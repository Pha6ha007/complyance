/**
 * Sentry Edge Runtime Configuration
 *
 * NOTE: Requires @sentry/nextjs package
 * Install: pnpm add @sentry/nextjs
 */

// This file configures Sentry for edge runtime (middleware, edge API routes)
try {
  const Sentry = require('@sentry/nextjs');

  const SENTRY_DSN = process.env.SENTRY_DSN;

  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,

      // Performance monitoring
      tracesSampleRate: 0.1,

      // Environment
      environment: process.env.NODE_ENV || 'development',

      // Edge runtime has limited integrations
      integrations: [],
    });

    console.log('✓ Sentry initialized (edge runtime)');
  }
} catch (error) {
  // Sentry package not installed - fail silently
  console.warn('Sentry package not found for edge runtime');
}
