# M003: Deep Scan on Free Classifier

**Vision:** After classifying their AI system for free, users can run a "Deep Compliance Scan" that shows specific EU AI Act gaps and required actions — a strong conversion hook to the paid platform.

## Success Criteria

- `/api/public/v1/deep-scan` accepts description + domain + risk level and returns compliance gaps
- Free classifier results page shows a "Deep Scan" section with a button to trigger analysis
- Deep scan results show detected issues, compliance gaps with article references, and a "Fix All Gaps" CTA
- Rate limited (shares rate limit with existing classifier endpoint)
- Legal disclaimer on output
- i18n keys in all 7 locales
- Zero TypeScript errors, zero console.log

## Key Risks / Unknowns

- UX integration: the existing results step is already rich — adding deep scan must not overwhelm it
- Gap analysis quality: keyword-based analysis needs to feel useful, not trivially obvious

## Proof Strategy

- UX: retire in S02 by building the component and checking it fits the existing layout
- Gap quality: retire in S01 by building the analysis engine with meaningful domain-specific gap lists

## Verification Classes

- Contract verification: `npx tsc --noEmit`, `rg 'console\.log'` (zero)
- Integration verification: POST to deep-scan endpoint returns valid gap analysis
- Operational verification: none
- UAT / human verification: free classifier flow → classify → deep scan → CTA visible

## Milestone Definition of Done

This milestone is complete only when all are true:

- All slices complete with passing verification
- `npx tsc --noEmit` returns 0 errors
- Deep scan endpoint returns compliance gaps for HIGH and LIMITED risk systems
- DeepScanSection renders on the free classifier results page
- i18n keys added to all 7 locales
- Zero console.log

## Requirement Coverage

- Covers: none (no REQUIREMENTS.md)
- Orphan risks: none

## Slices

- [x] **S01: Deep Scan API endpoint** `risk:high` `depends:[]`
  > After this: POST to `/api/public/v1/deep-scan` with description + domain + riskLevel returns structured compliance gaps with article references, detected risks, and compliance score
- [x] **S02: Deep Scan UI & i18n** `risk:medium` `depends:[S01]`
  > After this: free classifier results page shows "Deep Compliance Scan" section; clicking "Run Deep Scan" calls the endpoint and renders gaps, detected issues, and "Fix All Gaps with Complyance" CTA; i18n keys in all 7 locales

## Boundary Map

### S01 → S02

Produces:
- `/api/public/v1/deep-scan` endpoint with typed response: `{ riskLevel, detectedRisks[], complianceGaps[], complianceScore, disclaimer }`
- Rate limiting shared with existing classify endpoint

Consumes:
- nothing (first slice)

### S02 consumes S01

Produces:
- `DeepScanSection` client component integrated into free classifier results step
- i18n keys in all 7 locales under `freeClassifier.deepScan.*`

Consumes:
- Deep scan API response shape from S01
