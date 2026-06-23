'use strict';

/**
 * @fileoverview Global error handling middleware.
 * Catches any unhandled errors thrown in route handlers and returns a 500 response.
 */

/**
 * Express error-handling middleware.
 * Must be registered AFTER all routes (4-argument signature signals error handler to Express).
 *
 * @param {Error}  err  - The error that was thrown
 * @param {import('express').Request}  req  - Express request
 * @param {import('express').Response} res  - Express response
 * @param {import('express').NextFunction} next - Express next function (required for signature)
 * @returns {void}
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error('[ErrorHandler]', err.stack || err.message);

  const status = err.status || err.statusCode || 500;
  const message = err.expose ? err.message : 'Internal Server Error';

  res.status(status).json({ error: message });
}

module.exports = { errorHandler };
