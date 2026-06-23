'use strict';

/**
 * @fileoverview Pricing Engine Service
 * Handles all ZIP-code-to-price lookups and pricing zone retrieval.
 */

/**
 * @typedef {Object} PriceResult
 * @property {number}  price    - The resolved price in smallest currency unit (cents-free integer)
 * @property {string}  currency - ISO 4217 currency code
 * @property {string}  label    - Human-readable formatted price string
 * @property {string}  zipCode  - The ZIP code that was queried
 * @property {boolean} found    - Whether the ZIP was found in the pricing map
 */

/** Default price (USD) for unknown ZIP codes */
const DEFAULT_PRICE = 1299;

/**
 * Hardcoded ZIP → price mapping (USD).
 * Keys are 5-digit ZIP code strings; values are integer prices.
 * @type {Map<string, number>}
 */
const PRICING_MAP = new Map([
  ['75028', 1499],
  ['10001', 1699],
  ['90210', 1799],
]);

/**
 * Formats an integer price as a US dollar label.
 * @param {number} price - Integer price value (e.g. 1499)
 * @returns {string} Formatted label (e.g. "$1,499")
 */
function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Looks up the price for a given ZIP code.
 * Falls back to DEFAULT_PRICE if the ZIP is not in the pricing map.
 *
 * @param {string} zipCode - A validated 5-digit ZIP code string
 * @returns {PriceResult} The price result object
 */
function getPrice(zipCode) {
  const found = PRICING_MAP.has(zipCode);
  const price = found ? PRICING_MAP.get(zipCode) : DEFAULT_PRICE;

  return {
    price,
    currency: 'USD',
    label: formatPrice(price),
    zipCode,
    found,
  };
}

/**
 * Returns all ZIP → price mappings as an array of zone objects.
 * Used by the admin/demo /api/pricing-zones endpoint.
 *
 * @returns {Array<{zipCode: string, price: number, label: string}>}
 */
function getAllZones() {
  return Array.from(PRICING_MAP.entries()).map(([zipCode, price]) => ({
    zipCode,
    price,
    label: formatPrice(price),
    currency: 'USD',
  }));
}

module.exports = { getPrice, getAllZones, DEFAULT_PRICE };
