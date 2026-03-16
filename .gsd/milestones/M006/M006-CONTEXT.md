# M006: Attestix → Cryptographic Compliance Badge — Context

## Scope
Upgrade the existing Compliance Badge from a marketing label to a cryptographically verifiable credential. Implements W3C Verifiable Credentials Data Model v1.1 with Ed25519Signature2020 proof type.

## Goals
- Issue credentials with org's real compliance data (classified systems, risk levels, scores)
- Sign with Ed25519 when COMPLYANCE_SIGNING_PRIVATE_KEY is set
- Independent verification via public key at /api/well-known/public-key
- Content negotiation: JSON-LD for machines, JSON for humans
- 90-day credential validity with expiration checking

## Constraints
- No schema changes needed (reads existing Organization + AISystem data)
- No new dependencies (uses Node.js built-in crypto)
- API-only (no UI changes, no i18n keys needed)
- Signing env vars optional — credentials work unsigned too
