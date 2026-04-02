/* ═══════════════════════════════════════════════════════════
   SecondBreath — app.js
   Handles: recording, upload, waveform, API call,
            processing animation, result rendering, gauge
   ═══════════════════════════════════════════════════════════ */

'use strict';

// ─── Config ──────────────────────────────────────────────────
// Automatically switch between local backend and deployed backend
const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = IS_LOCAL 
  ? 'http://localhost:8000/analyze' 
  : 'https://your-backend-name.onrender.com/analyze'; // ⚠️ Replace this with your Render URL later!


// ─── State ───────────────────────────────────────────────────
const state = {
  mode: 'record',          // 'record' | 'upload'
  mediaRecorder: null,
  audioChunks: [],
  recordedBlob: null,
  uploadedFile: null,
  isRecording: false,
  timerInterval: null,
  timerSecs: 0,
  audioContext: null,
  analyserNode: null,
  waveformRaf: null,
  stream: null,
};

// ─────────────────────────────────────────────────────────────
// 1.  INIT
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initGridCanvas();
  initHeroWave();
  animateEkg();
  initTabIndicator();
});

// ─────────────────────────────────────────────────────────────
// 2.  AMBIENT GRID
// ─────────────────────────────────────────────────────────────
function initGridCanvas() {
  const canvas = document.getElementById('gridCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    drawGrid(ctx, canvas.width, canvas.height);
  }

  function drawGrid(ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(0,255,212,1)';
    ctx.lineWidth   = 0.5;

    const spacing = 60;
    for (let x = 0; x <= w; x += spacing) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y <= h; y += spacing) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
  }

  window.addEventListener('resize', resize);
  resize();
}

// ─────────────────────────────────────────────────────────────
// 3.  HERO WAVE (idle animation)
// ─────────────────────────────────────────────────────────────
let heroWaveOffset = 0;
function initHeroWave() {
  const canvas = document.getElementById('heroWave');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function draw() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0,255,212,0.7)';
    ctx.lineWidth = 2;

    for (let x = 0; x < W; x++) {
      const y = H / 2 +
        Math.sin((x + heroWaveOffset) * 0.05) * 14 +
        Math.sin((x + heroWaveOffset) * 0.02) * 6;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    heroWaveOffset += 2;
    requestAnimationFrame(draw);
  }
  draw();
}

// EKG line pulse
function animateEkg() {
  const line = document.getElementById('ekgLine');
  if (!line) return;
  // Already animated via CSS stroke-dashoffset; re-trigger periodically
  setInterval(() => {
    line.style.animation = 'none';
    line.getBoundingClientRect(); // force reflow
    line.style.animation = 'ekgDraw 2s ease-in-out forwards';
  }, 4000);
}

