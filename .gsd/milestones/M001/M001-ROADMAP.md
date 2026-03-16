# M001: Launch Readiness & Critical Fixes

**Vision:** A user can sign up, upgrade via Paddle, use settings, submit contact/partner forms, and receive real emails — with zero console.log leaks and a single source of truth for plan limits — before any integration work begins.

## Success Criteria

- Paddle checkout opens with real price IDs and a completed purchase updates the org's plan in the database
- Settings page loads the user's real profile/org data from DB and saving persists changes
- Contact and partner form submissions deliver emails via Resend to the appropriate addresses
- `rg 'console\.log' src/ --glob '*.ts' --glob '*.tsx'` returns zero matches (excluding dev-only instrumentation)
- PLAN_LIMITS is defined in exactly one file; all consumers import from that single source
- Pricing page renders translated feature text in all 7 locales (no raw i18n keys visible)

## Key Risks / Unknowns

- Paddle integration may have deeper issues beyond placeholder IDs — the webhook handler has its own inline `planMap` with keys that don't match `PADDLE_PRODUCT_MAP`, so there are effectively two disconnected mappings
- Settings page mutations require understanding how the current session exposes user/org data to client components — may need a tRPC procedure that doesn't exist yet

## Proof Strategy

- Paddle dual-mapping issue → retire in S01 by unifying all price-to-plan mapping through env vars and a single lookup
- Settings data flow → retire in S02 by wiring real session data + tRPC mutations and verifying round-trip persistence

## Verification Classes

- Contract verification: `pnpm tsc --noEmit` (zero errors), `rg 'console\.log'` (zero matches)
- Integration verification: Paddle webhook signature verification with test payload, Resend email delivery
- Operational verification: none (no new services)
- UAT / human verification: pricing page visual check in all 7 locales, settings save round-trip

## Milestone Definition of Done

This milestone is complete only when all are true:

- All four slices are complete with passing verification
- `pnpm tsc --noEmit` returns 0 errors
- `pnpm build` succeeds
- No `console.log` in src/ (verified by grep)
- Pricing page shows translated text in all 7 locales (spot-checked via dev server)
- Success criteria re-checked against running app

## Requirement Coverage

- Covers: none (no REQUIREMENTS.md yet — pre-existing project)
- Orphan risks: rate limiting on public API (deferred to M002+)

## Slices

- [x] **S01: Paddle Billing Fix** `risk:high` `depends:[]`
  > After this: checkout buttons use real (env-configured) price IDs, webhook correctly maps any Paddle price to a plan, no console.log in billing code, require('crypto') replaced with ESM import
- [x] **S02: Settings Page & Pricing i18n** `risk:medium` `depends:[]`
  > After this: settings page loads real user/org data from DB, save buttons persist changes via tRPC, pricing page shows translated feature text in all locales
- [x] **S03: Contact & Partner Email Sending** `risk:low` `depends:[]`
  > After this: contact and partner form submissions deliver emails via Resend, no console.log in either route
- [x] **S04: console.log Cleanup & PLAN_LIMITS Consolidation** `risk:low` `depends:[S01]`
  > After this: zero console.log in src/, PLAN_LIMITS defined in one file, all consumers import from constants.ts

## Boundary Map

### S01 → S04

Produces:
- `src/server/services/billing/paddle.ts` with clean webhook verification (no console.log, ESM crypto import)
- `PADDLE_PRICE_*` env vars pattern for price ID configuration
- Webhook handler using unified `getPlanFromPaddlePrice()` for all price-to-plan resolution

Consumes:
- nothing (first slice)

### S02 (independent)

Produces:
- tRPC procedures for profile/org update on an existing router
- Settings page wired to real session data

Consumes:
- nothing (independent of S01)

### S03 (independent)

Produces:
- Working Resend email delivery in contact and partner routes

Consumes:
- nothing (independent of S01)

### S04 depends on S01

Produces:
- Zero console.log across all src/
- Single PLAN_LIMITS definition in `src/lib/constants.ts`

Consumes:
- S01's cleaned billing files (to avoid editing the same files concurrently)
