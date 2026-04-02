"""
analyzer.py — Core audio analysis module for SecondBreath

This module extracts key acoustic features from a voice recording and applies
simple rule-based logic to classify respiratory / stress risk level.

Features extracted:
  - Pitch variation  (std-dev of F0)  → high variation = stress indicator
  - Silence ratio    (% of silent frames) → too many pauses = fatigue / breathlessness
  - Energy (RMS)     → very low energy = weak voice / exhaustion
"""

import numpy as np
import librosa


# ─────────────────────────────────────────────
# 1.  Feature Extraction
# ─────────────────────────────────────────────

def extract_features(audio_path: str) -> dict:
    """
    Load an audio file and return a dictionary of acoustic features.

    Parameters
    ----------
    audio_path : str
        Path to the audio file (wav, mp3, ogg, …).

    Returns
    -------
    dict with keys:
        pitch_std        – standard deviation of detected F0 values (Hz)
        silence_ratio    – fraction of frames classified as silent  (0–1)
        mean_energy      – mean RMS energy across all frames
        duration_seconds – total duration of the recording
    """
    # Load audio (resample to 22 050 Hz mono by default)
    y, sr = librosa.load(audio_path, sr=22050, mono=True)

    # ── Pitch (F0) via YIN algorithm ──────────────────────────────────────
    # pyin is more accurate but slower; yin is fast enough for a demo
    f0, voiced_flag, _ = librosa.pyin(
        y,
        fmin=librosa.note_to_hz("C2"),   # ~65 Hz  – lowest expected pitch
        fmax=librosa.note_to_hz("C7"),   # ~2093 Hz – highest expected pitch
        sr=sr,
    )
    # Only keep frames where a pitch was actually detected
    voiced_f0 = f0[voiced_flag & ~np.isnan(f0)]
    pitch_std = float(np.std(voiced_f0)) if len(voiced_f0) > 0 else 0.0

    # ── Silence ratio ─────────────────────────────────────────────────────
    # Use a simple energy-based silence detector
    frame_length = 2048
    hop_length = 512
    rms_frames = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)[0]
    silence_threshold = 0.01          # frames whose RMS < threshold are "silent"
    silence_ratio = float(np.mean(rms_frames < silence_threshold))

    # ── Mean energy ───────────────────────────────────────────────────────
    mean_energy = float(np.mean(rms_frames))

    # ── Duration ──────────────────────────────────────────────────────────
    duration = float(librosa.get_duration(y=y, sr=sr))

    return {
        "pitch_std": round(pitch_std, 4),
        "silence_ratio": round(silence_ratio, 4),
        "mean_energy": round(mean_energy, 6),
        "duration_seconds": round(duration, 2),
    }


# ─────────────────────────────────────────────
# 2.  Rule-Based Risk Classifier
# ─────────────────────────────────────────────

def classify_risk(features: dict) -> dict:
    """
    Apply simple threshold rules to assign a risk level.

    Rules (tuned for demo purposes – adjust thresholds as needed):
    ┌──────────────────────────────────────────────────────┐
    │  HIGH RISK   if silence_ratio > 0.60                │
    │              OR mean_energy   < 0.005               │
    │  MEDIUM RISK if silence_ratio > 0.35                │
    │              OR pitch_std     < 5  (monotone voice) │
    │  LOW RISK    otherwise                              │
    └──────────────────────────────────────────────────────┘

    Returns
    -------
    dict with keys: risk_level, score, explanation, suggestion, features
    """
    pitch_std     = features["pitch_std"]
    silence_ratio = features["silence_ratio"]
    mean_energy   = features["mean_energy"]

    # Accumulate a simple numeric score (0 = healthy, higher = riskier)
    score = 0

    reasons = []

    # --- Silence-based scoring ---
    if silence_ratio > 0.60:
        score += 3
        reasons.append(
            f"Very high silence ratio ({silence_ratio:.0%}) — suggests frequent pauses or breathlessness."
        )
    elif silence_ratio > 0.35:
        score += 1
        reasons.append(
            f"Elevated silence ratio ({silence_ratio:.0%}) — more pauses than normal speech."
        )

    # --- Energy-based scoring ---
    if mean_energy < 0.005:
        score += 3
        reasons.append(
            f"Very low vocal energy ({mean_energy:.4f}) — voice sounds weak or strained."
        )
    elif mean_energy < 0.015:
        score += 1
        reasons.append(
            f"Below-average vocal energy ({mean_energy:.4f}) — slightly reduced speaking effort."
        )

    # --- Pitch variation scoring ---
    if pitch_std < 5:
        score += 1
        reasons.append(
            f"Low pitch variation (std={pitch_std:.1f} Hz) — monotone speech may indicate fatigue or stress."
        )
    elif pitch_std > 80:
        score += 1
        reasons.append(
            f"High pitch variation (std={pitch_std:.1f} Hz) — irregular pitch can signal respiratory discomfort."
        )

    # --- Map score → risk level ---
    if score >= 4:
        risk_level = "High Risk"
        explanation = (
            "Your voice shows multiple indicators of potential respiratory or stress-related issues. "
            + " ".join(reasons)
        )
        suggestion = (
            "Please consider consulting a healthcare professional. "
            "In the meantime, practice slow diaphragmatic breathing: inhale for 4 s, hold for 4 s, exhale for 6 s. "
            "Avoid strenuous activity and stay hydrated."
        )
    elif score >= 2:
        risk_level = "Medium Risk"
        explanation = (
            "Your voice shows some mild indicators worth monitoring. "
            + " ".join(reasons)
        )
        suggestion = (
            "Try box breathing (4-4-4-4 pattern) for 5 minutes. "
            "Ensure adequate rest and hydration. "
            "If symptoms persist, speak with a doctor."
        )
    else:
        risk_level = "Low Risk"
        explanation = (
            "Your voice sounds healthy with no significant stress or respiratory indicators detected."
            + (" " + " ".join(reasons) if reasons else "")
        )
        suggestion = (
            "Great job! Keep up regular breathing exercises and maintain a healthy lifestyle. "
            "Re-check periodically if you experience any discomfort."
        )

    return {
        "risk_level": risk_level,
        "score": score,
        "explanation": explanation,
        "suggestion": suggestion,
        "features": features,
    }


# ─────────────────────────────────────────────
# 3.  Convenience wrapper
# ─────────────────────────────────────────────

def analyze_audio(audio_path: str) -> dict:
    """End-to-end: extract features → classify risk → return full result."""
    features = extract_features(audio_path)
    result   = classify_risk(features)
    return result
