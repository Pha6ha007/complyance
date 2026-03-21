# Product Status — Complyance

> Last updated: March 21, 2026  
> Stage: **Pre-launch (closed beta ready)**  
> EU AI Act high-risk deadline: **August 2, 2026** (134 days)

---

## Executive Summary

Complyance is a self-serve SaaS platform for EU AI Act compliance management, targeting SMB/SaaS companies. The product is feature-complete for closed beta: users can register, classify AI systems, get gap analysis, generate PDF reports, assess vendors, store evidence, and monitor regulatory changes — all in 7 languages.

**Readiness: 8/10** — core flows work end-to-end. Paid plan activation blocked on Paddle verification only.

---

## What's Built & Working

### Core Product (✅ Production-ready)

| Feature | Status | Details |
|---------|--------|---------|
| **AI Risk Classification** | ✅ Working | Rule-based pre-filter + Claude Sonnet (temp=0), Annex III categories, structured JSON validation |
| **Gap Analysis** | ✅ Working | Articles 9–15 obligations, prioritized action plan, compliance scoring |
| **Document Generation** | ✅ Working | 3 PDF templates (Classification Report, Compliance Roadmap, Annex IV), all 7 languages including Arabic RTL |
| **Vendor Risk Assessment** | ✅ Working | Questionnaire + LLM analysis, risk scoring, linked to AI systems |
| **Evidence Vault** | ✅ Working | S3/R2 file storage, integrity verification (SHA-256), article tagging |
| **Regulatory Intelligence** | ✅ Working | Update feed, read/unread tracking, severity filtering |
| **Compliance Badge** | ✅ Working | SVG badge generation, public verification page `/verify/[orgId]`, embeddable HTML/Markdown |
| **Bias Testing** | ✅ Working | AI-powered fairness analysis for classified systems |
| **Free Classifier** | ✅ Working | Public tool at `/free-classifier`, no registration required |
| **Blog** | ✅ Working | 5 MDX articles, localized, SEO metadata |

### Authentication & User Management (✅ Production-ready)

| Feature | Status | Details |
|---------|--------|---------|
| Email + password registration | ✅ | bcryptjs hashing, Zod validation |
| Google OAuth | ✅ | NextAuth.js v5 provider |
| Forgot password | ✅ | Token-based (256-bit, 1hr expiry), branded HTML email via Resend |
| Reset password | ✅ | Token validation, one-time use, email enumeration protection |
| Session management | ✅ | JWT, protected route middleware |
| `/register` redirect | ✅ | `/register` → `/login?mode=register` |

### Internationalization (✅ Production-ready)

| Locale | Language | Direction | Keys | Status |
|--------|----------|-----------|------|--------|
| en | English | LTR | 1,583 | ✅ Source |
| fr | French | LTR | 1,583 | ✅ Synced |
| de | German | LTR | 1,583 | ✅ Synced |
| pt | Portuguese | LTR | 1,583 | ✅ Synced |
| ar | Arabic | **RTL** | 1,583 | ✅ Synced |
| pl | Polish | LTR | 1,583 | ✅ Synced |
| it | Italian | LTR | 1,583 | ✅ Synced |

- All pages use `useTranslations()` / `getTranslations()` — zero hardcoded English
- RTL layout via Tailwind logical properties (`ms-`/`me-`/`ps-`/`pe-`)
- Locale sync tool: `pnpm i18n:sync` (check) / `pnpm i18n:sync:fix` (auto-clean)

### SEO & Marketing (✅ Production-ready)

| Feature | Status |
|---------|--------|
| OpenGraph meta (og:title, og:description, og:image) | ✅ All pages |
| Twitter Card meta (summary_large_image) | ✅ |
| Dynamic OG image (`/api/og`) | ✅ 1200×630 branded PNG |
| Per-page `generateMetadata` with localized titles | ✅ 19 pages |
| `robots.txt` (blocks dashboard, allows marketing) | ✅ |
| `sitemap.xml` (all locales, hreflang) | ✅ |
| Structured data (JSON-LD on pricing) | ✅ |
| 5 SEO blog articles (MDX) | ✅ |
| Security headers (CSP, HSTS, X-Frame, X-XSS) | ✅ |

