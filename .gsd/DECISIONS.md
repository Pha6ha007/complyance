# Decisions

<!-- Append-only register of architectural and pattern decisions -->

| ID | Decision | Rationale | Date |
|----|----------|-----------|------|
| D001 | Paddle price IDs configured via env vars (`PADDLE_PRICE_*`) | Same code for sandbox/production; no hardcoded IDs to leak or mismatch | 2026-03-16 |
| D002 | Single `getPlanFromPaddlePrice()` for all price→plan resolution | Webhook had separate inline mapping that diverged from checkout — unified to one function | 2026-03-16 |
| D003 | Settings tRPC procedures on `systemRouter` (not new router) | Avoids touching `_app.ts` which has commented-out router stubs for incident/team/billing | 2026-03-16 |
| D004 | PLAN_LIMITS canonical source in `constants.ts`; `paddle.ts` re-exports | Eliminates divergence risk; routers and billing page all use same field names and sentinel values | 2026-03-16 |
| D005 | 999 as unlimited sentinel (not 999999) | Matches constants.ts convention; all comparisons updated to use 999 | 2026-03-16 |
| D006 | Email sending via `sendEmail()` service wrapper, not direct Resend calls | Consistent error handling, from-address, and future abstraction point | 2026-03-16 |
| D007 | LegislationEntry as separate model from RegulatoryUpdate | RegulatoryUpdate = news/changes; LegislationEntry = the actual laws. Complementary, not overlapping | 2026-03-16 |
| D008 | Shared legislation normalizer module at `src/lib/legislation-normalizer.ts` | Same logic needed by seed script and cron endpoint — extracted to avoid duplication | 2026-03-16 |
| D009 | Plan-gated legislation content: Free sees titles, Starter+ sees details | Titles/badges are visible to drive engagement; full summary/provisions require upgrade | 2026-03-16 |
| D010 | Cron sources processed independently with error isolation | One failing GitHub URL doesn't block the other two from syncing | 2026-03-16 |
| D011 | Deep scan in TypeScript, not Python subprocess | Keyword matching doesn't need ML; avoids Python dependency on Railway | 2026-03-16 |
| D012 | Deep scan as progressive disclosure on classifier results page | Users classify first, then optionally scan deeper — conversion hook | 2026-03-16 |
| D013 | TypeScript-only bias analysis (no Python/AIF360 microservice) | DI and SPD are simple arithmetic on group means; avoids separate Railway service, Docker image, Python dependency | 2026-03-16 |
| D014 | Bias results stored as base64 JSON in Evidence fileUrl field | MVP approach — no S3 needed; full JSON result accessible via Evidence API | 2026-03-16 |
| D015 | Bias plan gate uses `PLAN_LIMITS[plan].biasTesting > 0` | Free/Starter = 0 tests, Professional = 3, Scale = unlimited; numeric gate not boolean | 2026-03-16 |
| D016 | SDK API key on Organization model (`cmp_` prefix, 48 hex chars) | Simple Bearer auth for webhook; unique constraint prevents collisions | 2026-03-16 |
| D017 | SDK plan gate checks plan name directly, not PLAN_LIMITS.cicdApi | cicdApi is Scale+ only, but SDK should be Professional+; separate concern | 2026-03-16 |
| D018 | SDK events stored as Evidence type LOG with Article 12 reference | Reuses existing Evidence infrastructure; Article 12 = Record Keeping obligation | 2026-03-16 |
| D019 | Unsigned credentials when signing key not set | Graceful degradation — credential still useful as structured compliance data | 2026-03-16 |
| D020 | PKCS8/SPKI DER wrapping for Ed25519 raw keys | Node.js crypto requires DER-encoded keys; RFC 8410 prefixes added at runtime | 2026-03-16 |
| D021 | 90-day credential validity period | Balances freshness (compliance status changes) with administrative burden (re-issuance) | 2026-03-16 |
