# M002: AI Legislation Tracker → Regulatory Intelligence

**Vision:** The intelligence page shows 28+ real AI laws from around the world — filterable by jurisdiction and status — seeded from the `ai-legislation-tracker` dataset and refreshable via cron.

## Success Criteria

- `LegislationEntry` model exists in Prisma with 28 seeded entries
- Intelligence page displays legislation entries with jurisdiction/status filter dropdowns
- Cron endpoint at `/api/cron/legislation-sync` re-fetches from GitHub source and upserts entries
- All 7 locales have i18n keys for jurisdiction names, status labels, and impact levels
- `npx tsc --noEmit` returns 0 errors

## Key Risks / Unknowns

- Schema migration on Railway production DB — Prisma migrate can fail on Railway if there are connection issues or model conflicts
- External GitHub raw URLs may change or go offline — the cron sync depends on repo stability
- Three different JSON shapes (international, us_state, us_federal) need normalization into one model

## Proof Strategy

- Schema migration risk → retire in S01 by running `prisma migrate` locally and verifying the model works with seed data
- JSON shape normalization → retire in S01 by building a normalizer that handles all 3 shapes and produces consistent LegislationEntry records
- Cron reliability → retire in S02 by building the sync endpoint with error handling per-source (one failing source doesn't block others)

## Verification Classes

- Contract verification: `npx tsc --noEmit`, `rg 'console\.log' src/` (zero matches)
- Integration verification: seed script runs and inserts 28 records; `getLegislation` returns paginated results
- Operational verification: cron endpoint returns success JSON with update count
- UAT / human verification: intelligence page shows legislation section with working filters

## Milestone Definition of Done

This milestone is complete only when all are true:

- All slices complete with passing verification
- `npx tsc --noEmit` returns 0 errors
- `prisma migrate` creates the LegislationEntry table
- Seed script inserts 28 entries (10 international + 10 state + 8 federal)
- Intelligence page renders legislation with working jurisdiction/status filters
- Cron endpoint fetches, upserts, and returns count
- i18n keys added to all 7 locales
- Zero console.log in new code

## Requirement Coverage

- Covers: none (no REQUIREMENTS.md — project predates GSD)
- Orphan risks: GitHub API rate limiting on cron (mitigated by using raw URLs, not API)

## Slices

- [x] **S01: Schema, Seed & tRPC** `risk:high` `depends:[]`
  > After this: `LegislationEntry` model exists, 28 entries seeded, `getLegislation` tRPC procedure returns paginated/filtered results
- [x] **S02: Cron Sync & UI** `risk:medium` `depends:[S01]`
  > After this: intelligence page shows legislation browser with filters; cron endpoint auto-refreshes data from GitHub

## Boundary Map

### S01 → S02

Produces:
- `LegislationEntry` Prisma model with jurisdiction, title, status, summary, keyProvisions, sourceUrl, tags, impactLevel
- `getLegislation` tRPC procedure on intelligence router with pagination (cursor) and filters (jurisdiction, status)
- `data/legislation/*.json` downloaded source files
- Seed script at `prisma/seeds/legislation.ts`

Consumes:
- nothing (first slice)

### S02 consumes S01

Produces:
- Cron endpoint at `/api/cron/legislation-sync` with CRON_SECRET auth
- Legislation section on intelligence page with jurisdiction/status filter dropdowns
- i18n keys in all 7 locales

Consumes:
- `LegislationEntry` model and `getLegislation` tRPC procedure from S01
