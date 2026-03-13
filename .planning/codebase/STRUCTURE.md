# Structure

**Analysis Date:** 2026-03-13

## Top-Level Layout

```
complyance/
├── auth.ts                        # NextAuth v5 config (root level)
├── playwright.config.ts           # E2E test config
├── prisma/
│   └── schema.prisma              # PostgreSQL schema (all models + enums)
├── content/
│   └── blog/                      # 5 MDX blog articles
├── docs/                          # Reference docs (read-only, never modify)
│   ├── AI_ENGINE.md               # Classification logic detail
│   ├── ARCHITECTURE.md            # System architecture
│   ├── DEPLOYMENT.md              # Railway deploy guide
│   ├── I18N.md                    # i18n strategy
│   ├── PADDLE_INTEGRATION.md      # Payment integration spec
│   ├── MONITORING.md              # Sentry + PostHog
│   ├── DATABASE.md                # Schema reference
│   ├── REFERRAL_SYSTEM.md         # Referral system spec
│   └── business/                  # Product scope & strategy
├── src/
│   ├── app/                       # Next.js App Router pages + API
│   ├── server/                    # tRPC routers + services + AI
│   ├── components/                # React components
│   ├── i18n/                      # Translations + i18n config
│   └── lib/                       # Utilities + hooks
├── tests/                         # Playwright E2E tests
├── .planning/                     # GSD planning docs
└── .claude/skills/                # Claude Code skills
```

## `src/app/` — Pages and API Routes

```
src/app/
├── [locale]/                      # All pages under locale prefix
│   ├── (marketing)/               # Route group — public pages, no auth
│   │   ├── page.tsx               # Homepage
│   │   ├── pricing/               # Pricing page
│   │   ├── about/                 # About page
│   │   ├── blog/                  # Blog index + [slug] posts
│   │   ├── contact/               # Contact form
│   │   ├── partners/              # Partner application form
│   │   ├── privacy/               # Privacy policy
│   │   ├── terms/                 # Terms of service
│   │   ├── refund/                # Refund policy
│   │   ├── free-classifier/       # Free AI risk classifier (no auth)
│   │   ├── login/                 # Login page
│   │   ├── verify/[orgId]/        # Email verification
│   │   └── layout.tsx             # Marketing layout
│   └── (dashboard)/               # Route group — protected pages
│       ├── dashboard/             # Main dashboard overview
│       ├── systems/               # AI systems list
│       │   ├── new/               # Add new system
│       │   └── [id]/              # System detail
│       │       └── gaps/          # Compliance gaps for system
│       ├── vendors/               # Vendor risk list
│       │   ├── new/               # Add vendor
│       │   └── [id]/              # Vendor detail
│       ├── evidence/              # Evidence vault list
│       │   ├── new/               # Upload evidence
│       │   └── [id]/              # Evidence detail
│       ├── intelligence/          # Regulatory updates feed
│       ├── reports/               # Generated documents
│       ├── referrals/             # Referral program
│       ├── admin/                 # Admin-only
│       │   └── updates/           # Manage regulatory updates
│       ├── settings/              # User/org settings
│       │   ├── page.tsx           # General settings
│       │   ├── billing/           # Billing + plan management
│       │   └── badge/             # Compliance badge config
│       └── layout.tsx             # Dashboard layout (sidebar + header)
├── api/
│   ├── trpc/[trpc]/route.ts       # tRPC endpoint
│   ├── auth/
│   │   ├── [...nextauth]/         # NextAuth handler
│   │   └── register/route.ts      # Custom registration endpoint
│   ├── webhooks/
│   │   └── paddle/route.ts        # Paddle webhook receiver
│   ├── public/v1/                 # Public REST API
│   │   ├── classify/route.ts      # Free classifier endpoint
│   │   └── badge/[orgId]/
│   │       ├── route.ts           # Badge JSON
│   │       └── svg/route.ts       # Badge SVG image
│   ├── contact/route.ts           # Contact form handler
│   ├── partners/route.ts          # Partner application handler
│   └── health/route.ts            # Railway health check
├── robots.ts                      # robots.txt generator
├── sitemap.ts                     # sitemap.xml generator
└── _app.ts                        # App-level config
```

## `src/server/` — Backend Logic

