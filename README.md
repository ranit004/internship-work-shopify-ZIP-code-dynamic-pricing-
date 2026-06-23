# 🛍️ Shopify ZIP Code Dynamic Pricing

[![Node Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Franit004%2Finternship-work-shopify-ZIP-code-dynamic-pricing-)

**Live API:** https://shopify-zip-pricing-api.vercel.app

> A **Shopify Theme App Extension + Node.js API** that delivers real-time, location-based pricing on product pages — built end-to-end in under 2 hours using AI-assisted development.

---

## 📹 Demo

> *(Demo GIF)*
>
> (https://drive.google.com/drive/u/0/folders/1P5_d9tRflhvrb6gdUuSHW-IridJxEZl3)

---

## ✨ Features

- 📍 **ZIP-code-based dynamic pricing** — different prices per market/region
- ⚡ **Real-time auto-submit** — price loads automatically as you type
- 💀 **Skeleton loading UI** — polished UX with animated placeholders
- 🎨 **Theme-agnostic** — CSS custom properties adapt to any Shopify theme
- 🔒 **Rate limited** — 100 req / 15 min per IP via `express-rate-limit`
- 🛡️ **Helmet-secured** — security headers out of the box
- ♿ **Fully accessible** — `aria-live`, `aria-label`, keyboard navigation
- 🚀 **One-command Vercel deploy** — serverless, zero-config
- ✅ **Jest-tested** — full HTTP layer + unit test coverage

---

## 🏗️ Architecture

```
                    Shopify Storefront
                         │
           ┌─────────────▼─────────────┐
           │  Theme App Extension       │
           │  blocks/zip-price-checker  │
           │  (Liquid + JS + CSS)       │
           └─────────────┬─────────────┘
                         │ POST /api/price-check
                         │ fetch()
                         ▼
              ┌──────────────────────┐
              │  Express API (Vercel) │
              │  ┌────────────────┐  │
              │  │  Rate Limiter  │  │
              │  │  Helmet / CORS │  │
              │  │  Validation MW │  │
              │  │  pricingEngine │  │
              │  └────────────────┘  │
              └──────────────────────┘
                         │
              ┌──────────▼───────────┐
              │  ZIP → Price Map     │
              │  75028 → $1,499      │
              │  10001 → $1,699      │
              │  90210 → $1,799      │
              │  *     → $1,299      │
              └──────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend runtime | Node.js 18+ |
| HTTP framework | Express 4 |
| Security | Helmet, CORS |
| Rate limiting | express-rate-limit |
| Request logging | Morgan |
| Config | dotenv |
| Testing | Jest + Supertest |
| Dev server | Nodemon |
| Deployment | Vercel (serverless) |
| Storefront | Shopify Theme App Extension (Liquid) |
| Frontend JS | Vanilla ES2020 (no dependencies) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** — [download](https://nodejs.org/)
- **Shopify CLI 3+** — `npm install -g @shopify/cli`
- **Shopify Partner account** — [partners.shopify.com](https://partners.shopify.com/)
- **Vercel CLI** (optional for deploy) — `npm install -g vercel`

### 1 · Clone & install backend

```bash
git clone https://github.com/YOUR_USERNAME/shopify-zip-pricing.git
cd shopify-zip-pricing/backend
npm install
```

### 2 · Configure environment

```bash
cp .env.example .env
# Edit .env — set PORT, ALLOWED_ORIGINS
```

### 3 · Run locally

```bash
npm run dev
# API running at http://localhost:3001
```

Quick smoke test:

```bash
curl -X POST http://localhost:3001/api/price-check \
  -H "Content-Type: application/json" \
  -d '{"zipCode":"75028","productId":"gid://shopify/Product/1"}'
```

### 4 · Deploy to Vercel

```bash
npm install          # install deps
vercel login         # authenticate
vercel --prod        # deploy → get live URL
```

Set environment variables in the Vercel dashboard:

| Variable | Example value |
|---|---|
| `NODE_ENV` | `production` |
| `ALLOWED_ORIGINS` | `https://your-store.myshopify.com` |

### 5 · Install Shopify extension

```bash
cd ../shopify-extension

# Create app (first time)
shopify app create extension

# Develop locally
shopify app dev

# Deploy
shopify app deploy
```

### 6 · Configure extension backend URL

1. Open your Shopify theme editor → **Add section → ZIP Price Checker**
2. In the **Backend API URL** field, paste your Vercel deployment URL (e.g. `https://shopify-zip-pricing.vercel.app`)
3. Save and publish.

---

## 📡 API Reference

### `POST /api/price-check`

**Request**

```json
{
  "zipCode": "75028",
  "productId": "gid://shopify/Product/123"
}
```

**Response (200)**

```json
{
  "price": 1499,
  "currency": "USD",
  "label": "$1,499",
  "zipCode": "75028",
  "found": true
}
```

**Error (400)**

```json
{ "error": "Invalid ZIP code format" }
```

---

### `GET /api/health`

```json
{ "status": "ok", "timestamp": "2024-01-15T12:00:00.000Z" }
```

---

### `GET /api/pricing-zones`

```json
[
  { "zipCode": "75028", "price": 1499, "label": "$1,499", "currency": "USD" },
  { "zipCode": "10001", "price": 1699, "label": "$1,699", "currency": "USD" },
  { "zipCode": "90210", "price": 1799, "label": "$1,799", "currency": "USD" }
]
```

---

## 🗺️ Test ZIP Codes

| ZIP Code | City | Price |
|---|---|---|
| `75028` | Flower Mound, TX | **$1,499** |
| `10001` | New York, NY | **$1,699** |
| `90210` | Beverly Hills, CA | **$1,799** |
| any other | — (fallback) | **$1,299** |

---

## 🧪 Running Tests

```bash
cd backend
npm test
```

Expected output: **14 tests, 14 passing** ✅

---

## 📁 Project Structure

```
shopify-zip-pricing/
├── backend/
│   ├── src/
│   │   ├── index.js                  # Express app entry point
│   │   ├── routes/
│   │   │   └── pricing.js            # Route handlers
│   │   ├── services/
│   │   │   └── pricingEngine.js      # ZIP→price business logic
│   │   ├── middleware/
│   │   │   ├── validation.js         # Input validation
│   │   │   └── errorHandler.js       # Global error handler
│   │   └── __tests__/
│   │       └── pricing.test.js       # Jest + Supertest tests
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── vercel.json
└── shopify-extension/
    ├── blocks/
    │   └── zip-price-checker.liquid  # Theme block (Liquid + JS + CSS)
    └── shopify.extension.toml
```

---

## 🔧 Adding New ZIP Codes / Regions

Open `backend/src/services/pricingEngine.js` and add entries to `PRICING_MAP`:

```js
const PRICING_MAP = new Map([
  ['75028', 1499],
  ['10001', 1699],
  ['90210', 1799],
  // ↓ Add new markets here
  ['60601', 1599],  // Chicago, IL
  ['30301', 1399],  // Atlanta, GA
]);
```

Redeploy with `vercel --prod`. No frontend changes required — the Liquid block is data-driven.

For **regional pricing** (state/country level), replace the flat Map with a range-lookup function in `pricingEngine.js` using a ZIP → state database (e.g. `zips` npm package).

---

## 🤖 Built with AI

This project was scaffolded and polished using AI-assisted development (Claude Sonnet + Antigravity), demonstrating how modern AI tooling enables a complete, production-ready fullstack feature to be delivered in a fraction of the traditional timeline.

---

## 📄 License

[MIT](LICENSE) © 2024
