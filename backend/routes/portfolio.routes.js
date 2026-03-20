const express = require('express');
const router = express.Router();
const { getPortfolio } = require('../controllers/portfolio.controller');

// GET /api/portfolio
router.get('/', getPortfolio);

module.exports = router;
