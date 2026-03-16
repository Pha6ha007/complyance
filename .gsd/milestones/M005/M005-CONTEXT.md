# M005: AgentGuard → Complyance SDK — Context

## Scope
Build the server-side infrastructure for a Python SDK that customers install to auto-log AI call metadata. The Python SDK package itself is documentation — the critical path is the webhook endpoint and API key management within the Next.js app.

## Goals
- POST /api/sdk/events webhook authenticated via Organization.apiKey
- API key lifecycle: generate (cmp_... prefix), view masked, revoke
- Events stored as Evidence (type: LOG, article: Article 12 — Record Keeping)
- Never store prompt/response content — only metadata + hashes
- Dashboard page with key management and Python code examples

## Constraints
- Schema change required: added `apiKey String? @unique` to Organization
- Plan gate: Professional+ (checked via plan name, not PLAN_LIMITS.cicdApi which is Scale+)
- API key shown once on generation, then only masked
