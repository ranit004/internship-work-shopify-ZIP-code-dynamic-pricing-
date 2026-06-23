'use strict';

/**
 * @fileoverview Input validation middleware for the pricing API.
 */

/** Regex that matches exactly 5 numeric digits */
const ZIP_REGEX = /^\d{5}$/;

/**
 * Validates the request body for POST /api/price-check.
 * Ensures `zipCode` is exactly 5 digits and `productId` is a non-empty string.
 *
 * @param {import('express').Request}  req  - Express request object
 * @param {import('express').Response} res  - Express response object
 * @param {import('express').NextFunction} next - Express next middleware
 * @returns {void}
 */
function validatePriceCheck(req, res, next) {
  const { zipCode, productId } = req.body;

  if (typeof zipCode !== 'string' || !ZIP_REGEX.test(zipCode)) {
    return res.status(400).json({ error: 'Invalid ZIP code format' });
  }

  if (!productId || typeof productId !== 'string' || productId.trim().length === 0) {
    return res.status(400).json({ error: 'productId must be a non-empty string' });
  }

  next();
}

module.exports = { validatePriceCheck };
