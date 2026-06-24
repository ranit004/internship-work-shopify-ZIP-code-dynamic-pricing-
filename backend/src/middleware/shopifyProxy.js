'use strict';

/**
 * @fileoverview Shopify App Proxy HMAC signature validation middleware.
 *
 * When a storefront request passes through the Shopify App Proxy, Shopify
 * appends query parameters including a `signature` field that is an HMAC-SHA256
 * digest of all other query params (sorted alphabetically, concatenated with NO
 * separator), keyed with the app's Client Secret. Validating this signature
 * proves the request originated from Shopify and was not forged by a third party
 * calling our Vercel URL directly.
 *
 * Key implementation note (Shopify-specific):
 *   Parameters are joined with an EMPTY string — not '&'.
 *   Ruby equivalent from Shopify docs: pairs.join  (no separator argument)
 *
 * Reference:
 *   https://shopify.dev/docs/apps/build/online-store/app-proxies/authenticate-app-proxies
 */

const crypto = require('crypto');

/**
 * Sorts query parameters (excluding `signature`), concatenates them as
 * `key=value` pairs with NO separator, then computes HMAC-SHA256
 * using the app's Client Secret.
 *
 * @param {Record<string, string>} query - Parsed query-string object from Express
 * @param {string}                 secret - Shopify app Client Secret (trimmed)
 * @returns {string} Hex-encoded HMAC-SHA256 digest
 */
function computeHmac(query, secret) {
  // Build the message: sorted key=value pairs joined with empty string (Shopify spec)
  const message = Object.entries(query)
    .filter(([key]) => key !== 'signature')   // exclude the signature itself
    .sort(([a], [b]) => a.localeCompare(b))   // alphabetical sort by key
    .map(([key, value]) => `${key}=${value}`) // key=value pairs
    .join('');                                 // ← empty separator (NOT '&')

  return crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');
}

/**
 * Express middleware that validates the Shopify App Proxy HMAC signature.
 *
 * Reads SHOPIFY_CLIENT_SECRET from environment. Rejects requests that:
 *  - Are missing the `signature` query parameter  → 401
 *  - Have a signature that does not match         → 401
 *  - Are attempted when the secret is unconfigured → 500
 *
 * On success, attaches `req.shopDomain` for downstream route handlers.
 *
 * @param {import('express').Request}      req  - Express request
 * @param {import('express').Response}     res  - Express response
 * @param {import('express').NextFunction} next - Express next function
 * @returns {void}
 */
function validateShopifyProxy(req, res, next) {
  // Trim to guard against newlines injected by shell piping during env-var setup
  const secret = (process.env.SHOPIFY_CLIENT_SECRET || '').trim();

  if (!secret) {
    // Configuration error — log loudly server-side but don't leak details to caller
    console.error('[ShopifyProxy] SHOPIFY_CLIENT_SECRET is not configured');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  const { signature, shop } = req.query;

  if (!signature) {
    // Missing signature → likely a direct API call bypassing the proxy
    console.warn('[ShopifyProxy] Rejected: missing signature param from', req.ip);
    return res.status(401).json({ error: 'Unauthorized: missing signature' });
  }

  const expected = computeHmac(req.query, secret);

  // Use timingSafeEqual to prevent timing side-channel attacks
  const sigBuf      = Buffer.from(signature, 'hex');
  const expectedBuf = Buffer.from(expected,  'hex');

  if (
    sigBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(sigBuf, expectedBuf)
  ) {
    console.warn('[ShopifyProxy] Rejected: signature mismatch from', req.ip);
    return res.status(401).json({ error: 'Unauthorized: invalid signature' });
  }

  // Signature valid — attach verified shop domain for downstream handlers
  req.shopDomain = shop || null;
  next();
}

module.exports = { validateShopifyProxy, computeHmac };
