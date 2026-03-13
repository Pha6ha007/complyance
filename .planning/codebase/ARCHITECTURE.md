# Architecture

**Analysis Date:** 2026-03-13

## Pattern

**Next.js App Router monolith** — single Railway deployment with 4 services:
- `web` — Next.js 14 App Router (SSR + RSC)
- `postgres` — PostgreSQL (Railway managed)
- `redis` — Redis for BullMQ job queue
- `worker` — BullMQ worker process for async PDF generation

**Primary architectural pattern:** Server-centric React (RSC by default, `"use client"` only for interactive components)

## Layers

```
Browser
  └── React Server Components (default, data-fetching at layout/page level)
      └── Client Components ("use client" — forms, wizards, interactive UI)
          └── tRPC client (type-safe API calls from client components)

Next.js Server
  ├── App Router pages: src/app/[locale]/
  │   ├── (marketing)/ — public, no auth required
  │   └── (dashboard)/ — protected, session required
  ├── API Routes: src/app/api/
  │   ├── /trpc/[trpc] — tRPC handler (all business mutations/queries)
  │   ├── /auth/ — NextAuth.js endpoints
  │   ├── /webhooks/paddle — Paddle payment events
  │   ├── /public/v1/ — Public REST API (badge, classify)
  │   └── /health — Railway health check
  ├── tRPC Routers: src/server/routers/
  └── Services: src/server/services/

Worker Process (separate Railway service)
  └── BullMQ consumers — PDF generation jobs
```

## tRPC API Surface

**Entry point:** `src/server/routers/_app.ts`

| Router | File | Purpose |
|--------|------|---------|
| `system` | `routers/system.ts` | AI system CRUD, listing, deletion |
| `classification` | `routers/classification.ts` | Trigger classification, get results |
| `document` | `routers/document.ts` | PDF generation, listing, download |
| `vendor` | `routers/vendor.ts` | Vendor assessment CRUD |
| `badge` | `routers/badge.ts` | Compliance badge management |
| `evidence` | `routers/evidence.ts` | Evidence vault CRUD |
| `intelligence` | `routers/intelligence.ts` | Regulatory updates feed |
| `referral` | `routers/referral.ts` | Referral code generation/tracking |

**Missing routers (TODO):** `billing`, `incident`, `team`

## Procedure Types

Defined in `src/server/trpc.ts`:

- `publicProcedure` — No auth required (public API, free classifier)
- `protectedProcedure` — Requires session; injects `ctx.user` + `ctx.organization`
- `adminProcedure` — Requires `user.role === 'ADMIN'`

**Plan limit enforcement:** Applied in router procedures via `PLAN_LIMITS` from `src/lib/constants.ts`. Each `protectedProcedure` checks org plan before mutations.

## Service Layer

**Location:** `src/server/services/`

| Service | Files | Purpose |
|---------|-------|---------|
| `classification/` | `engine.ts`, `rules.ts`, `llm.ts`, `validator.ts`, `gaps.ts` | Classification pipeline |
| `documents/` | `analyzer.ts`, `generator.ts`, `pdf.tsx`, `storage.ts`, `text-extractor.ts` | PDF generation + S3 storage |
| `billing/` | `paddle.ts` | Paddle API, plan limits, price mapping |
| `vendors/` | — | Vendor risk assessment |
| `evidence/` | — | Evidence vault management |
| `badge/` | `generator.ts` | Badge level computation + HTML/SVG generation |
| `referrals/` | `rewards.ts` | Referral reward granting/revoking |

## Classification Engine Pipeline

**File:** `src/server/services/classification/engine.ts`