```
src/server/
├── trpc.ts                        # tRPC context, publicProcedure, protectedProcedure, adminProcedure
├── db/
│   └── client.ts                  # Prisma singleton
├── routers/
│   ├── _app.ts                    # Root router (combines all sub-routers)
│   ├── system.ts                  # AI system CRUD
│   ├── classification.ts          # Classification trigger + results
│   ├── document.ts                # PDF generation + listing
│   ├── vendor.ts                  # Vendor assessment CRUD
│   ├── badge.ts                   # Badge management
│   ├── evidence.ts                # Evidence vault CRUD
│   ├── intelligence.ts            # Regulatory updates feed
│   └── referral.ts                # Referral codes + rewards
├── services/
│   ├── classification/
│   │   ├── engine.ts              # Main orchestrator (classifyAISystem)
│   │   ├── rules.ts               # Pre-filter rule engine
│   │   ├── llm.ts                 # Claude Sonnet API call
│   │   ├── validator.ts           # Result validation + cross-check
│   │   └── gaps.ts                # Gap generation + compliance score
│   ├── documents/
│   │   ├── analyzer.ts            # Fetch + prepare data for PDF
│   │   ├── generator.ts           # Orchestrate PDF generation
│   │   ├── pdf.tsx                # @react-pdf/renderer templates
│   │   ├── storage.ts             # S3/R2 upload/download
│   │   ├── text-extractor.ts      # Extract text from uploaded docs
│   │   └── templates/             # PDF template components
│   │       ├── annex-iv.tsx       # Annex IV technical doc
│   │       ├── classification-report.tsx
│   │       └── roadmap.tsx        # Compliance roadmap
│   ├── billing/
│   │   └── paddle.ts              # Paddle API, PLAN_LIMITS, PADDLE_PRODUCT_MAP
│   ├── vendors/                   # Vendor risk assessment logic
│   ├── evidence/                  # Evidence management
│   ├── badge/
│   │   └── generator.ts           # determineBadgeLevel, generateBadgeHTML/SVG
│   └── referrals/
│       └── rewards.ts             # grantReferrerReward, revokeReferrerReward
├── ai/
│   ├── schemas/                   # Zod schemas for LLM output validation
│   │   └── classification-result.ts
│   └── prompts/                   # System prompts for Claude
```

## `src/components/` — React Components

```
src/components/
├── ui/                            # shadcn/ui base components (Button, Card, Badge, etc.)
├── shared/                        # Shared across marketing + dashboard
├── marketing/                     # Marketing-only components
├── dashboard/
│   ├── header.tsx                 # Dashboard top navigation
│   ├── sidebar.tsx                # Dashboard side navigation
│   └── user-menu.tsx              # User dropdown (settings, logout)
├── systems/
│   ├── classification-wizard.tsx  # Multi-step classification form
│   ├── classification-report.tsx  # Classification result display
│   ├── document-analysis-viewer.tsx # Uploaded doc analysis results
│   ├── document-generator.tsx     # PDF generation trigger UI
│   ├── document-uploader.tsx      # File upload for doc-assisted classification
│   ├── annex-iv.tsx               # Annex IV viewer
│   └── roadmap.tsx                # Compliance roadmap viewer
└── billing/                       # Billing/plan UI components
```

## `src/lib/` — Utilities

```
src/lib/
├── constants.ts                   # PLAN_LIMITS, getEffectiveSystemLimit
├── auth.ts                        # Auth helper utilities
├── analytics.ts                   # PostHog analytics helpers
├── blog.ts                        # MDX blog post loader
├── utils.ts                       # General utilities (cn, etc.)
├── toast.tsx                      # Toast notification helpers
└── trpc/                          # tRPC client setup
```

## `src/i18n/` — Translations

```
src/i18n/
├── messages/
│   ├── en.json                    # 1056 keys (primary)
│   ├── fr.json
│   ├── de.json
│   ├── pt.json
│   ├── ar.json                    # RTL locale
│   ├── pl.json
│   └── it.json
└── request.ts                     # next-intl config (locale detection)
```

## `tests/` — E2E Tests

```
tests/
├── helpers.ts                     # Shared utilities (LOCALES, getLocalizedPath, etc.)
├── auth-pages.spec.ts             # Login page tests for all 7 locales
├── dashboard-pages.spec.ts        # Dashboard page availability
├── language-switching.spec.ts     # Locale switcher tests
└── marketing-pages.spec.ts        # Public page tests
```

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Utility files | `kebab-case.ts` | `text-extractor.ts`, `classification-report.ts` |
| React components | `PascalCase.tsx` | `ClassificationWizard.tsx` |
| tRPC router files | `kebab-case.ts` | `system.ts`, `intelligence.ts` |
| Service files | `kebab-case.ts` | `engine.ts`, `generator.ts` |
| Test files | `kebab-case.spec.ts` | `auth-pages.spec.ts` |
| i18n messages | `en.json` (locale code) | `ar.json` |
| API routes | `route.ts` (Next.js convention) | |
| Page files | `page.tsx` (Next.js convention) | |
| Layout files | `layout.tsx` (Next.js convention) | |

## Where to Add New Code

| Adding... | Location |
|-----------|---------|
| New page | `src/app/[locale]/(dashboard)/[name]/page.tsx` |
| New tRPC router | `src/server/routers/[name].ts` + register in `_app.ts` |
| New service | `src/server/services/[domain]/[name].ts` |
| New component | `src/components/[domain]/[name].tsx` |
| New utility | `src/lib/[name].ts` |
| New PDF template | `src/server/services/documents/templates/[name].tsx` |
| Translation key | All 7 files in `src/i18n/messages/` |
| New E2E test | `tests/[name].spec.ts` |

---

*Structure analysis: 2026-03-13*
