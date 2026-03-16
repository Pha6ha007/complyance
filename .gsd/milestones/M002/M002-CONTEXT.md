# M002: AI Legislation Tracker → Regulatory Intelligence

## Scope

Integrate data from the `ai-legislation-tracker` GitHub repo into Complyance's existing Regulatory Intelligence module. Populates the intelligence page with real legislative data from 28+ global AI laws and regulations.

## Source

- GitHub repo: `delschlangen/ai-legislation-tracker`
- 3 JSON files: `international_frameworks.json` (10 entries), `us_state_bills.json` (10 entries), `us_federal_actions.json` (8 entries)
- Each entry has: id, title, status, summary, key_provisions, source_url, tags, last_verified
- Shapes differ: international has `jurisdiction`/`name`, us_state has `state`/`bill_number`, us_federal has `issuing_body`/`type`

## Goals

1. New `LegislationEntry` Prisma model for storing legislation data
2. Seed script to download and import all 28 entries
3. Cron endpoint for auto-refresh from GitHub source
4. `getLegislation` tRPC procedure on intelligence router with pagination + filtering
5. UI: legislation browser on the intelligence page with jurisdiction/status filters
6. i18n keys for all 7 locales

## Constraints

- Existing `RegulatoryUpdate` model is for news/changes — `LegislationEntry` is complementary (the laws themselves)
- Existing intelligence router has `list`, `getById`, `markAsRead`, `getUnreadCount`, `seed` procedures
- Intelligence page already renders regulatory updates — new legislation section is additive
- Schema change needs explicit approval before execution
- Master plan's seed script assumed `{ frameworks: [...] }` shape — actual data is plain arrays with different field names per file

## Key Decisions to Make

- Add `LegislationEntry` model to Prisma schema (needs user confirmation)
- Whether cron endpoint should hit GitHub raw URLs directly (fragile) or we snapshot the data locally
- How to handle the 3 different JSON shapes (normalize at seed time)
- Plan gating: legislation browsing available to which plans?
