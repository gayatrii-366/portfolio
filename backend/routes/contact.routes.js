const express = require('express');
const router = express.Router();
const { submitContact } = require('../controllers/contact.controller');
const rateLimiter = require('../utils/rateLimiter');

// POST /api/contact  (rate limited: 5 requests per 15 min per IP)
router.post('/', rateLimiter, submitContact);

module.exports = router;