```
classifyAISystem(systemId, input)
  │
  ├── 1. preFilterClassification(input)     [rules.ts]
  │      Hard rules: profilesUsers=true → HIGH
  │      Social scoring + gov context → UNACCEPTABLE
  │      Returns: { isDefinitive, riskLevel, reason }
  │
  ├── 2. If NOT definitive → classifyWithLLM(input)  [llm.ts]
  │      Claude Sonnet (temp=0), structured JSON output
  │      Annex III categories (8 types), Article 6 exceptions
  │
  ├── 3. validateClassification(result)    [validator.ts]
  │      Verify category, profiling override
  │      confidence < 0.7 → flagForReview
  │
  ├── 4. generateComplianceGaps(result)    [gaps.ts]
  │      Generate article-level gaps
  │      calculateComplianceScore()
  │
  └── 5. Save to DB → return ClassificationEngineResult
```

## Document Generation Pipeline

```
documentRouter.generate()
  → Check plan limits (docGeneration flag)
  → Add BullMQ job to queue
  → Worker picks up job
  → analyzer.ts: fetch system data from DB
  → generator.ts: select template (CLASSIFICATION_REPORT | ANNEX_IV | ROADMAP)
  → pdf.tsx: @react-pdf/renderer → PDF buffer
  → storage.ts: upload to S3/R2
  → Update Document record with fileUrl
  → Notify user (Resend email)
```

## Authentication Flow

**Provider:** NextAuth.js v5 (`auth.ts` at project root)
- Email/password (credentials provider)
- Google OAuth
- JWT sessions (not database sessions)

**Registration:** Custom route `src/app/api/auth/register/route.ts`
- Creates User + Organization in one transaction
- Sets default locale from Accept-Language header

## Data Flow (Request Lifecycle)

```
User action in React Client Component
  → tRPC mutation via useUtils() hook
  → POST /api/trpc/[procedure]
  → createTRPCContext: auth() → session
  → protectedProcedure middleware: session → user + organization
  → Router procedure: Zod validation → plan check → service call
  → Prisma query to PostgreSQL
  → Response via superjson transformer
```

## Public REST API

**Base:** `/api/public/v1/`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/classify` | POST | Free AI classifier (no auth) |
| `/badge/[orgId]` | GET | Public badge info |
| `/badge/[orgId]/svg` | GET | SVG badge image |

## i18n Architecture

**Library:** `next-intl`
**URL Pattern:** `/{locale}/{path}` — e.g., `/en/dashboard`, `/ar/systems`

- All pages under `src/app/[locale]/`
- Server components: `await getTranslations('namespace')`
- Client components: `useTranslations('namespace')`
- RTL (Arabic): Tailwind logical properties only
- 7 locales: `en`, `fr`, `de`, `pt`, `ar`, `pl`, `it`
- 1056 keys per locale, 100% synced

## Database Schema (Prisma)

**Key models:**

| Model | Purpose |
|-------|---------|
| `Organization` | Tenant root — plan, badge, Paddle IDs |
| `User` | Belongs to Organization, has role |
| `AISystem` | Core entity — classification results stored inline |
| `ComplianceGap` | Article-level gaps per AISystem |
| `Vendor` | Vendor risk assessment |
| `SystemVendorLink` | Many-to-many AISystem ↔ Vendor |
| `Document` | Generated PDFs with S3 URL |
| `Evidence` | Evidence vault items with integrity hash |
| `Incident` | AI incident register |
| `RegulatoryUpdate` | Intelligence feed items |
| `ReferralCode` / `ReferralReward` | Referral system |

**Enums:** `Plan` (FREE/STARTER/PROFESSIONAL/SCALE/ENTERPRISE), `RiskLevel` (UNACCEPTABLE/HIGH/LIMITED/MINIMAL), `BadgeLevel` (NONE/AWARE/READY/COMPLIANT)

## Entry Points

| Entry | File | Notes |
|-------|------|-------|
| Next.js app | `src/app/layout.tsx` | Root layout with Sentry |
| tRPC handler | `src/app/api/trpc/[trpc]/route.ts` | All API mutations |
| Auth | `auth.ts` (root) | NextAuth config |
| Prisma client | `src/server/db/client.ts` | Singleton |
| tRPC context | `src/server/trpc.ts` | Context + procedure builders |
| Constants | `src/lib/constants.ts` | PLAN_LIMITS, getEffectiveSystemLimit |

---

*Architecture analysis: 2026-03-13*
