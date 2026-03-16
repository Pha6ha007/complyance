# S01: Deep Scan API Endpoint

**Goal:** POST endpoint at `/api/public/v1/deep-scan` that returns compliance gaps for a given AI system description.
**Demo:** `curl -X POST /api/public/v1/deep-scan -d '{"description":"...","domain":"HR","riskLevel":"HIGH"}'` returns gaps.

## Must-Haves

- Zod-validated input: description, domain, riskLevel (from prior classification)
- Keyword-based risk detection: profiling, automated decisions, PII
- Domain-specific compliance gap generation per risk level
- Article-by-article gap analysis (Articles 9-15 for HIGH, Article 50 for LIMITED)
- Rate limiting shared with existing classifier
- Legal disclaimer in response
- Zero console.log

## Verification

- `npx tsc --noEmit` — zero errors
- Endpoint file exists and compiles
- Zero console.log in new file

## Tasks

- [ ] **T01: Create deep-scan route handler** `est:30m`
  - Create `src/app/api/public/v1/deep-scan/route.ts`
  - Zod input: description (min 10, max 2000), domain (string), riskLevel (UNACCEPTABLE|HIGH|LIMITED|MINIMAL)
  - Risk detection: scan description for profiling keywords, decision keywords, PII keywords
  - Gap generation: domain-specific gaps mapped to EU AI Act articles
  - Return: { riskLevel, detectedRisks[], complianceGaps[], complianceScore, confidence, disclaimer }
  - Rate limit: reuse pattern from existing classify endpoint
  - Verify: TypeScript compiles, no console.log

## Files Likely Touched

- src/app/api/public/v1/deep-scan/route.ts (new)