### Infrastructure (✅ Production-ready)

| Component | Technology | Status |
|-----------|-----------|--------|
| Database | PostgreSQL (18 models, Railway) | ✅ |
| Cache/Queue | Redis (Railway) | ✅ |
| File storage | AWS S3 / Cloudflare R2 | ✅ |
| Email | Resend (transactional) | ✅ |
| Error monitoring | Sentry (server + client) | ✅ |
| Analytics | PostHog (4 integration points) | ✅ |
| Rate limiting | Middleware (100 req/min) | ✅ |
| Dockerfile | Standalone build | ✅ |
| `.env.example` | 54 variables documented | ✅ |

### Testing (✅ Ready)

| Type | Count | Coverage |
|------|-------|----------|
| E2E smoke tests (Playwright) | 40 tests | All marketing pages, auth redirects, login flow, i18n, API endpoints, critical path, content, 404 |
| TypeScript strict mode | 0 errors | Full codebase |

---

## What's NOT Built Yet

### 🔴 Blocked on External

| Feature | Blocker | Impact |
|---------|---------|--------|
| **Paid plan checkout** | Paddle verification pending | Users can't upgrade from FREE. All other billing infra works (webhooks, plan display, usage tracking) |

### 🟡 Post-Launch Features (planned)

| Feature | Priority | Effort | Notes |
|---------|----------|--------|-------|
| **Incident Register** | High | 2-3 days | EU AI Act requires for high-risk systems. Prisma `Incident` model exists. Router not implemented. |
| **Team Management** | High | 3-4 days | Professional plan promises 3 seats, Scale 10. No invite/role UI yet. |
| **Referral System UI** | Medium | 1-2 days | Backend implemented (referral codes, rewards). Dashboard page exists. Email notifications work. Needs testing. |
| **BullMQ Classification Queue** | Medium | 1 day | Classification runs inline. For scale, should use Redis queue. Worker service configured in Railway. |
| **Additional PDF Templates** | Medium | 2-3 days | Vendor Assessment, Model Card, Bias Report. Framework exists. |
| **Regulation DB** | Low | 3-5 days | Models spec'd (Regulation, RiskCategory, RiskException, Obligation). Not yet in schema. |
| **CI/CD API** | Low | 2 days | SDK page exists with docs. API endpoints not implemented. |
| **DATABASE.md** | Low | 1 hour | Schema documentation. |

