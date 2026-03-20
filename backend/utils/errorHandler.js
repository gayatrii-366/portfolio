/**
 * Global Express error handler.
 * All errors thrown with next(err) land here.
 * Sends a standardised JSON response.
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  // Never expose stack traces in production
  const payload = {
    success: false,
    message: err.message || 'An unexpected error occurred.',
  };

  if (process.env.NODE_ENV === 'development') {
    payload.stack = err.stack;
  }

  console.error(`[${new Date().toISOString()}] ❌ ${statusCode} — ${err.message}`);

  res.status(statusCode).json(payload);
};

module.exports = errorHandler;
