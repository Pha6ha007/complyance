# S01: Schema, Seed & tRPC

**Goal:** LegislationEntry Prisma model with 28 seeded entries and a tRPC procedure for paginated/filtered queries.
**Demo:** Call `getLegislation({ jurisdiction: 'EU' })` via tRPC and get back real legislation data.

## Must-Haves

- LegislationEntry model in prisma/schema.prisma
- prisma migrate succeeds
- 28 entries seeded from 3 JSON files (normalized to common shape)
- getLegislation tRPC procedure with cursor pagination and jurisdiction/status filters
- Zero console.log in new code

## Verification

- `npx prisma migrate dev --name add-legislation` succeeds
- Seed script inserts 28 records
- `npx tsc --noEmit` — zero errors
- `rg 'console\.log' src/server/routers/intelligence.ts prisma/seeds/` — zero matches

## Tasks

- [ ] **T01: Add LegislationEntry model to Prisma schema** `est:10m`
  - Add model with: externalId (unique), jurisdiction, title, status, effectiveDate, summary, keyProvisions (Json), sourceUrl, tags (Json), lastVerified, impactLevel, region (for filtering by market)
  - Run prisma migrate
  - Verify: `npx prisma migrate dev --name add-legislation` succeeds

- [ ] **T02: Download source data and create seed script** `est:20m`
  - Download 3 JSON files to data/legislation/
  - Create seed script at prisma/seeds/legislation.ts
  - Normalize 3 different JSON shapes into LegislationEntry records
  - Handle: international (jurisdiction/name), us_state (state/bill_number/title), us_federal (title/type/issuing_body)
  - Map jurisdiction strings to consistent codes (EU, US-CO, US-NYC, UK, etc.)
  - Run seed and verify 28 entries inserted
  - Zero console.log — use process.stdout.write for seed progress if needed

- [ ] **T03: Add getLegislation tRPC procedure** `est:15m`
  - Add to intelligenceRouter
  - Input: jurisdiction (optional), status (optional), limit (1-50, default 20), cursor (optional)
  - Sort by impactLevel desc, updatedAt desc
  - Plan gating: titles visible to all, full content (summary, keyProvisions) to Starter+
  - Verify: TypeScript compiles

## Files Likely Touched

- prisma/schema.prisma
- prisma/seeds/legislation.ts (new)
- data/legislation/*.json (new, downloaded)
- src/server/routers/intelligence.ts
