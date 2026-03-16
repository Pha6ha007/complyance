---
id: S02
parent: M002
milestone: M002
provides:
  - Cron sync endpoint for auto-refreshing legislation from GitHub
  - Legislation browser UI on intelligence page with jurisdiction/status filters
  - i18n keys for all 7 locales
  - Shared normalization module extracted from seed script
requires:
  - slice: S01
    provides: LegislationEntry model and getLegislation tRPC procedure
affects: []
key_files:
  - src/app/api/cron/legislation-sync/route.ts
  - src/components/dashboard/legislation-browser.tsx
  - src/lib/legislation-normalizer.ts
  - src/app/[locale]/(dashboard)/intelligence/page.tsx
  - src/i18n/messages/*.json (all 7 locales)
  - prisma/seeds/legislation.ts (refactored to use shared normalizer)
key_decisions:
  - Extracted normalization logic to src/lib/legislation-normalizer.ts (shared between seed and cron)
  - Cron endpoint processes sources independently — one failing doesn't block others
  - Used useInfiniteQuery for pagination in legislation browser
  - Plan-gated: Free sees titles/badges, Starter+ sees summary and key provisions
patterns_established:
  - Shared data normalizer pattern for external data sources
  - Cron endpoint with CRON_SECRET auth via query param
drill_down_paths: []
duration: ~25min
verification_result: passed
completed_at: 2026-03-16
---

# S02: Cron Sync & Legislation UI

**Legislation auto-sync from GitHub and filterable browser on the intelligence page.**

## What Happened

T01: Created cron endpoint at `/api/cron/legislation-sync`. Extracted normalization logic from seed script to `src/lib/legislation-normalizer.ts` (shared module). Cron fetches all 3 GitHub raw URLs, normalizes entries, and upserts. Each source is processed independently with error isolation. Auth via CRON_SECRET query param. Refactored seed script to use the shared normalizer.

T02: Added `intelligence.legislation.*` i18n keys to all 7 locales (en, fr, de, pt, ar, pl, it). Includes jurisdiction names (21 codes), status labels (5), impact levels (3), and UI strings (titles, filters, upgrade prompt, pagination). Arabic uses proper ICU plural categories (one/two/few/many/other).

T03: Created `LegislationBrowser` client component with jurisdiction and status filter dropdowns, cards showing title/jurisdiction/status/impact badges, plan-gated content (summary/keyProvisions hidden for Free, with upgrade link), source URL links, effective date, and "Load more" cursor pagination via `useInfiniteQuery`. Added to intelligence page as a new section below the existing regulatory updates.

## Verification

- `npx tsc --noEmit` — 0 errors
- Zero console.log in all new files
- i18n keys present in all 7 locale files
- Cron endpoint file exists

## Files Created/Modified

- `src/lib/legislation-normalizer.ts` — new shared normalization module
- `src/app/api/cron/legislation-sync/route.ts` — new cron endpoint
- `src/components/dashboard/legislation-browser.tsx` — new UI component
- `src/app/[locale]/(dashboard)/intelligence/page.tsx` — added LegislationBrowser section
- `prisma/seeds/legislation.ts` — refactored to use shared normalizer
- `src/i18n/messages/en.json` — added legislation keys
- `src/i18n/messages/fr.json` — added legislation keys
- `src/i18n/messages/de.json` — added legislation keys
- `src/i18n/messages/pt.json` — added legislation keys
- `src/i18n/messages/ar.json` — added legislation keys
- `src/i18n/messages/pl.json` — added legislation keys
- `src/i18n/messages/it.json` — added legislation keys
