# M003: Deep Scan on Free Classifier

## Scope

Add a "Deep Compliance Scan" feature to the free classifier results page. After the basic risk classification, users can run a deeper analysis that identifies specific EU AI Act compliance gaps and required actions. This creates a stronger conversion hook — users see exactly what gaps they need to fix, then sign up for the platform.

## Goals

1. New `/api/public/v1/deep-scan` endpoint — takes description + domain + risk level, returns compliance gaps
2. Deep scan logic in TypeScript (not Python) — keyword-based gap analysis against EU AI Act articles
3. DeepScanSection client component on the free classifier results step
4. i18n keys for all 7 locales
5. Legal disclaimer on all output

## Constraints

- No Python dependency — pure TypeScript, runs in Next.js
- Public endpoint — rate limited like the existing classifier
- No LLM calls — deterministic rule-based analysis (keeps it instant and free)
- Must integrate into the existing results step (step 5) of the free classifier wizard
- Same dark theme styling as existing free classifier page

## Key Decisions

- TypeScript over Python: the master plan's Python script is just keyword matching, no ML needed
- Runs as a second step after initial classification — user clicks "Run Deep Scan" on results page
- Reuses the rate limiter from the existing classify endpoint
- Compliance gaps map directly to EU AI Act Articles 5-50 and Annex III
