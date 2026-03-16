# S04: console.log Cleanup & PLAN_LIMITS Consolidation

**Goal:** Zero console.log in src/ (excluding console.error/warn for real errors). Single source of truth for PLAN_LIMITS.
**Demo:** `rg 'console\.log' src/ --glob '*.ts' --glob '*.tsx'` returns zero matches. PLAN_LIMITS defined only in constants.ts; paddle.ts imports from there.

## Must-Haves

- Zero console.log in src/ (console.error kept for real operational errors)
- PLAN_LIMITS defined only in src/lib/constants.ts
- paddle.ts imports PLAN_LIMITS from constants.ts, re-exports helper functions
- Billing settings page imports from constants.ts (or from paddle.ts which re-exports)
- No behavior changes — just cleanup

## Verification

- `npx tsc --noEmit` — zero TypeScript errors
- `rg 'console\.log' src/ --glob '*.ts' --glob '*.tsx'` — zero matches
- `rg 'export const PLAN_LIMITS' src/` — exactly one match (constants.ts)

## Tasks

- [x] **T01: Remove console.log from classification engine and LLM** `est:20m`
- [x] **T02: Remove console.log from system router, analytics, posthog, instrumentation** `est:15m`
- [x] **T03: Consolidate PLAN_LIMITS to single source** `est:20m`

## Files Likely Touched

- `src/server/services/classification/engine.ts`
- `src/server/services/classification/llm.ts`
- `src/server/routers/system.ts`
- `src/lib/analytics.ts`
- `src/components/shared/posthog-provider.tsx`
- `src/instrumentation.ts`
- `src/server/services/billing/paddle.ts`
- `src/app/[locale]/(dashboard)/settings/billing/page.tsx`
