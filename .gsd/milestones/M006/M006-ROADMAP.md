# M006: Attestix → Cryptographic Compliance Badge

**Vision:** Make the Compliance Badge cryptographically verifiable via W3C Verifiable Credentials with Ed25519 signatures.

## Success Criteria

- Credential issuer generates W3C VC with compliance data
- Ed25519 signing when env vars are set, graceful unsigned fallback
- Public verification endpoint returns credential + verification status
- Public key endpoint for independent signature verification
- Content negotiation (application/ld+json for machine-readable)

## Key Risks / Unknowns

- Ed25519 raw key → PKCS8/SPKI DER wrapping for Node.js crypto compatibility

## Slices

- [x] **S01: Credential issuer + verify endpoint + public key endpoint** `risk:medium` `depends:[]`
  > After this: Badge QR codes can link to /api/public/v1/badge/{orgId}/verify which returns a W3C Verifiable Credential with real compliance data, optionally Ed25519 signed
