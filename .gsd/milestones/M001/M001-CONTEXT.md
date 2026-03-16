# M001 Context

## Overview

Complyance is a self-serve AI compliance SaaS (Next.js 14 + tRPC + Prisma + Paddle). Phases 1–5 are complete — the core platform works. This milestone fixes critical blockers found during codebase audit before any integration work begins (M002–M006).

## Scope

4 slices covering:
1. **Paddle billing** — placeholder price IDs, dual plan mapping, CJS require, console.log in billing code
2. **Settings page + pricing i18n** — stub mutations, hardcoded values, raw translation keys on pricing page
3. **Contact/partner email** — Resend integration (code exists but commented out)
4. **console.log cleanup + PLAN_LIMITS consolidation** — remaining ~20 console.log instances, duplicate plan limits definitions

## Key Findings (from .planning/codebase/CONCERNS.md audit)

- `PADDLE_PRODUCT_MAP` in paddle.ts uses `'pri_01j...starter'` placeholders
- Webhook handler has a *separate* inline `planMap` with *different* keys (`'pri_starter'`)
- `require('crypto')` used inside ESM context in webhook handler
- Settings page has two `// TODO: Implement with tRPC` stubs — save buttons do nothing
- Contact/partner routes return 200 but silently drop submissions (no email sent)
- PLAN_LIMITS defined in both `src/lib/constants.ts` and `src/server/services/billing/paddle.ts`

## Key References

- `CLAUDE.md` — project conventions, stack, plan limits, coding rules
- `.planning/codebase/CONCERNS.md` — full audit of blockers, debt, and security issues
- `docs/PADDLE_INTEGRATION.md` — Paddle integration spec

## Dependencies

No upstream milestone dependencies. M002–M006 (integration phases) depend on M001 completion.
