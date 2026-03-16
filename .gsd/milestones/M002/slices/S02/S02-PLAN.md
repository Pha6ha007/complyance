# S02: Cron Sync & Legislation UI

**Goal:** Cron endpoint refreshes legislation from GitHub. Intelligence page has a legislation browser section with jurisdiction/status filters.
**Demo:** Visit intelligence page → see legislation entries with filters. Hit cron endpoint → entries update.

## Must-Haves

- Cron endpoint at `/api/cron/legislation-sync` with CRON_SECRET auth
- Legislation section on intelligence page with filter dropdowns
- Plan-gated: titles visible to all, summary/provisions require Starter+
- i18n keys for all 7 locales
- Zero console.log

## Verification

- `npx tsc --noEmit` — zero errors
- `rg 'console\.log' src/app/api/cron/ src/app/\[locale\]/\(dashboard\)/intelligence/` — zero matches
- i18n keys present in all 7 locale files

## Tasks

- [ ] **T01: Create cron sync endpoint** `est:15m`
  - `/api/cron/legislation-sync` route handler
  - Auth: query param `key` must match CRON_SECRET env var
  - Fetch all 3 GitHub raw URLs, normalize, upsert
  - Reuse normalization logic from seed (extract to shared module or inline)
  - Return JSON: { success, updated, timestamp }
  - Error handling: one source failing doesn't block others

- [ ] **T02: Add i18n keys to all 7 locales** `est:20m`
  - Keys under `intelligence.legislation.*`
  - Jurisdiction names, status labels, impact levels, UI labels
  - All 7 locales: en, fr, de, pt, ar, pl, it

- [ ] **T03: Add legislation section to intelligence page** `est:25m`
  - Client component for filter + data display
  - Filter dropdowns: jurisdiction, status
  - Cards showing title, jurisdiction badge, status badge, impact level
  - Plan-gated: "Upgrade to see details" for summary/provisions
  - Source URL link
  - Pagination (load more)

## Files Likely Touched

- src/app/api/cron/legislation-sync/route.ts (new)
- src/app/[locale]/(dashboard)/intelligence/page.tsx
- src/components/dashboard/legislation-browser.tsx (new)
- src/i18n/messages/en.json, fr.json, de.json, pt.json, ar.json, pl.json, it.json
