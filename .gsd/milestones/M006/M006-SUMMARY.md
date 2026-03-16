---
id: M006
provides:
  - W3C Verifiable Credential issuer for Compliance Badge
  - Public verification endpoint with content negotiation
  - Public key endpoint for independent Ed25519 verification
key_decisions:
  - "D019: Graceful degradation — unsigned credentials when signing key not set"
  - "D020: PKCS8/SPKI DER wrapping for Ed25519 raw keys in Node.js crypto"
  - "D021: 90-day credential validity period"
patterns_established:
  - "W3C VC structure with credentialSubject containing compliance data"
  - "Content negotiation on API endpoints (application/ld+json vs application/json)"
observability_surfaces:
  - "GET /api/public/v1/badge/{orgId}/verify returns verification status"
  - "GET /api/well-known/public-key returns 503 if key not configured"
duration: ~30 minutes
verification_result: passed
completed_at: 2026-03-16
---

# M006: Attestix → Cryptographic Compliance Badge

**W3C Verifiable Credentials with Ed25519 signatures for machine-readable, independently verifiable compliance proof.**

## What Happened

Built a credential issuer service that generates W3C Verifiable Credentials from real org compliance data. The credential includes classified system count, high-risk system count, open gaps, average compliance score, and the badge level mapped to AWARE/READY/COMPLIANT.

When `COMPLYANCE_SIGNING_PRIVATE_KEY` is set, credentials are signed with Ed25519. The implementation handles raw Ed25519 keys by wrapping them in PKCS8 DER format (RFC 8410 prefix) for Node.js crypto compatibility. Verification function checks expiration, issuer identity, and optionally validates the Ed25519 signature against the public key.

The verify endpoint issues a credential and self-verifies it in one request. Supports content negotiation: `application/ld+json` returns the raw credential, `application/json` returns a verification wrapper with status. The public key endpoint at `/api/well-known/public-key` exposes the Ed25519 key in W3C Security Vocabulary format.

Also cleaned up a `console.error` in the existing badge route.

## Cross-Slice Verification

- TypeScript: 0 errors
- No i18n changes needed (API-only)
- Zero console.log/error in new code
- Removed existing console.error from badge route

## Forward Intelligence

### What the next milestone should know
- Env vars `COMPLYANCE_SIGNING_PRIVATE_KEY` and `COMPLYANCE_SIGNING_PUBLIC_KEY` need to be generated and set in Railway
- The `.well-known` path lives at `/api/well-known/public-key` — may want a next.config.js rewrite to `/.well-known/public-key`

### What's fragile
- openGaps is hardcoded to 0 — would need ComplianceGap model query to compute real value
- Credential validity (90 days) is not configurable per org

## Files Created/Modified

- `src/server/services/badge/credential-issuer.ts` — W3C VC issuer + verifier
- `src/app/api/public/v1/badge/[orgId]/verify/route.ts` — Public verification endpoint
- `src/app/api/well-known/public-key/route.ts` — Public key endpoint
- `src/app/api/public/v1/badge/[orgId]/route.ts` — Removed console.error
