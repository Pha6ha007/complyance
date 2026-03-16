# GSD State

**Active Milestone:** (none — all integration phases complete)
**Active Slice:** (none)
**Active Task:** (none)
**Phase:** complete
**Next Action:** Deploy to production, verify all features live
**Last Updated:** 2026-03-16

## Completed Milestones

- M001: Launch Readiness & Critical Fixes (4 slices)
- M002: AI Legislation Tracker → Regulatory Intelligence (2 slices)
- M003: Deep Scan on Free Classifier (2 slices)
- M004: AIF360 Bias Testing — TypeScript-only (1 slice)
- M005: AgentGuard → Complyance SDK Integration (1 slice)
- M006: Attestix → Cryptographic Compliance Badge (1 slice)

## Hotfixes Applied

- Pricing page crash (undefined href when Paddle env vars unset)
- Contact form 400 (client/server validation mismatch, message min-length)
- LegislationBrowser (replaced useInfiniteQuery with useQuery)
- console.error cleanup in badge route

## Recent Decisions

- D013: TypeScript-only bias analysis (no Python/AIF360)
- D014: Bias results as base64 JSON in Evidence fileUrl
- D016: SDK API key on Organization model (cmp_ prefix)
- D019: Unsigned credentials when signing key not set

## Blockers

- (none)

## Env Vars Needed for Production

- COMPLYANCE_SIGNING_PRIVATE_KEY — Ed25519 private key (base64)
- COMPLYANCE_SIGNING_PUBLIC_KEY — Ed25519 public key (base64)
