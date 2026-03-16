---
id: S04
parent: M001
milestone: M001
provides:
  - Zero console.log across all src/
  - Single PLAN_LIMITS definition in constants.ts
requires:
  - slice: S01
    provides: Clean billing files (no console.log conflicts)
affects: []
key_files:
  - src/server/services/classification/engine.ts
  - src/server/services/classification/llm.ts
  - src/server/routers/system.ts
  - src/lib/analytics.ts
  - src/components/shared/posthog-provider.tsx
  - src/instrumentation.ts
  - src/server/services/billing/paddle.ts
  - src/app/[locale]/(dashboard)/settings/billing/page.tsx
key_decisions:
  - Removed all console.log including dev-gated ones in analytics.ts (PostHog is the real tracking)
  - paddle.ts re-exports PLAN_LIMITS from constants.ts to avoid breaking existing imports
  - Billing settings page updated to use constants.ts field names (docGeneration, cicdApi, 999 for unlimited)
patterns_established:
  - All plan limit checks use constants.ts field names and values
  - 999 = unlimited (not 999999)
drill_down_paths: []
duration: ~20min
verification_result: passed
completed_at: 2026-03-16
---

# S04: console.log Cleanup & PLAN_LIMITS Consolidation

**Zero console.log across all src/. PLAN_LIMITS defined in exactly one place (constants.ts).**

## What Happened

T01: Removed 13 console.log calls from classification engine (9) and LLM service (4). These were step-by-step debug logs including one that logged raw LLM responses (security concern). Kept console.error/warn for real operational errors and retries.

T02: Removed remaining 6 console.log calls from system router (analytics stub), analytics.ts (dev-gated PostHog debug), posthog-provider.tsx (init success), and instrumentation.ts (Sentry init success x2).

T03: Removed the duplicate PLAN_LIMITS from paddle.ts. Paddle.ts now imports and re-exports from `@/lib/constants`. Updated `canPerformAction()` to use constants.ts field names (`docGeneration`, `cicdApi`). Updated billing settings page to import from constants.ts directly and use its field names and values (999 for unlimited, `REAL_TIME`, `docGeneration`, `cicdApi`).

## Verification

- `npx tsc --noEmit` — 0 errors
- `rg 'console\.log' src/` — 0 matches
- `rg 'export const PLAN_LIMITS' src/` — exactly 1 match (constants.ts)

## Deviations

Billing settings page needed more edits than expected — paddle.ts and constants.ts used different field names (`documents` vs `docGeneration`, `cicdAPI` vs `cicdApi`) and different unlimited sentinel values (999999 vs 999). All reconciled to constants.ts conventions.

## Known Limitations

- `console.warn` in email service and `console.error` calls remain — these are intentional operational signals

## Follow-ups

- None for M001

## Files Created/Modified

- `src/server/services/classification/engine.ts` — removed 9 console.log
- `src/server/services/classification/llm.ts` — removed 4 console.log (including raw LLM output logging)
- `src/server/routers/system.ts` — removed analytics console.log stub
- `src/lib/analytics.ts` — removed 2 dev-gated console.log
- `src/components/shared/posthog-provider.tsx` — removed init success log
- `src/instrumentation.ts` — removed 2 Sentry init success logs
- `src/server/services/billing/paddle.ts` — removed PLAN_LIMITS, imports from constants.ts
- `src/app/[locale]/(dashboard)/settings/billing/page.tsx` — updated to constants.ts field names

## Forward Intelligence

### What the next slice should know
- This is the last slice in M001. All critical fixes complete.

### What's fragile
- paddle.ts re-exports PLAN_LIMITS — if someone adds a new field to constants.ts, the re-export picks it up automatically. But the `canPerformAction` switch-case needs manual update for new actions.

### Authoritative diagnostics
- `rg 'console\.' src/ --glob '*.ts' --glob '*.tsx'` — should show only console.error and console.warn calls

### What assumptions changed
- paddle.ts and constants.ts had more differences than field names alone — the unlimited sentinels (999 vs 999999) and regulatory alerts values ('REALTIME' vs 'REAL_TIME') also diverged
