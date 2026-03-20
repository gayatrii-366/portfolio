const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for the contact endpoint.
 * Allows a maximum of 5 submissions per IP every 15 minutes.
 */
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again after 15 minutes.',
  },
});

module.exports = rateLimiter;
