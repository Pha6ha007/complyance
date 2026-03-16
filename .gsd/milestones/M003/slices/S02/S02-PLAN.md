# S02: Deep Scan UI & i18n

**Goal:** Deep scan section on free classifier results page with i18n in all 7 locales.
**Demo:** Complete free classification → see "Deep Compliance Scan" section → click → see gaps + CTA.

## Must-Haves

- DeepScanSection client component matching existing dark theme
- Integrated into step 5 (results) of free classifier wizard
- Shows: detected risks, compliance gaps with article refs, "Fix All Gaps" CTA
- i18n keys for all 7 locales
- Legal disclaimer
- Zero console.log

## Verification

- `npx tsc --noEmit` — zero errors
- Zero console.log in new files
- i18n keys present in all 7 locales under freeClassifier.deepScan

## Tasks

- [ ] **T01: Add i18n keys for deep scan** `est:15m`
- [ ] **T02: Create DeepScanSection component and integrate into classifier** `est:25m`

## Files Likely Touched

- src/app/[locale]/(marketing)/free-classifier/client.tsx
- src/i18n/messages/{en,fr,de,pt,ar,pl,it}.json
