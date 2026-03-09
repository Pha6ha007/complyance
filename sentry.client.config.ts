/**
 * Sentry Client-side Configuration
 *
 * NOTE: Requires @sentry/nextjs package
 * Install: pnpm add @sentry/nextjs
 */

// This file configures Sentry for the browser (client-side)
try {
  const Sentry = require('@sentry/nextjs');

  const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,

      // Performance monitoring
      tracesSampleRate: 0.1,

      // Session Replay
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

      // Environment
      environment: process.env.NODE_ENV || 'development',

      // Integrations
      integrations: [
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],

      // Ignore common client errors
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
        // Network errors
        'Failed to fetch',
        'NetworkError',
        'Network request failed',
        // Browser extension errors
        'Extension context invalidated',
        '__gCrWeb',
        '__firefox__',
      ],

      // Filter out sensitive data
      beforeSend(event, hint) {
        // Remove sensitive query params
        if (event.request?.url) {
          try {
            const url = new URL(event.request.url);
            url.searchParams.delete('token');
            url.searchParams.delete('key');
            url.searchParams.delete('password');
            event.request.url = url.toString();
          } catch (e) {
            // Invalid URL, ignore
          }
        }

        return event;
      },
    });

    console.log('✓ Sentry initialized (client-side)');
  }
} catch (error) {
  // Sentry package not installed - fail silently
  console.warn('Sentry package not found. Install with: pnpm add @sentry/nextjs');
}
