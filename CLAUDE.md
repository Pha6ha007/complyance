# CLAUDE.md — Complyance | AI Compliance Platform

## Project Overview

Self-serve SaaS for AI compliance management. Target: SMB/SaaS companies selling into EU, US, UAE.

**Core proposition:** "Credo AI for companies that can't afford Credo AI."
**Deadline:** EU AI Act high-risk — August 2, 2026
**Context:** Solo founder, Paddle payments, no sales team, all self-serve

---

## Working Mode

- **One task at a time** — do NOT refactor unrelated code while working
- **Ask before touching** — if a change affects >3 files, confirm first
- **Small steps** — complete one logical change, then stop and report
- **Never rewrite** — prefer minimal targeted edits over full rewrites
- **Stop and ask** if task requires reading >10 files
- **No surprises** — if you see something broken unrelated to the task, mention it but do NOT fix it

---

## Do NOT Touch (unless explicitly asked)

- `src/i18n/messages/` — translation files (only the locale specified in task)
- `prisma/schema.prisma` — DB schema changes require explicit approval
- `package.json` — no new dependencies without asking
- `docs/` — read-only reference, never modify
- Any file not directly related to the current task

---

## Context Loading Order

When starting any task, read ONLY:
1. This file (CLAUDE.md)
2. The specific file(s) mentioned in the task
3. Related router/service only if directly needed

Do NOT proactively read all docs/ files. Do NOT scan the entire project structure unless asked.

---

## Definition of Done

A task is complete when:
- TypeScript: 0 errors (`pnpm tsc --noEmit`)
- All 7 locales updated if any UI strings were added
- No `console.log` left in code
- Report exact list of changed files at the end

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict) |
| UI | Tailwind CSS + shadcn/ui |
| API | tRPC + Next.js Route Handlers |
| Database | PostgreSQL (Railway) + Prisma |
| Auth | NextAuth.js v5 (email + Google OAuth, JWT) |
| AI | Anthropic Claude API (Sonnet, temp=0) |
| Payments | Paddle (MoR) |
| Email | Resend |
| Storage | AWS S3 / Cloudflare R2 |
| PDF | @react-pdf/renderer |
| i18n | next-intl (7 locales) |
| Queue | BullMQ + Redis |
| Monitoring | Sentry + PostHog |
| Deploy | Railway (monorepo, single platform) |

---

## Project Structure (key paths only)

```
complyance/
├── prisma/schema.prisma          # Full DB schema
├── content/blog/                  # 5 MDX articles
├── docs/                          # Detailed docs (read when needed)
│   ├── AI_ENGINE.md               # Classification logic
│   ├── ARCHITECTURE.md            # System architecture
│   ├── DEPLOYMENT.md              # Railway deploy guide
│   ├── I18N.md                    # i18n strategy
│   ├── PADDLE_INTEGRATION.md      # Payment integration
│   ├── MONITORING.md              # Sentry + PostHog
│   ├── DATABASE.md                # Schema reference
│   ├── REFERRAL_SYSTEM.md         # Referral system spec
│   └── business/                  # Product scope & strategy
├── src/
│   ├── app/[locale]/              # Pages (marketing, auth, dashboard, admin)
│   ├── server/
│   │   ├── routers/               # tRPC routers (system, classification, vendor, document, evidence, incident, intelligence, badge, billing)
│   │   ├── services/              # Business logic (classification/, documents/, vendors/, evidence/, billing/, badge/, intelligence/)
│   │   └── ai/                    # LLM client, prompts, schemas
│   ├── components/                # React components (ui/, shared/, dashboard/, systems/, billing/)
│   ├── i18n/messages/             # 7 locale JSON files (1056 keys each)
│   └── lib/                       # Utilities (trpc, auth, blog, utils)
└── .claude/skills/                # Claude Code skills
    ├── complyance-audit/          # Project audit skill
    └── frontend-design/           # UI design skill
```

---

## Coding Conventions

- **TypeScript strict**, pnpm, Prettier, ESLint
- **Imports:** `@/` alias for `src/`
- **Files:** `kebab-case.ts` utilities, `PascalCase.tsx` components
- **Server components by default** — `"use client"` only when needed
- **Async server components:** use `await getTranslations()` NOT `useTranslations()`
- **Translation keys:** ALL user-facing strings via i18n, NEVER hardcoded
- **RTL (Arabic):** Tailwind logical properties only (ms-/me-/ps-/pe-, NOT ml-/mr-/pl-/pr-)
- **tRPC:** Zod input validation, protectedProcedure for auth, plan limit middleware
- **Errors:** TRPCError with codes, Sentry for server errors, toast for client
- **Legal disclaimer:** every classification result and generated document
- **Classification:** temperature=0, structured JSON, always validate LLM output

---

## i18n — 7 Locales

