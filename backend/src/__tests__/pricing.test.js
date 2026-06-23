'use strict';

/**
 * @fileoverview Comprehensive Jest + Supertest unit tests for the pricing API.
 * Covers HTTP layer (all three endpoints) and the pricingEngine service directly.
 */

const request = require('supertest');
const app = require('../index');
const { getPrice, DEFAULT_PRICE } = require('../services/pricingEngine');

// ─── HTTP Layer Tests ─────────────────────────────────────────────────────────

describe('POST /api/price-check', () => {
  // ── Valid ZIPs ──────────────────────────────────────────────────────────────

  test('ZIP 75028 → 200, price 1499, found true', async () => {
    const res = await request(app)
      .post('/api/price-check')
      .send({ zipCode: '75028', productId: 'gid://shopify/Product/1' });

    expect(res.status).toBe(200);
    expect(res.body.price).toBe(1499);
    expect(res.body.found).toBe(true);
    expect(res.body.currency).toBe('USD');
    expect(res.body.label).toBe('$1,499');
    expect(res.body.zipCode).toBe('75028');
  });

  test('ZIP 10001 → 200, price 1699', async () => {
    const res = await request(app)
      .post('/api/price-check')
      .send({ zipCode: '10001', productId: 'gid://shopify/Product/2' });

    expect(res.status).toBe(200);
    expect(res.body.price).toBe(1699);
    expect(res.body.found).toBe(true);
  });

  test('ZIP 90210 → 200, price 1799', async () => {
    const res = await request(app)
      .post('/api/price-check')
      .send({ zipCode: '90210', productId: 'gid://shopify/Product/3' });

    expect(res.status).toBe(200);
    expect(res.body.price).toBe(1799);
    expect(res.body.found).toBe(true);
  });

  // ── Unknown ZIP fallback ────────────────────────────────────────────────────

  test('Unknown ZIP 99999 → 200, price 1299, found false', async () => {
    const res = await request(app)
      .post('/api/price-check')
      .send({ zipCode: '99999', productId: 'gid://shopify/Product/4' });

    expect(res.status).toBe(200);
    expect(res.body.price).toBe(1299);
    expect(res.body.found).toBe(false);
  });

  // ── Invalid input ───────────────────────────────────────────────────────────

  test('Missing zipCode → 400 with error message', async () => {
    const res = await request(app)
      .post('/api/price-check')
      .send({ productId: 'gid://shopify/Product/5' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('ZIP with letters (ABCDE) → 400', async () => {
    const res = await request(app)
      .post('/api/price-check')
      .send({ zipCode: 'ABCDE', productId: 'gid://shopify/Product/6' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid ZIP code format');
  });

  test('ZIP with 4 digits → 400', async () => {
    const res = await request(app)
      .post('/api/price-check')
      .send({ zipCode: '7502', productId: 'gid://shopify/Product/7' });

    expect(res.status).toBe(400);
  });

  test('ZIP with 6 digits → 400', async () => {
    const res = await request(app)
      .post('/api/price-check')
      .send({ zipCode: '750280', productId: 'gid://shopify/Product/8' });

    expect(res.status).toBe(400);
  });

  test('Empty string zipCode → 400', async () => {
    const res = await request(app)
      .post('/api/price-check')
      .send({ zipCode: '', productId: 'gid://shopify/Product/9' });

    expect(res.status).toBe(400);
  });

  test('Missing productId → 400', async () => {
    const res = await request(app)
      .post('/api/price-check')
      .send({ zipCode: '75028' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

// ─── GET /api/health ──────────────────────────────────────────────────────────

describe('GET /api/health', () => {
  test('Returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('Response contains a timestamp field', async () => {
    const res = await request(app).get('/api/health');

    expect(res.body).toHaveProperty('timestamp');
    expect(new Date(res.body.timestamp).toString()).not.toBe('Invalid Date');
  });
});

// ─── GET /api/pricing-zones ───────────────────────────────────────────────────

describe('GET /api/pricing-zones', () => {
  test('Returns 200', async () => {
    const res = await request(app).get('/api/pricing-zones');
    expect(res.status).toBe(200);
  });

  test('Response is an array', async () => {
    const res = await request(app).get('/api/pricing-zones');
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('Contains an entry for ZIP 75028', async () => {
    const res = await request(app).get('/api/pricing-zones');
    const zone = res.body.find((z) => z.zipCode === '75028');
    expect(zone).toBeDefined();
    expect(zone.price).toBe(1499);
  });
});

// ─── pricingEngine Unit Tests ─────────────────────────────────────────────────

describe('pricingEngine service (unit)', () => {
  test('getPrice("75028") returns 1499', () => {
    const result = getPrice('75028');
    expect(result.price).toBe(1499);
    expect(result.found).toBe(true);
  });

  test('getPrice("99999") returns default price', () => {
    const result = getPrice('99999');
    expect(result.price).toBe(DEFAULT_PRICE);
    expect(result.found).toBe(false);
  });
});