---

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────┐
│  Browser (Next.js App Router, 7 locales)            │
│  ├─ Marketing: 15 public pages                      │
│  ├─ Dashboard: 20 authenticated pages               │
│  └─ Components: 33 React components (shadcn/ui)     │
├─────────────────────────────────────────────────────┤
│  API Layer                                           │
│  ├─ tRPC: 9 active routers (3 planned)              │
│  ├─ REST: 19 API routes (auth, webhooks, public)    │
│  └─ Edge: OG image generation                        │
├─────────────────────────────────────────────────────┤
│  Services                                            │
│  ├─ Classification Engine (rules + Claude Sonnet)    │
│  ├─ PDF Generator (@react-pdf/renderer)              │
│  ├─ Vendor AI Assessment (Claude)                    │
│  ├─ Bias Analyzer (Claude)                           │
│  ├─ Badge Generator (SVG)                            │
│  ├─ Evidence Integrity (SHA-256)                     │
│  └─ Email (Resend)                                   │
├─────────────────────────────────────────────────────┤
│  Data                                                │
│  ├─ PostgreSQL: 18 Prisma models                     │
│  ├─ Redis: session cache, future job queue           │
│  └─ S3/R2: evidence files, generated PDFs            │
├─────────────────────────────────────────────────────┤
│  External                                            │
│  ├─ Anthropic Claude API (classification, analysis)  │
│  ├─ Paddle (payments, MoR)                           │
│  ├─ Google OAuth                                     │
│  ├─ Sentry (errors) + PostHog (analytics)            │
│  └─ Resend (email)                                   │
└─────────────────────────────────────────────────────┘
```

---

## Numbers

| Metric | Value |
|--------|-------|
| Total pages | 36 |
| Marketing pages | 15 |
| Dashboard pages | 20 |
| Admin pages | 1 |
| tRPC routers (active) | 9 |
| tRPC routers (planned) | 3 |
| REST API routes | 19 |
| Prisma models | 18 |
| React components | 33 |
| i18n keys (per locale) | 1,583 |
| Locales | 7 |
| PDF templates | 3 |
| Blog articles | 5 |
| E2E tests | 40 |
| TypeScript errors | 0 |
| Env variables | 54 |

---

## Plan Pricing

| | Free | Starter $99/mo | Professional $249/mo | Scale $499/mo |
|---|---|---|---|---|
| AI Systems | 1 | 5 | 20 | 50 |
| Vendors | 0 | 2 | 10 | Unlimited |
| Documents | ✗ | ✓ | ✓ | ✓ |
| Evidence Vault | ✗ | ✗ | ✓ | ✓ |
| Badge | Aware | Ready | Compliant | Compliant |
| Regulatory Alerts | ✗ | Weekly | Real-time | Real-time |
| Bias Testing | ✗ | ✗ | 3/month | Unlimited |
| Team Members | 1 | 1 | 3 ⚠️ | 10 ⚠️ |
| Incident Register | ✗ | ✗ | ✗ | ⚠️ |

⚠️ = Feature advertised in pricing but not yet implemented (team management, incident register)

---

## Pre-Launch Improvements (March 2026)

Full technical details: [docs/PRE_LAUNCH_IMPROVEMENTS.md](./PRE_LAUNCH_IMPROVEMENTS.md)

### Bugs Fixed (10)
1. Missing `/api/referral/apply` endpoint → created REST route
2. `window.location.reload()` in SPA → tRPC query invalidation
3. `/register` → 404 → redirect to `/login?mode=register`
4. No forgot/reset password → full flow with email, tokens, branded HTML
5. Sidebar hardcoded plan → live tRPC data
6. Login form hardcoded English → 22 i18n keys
7. User menu hardcoded strings + dead link → i18n + fix
8. Reports page `window.location.href` → SPA navigation
9. Light-mode colors in dark theme (7 pages) → dark-mode equivalents
10. `console.error` in client components → removed

### i18n Improvements (5)
11. Footer 3 hardcoded strings → translated
12. About page 14 hardcoded strings → translated
13. Pricing Enterprise badge → translated
14. Reset password API error → client-side i18n
15. Locale key drift: **3,711 stale keys removed** across 6 locales

### SEO Improvements (3)
16. OG + Twitter meta tags added to root layout
17. Dynamic OG image endpoint (`/api/og`)
18. Per-page `generateMetadata` for 4 pages (about, partners, forgot-password, reset-password)

### Tooling (2)
19. `scripts/sync-locale-keys.mjs` — automated locale sync
20. `tests/smoke.spec.ts` — 40 E2E tests

---

## Launch Checklist

### Ready now (FREE plan launch)
- [x] Registration + login + password reset
- [x] AI system classification (1 system on free plan)
- [x] Gap analysis + compliance scoring
- [x] Dashboard with onboarding steps
- [x] 7 locales fully translated
- [x] SEO + OG images
- [x] Security headers + rate limiting
- [x] Error monitoring (Sentry) + analytics (PostHog)
- [x] E2E tests passing
- [x] Dockerfile ready for Railway deploy

### Before paid plan launch
- [ ] Paddle account verified
- [ ] Checkout flow tested end-to-end
- [ ] Welcome email on registration
- [ ] Plan change email notifications

### First month post-launch
- [ ] Team management (invite, roles)
- [ ] Incident register
- [ ] BullMQ classification queue
- [ ] Additional PDF templates
- [ ] Referral system testing
