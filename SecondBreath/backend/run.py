#!/usr/bin/env python
"""
run.py — convenience launcher for SecondBreath backend.
Usage:  python run.py
"""
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,          # auto-restart on file changes
        log_level="info",
    )