// ─────────────────────────────────────────────────────────────
// 4.  NAVIGATION + SCROLL
// ─────────────────────────────────────────────────────────────
function scrollToAnalyzer() {
  document.getElementById('sectionAnalyzer').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ─────────────────────────────────────────────────────────────
// 5.  TAB SWITCHER
// ─────────────────────────────────────────────────────────────
function initTabIndicator() {
  positionTabIndicator('record');
}

function positionTabIndicator(which) {
  const indicator = document.getElementById('tabIndicator');
  const tabId     = which === 'record' ? 'tabRecord' : 'tabUpload';
  const tab       = document.getElementById(tabId);
  if (!indicator || !tab) return;

  const parent = tab.parentElement.getBoundingClientRect();
  const rect   = tab.getBoundingClientRect();
  indicator.style.left  = (rect.left - parent.left) + 'px';
  indicator.style.width = rect.width + 'px';
}

function switchTab(which) {
  state.mode = which;

  // Buttons
  document.getElementById('tabRecord').classList.toggle('active', which === 'record');
  document.getElementById('tabUpload').classList.toggle('active', which === 'upload');

  // Panels
  document.getElementById('panelRecord').classList.toggle('hidden', which !== 'record');
  document.getElementById('panelUpload').classList.toggle('hidden', which !== 'upload');

  // Indicator
  positionTabIndicator(which);

  refreshAnalyzeBtn();
}

// ─────────────────────────────────────────────────────────────
// 6.  RECORDING
// ─────────────────────────────────────────────────────────────
async function toggleRecording() {
  if (state.isRecording) {
    stopRecording();
  } else {
    await startRecording();
  }
}

async function startRecording() {
  try {
    state.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    showError('Microphone access denied. Please allow microphone permissions and try again.');
    return;
  }

  // ── MediaRecorder ───────────────────────────────────────
  const mimeType = getSupportedMimeType();
  const options  = mimeType ? { mimeType } : {};
  state.mediaRecorder = new MediaRecorder(state.stream, options);
  state.audioChunks   = [];

  state.mediaRecorder.ondataavailable = e => {
    if (e.data.size > 0) state.audioChunks.push(e.data);
  };

  state.mediaRecorder.onstop = () => {
    const blob = new Blob(state.audioChunks, { type: mimeType || 'audio/webm' });
    state.recordedBlob = blob;
    showAudioPreview(blob);
    refreshAnalyzeBtn();
  };

  state.mediaRecorder.start(100);

  // ── Web Audio → waveform ────────────────────────────────
  state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  state.analyserNode = state.audioContext.createAnalyser();
  state.analyserNode.fftSize = 512;
  const source = state.audioContext.createMediaStreamSource(state.stream);
  source.connect(state.analyserNode);
  startWaveformDraw();

  // ── UI ──────────────────────────────────────────────────
  state.isRecording = true;
  const btn = document.getElementById('btnRecord');
  btn.classList.add('recording');
  btn.setAttribute('aria-pressed', 'true');

  // Stop icon
  document.getElementById('orbIcon').innerHTML = `
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="2"/>
    </svg>`;

  document.getElementById('orbRings').classList.add('active');
  document.getElementById('recDot').classList.add('live');
  document.getElementById('recordStatusText').textContent = 'Recording — speak naturally…';
  document.getElementById('waveformLabel').classList.add('hidden-label');

  // Timer
  state.timerSecs = 0;
  updateTimerDisplay();
  state.timerInterval = setInterval(() => {
    state.timerSecs++;
    updateTimerDisplay();
  }, 1000);
}

function stopRecording() {
  if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') {
    state.mediaRecorder.stop();
  }
  if (state.stream) {
    state.stream.getTracks().forEach(t => t.stop());
  }

  state.isRecording = false;
  clearInterval(state.timerInterval);
  cancelAnimationFrame(state.waveformRaf);

  if (state.audioContext) {
    state.audioContext.close().catch(() => {});
  }

  const btn = document.getElementById('btnRecord');
  btn.classList.remove('recording');
  btn.setAttribute('aria-pressed', 'false');

  // Mic icon
  document.getElementById('orbIcon').innerHTML = `
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zm-1 3a1 1 0 012 0v8a1 1 0 01-2 0V4zm-4 8a5 5 0 0010 0h2a7 7 0 01-7 7v2h3v2H9v-2h3v-2a7 7 0 01-7-7h2z"/>
    </svg>`;

  document.getElementById('orbRings').classList.remove('active');
  document.getElementById('recDot').classList.remove('live');
  document.getElementById('recordStatusText').textContent = 'Recording saved! Ready to analyze.';
}

function showAudioPreview(blob) {
  const url    = URL.createObjectURL(blob);
  const audio  = document.getElementById('audioPlayer');
  audio.src    = url;
  document.getElementById('audioPreview').classList.remove('hidden');
}

function clearRecording() {
  state.recordedBlob = null;
  state.audioChunks  = [];

  document.getElementById('audioPreview').classList.add('hidden');
  document.getElementById('audioPlayer').src = '';
  document.getElementById('recordStatusText').textContent = 'Tap to start recording';
  document.getElementById('timerDisplay').textContent = '00:00';
  document.getElementById('recDot').classList.remove('live');
  document.getElementById('waveformLabel').classList.remove('hidden-label');

  // Clear waveform canvas
  const canvas = document.getElementById('waveformCanvas');
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

  refreshAnalyzeBtn();
}

function updateTimerDisplay() {
  const m = String(Math.floor(state.timerSecs / 60)).padStart(2, '0');
  const s = String(state.timerSecs % 60).padStart(2, '0');
  document.getElementById('timerDisplay').textContent = `${m}:${s}`;
}

function getSupportedMimeType() {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
  return types.find(t => MediaRecorder.isTypeSupported(t)) || '';
}

