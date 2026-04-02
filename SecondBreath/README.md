# 🫁 SecondBreath — Voice-Based Respiratory Risk Detector

> **Hackathon MVP** · Detect early respiratory & stress-related risks using just your voice.

---

## 📁 Project Structure

```
SecondBreath/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          ← FastAPI app (routes)
│   │   └── analyzer.py      ← Audio feature extraction + risk logic
│   ├── requirements.txt
│   └── run.py               ← Convenience launcher
└── frontend/
    ├── index.html           ← Single-page app
    ├── style.css            ← Dark glassmorphism design
    └── app.js               ← Recording, upload, API, visualizations
```

---

## 🚀 Quick Start

### Step 1 — Backend

```bash
cd SecondBreath/backend

# Create a virtual environment (recommended)
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python run.py
```

The API will be available at **http://localhost:8000**
Swagger docs at **http://localhost:8000/docs**

---

### Step 2 — Frontend

The frontend is plain HTML — **no build step needed**.

Simply open `frontend/index.html` in your browser.

> For best results (microphone HTTPS requirement), serve via a local server:

```bash
cd SecondBreath/frontend

# Option A: Python
python -m http.server 3000

# Option B: Node
npx serve .
```

Then visit **http://localhost:3000**

---

## 🔬 How the Analysis Works

| Feature | Extraction Method | Risk Indicator |
|---|---|---|
| **Pitch variation** | librosa `pyin` F0 | Low std-dev = monotone (fatigue) |
| **Silence ratio** | RMS energy threshold | High ratio = breathlessness |
| **Vocal energy** | RMS mean | Very low = weak/strained voice |

### Risk Thresholds

```
HIGH RISK   → score ≥ 4  (silence > 60% OR energy < 0.005)
MEDIUM RISK → score ≥ 2  (silence > 35% OR monotone pitch)
LOW RISK    → score < 2  (all features within normal range)
```

---

## 🌐 API Reference

### `POST /analyze`
Upload an audio file for analysis.

**Request:** `multipart/form-data` with field `file`

```bash
curl -X POST http://localhost:8000/analyze \
     -F "file=@your_voice.wav"
```

**Response:**
```json
{
  "risk_level": "Medium Risk",
  "score": 2,
  "explanation": "Your voice shows an elevated silence ratio...",
  "suggestion": "Try box breathing (4-4-4-4 pattern)...",
  "features": {
    "pitch_std": 18.4,
    "silence_ratio": 0.42,
    "mean_energy": 0.0095,
    "duration_seconds": 11.2
  }
}
```

### `GET /health`
Server health check.

---

## ✨ UI Polish Features

1. **Live waveform visualizer** — Real-time Web Audio API canvas waveform while recording
2. **AI scanner animation** — Rotating globe with sweep radar during processing
3. **Animated arc gauge** — Speedometer-style gauge that animates to your risk score

---

## ⚠️ Medical Disclaimer

SecondBreath is a **hackathon prototype** for research and demonstration purposes only.
It is **not** a certified medical device and does not replace professional medical advice.
