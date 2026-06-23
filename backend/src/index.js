'use strict';

/**
 * @fileoverview Express application entry point.
 * Configures middleware, mounts routes, and either starts a local server
 * or exports the app for Vercel serverless deployment.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const pricingRouter = require('./routes/pricing');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// ─── Security & Utility Middleware ────────────────────────────────────────────

/** Parse allowed origins from environment (comma-separated) or allow all */
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : '*';

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());

// ─── Rate Limiting ─────────────────────────────────────────────────────────────

/**
 * Limits each IP to 100 requests per 15-minute window.
 * Applied only to /api/* routes.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

app.use('/api', apiLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api', pricingRouter);

/** 404 handler for undefined routes */
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────

app.use(errorHandler);

// ─── Server Startup ───────────────────────────────────────────────────────────

/**
 * Start the HTTP server when running locally (not imported by Vercel).
 * Vercel imports this file and uses `module.exports = app` directly.
 */
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Pricing API running on http://localhost:${PORT}`);
  });
}

// Export for Vercel serverless compatibility
module.exports = app;
