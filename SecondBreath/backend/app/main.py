"""
main.py — FastAPI application for SecondBreath

Endpoints:
  POST /analyze    Upload an audio file → get risk analysis
  GET  /health     Simple health check
"""

import os
import uuid
import tempfile
import logging
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.analyzer import analyze_audio

# ─────────────────────────────────────────────
# App setup
# ─────────────────────────────────────────────

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("secondbreath")

app = FastAPI(
    title="SecondBreath API",
    description="Detects early respiratory / stress-related risks from voice audio.",
    version="1.0.0",
)

# Allow all origins so the simple HTML frontend can reach the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Accepted audio MIME types
SUPPORTED_TYPES = {
    "audio/wav",
    "audio/x-wav",
    "audio/mpeg",     # mp3
    "audio/ogg",
    "audio/webm",     # from browser MediaRecorder
    "audio/mp4",
    "application/octet-stream",  # some browsers send this for .wav
}

MAX_FILE_SIZE_MB = 20


# ─────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────

@app.get("/health", tags=["Utility"])
def health_check():
    """Returns 200 OK when the server is running."""
    return {"status": "ok", "service": "SecondBreath API"}


@app.post("/analyze", tags=["Analysis"])
async def analyze(file: UploadFile = File(...)):
    """
    Upload an audio file and receive a respiratory / stress risk assessment.

    - **file**: Audio file (wav, mp3, ogg, webm). Max 20 MB.

    Returns JSON with:
    - `risk_level`  : "Low Risk" | "Medium Risk" | "High Risk"
    - `score`       : internal numeric score (higher = riskier)
    - `explanation` : plain-English explanation of findings
    - `suggestion`  : actionable health advice
    - `features`    : raw acoustic measurements
    """
    # ── Validate content type ──────────────────────────────────────────────
    if file.content_type not in SUPPORTED_TYPES:
        logger.warning("Unsupported content type: %s", file.content_type)
        # Be lenient — try to process anyway; librosa handles many formats
        # raise HTTPException(status_code=415, detail=f"Unsupported audio type: {file.content_type}")

    # ── Read & size-check ──────────────────────────────────────────────────
    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({size_mb:.1f} MB). Max allowed: {MAX_FILE_SIZE_MB} MB.",
        )

    # ── Save to temp file ─────────────────────────────────────────────────
    suffix = Path(file.filename or "audio.wav").suffix or ".wav"
    tmp_path = os.path.join(tempfile.gettempdir(), f"sb_{uuid.uuid4().hex}{suffix}")

    try:
        with open(tmp_path, "wb") as f:
            f.write(contents)

        logger.info("Analyzing file: %s (%.2f MB, type=%s)", file.filename, size_mb, file.content_type)

        # ── Run analysis ───────────────────────────────────────────────────
        result = analyze_audio(tmp_path)
        logger.info("Result: risk=%s score=%s", result["risk_level"], result["score"])
        return JSONResponse(content=result)

    except Exception as exc:
        logger.exception("Analysis failed")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(exc)}")
    finally:
        # Always clean up the temp file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
