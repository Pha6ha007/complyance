/**
 * Sentry Instrumentation (Server-side)
 *
 * NOTE: Requires @sentry/nextjs package
 * Install: pnpm add @sentry/nextjs
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      // Dynamic import to handle missing package gracefully
      const Sentry = await import('@sentry/nextjs');

      const SENTRY_DSN = process.env.SENTRY_DSN;

      // Only initialize if DSN is provided (skip in dev mode if not set)
      if (SENTRY_DSN) {
        Sentry.init({
          dsn: SENTRY_DSN,

          // Performance monitoring
          tracesSampleRate: 0.1, // 10% of transactions for performance monitoring

          // Environment
          environment: process.env.NODE_ENV || 'development',

          // Release tracking
          release: process.env.VERCEL_GIT_COMMIT_SHA || 'dev',

          // Session replay
          // replaysSessionSampleRate: 0.1,
          // replaysOnErrorSampleRate: 1.0,

          // Ignore common non-errors
          ignoreErrors: [
            'ResizeObserver loop limit exceeded',
            'Non-Error promise rejection captured',
          ],

          // Filter out sensitive data
          beforeSend(event) {
            // Remove sensitive headers
            if (event.request?.headers) {
              delete event.request.headers['authorization'];
              delete event.request.headers['cookie'];
            }
            return event;
          },
        });
      }
    } catch (error) {
      // Sentry package not installed - fail silently
      console.warn('Sentry package not found. Install with: pnpm add @sentry/nextjs');
    }
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    try {
      const Sentry = await import('@sentry/nextjs');

      const SENTRY_DSN = process.env.SENTRY_DSN;

      if (SENTRY_DSN) {
        Sentry.init({
          dsn: SENTRY_DSN,
          tracesSampleRate: 0.1,
          environment: process.env.NODE_ENV || 'development',
        });
      }
    } catch (error) {
      console.warn('Sentry package not found for edge runtime');
    }
  }
}
