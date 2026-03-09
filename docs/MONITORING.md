# Monitoring Setup Guide

This document explains how to set up and use Sentry (error tracking) and PostHog (product analytics) for the Complyance platform.

---

## Overview

The platform uses two monitoring tools:

1. **Sentry** — Error tracking and performance monitoring
2. **PostHog** — Product analytics and user behavior tracking

Both tools are **optional** and fail gracefully if not configured. The app works perfectly fine without them in development.

---

## 1. Sentry Setup (Error Tracking)

### Installation

```bash
pnpm add @sentry/nextjs
```

### Configuration

Add to `.env`:

```bash
SENTRY_DSN="https://your-key@o123456.ingest.sentry.io/123456"
NEXT_PUBLIC_SENTRY_DSN="" # Optional - uses SENTRY_DSN if not set
SENTRY_ORG="your-org-slug" # Optional
SENTRY_PROJECT="complyance" # Optional
```

### How It Works

- **Server-side:** `src/instrumentation.ts` — Initializes Sentry for Node.js runtime
- **Client-side:** `sentry.client.config.ts` — Initializes Sentry for browser
- **Edge runtime:** `sentry.edge.config.ts` — Initializes Sentry for edge functions
- **Next.js config:** `next.config.mjs` — Wraps config with `withSentryConfig`
- **tRPC integration:** `src/server/trpc.ts` — Captures server errors in error formatter

### What Gets Tracked

- ✅ Server-side errors (API routes, tRPC procedures)
- ✅ Client-side errors (React component errors, unhandled promises)
- ✅ Edge runtime errors (middleware, edge functions)
- ✅ Performance traces (10% sample rate)
- ✅ Session replays (10% of sessions, 100% with errors)

### Privacy & Security

- Authorization headers and cookies are filtered out
- Sensitive query params (token, key, password) are removed
- Common non-errors (ResizeObserver, network errors) are ignored
- All text is masked in session replays

### Development

If `SENTRY_DSN` is not set, Sentry won't initialize. Check console for:

```
✓ Sentry initialized (server-side)
✓ Sentry initialized (client-side)
```

---

## 2. PostHog Setup (Product Analytics)

### Installation

```bash
pnpm add posthog-js
```

### Configuration

Add to `.env`:

```bash
NEXT_PUBLIC_POSTHOG_KEY="phc_your_key_here"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com" # Optional
```

### How It Works

- **Provider:** `src/components/shared/posthog-provider.tsx` — Wraps app in PostHogProvider
- **Root layout:** Includes PHProvider at the top level
- **Analytics utility:** `src/lib/analytics.ts` — Pre-defined tracking functions

### What Gets Tracked

The platform tracks these key events:

#### AI System Events
- `system_created` — When a new AI system is added
- `system_classified` — When classification completes
- `system_deleted` — When a system is removed

#### Document Events
- `document_generated` — When a PDF is generated
- `document_downloaded` — When a document is downloaded

#### Vendor Events
- `vendor_added` — When a vendor is added
- `vendor_assessed` — When vendor risk assessment completes

#### Billing Events
- `plan_upgraded` — When user upgrades subscription
- `plan_downgraded` — When user downgrades subscription
- `subscription_cancelled` — When subscription is canceled

#### User Events
- `user_signed_up` — On successful registration
- `user_logged_in` — On successful login
- `user_logged_out` — On logout

#### Public Tool Events
- `free_classifier_used` — When free classifier is used (no account needed)

### Usage in Code

```typescript
import { analytics } from '@/lib/analytics';

// Track system creation
analytics.systemCreated(systemId, systemName, aiType, domain);

// Track classification
analytics.systemClassified(systemId, riskLevel, confidenceScore, annexIIICategory);

// Track plan upgrade (server-side logs, PostHog picks it up via webhooks)
analytics.planUpgraded(fromPlan, toPlan, subscriptionId);

// Identify user (on login)
analytics.userSignedUp(userId, email, locale, plan);
```

### Privacy & Security

- Respects Do Not Track (DNT) browser setting
- All input fields are masked in session recordings
- Custom `.ph-no-capture` class to exclude specific elements
- Users can opt out via browser settings

### Development

If `NEXT_PUBLIC_POSTHOG_KEY` is not set, PostHog won't initialize. Check console for:

```
✓ PostHog initialized
```

In development mode, PostHog runs in debug mode with verbose logging.

---

## 3. Server-Side Tracking (Backend Events)

Some events are tracked server-side (e.g., in Paddle webhooks or tRPC mutations). These are logged with a `📊 Analytics:` prefix:

