---
id: M003
provides:
  - /api/public/v1/deep-scan endpoint for compliance gap analysis
  - DeepScanSection on free classifier results page
  - i18n keys for deep scan in all 7 locales
key_decisions:
  - TypeScript instead of Python — keyword matching doesn't need ML, avoids deployment complexity
  - Separate rate limiter per endpoint (same 10/hour pattern)
  - Deep scan as progressive disclosure on results page, not a separate page
  - Gap analysis maps to specific EU AI Act articles with priority levels
patterns_established:
  - Public API endpoints share rate limiting pattern but have separate stores
  - Conversion hooks via gap display → CTA
observability_surfaces:
  - console.error in deep-scan route for unexpected failures
requirement_outcomes: []
duration: ~30min across 2 slices
verification_result: passed
completed_at: 2026-03-16
---

# M003: Deep Scan on Free Classifier

**Compliance gap analysis on the free classifier — users see specific EU AI Act gaps and a conversion CTA.**

## What Happened

S01 built the deep scan API endpoint. Accepts description + domain + riskLevel and returns structured compliance gaps. Risk detection uses keyword matching across 4 categories (profiling, automated decisions, PII, transparency) plus 5 domain-specific risk patterns. Gap generation maps risk level to specific EU AI Act articles: HIGH risk gets 8+ gaps covering Articles 9-15 and 47, with domain-specific additions (e.g., Article 26(5) for HR systems). LIMITED risk gets Article 50 transparency gaps. Rate limited at 10/hour per IP.

S02 integrated the deep scan into the free classifier. Added `DeepScanSection` component that appears after the classification obligations on the results page. Users click "Run Deep Scan" to get detailed gap analysis showing detected risks with severity icons, compliance gaps with article references and priority indicators, and a "Fix All Gaps with Complyance" CTA with PostHog tracking. Added i18n keys for all 7 locales including proper Arabic ICU plural forms.

## Cross-Slice Verification

| Criterion | Method | Result |
|-----------|--------|--------|
| `npx tsc --noEmit` zero errors | TypeScript check | PASS |
| Zero console.log | grep across src/ | PASS |
| Deep scan endpoint exists | File check | PASS |
| DeepScanSection in classifier | grep in client.tsx | PASS |
| i18n keys in all 7 locales | Python JSON check | PASS |

## Requirement Changes

None.

## Forward Intelligence

### What the next milestone should know
- The deep scan endpoint is completely stateless — no DB, no auth. It's a pure analysis function.
- The existing `/api/public/v1/classify` endpoint uses rule-based classification (no LLM). The deep scan extends this with gap analysis.
- Both endpoints have separate in-memory rate limit stores that reset on server restart.
- The free classifier page (`client.tsx`) is now ~900 lines. Consider extracting components if more features are added.

### What's fragile
- In-memory rate limiting resets on deploy — Railway redeploys clear the store
- Keyword-based risk detection is simple pattern matching — could produce false positives for unrelated domains

### Authoritative diagnostics
- `curl -X POST localhost:3000/api/public/v1/deep-scan -H 'Content-Type: application/json' -d '{"description":"HR screening tool that evaluates candidates","domain":"HR","riskLevel":"HIGH"}'` — should return gaps

### What assumptions changed
- Master plan specified Python subprocess for deep scan — replaced with pure TypeScript since the logic is keyword matching, not ML

## Files Created/Modified

- `src/app/api/public/v1/deep-scan/route.ts` — new endpoint
- `src/app/[locale]/(marketing)/free-classifier/client.tsx` — added DeepScanSection
- `src/i18n/messages/{en,fr,de,pt,ar,pl,it}.json` — added deepScan keys
