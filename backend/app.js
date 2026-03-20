const express = require('express');
const cors = require('cors');

const resumeRoutes = require('./routes/resume.routes');
const portfolioRoutes = require('./routes/portfolio.routes');
const contactRoutes = require('./routes/contact.routes');
const errorHandler = require('./utils/errorHandler');

const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend is running ✅' });
});

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/resume', resumeRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/contact', contactRoutes);

// ─── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Error Handler ────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
