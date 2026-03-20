const express = require('express');
const router = express.Router();
const { downloadResume } = require('../controllers/resume.controller');

// GET /api/resume
router.get('/', downloadResume);

module.exports = router;
