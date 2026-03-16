---
id: S01
parent: M002
milestone: M002
provides:
  - LegislationEntry Prisma model
  - 28 seeded legislation entries from ai-legislation-tracker repo
  - getLegislation tRPC procedure with pagination, filters, and plan-gated content
requires: []
affects: []
key_files:
  - prisma/schema.prisma
  - prisma/seeds/legislation.ts
  - data/legislation/international.json
  - data/legislation/us_state.json
  - data/legislation/us_federal.json
  - src/server/routers/intelligence.ts
key_decisions:
  - Used prisma db push (not migrate dev) since terminal is non-interactive
  - Normalized 3 JSON shapes into consistent format via jurisdiction mapping
  - Free plan sees titles only; Starter+ sees full summary and keyProvisions
  - Added region field for market-based filtering (EU, US, APAC, MENA, OTHER)
  - impactLevel sorted ascending (HIGH sorts before LOW/MEDIUM alphabetically) — works because H < L < M
patterns_established:
  - Legislation data lives in data/legislation/*.json — seed script reads from there
  - Seed uses upsert for idempotent re-runs
drill_down_paths: []
duration: ~15min
verification_result: passed
completed_at: 2026-03-16
---

# S01: Schema, Seed & tRPC

**LegislationEntry model with 28 seeded entries and paginated/filtered tRPC query.**

## What Happened

T01: Added LegislationEntry model to Prisma schema with externalId (unique), jurisdiction, title, status, effectiveDate, summary, keyProvisions (Json), sourceUrl, tags (Json), lastVerified, impactLevel, region. Used `prisma db push` since terminal is non-interactive.

T02: Downloaded 3 JSON files (10 international, 10 US state, 8 US federal = 28 total). Created seed script with normalizers for each shape — international uses `name`/`jurisdiction`, US state uses `title`/`state`/`bill_number`, US federal uses `title`/`type`/`issuing_body`. Mapped jurisdiction strings to codes (EU, US-CO, US-FED, etc.) and regions.

T03: Added `getLegislation` procedure to intelligence router with cursor pagination, jurisdiction/status/region filters, and plan-gated content (Free sees titles only, Starter+ sees summary/keyProvisions). Returns totalEstimate via count query.

## Verification

- `prisma db push` succeeded — table created
- Seed script inserted 28 entries
- `npx tsc --noEmit` — 0 errors
- Zero console.log in new code

## Files Created/Modified

- `prisma/schema.prisma` — added LegislationEntry model
- `prisma/seeds/legislation.ts` — new seed script with 3-shape normalizer
- `data/legislation/international.json` — downloaded (10 entries)
- `data/legislation/us_state.json` — downloaded (10 entries)
- `data/legislation/us_federal.json` — downloaded (8 entries)
- `src/server/routers/intelligence.ts` — added getLegislation procedure

## Forward Intelligence

### What the next slice should know
- impactLevel values are 'HIGH', 'MEDIUM', 'LOW' — sorted ascending means HIGH comes first (alphabetical: H < L < M)
- getLegislation returns `summary: null` and `keyProvisions: null` for Free plan users — UI should show upgrade prompt
- Existing intelligence page renders RegulatoryUpdate items — the new legislation section is additive, not a replacement
