---
id: M005
provides:
  - SDK webhook endpoint (POST /api/sdk/events)
  - API key management (generate/revoke via tRPC)
  - SDK dashboard page with integration guide
  - Organization.apiKey schema field
key_decisions:
  - "D016: SDK API key on Organization model (cmp_ prefix, 48 hex chars)"
  - "D017: Plan gate uses explicit plan name check, not PLAN_LIMITS.cicdApi (which is Scale+ only)"
  - "D018: SDK events stored as Evidence type LOG with Article 12 reference"
patterns_established:
  - "Bearer token auth via Organization.apiKey for external API endpoints"
  - "One-time key display pattern (show full key once, then only masked)"
observability_surfaces:
  - "Evidence entries with title prefix 'SDK:' for filtering"
  - "API key status via system.getApiKey tRPC query"
duration: ~45 minutes
verification_result: passed
completed_at: 2026-03-16
---

# M005: AgentGuard → Complyance SDK Integration

**SDK webhook infrastructure with API key management, Evidence storage for AI call metadata, and developer integration guide.**

## What Happened

Added `apiKey` (unique, nullable) to the Organization model via `prisma db push`. Built the webhook endpoint at `/api/sdk/events` that authenticates via Bearer token, validates the event schema with Zod, verifies system ownership, and stores events as Evidence entries with integrity hashes. Never stores prompt content — only model name, provider, token counts, latency, PII indicators, and content hashes.

Three tRPC procedures added to systemRouter: `getApiKey` (returns masked key), `generateApiKey` (creates `cmp_` prefixed key, returns full key once), `revokeApiKey` (nullifies). The dashboard page shows key management UI with copy-to-clipboard, a Python quick-start guide with code examples, and supported provider grid.

## Cross-Slice Verification

- TypeScript: 0 errors
- All 7 locales updated (nav key + sdk content section)
- Zero console.log
- Schema pushed successfully to local DB
- Fixed en.json nesting issue (bias/sdk were accidentally inside referrals object)

## Forward Intelligence

### What the next milestone should know
- The Python SDK package itself wasn't created — only the server-side infrastructure
- `prisma db push --accept-data-loss` was needed due to new unique constraint on nullable field

### What's fragile
- API key auth is simple Bearer token — no rate limiting on the webhook endpoint yet
- SDK events create one Evidence row per call — high-volume systems could generate many rows

## Files Created/Modified

- `prisma/schema.prisma` — Added apiKey to Organization
- `src/app/api/sdk/events/route.ts` — Webhook endpoint
- `src/server/routers/system.ts` — Added getApiKey, generateApiKey, revokeApiKey
- `src/app/[locale]/(dashboard)/sdk/page.tsx` — Server page
- `src/app/[locale]/(dashboard)/sdk/client.tsx` — Client component
- `src/components/dashboard/sidebar.tsx` — Added SDK nav item
- `src/i18n/messages/*.json` — sdk section in all 7 locales