| Code | Language | Dir | Market |
|------|----------|-----|--------|
| en | English | LTR | Primary |
| fr | French | LTR | France, Belgium |
| de | German | LTR | DACH |
| pt | Portuguese | LTR | Portugal, Brazil |
| ar | Arabic | **RTL** | UAE, MENA |
| pl | Polish | LTR | Poland |
| it | Italian | LTR | Italy |

All locales: **1056 keys**, 100% synced. Files in `src/i18n/messages/`.

---

## Plan Limits (server-side enforced)

| Feature | Free | Starter $99 | Professional $249 | Scale $499 |
|---------|------|-------------|-------------------|------------|
| AI Systems | 1 | 5 | 20 | 50 |
| Vendors | 0 | 2 | 10 | Unlimited |
| Documents | No | Yes | Yes | Yes |
| Evidence Vault | No | No | Yes | Yes |
| Badge | Aware | Ready | Compliant | Compliant |
| Regulatory Alerts | No | Weekly | Real-time | Real-time |
| Team | 1 | 1 | 3 | 10 |

Effective system limit = PLAN_LIMITS[plan].systems + org.bonusSystems (referrals)

---

## Classification Engine

```
Input → Rule-Based Pre-Filter → LLM (Claude Sonnet, temp=0) → Validation → Gaps → Score
```

**Hard rules:** profilesUsers=true → HIGH, social scoring + gov → UNACCEPTABLE
**LLM:** Annex III (8 categories), Article 6, exceptions, structured JSON
**Validation:** verify category, profiling override, confidence < 0.7 → flag review
**Score:** weights CRITICAL=4, HIGH=3, MEDIUM=2, LOW=1

Full details: `docs/AI_ENGINE.md`

---

## Key Workflows

1. **Onboarding:** Register → language → markets → plan → add system → classify → gaps
2. **Classification:** Wizard → DB → pre-filter → LLM → validate → gaps → score
3. **Doc generation:** Check plan → queue → fetch data → render PDF in locale → S3 → notify
4. **Vendor assessment:** Add vendor → questionnaire → LLM analysis → risk score → link systems
5. **Doc-assisted classification:** Upload files → Claude extracts data → pre-fill wizard → classify

---

## Deployment (Railway)

4 services: web (Next.js), postgres, redis, worker (BullMQ)

```
git push origin main → Railway builds → prisma migrate → health check → live
```

Key env vars: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, ANTHROPIC_API_KEY, PADDLE_API_KEY, PADDLE_WEBHOOK_SECRET, RESEND_API_KEY, SENTRY_DSN, NEXT_PUBLIC_POSTHOG_KEY

Full details: `docs/DEPLOYMENT.md`

---

## Development Status

**Stage:** Pre-launch (closed beta ready) | **Full status:** `docs/PRODUCT_STATUS.md`

### ✅ Completed
- Phase 1: Foundation (Next.js, Prisma, auth, i18n, marketing pages)
- Phase 2: Core (dashboard, systems CRUD, classification engine, gap analysis, doc upload)
- Phase 3: Documents & Payments (3 PDF templates, blog, Paddle, legal pages)
- Phase 4: Competitive features (vendors, evidence vault, intelligence, badge, free classifier)
- Phase 5: Launch prep (SEO, error handling, monitoring, security headers, Dockerfile)
- Phase 6: Pre-launch audit (March 2026) — see `docs/PRE_LAUNCH_IMPROVEMENTS.md`
  - 10 bugs fixed (SPA navigation, dark-mode, auth flow, i18n)
  - Full i18n audit: 7 locales × 1,583 keys, 3,711 stale keys removed
  - OG/Twitter meta + dynamic OG image + per-page SEO metadata
  - Forgot/reset password flow (token-based, branded email, email enumeration protection)
  - 40 E2E smoke tests (Playwright)
  - Locale sync tool (`pnpm i18n:sync`)

### 🔴 Blocked on External
- Paddle verification (paid plan checkout)

### ❌ Not Yet Implemented (post-launch)
- Team management (invite, roles) — Professional/Scale plans
- Incident register — EU AI Act requirement for high-risk
- BullMQ classification queue — currently runs inline
- Regulation DB models (Regulation, RiskCategory, RiskException, Obligation)
- Vendor Assessment / Model Card / Bias Report PDF templates
- CI/CD API, DATABASE.md documentation

---

## Important Rules

1. **Solo founder** — prefer simplicity over cleverness
2. **Paddle, not Stripe** — Merchant of Record pattern
3. **RTL for Arabic** — every component, logical properties
4. **Legal disclaimer** — every output
5. **EU AI Act is PRIMARY** — other regulations secondary
6. **Deterministic classification** — temperature 0
7. **PDF supports all 7 languages** — including Arabic RTL
8. **Dates: ISO 8601** — display per locale
9. **Read docs/ for details** — this file is overview only, detailed specs in docs/