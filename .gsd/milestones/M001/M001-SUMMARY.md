---
id: M001
provides:
  - Working Paddle billing with env-var price IDs and unified webhook mapping
  - Settings page with real DB data via tRPC (getSettings, updateProfile, updateOrganization)
  - Contact and partner email delivery via Resend
  - Zero console.log across entire src/
  - Single PLAN_LIMITS definition in constants.ts
  - Fixed pricing page i18n plurals
key_decisions:
  - Paddle price IDs via env vars (PADDLE_PRICE_STARTER/PROFESSIONAL/SCALE) — no hardcoded IDs
  - Settings tRPC procedures added to systemRouter (not a new router) to avoid touching _app.ts
  - PLAN_LIMITS consolidated in constants.ts with 999 as unlimited sentinel; paddle.ts re-exports
  - console.error/warn kept for real operational errors; only console.log removed
  - Contact/partner routes rewritten to use existing sendEmail service instead of inline Resend
patterns_established:
  - Env-var-driven config for external service IDs (Paddle prices)
  - Single source of truth for plan limits with re-exports for backward compat
  - Email sending via sendEmail service wrapper, not direct Resend calls
observability_surfaces:
  - console.error in paddle webhook for signature/customer failures
  - console.warn in email service for send failures
  - Sentry error tracking (init logs removed, error capture still active)
requirement_outcomes: []
duration: ~3 hours across 4 slices
verification_result: passed
completed_at: 2026-03-16
---

# M001: Launch Readiness & Critical Fixes

**All critical pre-launch issues fixed: billing wired to real Paddle prices, settings page functional, email sending live, zero console.log, and plan limits unified.**

## What Happened

S01 tackled the highest-risk issue: Paddle billing was completely non-functional with hardcoded placeholder price IDs. Replaced with env-var-driven `buildPaddlePriceMap()`, unified the webhook handler's separate inline mapping into the same `getPlanFromPaddlePrice()` function, switched from CJS `require('crypto')` to ESM import, and removed 4 console.log calls from billing code.

S02 wired the settings page to real data. Added three tRPC procedures (`getSettings`, `updateProfile`, `updateOrganization`) to systemRouter. Rewrote the settings page from hardcoded `useState('Pavel')` to real session/DB data with tRPC mutations. Also fixed pricing page i18n — two ICU plural messages (`vendors` on Free, `biasTesting` on Starter) were called without the required `{ count }` param, showing raw keys instead of translated text.

S03 made contact and partner forms actually send email. Both route handlers had commented-out Resend code. Rewrote them to use the existing `sendEmail` service, sending both an internal notification and a confirmation email to the submitter.

S04 cleaned up remaining console.log (19 instances across 6 files) and consolidated the duplicate PLAN_LIMITS. The paddle.ts copy had different field names (`documents` vs `docGeneration`, `cicdAPI` vs `cicdApi`) and different unlimited sentinels (999999 vs 999). Removed the duplicate, updated paddle.ts to import and re-export from constants.ts, and updated the billing settings page to use constants.ts field names.

## Cross-Slice Verification

| Criterion | Method | Result |
|-----------|--------|--------|
| `npx tsc --noEmit` zero errors | Ran after every slice | PASS |
| Zero console.log in src/ | `rg 'console\.log' src/ --glob '*.ts' --glob '*.tsx'` | PASS — 0 matches |
| No hardcoded Paddle price IDs | `rg 'pri_01j' src/` | PASS — 0 matches |
| No require() in webhook | `rg "require(" src/app/api/webhooks/` | PASS — 0 matches |
| No TODO stubs in settings | `rg 'TODO.*tRPC' settings/page.tsx` | PASS — 0 matches |
| Single PLAN_LIMITS definition | `rg 'export const PLAN_LIMITS' src/` | PASS — 1 match (constants.ts) |
| No hardcoded user data | `rg "useState('Pavel')" src/` | PASS — 0 matches |

## Requirement Changes

None — no REQUIREMENTS.md exists yet (pre-existing project, no formal requirements tracked).

## Forward Intelligence

### What the next milestone should know
- The _app.ts router file has commented-out `incident`, `team`, and `billing` routers — these are deferred past M001. Any M002+ work that needs new routers should check if these stubs should be activated.
- The email service (`src/server/services/email.ts`) uses a `RESEND_API_KEY` env var and provides `sendEmail()` with subject/html/text/replyTo. New email features should use this wrapper.
- Settings page is `"use client"` with tRPC hooks. It's one of the few client-side pages in the dashboard.

### What's fragile
- paddle.ts re-exports PLAN_LIMITS from constants.ts — if someone adds it back locally, there'll be two definitions again. The `canPerformAction` function manually maps action names to field names.
- The pricing page i18n fix was minimal — only patched the two calls that were broken. Other ICU messages may have similar issues if called without required params.
- Contact/partner routes don't have rate limiting — public endpoints that send email.

### Authoritative diagnostics
- `rg 'console\.' src/ --glob '*.ts' --glob '*.tsx'` — should show only console.error and console.warn. Any console.log is a regression.
- `rg 'PLAN_LIMITS' src/` — should show constants.ts (definition), paddle.ts (re-export + usage), billing page (import + usage), and routers (import + usage). No other definitions.

### What assumptions changed
- Expected paddle.ts and constants.ts PLAN_LIMITS to be simple field name differences. Actual: they also diverged on unlimited sentinels (999999 vs 999) and enum values ('REALTIME' vs 'REAL_TIME'). The billing page needed 7 edits, not just an import swap.
- Expected settings page to need a new tRPC router. Actual: added to systemRouter to avoid touching _app.ts, which has other commented-out routers that shouldn't be disturbed.

## Files Created/Modified

- `src/server/services/billing/paddle.ts` — env-var price map, removed PLAN_LIMITS (re-exports from constants)
- `src/app/api/webhooks/paddle/route.ts` — ESM crypto, unified plan mapping
- `src/components/billing/checkout-button.tsx` — removed console.log, env-var price IDs
- `src/components/shared/paddle-provider.tsx` — removed console.log
- `src/app/[locale]/(marketing)/pricing/page.tsx` — fixed i18n plural params
- `src/server/routers/system.ts` — added getSettings/updateProfile/updateOrganization procedures
- `src/app/[locale]/(dashboard)/settings/page.tsx` — rewired to tRPC with real DB data
- `src/app/api/contact/route.ts` — rewired to sendEmail service
- `src/app/api/partners/route.ts` — rewired to sendEmail service
- `src/server/services/classification/engine.ts` — removed 9 console.log
- `src/server/services/classification/llm.ts` — removed 4 console.log (incl. raw LLM output)
- `src/lib/analytics.ts` — removed 2 dev-gated console.log
- `src/instrumentation.ts` — removed 2 Sentry init logs
- `src/app/[locale]/(dashboard)/settings/billing/page.tsx` — updated to constants.ts field names
