---
id: M002
provides:
  - LegislationEntry Prisma model with 28 seeded entries from ai-legislation-tracker
  - getLegislation tRPC procedure with cursor pagination, filters, plan-gated content
  - Cron sync endpoint for auto-refreshing from GitHub source
  - Legislation browser UI on intelligence page
  - i18n keys for legislation in all 7 locales
  - Shared legislation normalizer module
key_decisions:
  - Used prisma db push (not migrate dev) for schema changes in non-interactive terminal
  - Normalized 3 different JSON shapes (international/us_state/us_federal) via shared module
  - Free plan sees titles and badges only; Starter+ gets summary and key provisions
  - Cron processes sources independently — one source failing doesn't block others
  - Added region field for market-based filtering (EU, US, APAC, MENA, OTHER)
patterns_established:
  - External data integration pattern: download → normalize → seed → cron sync
  - Shared normalizer module for reuse between seed and cron
  - Plan-gated content: return null for restricted fields, UI shows upgrade prompt
observability_surfaces:
  - Cron endpoint returns JSON with success/updated/errors/timestamp
  - console.error in cron for source fetch failures
requirement_outcomes: []
duration: ~50min across 2 slices
verification_result: passed
completed_at: 2026-03-16
---

# M002: AI Legislation Tracker → Regulatory Intelligence

**28 global AI laws seeded, browsable with filters, auto-synced from GitHub, plan-gated content.**

## What Happened

S01 built the data foundation: added `LegislationEntry` model to Prisma with fields for jurisdiction, status, impact level, key provisions, and a region field for market filtering. Downloaded 3 JSON files from the ai-legislation-tracker repo (10 international frameworks, 10 US state bills, 8 US federal actions). Created a seed script that normalizes the 3 different JSON shapes — each source uses different field names (name/jurisdiction vs title/state vs title/issuing_body) — into consistent records. Seeded all 28 entries. Added `getLegislation` tRPC procedure to the intelligence router with cursor pagination, jurisdiction/status/region filters, and plan-gated content (Free sees titles only).

S02 completed the feature: extracted normalization logic from the seed script into a shared module (`legislation-normalizer.ts`), then built a cron endpoint that fetches from the 3 GitHub raw URLs, normalizes, and upserts with source-level error isolation. Added i18n keys for all 7 locales covering jurisdiction names (21 codes), status labels, impact levels, and UI strings including proper Arabic ICU plural forms. Built a `LegislationBrowser` client component with filter dropdowns, styled cards with jurisdiction/status/impact badges, plan-gated content (upgrade prompt for Free users), source links, and infinite scroll pagination. Integrated it into the intelligence page below the existing regulatory updates section.

## Cross-Slice Verification

| Criterion | Method | Result |
|-----------|--------|--------|
| `npx tsc --noEmit` zero errors | Ran after each slice | PASS |
| Zero console.log | `rg 'console\.log' src/` | PASS |
| LegislationEntry model exists | `rg 'model LegislationEntry' prisma/schema.prisma` | PASS |
| 28 entries seeded | Prisma count query | PASS — 28 |
| getLegislation tRPC procedure | grep in intelligence.ts | PASS |
| Cron endpoint exists | file check | PASS |
| i18n keys in all 7 locales | Python JSON check per locale | PASS |
| LegislationBrowser on page | grep in page.tsx | PASS |

## Requirement Changes

None — no REQUIREMENTS.md exists.

## Forward Intelligence

### What the next milestone should know
- LegislationEntry has an `externalId` field used for upsert deduplication — the ai-legislation-tracker uses IDs like "intl-001", "state-001", "fed-001"
- The cron endpoint needs `CRON_SECRET` env var — this was listed in the master plan as "should already exist"
- Intelligence page is a client component (`'use client'`) with dark theme (slate-800 backgrounds, emerald accents)
- The shared normalizer at `src/lib/legislation-normalizer.ts` can be extended for new data sources

### What's fragile
- GitHub raw URLs for the ai-legislation-tracker repo — if the repo moves or restructures, cron sync breaks silently (returns `errors` array in response)
- The jurisdiction mapping is hardcoded in the normalizer — new jurisdictions in the source data will map to "UNKNOWN"
- impactLevel sort relies on alphabetical ordering (H < L < M) which happens to sort HIGH first — not robust if values change

### Authoritative diagnostics
- `npx tsx -e "const{PrismaClient}=require('@prisma/client');new PrismaClient().legislationEntry.count().then(console.log)"` — should be 28
- Cron health: `curl "localhost:3000/api/cron/legislation-sync?key=$CRON_SECRET"` — returns JSON with updated count

### What assumptions changed
- Master plan assumed JSON files had wrapper objects (`{ frameworks: [...] }`) — actual data is plain arrays
- Master plan assumed field names were consistent across files — actually all 3 sources have different shapes
- prisma migrate dev doesn't work in non-interactive terminals — used prisma db push instead

## Files Created/Modified

- `prisma/schema.prisma` — added LegislationEntry model
- `prisma/seeds/legislation.ts` — seed script using shared normalizer
- `data/legislation/international.json` — downloaded (10 entries)
- `data/legislation/us_state.json` — downloaded (10 entries)
- `data/legislation/us_federal.json` — downloaded (8 entries)
- `src/lib/legislation-normalizer.ts` — shared normalization module
- `src/server/routers/intelligence.ts` — added getLegislation procedure
- `src/app/api/cron/legislation-sync/route.ts` — cron sync endpoint
- `src/components/dashboard/legislation-browser.tsx` — UI component
- `src/app/[locale]/(dashboard)/intelligence/page.tsx` — integrated LegislationBrowser
- `src/i18n/messages/en.json` — added legislation i18n keys
- `src/i18n/messages/fr.json` — added legislation i18n keys
- `src/i18n/messages/de.json` — added legislation i18n keys
- `src/i18n/messages/pt.json` — added legislation i18n keys
- `src/i18n/messages/ar.json` — added legislation i18n keys
- `src/i18n/messages/pl.json` — added legislation i18n keys
- `src/i18n/messages/it.json` — added legislation i18n keys
