# Concerns

**Analysis Date:** 2026-03-13

## Critical Blockers (Must Fix Before Launch)

### Paddle Price IDs Are Placeholder Values

**Severity:** CRITICAL — payments completely broken

Placeholder strings `'pri_01j...starter'`, `'pri_01j...professional'`, `'pri_01j...scale'` used in 2 places:

- `src/server/services/billing/paddle.ts:7-9` — `PADDLE_PRODUCT_MAP` (webhook → plan mapping)
- `src/app/[locale]/(marketing)/pricing/page.tsx:139,160,182` — checkout button price IDs

**Impact:** No user can upgrade. Webhook handler will not match any plan. Checkout button will fail with invalid price ID.

**Fix:** Create products in Paddle dashboard, replace placeholder strings with real `pri_*` IDs.

---

### Settings Page Mutations Are Stubs

**File:** `src/app/[locale]/(dashboard)/settings/page.tsx:32,36`

```typescript
// TODO: Implement with tRPC
```

The general settings page has at minimum 2 mutation handlers that are stubs. If users can see settings fields (name, locale, etc.) but save does nothing, this is a trust-breaking UX issue.

---

### Contact and Partner Forms Don't Send Emails

**Files:**
- `src/app/api/contact/route.ts:16` — `// TODO: Send email via Resend`
- `src/app/api/partners/route.ts:18` — `// TODO: Send email via Resend to partnerships@complyance.io`

Forms appear to work (return 200) but email is never sent. Leads and partner inquiries are silently dropped.

---

## Technical Debt

### console.log Violations

CLAUDE.md Definition of Done requires zero `console.log` in production code. Current violations:

**`src/app/api/contact/route.ts`**
- `console.log('Contact form submission:', data)` — leaks form data to logs

**`src/app/api/partners/route.ts`**
- `console.log('Partnership application:', data)` — leaks applicant data

**`src/app/api/webhooks/paddle/route.ts`** (4 instances)
- `console.log('Paddle webhook received:', eventType)`
- `console.log('Payment succeeded for subscription:', ...)`
- `console.log('Payment failed for subscription:', ...)`
- `console.log('Unhandled Paddle event type:', eventType)`

**`src/server/services/classification/engine.ts`** (7 instances)
- Multiple `[Classification Engine]` prefixed logs throughout pipeline

**`src/server/services/classification/llm.ts`** (6 instances)
- Raw LLM response logged: `console.log('[Classification] Raw LLM response:', rawText)` — could log sensitive system descriptions

**`src/server/routers/system.ts:170`**
- `console.log('📊 Analytics: system_created', ...)` — analytics via console instead of PostHog

All should be replaced with Sentry (`captureException`) or PostHog events, or removed.

---

### `require('crypto')` in ES Module Context

**File:** `src/app/api/webhooks/paddle/route.ts:32`

```typescript
const crypto = require('crypto');
```

CommonJS `require()` used inside an ESM context (`export async function`). Should be `import crypto from 'crypto'` at file top. Works in Node.js but is inconsistent with the rest of the codebase's ESM imports and can cause issues with some bundler configurations.

---

### `any` Type in tRPC Context

**File:** `src/server/trpc.ts:71`

```typescript
path: (shape as any).path,
```

Typed as `any` in the Sentry error formatter. Minor, but contradicts strict TypeScript mode.

---

### Duplicate PLAN_LIMITS Definitions

Plan limits are defined in two separate files with different structures:

- `src/lib/constants.ts` — used by most routers
- `src/server/services/billing/paddle.ts` — used by billing pages

They must be kept in sync manually. Risk of divergence as plans evolve. Single source of truth needed.

---

### Missing tRPC Routers

**File:** `src/server/routers/_app.ts:25-29`

```typescript
// TODO: Add other routers as they are created:
// incident: incidentRouter,
// team: teamRouter,
// billing: billingRouter,
```