// ─────────────────────────────────────────────────────────────
// 7.  WAVEFORM VISUALIZER
// ─────────────────────────────────────────────────────────────
function startWaveformDraw() {
  const canvas = document.getElementById('waveformCanvas');
  const ctx    = canvas.getContext('2d');
  const analyser = state.analyserNode;
  const bufLen = analyser.frequencyBinCount;
  const dataArr = new Uint8Array(bufLen);

  function draw() {
    state.waveformRaf = requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(dataArr);

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, 'rgba(0,255,212,0)');
    grad.addColorStop(0.5, 'rgba(0,255,212,0.08)');
    grad.addColorStop(1, 'rgba(0,255,212,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Waveform line
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#00ffd4';
    ctx.shadowColor = '#00ffd4';
    ctx.shadowBlur  = 8;
    ctx.beginPath();

    const sliceW = W / bufLen;
    let x = 0;

    for (let i = 0; i < bufLen; i++) {
      const v = dataArr[i] / 128;
      const y = (v * H) / 2;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      x += sliceW;
    }
    ctx.lineTo(W, H / 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  draw();
}

// ─────────────────────────────────────────────────────────────
// 8.  FILE UPLOAD
// ─────────────────────────────────────────────────────────────
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) setUploadedFile(file);
}

function handleDragOver(event) {
  event.preventDefault();
  document.getElementById('dropZone').classList.add('dragover');
}

function handleDragLeave(event) {
  document.getElementById('dropZone').classList.remove('dragover');
}

function handleDrop(event) {
  event.preventDefault();
  document.getElementById('dropZone').classList.remove('dragover');
  const file = event.dataTransfer.files[0];
  if (file && file.type.startsWith('audio/')) {
    setUploadedFile(file);
  } else {
    showError('Please drop an audio file (WAV, MP3, OGG, WebM).');
  }
}

function setUploadedFile(file) {
  if (file.size > 20 * 1024 * 1024) {
    showError('File too large. Maximum size is 20 MB.');
    return;
  }
  state.uploadedFile = file;

  const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
  document.getElementById('fileChosenName').textContent = file.name;
  document.getElementById('fileChosenSize').textContent = `${sizeMB} MB`;
  document.getElementById('fileChosen').classList.remove('hidden');
  document.getElementById('dropZone').style.borderColor = 'rgba(0,255,212,.4)';

  refreshAnalyzeBtn();
}

function clearFile() {
  state.uploadedFile = null;
  document.getElementById('fileInput').value = '';
  document.getElementById('fileChosen').classList.add('hidden');
  document.getElementById('dropZone').style.borderColor = '';
  refreshAnalyzeBtn();
}

// ─────────────────────────────────────────────────────────────
// 9.  ANALYZE BUTTON STATE
// ─────────────────────────────────────────────────────────────
function refreshAnalyzeBtn() {
  const hasData = (state.mode === 'record' && state.recordedBlob) ||
                  (state.mode === 'upload' && state.uploadedFile);
  document.getElementById('btnAnalyze').disabled = !hasData;
}

// ─────────────────────────────────────────────────────────────
// 10. ANALYZE — API CALL
// ─────────────────────────────────────────────────────────────
async function analyzeAudio() {
  const file = state.mode === 'record' ? state.recordedBlob : state.uploadedFile;
  if (!file) return;

  // Show processing overlay
  showProcessing();

  // Build form data
  const fd   = new FormData();
  const name = state.mode === 'record' ? 'recording.webm' : (state.uploadedFile?.name || 'audio.wav');
  fd.append('file', file, name);

  try {
    const response = await fetch(API_URL, { method: 'POST', body: fd });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Unknown server error' }));
      throw new Error(err.detail || `Server error ${response.status}`);
    }

    const data = await response.json();
    hideProcessing();
    renderResults(data);

  } catch (err) {
    hideProcessing();
    // If backend is down, show a demo result for hackathon purposes
    if (err.message.includes('fetch') || err.message.includes('Failed')) {
      showError('Cannot reach backend (is it running on :8000?). Showing a demo result.');
      renderResults(getDemoResult());
    } else {
      showError(`Analysis failed: ${err.message}`);
    }
  }
}

// Demo result for when backend is offline
function getDemoResult() {
  return {
    risk_level: 'Medium Risk',
    score: 2,
    explanation: 'Your voice shows an elevated silence ratio (42%) and below-average vocal energy, which may indicate mild respiratory fatigue or stress. This is a simulated demo result.',
    suggestion: 'Try box breathing (inhale 4s, hold 4s, exhale 4s, hold 4s) for 5 minutes. Ensure adequate rest and hydration. If symptoms persist, speak with a doctor.',
    features: { pitch_std: 18.4, silence_ratio: 0.42, mean_energy: 0.0095, duration_seconds: 11.2 },
  };
}

// ─────────────────────────────────────────────────────────────
// 11. PROCESSING OVERLAY ANIMATION
// ─────────────────────────────────────────────────────────────
let processingRaf = null;