```typescript
console.log('📊 Analytics: system_created', {
  system_id: systemId,
  system_name: systemName,
  ai_type: aiType,
  domain,
});
```

These logs:
1. Show up in Railway logs for debugging
2. Can be processed by PostHog via log ingestion (if configured)
3. Provide audit trail for key events

---

## 4. Production Deployment

### Environment Variables

On Railway, add these environment variables:

```bash
# Sentry
SENTRY_DSN=https://your-key@o123456.ingest.sentry.io/123456
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=complyance

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Sentry Release Tracking

The platform automatically tracks releases using the Git commit SHA:

```typescript
release: process.env.VERCEL_GIT_COMMIT_SHA || 'dev'
```

On Railway, set:

```bash
VERCEL_GIT_COMMIT_SHA=$RAILWAY_GIT_COMMIT_SHA
```

This allows Sentry to:
- Track which errors belong to which release
- Show release health metrics
- Link errors to specific commits

---

## 5. Monitoring Best Practices

### Error Handling

Always log errors before throwing:

```typescript
try {
  await riskyOperation();
} catch (error) {
  console.error('Operation failed:', error);
  // Sentry automatically captures this
  throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', cause: error });
}
```

### User Identification

Identify users as early as possible:

```typescript
// In login callback
import { identifyUser } from '@/components/shared/posthog-provider';

identifyUser(user.id, {
  email: user.email,
  plan: user.organization.plan,
  locale: user.locale,
  organizationId: user.organizationId,
});
```

### Custom Events

For new features, add tracking:

```typescript
import { track } from '@/lib/analytics';

track('feature_name_used', {
  feature_id: 'custom-feature',
  user_id: userId,
  // ... other properties
});
```

---

## 6. Troubleshooting

### Sentry Not Working

1. Check if `SENTRY_DSN` is set
2. Look for `✓ Sentry initialized` in console
3. Verify webhook secret in Sentry dashboard
4. Check Railway logs for error details

### PostHog Not Working

1. Check if `NEXT_PUBLIC_POSTHOG_KEY` is set
2. Look for `✓ PostHog initialized` in console
3. Open browser DevTools → Network → Filter by "posthog"
4. Check if events are being sent

### Events Not Showing Up

- **PostHog:** Events may take 1-2 minutes to appear in dashboard
- **Sentry:** Errors appear instantly, but releases need to be finalized
- **Server-side:** Check Railway logs for `📊 Analytics:` prefix

---

## 7. Cost Management

### Sentry

- **Free tier:** 5,000 errors/month, 10,000 performance traces/month
- **Traces sample rate:** 0.1 (10%) — adjust in `instrumentation.ts`
- **Session replay:** 0.1 (10%) — adjust in `sentry.client.config.ts`

### PostHog

- **Free tier:** 1M events/month, 5,000 session recordings/month
- **Autocapture:** Enabled by default (can be disabled)
- **Session recording:** Enabled (can be disabled per environment)

To reduce costs:

```typescript
// In posthog-provider.tsx
session_recording: {
  maskAllInputs: true,
  // Only record in production
  enabled: process.env.NODE_ENV === 'production',
}
```

---

## 8. GDPR Compliance

Both tools are GDPR-compliant when configured correctly:

### Sentry
- Hosted in EU (select EU region in Sentry settings)
- Data retention: 90 days (configurable)
- User data deletion: Via Sentry API

### PostHog
- Self-hosted option available (recommended for EU)
- Data retention: Configurable
- User data deletion: Built-in GDPR features

### User Privacy

Add to Privacy Policy:

> We use Sentry for error tracking and PostHog for product analytics. These tools collect anonymized usage data to improve the platform. You can opt out via your browser's Do Not Track setting. For data deletion requests, contact support@complyance.io.

---

## 9. Further Reading

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [PostHog Next.js Documentation](https://posthog.com/docs/libraries/next-js)
- [tRPC Error Handling](https://trpc.io/docs/server/error-handling)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)

---

## Summary

✅ **Sentry** tracks errors and performance issues
✅ **PostHog** tracks user behavior and product usage
✅ Both are **optional** and fail gracefully if not configured
✅ Server-side events logged with `📊 Analytics:` prefix
✅ GDPR-compliant when configured correctly
✅ Free tiers available for both tools

**Next steps:**
1. Install packages: `pnpm add @sentry/nextjs posthog-js`
2. Add environment variables to Railway
3. Deploy and verify logs show initialization messages
4. Monitor dashboard for errors and analytics
