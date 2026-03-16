---
id: S02
parent: M003
milestone: M003
provides:
  - DeepScanSection component on free classifier results page
  - i18n keys for deep scan in all 7 locales
requires:
  - slice: S01
    provides: Deep scan API endpoint
affects: []
key_files:
  - src/app/[locale]/(marketing)/free-classifier/client.tsx
  - src/i18n/messages/*.json
key_decisions:
  - DeepScanSection defined in same file as FreeClassifierClient (tightly coupled to wizard state)
  - Light theme card (slate-50 bg) since classifier results use white card on dark page
  - PostHog capture attribute on CTA button for conversion tracking
patterns_established:
  - Deep scan as a progressive disclosure pattern (classify first → scan deeper)
drill_down_paths: []
duration: ~15min
verification_result: passed
completed_at: 2026-03-16
---

# S02: Deep Scan UI & i18n

**Deep scan section integrated into free classifier with i18n in all 7 locales.**

## What Happened

T01: Added `freeClassifier.deepScan.*` i18n keys to all 7 locales. Keys cover: title, subtitle, button labels, detected issues, required actions, gap count (ICU plural), fix CTA, no-gaps state, error, disclaimer, and severity/priority labels. Arabic uses proper plural categories.

T02: Added `DeepScanSection` component directly in the free classifier client file. Shows between the classification obligations and the CTA section in step 5 (results). Uses light card styling (slate-50 bg) to fit the white results card. Includes: detected risks with severity icons and article references, compliance gaps with article numbers and priority indicators, a "Fix All Gaps with Complyance" CTA button with PostHog tracking attribute, and the legal disclaimer.

## Verification

- `npx tsc --noEmit` — 0 errors
- Zero console.log in modified files
- i18n keys present in all 7 locales under freeClassifier.deepScan

## Files Created/Modified

- `src/app/[locale]/(marketing)/free-classifier/client.tsx` — added DeepScanSection component + integration
- `src/i18n/messages/{en,fr,de,pt,ar,pl,it}.json` — added deepScan keys
