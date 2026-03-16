---
id: M004
provides:
  - Bias & fairness testing module (TypeScript-only, no Python)
  - tRPC router (bias.analyze, bias.getResults, bias.checkAccess, bias.getAvailableSystems)
  - Dashboard UI with CSV upload, column selection, results display
  - Evidence Vault integration for audit trail
key_decisions:
  - "D013: TypeScript-only bias analysis — no Python/AIF360 microservice"
  - "D014: Results stored as base64 JSON in Evidence fileUrl (MVP, no S3)"
  - "D015: Plan gate uses PLAN_LIMITS[plan].biasTesting > 0"
patterns_established:
  - "Client-side CSV parsing with preview table and column auto-detection"
  - "Bias metrics stored as Evidence with type TEST_RESULT"
observability_surfaces:
  - "Evidence entries with title prefix 'Bias Analysis:' for filtering"
duration: ~1 hour
verification_result: passed
completed_at: 2026-03-16
---

# M004: AIF360 Bias Testing

**TypeScript-only bias & fairness testing with DI/SPD metrics, EU AI Act compliance assessment, and Evidence Vault integration.**

## What Happened

Built a complete bias testing pipeline in TypeScript — no Python microservice needed. The analyzer computes Disparate Impact (EEOC 4/5 rule: DI ≥ 0.8) and Statistical Parity Difference (|SPD| < 0.1), maps violations to EU AI Act articles, and generates prioritized recommendations. Results are stored as Evidence entries for audit compliance.

The tRPC router handles CSV parsing server-side, validates column existence, and stores results with integrity hashes. The dashboard UI provides CSV upload with drag-and-drop, auto-detects common column names (outcome, gender, etc.), shows compliance banners, metric cards, group statistics, and recommendation badges.

## Cross-Slice Verification

- TypeScript: 0 errors (`pnpm tsc --noEmit`)
- All 7 locales updated (48 bias keys + 1 nav key each)
- Zero console.log in code
- Plan gate verified: `PLAN_LIMITS[plan].biasTesting > 0` (Free/Starter = 0, Professional = 3)

## Forward Intelligence

### What the next milestone should know
- Evidence model is reused heavily — fileUrl stores base64 JSON for MVP, will need S3 migration
- The CSV parser handles quoted fields but not all edge cases (e.g., newlines within quotes)

### What's fragile
- Base64 JSON in fileUrl is a temporary hack — large results could exceed DB column limits

## Files Created/Modified

- `src/server/services/bias/analyzer.ts` — Core analysis engine (DI, SPD, CSV parser)
- `src/server/routers/bias.ts` — tRPC router (analyze, getResults, checkAccess, getAvailableSystems)
- `src/server/routers/_app.ts` — Registered biasRouter
- `src/app/[locale]/(dashboard)/bias-testing/page.tsx` — Server page component
- `src/app/[locale]/(dashboard)/bias-testing/client.tsx` — Client component
- `src/components/dashboard/sidebar.tsx` — Added Bias Testing nav item
- `src/i18n/messages/*.json` — 48 bias keys + 1 nav key in all 7 locales
