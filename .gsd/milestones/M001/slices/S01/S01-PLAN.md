# S01: Paddle Billing Fix

**Goal:** Unify all Paddle price-to-plan mapping behind env vars, fix the webhook handler's ESM/CJS inconsistency, and remove all console.log from billing code.
**Demo:** Checkout buttons reference env-configured price IDs. Webhook handler correctly resolves any Paddle price ID to a plan using a single mapping function. `rg 'console\.log' src/server/services/billing/ src/app/api/webhooks/paddle/ src/components/billing/` returns zero matches.

## Must-Haves

- All Paddle price IDs come from env vars (`PADDLE_PRICE_STARTER`, `PADDLE_PRICE_PROFESSIONAL`, `PADDLE_PRICE_SCALE`), not hardcoded strings
- Single mapping path: both `PADDLE_PRODUCT_MAP` in paddle.ts and the inline `planMap` in the webhook handler are unified into one lookup via `getPlanFromPaddlePrice()`
- `require('crypto')` in webhook route replaced with `import crypto from 'crypto'` at file top
- Zero `console.log` in: `paddle.ts`, `webhook/paddle/route.ts`, `checkout-button.tsx`, `paddle-provider.tsx`
- Pricing page `priceId` values come from env vars (via server component props or a shared config)

## Proof Level

- This slice proves: integration (Paddle price resolution and webhook signature verification work with real env var configuration)
- Real runtime required: yes (dev server with env vars set)
- Human/UAT required: yes (verify checkout opens, no JS errors)

## Verification

- `pnpm tsc --noEmit` — zero TypeScript errors
- `rg 'console\.log' src/server/services/billing/ src/app/api/webhooks/paddle/ src/components/billing/` — zero matches
- `rg "require\(" src/app/api/webhooks/paddle/route.ts` — zero matches
- `rg 'pri_01j' src/` — zero matches (no placeholder IDs remain)
- `rg 'pri_starter|pri_professional|pri_scale' src/app/api/webhooks/paddle/route.ts` — zero matches (inline planMap removed)
- Dev server: pricing page loads without errors, checkout button onClick doesn't crash (even without real Paddle keys, it should reach the Paddle.js check gracefully)

## Tasks

- [x] **T01: Env-var-driven price ID mapping in paddle.ts** `est:30m`
  - Why: `PADDLE_PRODUCT_MAP` uses hardcoded placeholder strings. The webhook handler has a *separate* inline `planMap` with different placeholder keys. Both must be unified behind env vars.
  - Files: `src/server/services/billing/paddle.ts`
  - Do:
    - Replace hardcoded `PADDLE_PRODUCT_MAP` with env-var-driven construction: read `PADDLE_PRICE_STARTER`, `PADDLE_PRICE_PROFESSIONAL`, `PADDLE_PRICE_SCALE` from `process.env`
    - Build the map dynamically: only include entries where the env var is defined (graceful in dev without keys)
    - Keep `getPlanFromPaddlePrice()` as the single lookup function
    - Verify the `import crypto from 'crypto'` at the top is already correct (it is — paddle.ts already uses ESM import)
  - Verify: `pnpm tsc --noEmit`, `rg 'pri_01j' src/server/services/billing/paddle.ts` returns nothing
  - Done when: `PADDLE_PRODUCT_MAP` is built from env vars, no hardcoded placeholder IDs remain

- [x] **T02: Fix webhook handler — unify plan mapping, fix require, remove console.log** `est:45m`
  - Why: The webhook route has three problems: (1) inline `planMap` with its own placeholder keys duplicating paddle.ts, (2) `require('crypto')` instead of ESM import, (3) four `console.log` calls.
  - Files: `src/app/api/webhooks/paddle/route.ts`
  - Do:
    - Add `import crypto from 'crypto'` at file top, remove the `const crypto = require('crypto')` inside `verifyPaddleSignature`
    - Remove the inline `planMap` object in the `subscription.created`/`subscription.updated` handler
    - Import `getPlanFromPaddlePrice` from `@/server/services/billing/paddle` and use it to resolve `subscription.items[0].price.id` (or however Paddle structures the price reference)
    - Replace all `console.log(...)` with either Sentry `captureMessage` for important events or simply remove for debug noise
    - Replace `console.warn(...)` for "user not found" / "org not found" with Sentry `captureMessage` at warning level
    - Keep `console.error` for the signature verification failure (this is an operational error, acceptable)
  - Verify: `rg 'console\.log' src/app/api/webhooks/paddle/route.ts` returns nothing, `rg "require\(" src/app/api/webhooks/paddle/route.ts` returns nothing, `pnpm tsc --noEmit`
  - Done when: webhook handler uses single `getPlanFromPaddlePrice()` from paddle.ts, no CJS require, no console.log

- [x] **T03: Env-var price IDs on pricing page and checkout button cleanup** `est:30m`
  - Why: Pricing page hardcodes `'pri_01j...starter'` etc. as priceId props. Checkout button has a `console.log('Checkout success:', data)` and `console.error` that should be cleaned up.
  - Files: `src/app/[locale]/(marketing)/pricing/page.tsx`, `src/components/billing/checkout-button.tsx`, `src/components/shared/paddle-provider.tsx`
  - Do:
    - In pricing page (server component): read `process.env.PADDLE_PRICE_STARTER` etc. and pass as priceId to CheckoutButton. Use `null` if env var is not set (same as Free plan behavior — renders a link instead of checkout button)
    - In checkout-button.tsx: replace `console.log('Checkout success:', data)` with PostHog event or remove. Replace `console.error('Paddle.js not loaded')` and `console.error('Checkout error:', error)` with Sentry captureException or silent handling
    - In paddle-provider.tsx: check for console.log calls and remove/replace
  - Verify: `rg 'console\.log' src/components/billing/ src/components/shared/paddle-provider.tsx` returns nothing, `rg 'pri_01j' src/app` returns nothing, `pnpm tsc --noEmit`
  - Done when: pricing page uses env vars for price IDs, zero console.log in billing components

## Files Likely Touched

- `src/server/services/billing/paddle.ts`
- `src/app/api/webhooks/paddle/route.ts`
- `src/app/[locale]/(marketing)/pricing/page.tsx`
- `src/components/billing/checkout-button.tsx`
- `src/components/shared/paddle-provider.tsx`