function showProcessing() {
  document.getElementById('processingOverlay').classList.remove('hidden');

  // Animate steps
  const steps = document.querySelectorAll('.proc-step');
  steps.forEach(s => s.classList.remove('active', 'done'));

  const delays  = [0, 600, 1200, 1900, 2600];
  const barPcts = [10, 28, 52, 76, 95];

  delays.forEach((delay, i) => {
    setTimeout(() => {
      steps.forEach((s, si) => {
        if (si < i) {
          s.classList.remove('active');
          s.classList.add('done');
          document.getElementById(`procIcon${si}`).textContent = '✅';
        }
      });
      steps[i].classList.add('active');
      document.getElementById(`procIcon${i}`).textContent = '⏳';
      document.getElementById('procBarFill').style.width = barPcts[i] + '%';
    }, delay);
  });

  // Scan canvas animation
  initScanCanvas();
}

function hideProcessing() {
  document.getElementById('procBarFill').style.width = '100%';
  setTimeout(() => {
    document.getElementById('processingOverlay').classList.add('hidden');
    if (processingRaf) cancelAnimationFrame(processingRaf);
  }, 400);
}

function initScanCanvas() {
  const canvas = document.getElementById('scanCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2, r = 56;
  let angle = 0;

  function draw() {
    processingRaf = requestAnimationFrame(draw);
    ctx.clearRect(0, 0, W, H);

    // Rotating sweep
    const sweep = ctx.createConicalGradient
      ? null  // fallback below
      : null;

    // Arc sweep effect
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    const sweepGrad = ctx.createLinearGradient(-r, 0, r, 0);
    sweepGrad.addColorStop(0, 'rgba(0,255,212,0)');
    sweepGrad.addColorStop(1, 'rgba(0,255,212,0.3)');

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, -0.4, 0.4);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0,255,212,0.08)';
    ctx.fill();

    ctx.restore();

    // Data blips
    ctx.fillStyle = 'rgba(0,255,212,0.6)';
    const t = Date.now() / 300;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + angle;
      const rd = r * (0.3 + ((Math.sin(t + i * 1.2) + 1) / 2) * 0.7);
      const bx = cx + Math.cos(a) * rd;
      const by = cy + Math.sin(a) * rd;
      ctx.beginPath();
      ctx.arc(bx, by, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    angle += 0.05;
  }
  draw();
}

// ─────────────────────────────────────────────────────────────
// 12. RENDER RESULTS
// ─────────────────────────────────────────────────────────────
function renderResults(data) {
  const { risk_level, explanation, suggestion, features } = data;

  // Determine color class
  const lvl = risk_level.toLowerCase().includes('high')   ? 'high' :
              risk_level.toLowerCase().includes('medium') ? 'medium' : 'low';

  const colors = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };
  const icons  = { low: '🟢', medium: '🟡', high: '🔴' };
  const color  = colors[lvl];

  // Badge
  const badge = document.getElementById('resultBadge');
  badge.className = `result-badge ${lvl}`;
  document.getElementById('badgeDot').className = `badge-dot ${lvl}`;
  document.getElementById('badgeLabel').textContent = risk_level;

  // Explanation + suggestion
  document.getElementById('resultExplanation').textContent = explanation;
  document.getElementById('suggestionText').textContent    = suggestion;

  // Gauge risk label
  document.getElementById('gaugeIcon').textContent     = icons[lvl];
  document.getElementById('gaugeRiskText').textContent  = risk_level;
  document.getElementById('gaugeRiskText').style.color  = color;

  // Metrics
  const f = features;
  document.getElementById('mpPitchVal').textContent   = f.pitch_std.toFixed(1);
  document.getElementById('mpSilenceVal').textContent = (f.silence_ratio * 100).toFixed(0) + '%';
  document.getElementById('mpEnergyVal').textContent  = f.mean_energy.toFixed(4);
  document.getElementById('mpDurationVal').textContent= f.duration_seconds.toFixed(1) + 's';

  // Color metric values by severity
  const pitchOk  = f.pitch_std >= 5 && f.pitch_std <= 80;
  const silOk    = f.silence_ratio < 0.35;
  const energyOk = f.mean_energy >= 0.015;

  styleMetric('mpPitchVal',   pitchOk);
  styleMetric('mpSilenceVal', silOk);
  styleMetric('mpEnergyVal',  energyOk);
  document.getElementById('mpDurationVal').style.color = 'var(--text)';

  // Animating bars
  setTimeout(() => {
    animateBar('mpPitchBar',   Math.min(f.pitch_std / 100 * 100, 100), pitchOk  ? '#22c55e' : '#ef4444');
    animateBar('mpSilenceBar', f.silence_ratio * 100, silOk    ? '#22c55e' : '#ef4444');
    animateBar('mpEnergyBar',  Math.min(f.mean_energy / 0.05 * 100, 100), energyOk ? '#22c55e' : '#ef4444');
    animateBar('mpDurationBar',Math.min(f.duration_seconds / 30 * 100, 100), '#3b82f6');
  }, 300);

  // Draw gauge
  drawGauge(data.score, lvl, color);

  // Show section
  document.getElementById('sectionResults').classList.remove('hidden');
  document.getElementById('sectionResults').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function styleMetric(id, isGood) {
  document.getElementById(id).style.color = isGood ? '#22c55e' : '#ef4444';
}