3 routers not connected:
- **Incident register** — `Incident` model exists in schema, no router
- **Team management** — `UserRole` enum exists (COMPLIANCE_MANAGER, DEVELOPER, VIEWER), no multi-user flow
- **Billing router** — billing actions handled ad-hoc in pages, no centralized tRPC billing router

---

### BullMQ Worker Coupling

The PDF generation worker is a separate Railway service. If:
- Redis goes down → PDF jobs silently queue and wait
- Worker crashes → documents never generate, users see pending state forever
- No dead-letter queue or job failure alerting configured (not visible in codebase)

The `Document` model has a `status` field (DRAFT/FINAL/ARCHIVED) but no explicit FAILED state for jobs that error.

---

## Security Concerns

### Classification Results Store Sensitive Data in LLM Response Logs

`src/server/services/classification/llm.ts:99`:
```typescript
console.log('[Classification] Raw LLM response:', rawText);
```

Raw LLM output (containing system descriptions, use cases, potentially sensitive business data) logged to stdout. In Railway, stdout goes to Railway logs which may be accessible to anyone with project access.

---

### Webhook Signature Verification Uses `require('crypto')`

Minor: `require('crypto')` in webhook handler (see above). The logic itself is correct (HMAC SHA-256, timing-safe comparison), but the import style is inconsistent.

---

### No Rate Limiting on Public API Endpoints

`/api/public/v1/classify` and `/api/public/v1/badge/[orgId]` are unauthenticated. No rate limiting visible in codebase. The free classifier could be abused to run unlimited Claude API calls.

---

### Contact/Partner Forms Accept Arbitrary Input

`src/app/api/contact/route.ts` and `src/app/api/partners/route.ts` — Zod validation exists but no spam protection (CAPTCHA, honeypot, rate limiting).

---

## Performance Concerns

### PDF Generation Is Synchronous in Worker

If multiple users generate PDFs simultaneously, worker processes them sequentially (single BullMQ worker per Railway instance). No concurrency configuration visible. Under load, PDF generation queue could back up significantly.

---

### Classification Engine Makes Sequential LLM Calls

`src/server/services/classification/llm.ts` retries on failure but runs single call per classification. No batching. Under high load, classification latency directly proportional to Claude API response time (~2-5s per request).

---

## Not Yet Implemented (Post-Launch Deferred)

Per CLAUDE.md and schema evidence:

| Feature | Evidence of Intent | Status |
|---------|-------------------|--------|
| Referral system | `ReferralCode`/`ReferralReward` models exist, `rewards.ts` written | No UI entry point |
| Incident register | `Incident` model exists, no router/UI | Deferred |
| Team management | `UserRole` enum with 4 roles, no multi-user flow | Deferred |
| CI/CD API | `cicdApi` flag in PLAN_LIMITS for SCALE | Deferred |
| Vendor Assessment PDF | `VENDOR_ASSESSMENT` in `DocType` enum | Template not built |
| Model Card PDF | `MODEL_CARD` in `DocType` enum | Template not built |
| Bias Report PDF | `BIAS_REPORT` in `DocType` enum | Template not built |
| Regulation DB models | Referenced in CLAUDE.md: `Regulation`, `RiskCategory` etc. | Not in schema |
| GDPR module | `gdprModule: true` for SCALE in PLAN_LIMITS | Not implemented |

---

## Code Quality Notes

- **Blog loading** uses filesystem reads at request time (`src/lib/blog.ts`) — should be cached or pre-built at build time for production performance
- **Settings page** (`src/app/[locale]/(dashboard)/settings/page.tsx`) — stub TODOs suggest it was scaffolded but not wired up to tRPC
- **Intelligence router** — uses in-memory `REGULATION_CODES` array and `REGULATION_TO_MARKETS` map that duplicates business logic — these should eventually move to the database (per CLAUDE.md's mention of planned `Regulation` model)

---

*Concerns analysis: 2026-03-13*
