---
id: S01
parent: M001
milestone: M001
provides:
  - Env-var-driven Paddle price-to-plan mapping via getPlanFromPaddlePrice()
  - Clean webhook handler with ESM crypto import and unified plan resolution
  - Zero console.log in all billing/checkout/paddle code
requires: []
affects:
  - S04
key_files:
  - src/server/services/billing/paddle.ts
  - src/app/api/webhooks/paddle/route.ts
  - src/app/[locale]/(marketing)/pricing/page.tsx
  - src/components/billing/checkout-button.tsx
  - src/components/shared/paddle-provider.tsx
key_decisions:
  - Paddle price IDs via env vars (PADDLE_PRICE_STARTER/PROFESSIONAL/SCALE) — no hardcoded IDs
  - Removed all console.log from billing code — kept console.error for real operational errors
  - Webhook handler uses getPlanFromPaddlePrice() from paddle.ts instead of inline planMap
patterns_established:
  - Env var pattern for external service IDs (PADDLE_PRICE_*) — use same pattern for future integrations
observability_surfaces:
  - console.error retained for webhook signature failures and missing customer/org lookups
drill_down_paths: []
duration: ~30min
verification_result: passed
completed_at: 2026-03-16
---

# S01: Paddle Billing Fix

**All Paddle price IDs now come from env vars, webhook handler uses a single unified mapping, and zero console.log remains in billing code.**

## What Happened

T01: Replaced the hardcoded `PADDLE_PRODUCT_MAP` in `paddle.ts` with a `buildPaddlePriceMap()` function that reads `PADDLE_PRICE_STARTER`, `PADDLE_PRICE_PROFESSIONAL`, `PADDLE_PRICE_SCALE` from `process.env`. Gracefully builds an empty map when env vars aren't set (dev without Paddle keys).

T02: Rewrote the webhook handler. Three problems fixed: (1) added `import crypto from 'crypto'` at file top and removed `const crypto = require('crypto')` from inside the function, (2) removed the inline `planMap` with its own divergent placeholder keys and replaced it with `getPlanFromPaddlePrice()` imported from paddle.ts, (3) removed all four `console.log` calls. Also improved price ID extraction to handle both `subscription.items[0].price.id` (Paddle v2 format) and `subscription.price_id` (legacy).

T03: Updated the pricing page (server component) to read price IDs from env vars and pass them as props. `null` price ID gracefully renders a link instead of a checkout button. Removed `console.log` from checkout-button.tsx and paddle-provider.tsx (3 instances total).

## Verification

- `npx tsc --noEmit` — 0 errors
- `rg 'console\.log'` on all 5 billing files — 0 matches
- `rg "require\("` in webhook handler — 0 matches
- `rg 'pri_01j'` across all src/ — 0 matches (no placeholder IDs anywhere)
- `rg 'pri_starter|pri_professional|pri_scale'` in webhook — 0 matches (inline planMap gone)

## Deviations

Found the webhook handler had a **second, independent** plan mapping with different placeholder keys (`pri_starter` vs `pri_01j...starter`) — this was worse than the audit noted. The fix unified both through the single `getPlanFromPaddlePrice()` function.

## Known Limitations

- Paddle checkout won't actually work until real price IDs are set in Railway env vars
- `console.error` calls remain in webhook handler for operational errors (signature failures, missing customer) — this is intentional, not a gap

## Follow-ups

- Set real Paddle price IDs in Railway: `PADDLE_PRICE_STARTER`, `PADDLE_PRICE_PROFESSIONAL`, `PADDLE_PRICE_SCALE`

## Files Created/Modified

- `src/server/services/billing/paddle.ts` — env-var-driven PADDLE_PRODUCT_MAP builder
- `src/app/api/webhooks/paddle/route.ts` — ESM crypto, unified plan mapping, removed console.log
- `src/app/[locale]/(marketing)/pricing/page.tsx` — env var price IDs instead of hardcoded
- `src/components/billing/checkout-button.tsx` — removed console.log/console.error
- `src/components/shared/paddle-provider.tsx` — removed console.log (3 instances)

## Forward Intelligence

### What the next slice should know
- paddle.ts still has its own `PLAN_LIMITS` object (duplicate of constants.ts) — S04 consolidates this
- The webhook handler's `console.error` calls are intentional operational errors — don't remove in S04

### What's fragile
- `buildPaddlePriceMap()` runs at module load time — if env vars aren't available at import time, the map will be empty. This is fine for Next.js (env vars are always available at server startup) but would break in edge runtime.

### Authoritative diagnostics
- `rg 'console\.' src/app/api/webhooks/paddle/route.ts` — should show only `console.error` lines (operational)

### What assumptions changed
- Assumed the webhook handler used `PADDLE_PRODUCT_MAP` from paddle.ts — it actually had its own inline `planMap` with completely different placeholder keys