function animateBar(id, pct, color) {
  const bar = document.getElementById(id);
  bar.style.width      = pct + '%';
  bar.style.background = color;
  bar.style.boxShadow  = `0 0 8px ${color}`;
}

// ─────────────────────────────────────────────────────────────
// 13. GAUGE (arc / speedometer)
// ─────────────────────────────────────────────────────────────
function drawGauge(score, lvl, color) {
  const canvas = document.getElementById('gaugeCanvas');
  const ctx    = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H - 20;
  const radius = 90;
  const startAngle = Math.PI;        // 180°
  const endAngle   = 0;              // 0° (right)

  ctx.clearRect(0, 0, W, H);

  // ── Background arc ───────────────────────────
  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle, endAngle, false);
  ctx.lineWidth   = 16;
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineCap     = 'round';
  ctx.stroke();

  // ── Colored arc (animated) ───────────────────
  const maxScore   = 6;
  const pct        = Math.min(score / maxScore, 1);
  const fillAngle  = startAngle + pct * Math.PI;

  // Gradient: green → yellow → red
  const arcGrad = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);
  arcGrad.addColorStop(0,   '#22c55e');
  arcGrad.addColorStop(0.5, '#f59e0b');
  arcGrad.addColorStop(1,   '#ef4444');

  let currentAngle = startAngle;
  const targetAngle = fillAngle;
  const speed = 0.04;

  function animateGauge() {
    ctx.clearRect(0, 0, W, H);

    // BG arc
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI, 0, false);
    ctx.lineWidth   = 16;
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineCap     = 'round';
    ctx.stroke();

    // Track ticks
    for (let i = 0; i <= 6; i++) {
      const a = Math.PI + (i / 6) * Math.PI;
      const ix = cx + (radius + 12) * Math.cos(a);
      const iy = cy + (radius + 12) * Math.sin(a);
      ctx.beginPath();
      ctx.arc(ix, iy, 3, 0, Math.PI * 2);
      ctx.fillStyle = i <= Math.round(pct * 6) ? color : 'rgba(255,255,255,.15)';
      ctx.fill();
    }

    // Fill arc
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI, currentAngle, false);
    ctx.lineWidth   = 16;
    ctx.strokeStyle = arcGrad;
    ctx.lineCap     = 'round';
    ctx.shadowColor = color;
    ctx.shadowBlur  = 12;
    ctx.stroke();
    ctx.shadowBlur  = 0;

    // Needle dot at tip
    const ndx = cx + radius * Math.cos(currentAngle);
    const ndy = cy + radius * Math.sin(currentAngle);
    ctx.beginPath();
    ctx.arc(ndx, ndy, 7, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur  = 20;
    ctx.fill();
    ctx.shadowBlur  = 0;

    if (currentAngle < targetAngle) {
      currentAngle = Math.min(currentAngle + speed, targetAngle);
      requestAnimationFrame(animateGauge);
    }
  }
  animateGauge();
}

// ─────────────────────────────────────────────────────────────
// 14. RESET
// ─────────────────────────────────────────────────────────────
function resetApp() {
  // Clear state
  clearRecording();
  clearFile();
  state.recordedBlob = null;
  state.uploadedFile = null;

  // Hide results
  document.getElementById('sectionResults').classList.add('hidden');
  hideError();

  // Scroll back
  document.getElementById('sectionAnalyzer').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ─────────────────────────────────────────────────────────────
// 15. ERROR HANDLING
// ─────────────────────────────────────────────────────────────
function showError(msg) {
  const toast = document.getElementById('errorToast');
  document.getElementById('errorToastMsg').textContent = msg;
  toast.classList.remove('hidden');
  // Auto-dismiss after 6s
  setTimeout(hideError, 6000);
}

function hideError() {
  document.getElementById('errorToast').classList.add('hidden');
}

// ─────────────────────────────────────────────────────────────
// 16.  WINDOW RESIZE → tab indicator
// ─────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
  positionTabIndicator(state.mode);
});
