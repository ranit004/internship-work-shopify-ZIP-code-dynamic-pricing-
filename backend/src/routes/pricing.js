'use strict';

/**
 * @fileoverview Pricing API route handlers.
 *
 * Mounts under /api — see src/index.js.
 *
 * Route layout
 * ─────────────
 *  GET  /api/health           — Liveness probe (no auth required)
 *  GET  /api/pricing-zones    — All ZIP→price mappings (admin / demo)
 *  POST /api/price-check      — Legacy direct call (kept for backward compat)
 *  GET  /api/proxy/price-check — Shopify App Proxy entry-point (HMAC-verified)
 */

const { Router } = require('express');
const { validatePriceCheck } = require('../middleware/validation');
const { validateShopifyProxy } = require('../middleware/shopifyProxy');
const { getPrice, getAllZones } = require('../services/pricingEngine');

const router = Router();

// ─── Health ───────────────────────────────────────────────────────────────────

/**
 * GET /api/health
 * Simple health check endpoint — no authentication required.
 *
 * @param {import('express').Request}  req - Express request
 * @param {import('express').Response} res - Express response
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Admin / Demo ─────────────────────────────────────────────────────────────

/**
 * GET /api/pricing-zones
 * Returns all configured ZIP → price mappings.
 * Intended for admin inspection or demo purposes.
 *
 * @param {import('express').Request}  req - Express request
 * @param {import('express').Response} res - Express response
 */
router.get('/pricing-zones', (req, res) => {
  res.json(getAllZones());
});

// ─── Shopify App Proxy ────────────────────────────────────────────────────────

/**
 * GET /api/proxy/price-check
 *
 * Entry-point for the Shopify App Proxy.  Shopify proxies the storefront
 * request to this URL and appends HMAC query params so we can verify the
 * origin.  The route uses GET because the App Proxy always issues GET
 * requests; the ZIP code and product ID come in as query parameters.
 *
 * Query params injected by Shopify:
 *   shop        — myshopify domain, e.g. my-store.myshopify.com
 *   timestamp   — Unix epoch when Shopify forwarded the request
 *   signature   — HMAC-SHA256 of all other query params (validated in middleware)
 *
 * Query params sent by the storefront JS:
 *   zipCode     — 5-digit US ZIP code
 *   productId   — Shopify product GID
 *
 * Security: validateShopifyProxy runs first; the handler never executes if
 * the signature is absent or invalid (401 is returned immediately).
 *
 * @param {import('express').Request}  req - Express request (with req.shopDomain set by middleware)
 * @param {import('express').Response} res - Express response
 */
router.get(
  '/proxy/price-check',
  validateShopifyProxy,    // ← 401 if signature missing / invalid
  (req, res) => {
    const { zipCode, productId } = req.query;

    // Basic input validation (same rules as the POST endpoint)
    const ZIP_REGEX = /^\d{5}$/;
    if (!zipCode || !ZIP_REGEX.test(zipCode)) {
      return res.status(400).json({ error: 'Invalid ZIP code format' });
    }
    if (!productId || typeof productId !== 'string' || productId.trim().length === 0) {
      return res.status(400).json({ error: 'productId must be a non-empty string' });
    }

    const result = getPrice(zipCode);

    // Log which shop triggered the request (available from verified proxy middleware)
    console.log(
      `[Proxy] Price check — shop: ${req.shopDomain}, zip: ${zipCode}, found: ${result.found}`
    );

    res.json(result);
  }
);

// ─── Legacy Direct Endpoint ───────────────────────────────────────────────────

/**
 * POST /api/price-check
 * Kept for backward compatibility and local testing.
 * Accepts { zipCode, productId } and returns location-based pricing.
 *
 * @param {import('express').Request}  req - Express request with validated body
 * @param {import('express').Response} res - Express response
 */
router.post('/price-check', validatePriceCheck, (req, res) => {
  const { zipCode } = req.body;
  const result = getPrice(zipCode);
  res.json(result);
});

module.exports = router;
