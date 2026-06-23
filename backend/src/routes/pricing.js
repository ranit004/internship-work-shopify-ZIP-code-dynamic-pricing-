'use strict';

/**
 * @fileoverview Pricing API route handlers.
 * Mounts under /api — see src/index.js.
 */

const { Router } = require('express');
const { validatePriceCheck } = require('../middleware/validation');
const { getPrice, getAllZones } = require('../services/pricingEngine');

const router = Router();

/**
 * GET /api/health
 * Simple health check endpoint.
 *
 * @param {import('express').Request}  req - Express request
 * @param {import('express').Response} res - Express response
 * @returns {void}
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * GET /api/pricing-zones
 * Returns all configured ZIP → price mappings.
 * Intended for admin or demo inspection.
 *
 * @param {import('express').Request}  req - Express request
 * @param {import('express').Response} res - Express response
 * @returns {void}
 */
router.get('/pricing-zones', (req, res) => {
  res.json(getAllZones());
});

/**
 * POST /api/price-check
 * Accepts { zipCode, productId } and returns location-based pricing.
 *
 * @param {import('express').Request}  req - Express request with validated body
 * @param {import('express').Response} res - Express response
 * @returns {void}
 */
router.post('/price-check', validatePriceCheck, (req, res) => {
  const { zipCode } = req.body;
  const result = getPrice(zipCode);
  res.json(result);
});

module.exports = router;
