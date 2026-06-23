# 🎬 Loom Demo Script — Shopify ZIP Code Dynamic Pricing (90 seconds)

---

## Pre-Recording Checklist

- [ ] Backend API running locally on `http://localhost:3001`
- [ ] Shopify dev store open in browser with product page visible
- [ ] ZIP checker widget visible on the page (no scroll needed)
- [ ] Browser devtools console open (optional, for debug logs)
- [ ] Screen recording at 1920×1080, audio on

---

## Recording Script

---

### ▶ Segment 1 — 0:00 – 0:10 · Show the widget

**On screen:** Shopify product page with the ZIP Price Checker widget below the product description.

> **Say:** "Here's a Shopify product page with a ZIP-code-based dynamic pricing widget — built as a Theme App Extension with zero external JS dependencies."

---

### ▶ Segment 2 — 0:10 – 0:25 · Type ZIP 75028

**Action:** Click the ZIP input field. Slowly type `7` `5` `0` `2` `8`.

**On screen:** As you type the 5th digit, the input border turns green, a ✓ appears, and after 400ms the skeleton loader animates — then the price fades in with a slide-up animation: **"Price for 75028: $1,499"**

> **Say:** "Watch — as I finish typing the 5-digit ZIP, it auto-submits, and the price animates in. No button click required."

---

### ▶ Segment 3 — 0:25 – 0:40 · Change to ZIP 10001

**Action:** Clear the input, type `1` `0` `0` `0` `1`.

**On screen:** Skeleton appears, then price updates to **"Price for 10001: $1,699"**

> **Say:** "Switching to a New York ZIP — $1,699. Each region has its own price, all managed in the backend."

---

### ▶ Segment 4 — 0:40 – 0:55 · Change to ZIP 90210

**Action:** Clear the input, type `9` `0` `2` `1` `0`.

**On screen:** Price updates to **"Price for 90210: $1,799"**

> **Say:** "Beverly Hills — $1,799. For unknown ZIPs, a $1,299 fallback is shown automatically."

---

### ▶ Segment 5 — 0:55 – 1:10 · Show backend API

**Action:** Switch to a new browser tab. Navigate to `http://localhost:3001/api/pricing-zones`.

**On screen:** JSON array showing all three ZIP zones.

> **Say:** "The backend is a Node.js Express API — this admin endpoint returns all configured pricing zones. The POST endpoint handles validation, rate limiting, and returns the price in under 50ms."

---

### ▶ Segment 6 — 1:10 – 1:20 · Theme editor

**Action:** Open the Shopify theme editor. Click on the ZIP Price Checker block in the sidebar.

**On screen:** The block settings panel showing "Backend API URL" and "Section Title" fields.

> **Say:** "The backend URL is fully configurable from the Shopify theme editor — no code changes needed when you redeploy."

---

### ▶ Segment 7 — 1:20 – 1:30 · GitHub README

**Action:** Switch to the GitHub repository tab showing the README.

**On screen:** README with badge, architecture diagram, and API reference visible.

> **Say:** "Full source on GitHub — Node backend, Shopify Liquid block, Vercel config, and Jest tests — all production-ready. Link in the description."

---

## 📝 LinkedIn Caption

> 🚀 Just shipped a full-stack Shopify ZIP-code dynamic pricing feature — in an afternoon.
>
> A Shopify Theme App Extension (Liquid + vanilla JS) talks to a Node.js/Express API deployed on Vercel to serve location-specific prices in real-time. No page refresh, no external dependencies, fully accessible and mobile-responsive.
>
> Stack: Node.js · Express · Vercel · Shopify CLI 3 · Liquid · Vanilla JS · Jest
>
> Built with AI-assisted development (Claude + Antigravity) — this is the speed of modern fullstack engineering.
>
> 👇 Demo in the video. Code + docs on GitHub (link in comments).
>
> #Shopify #NodeJS #API #AIAssistedDevelopment #Ecommerce #Vercel #FullStack

---

*Script runtime target: 88–92 seconds at a comfortable speaking pace.*
