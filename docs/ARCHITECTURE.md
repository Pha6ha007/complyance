# ARCHITECTURE.md — System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        RAILWAY                               │
│                                                              │
│  ┌──────────────┐  ┌──────────┐  ┌───────┐  ┌───────────┐  │
│  │  Next.js App  │  │  Worker   │  │ Redis │  │ PostgreSQL│  │
│  │  (web)        │  │  (BullMQ) │  │       │  │           │  │
│  │               │  │           │  │       │  │           │  │
│  │ • App Router  │  │ • PDF Gen │  │ Queue │  │ Prisma    │  │
│  │ • tRPC API    │  │ • LLM     │  │ Cache │  │ ORM       │  │
│  │ • Webhooks    │──│ • Email   │──│       │──│           │  │
│  │ • Public API  │  │ • Cron    │  │       │  │           │  │
│  │ • SSR/SSG     │  │           │  │       │  │           │  │
│  └──────┬───────┘  └─────┬─────┘  └───────┘  └───────────┘  │
│         │                │                                    │
└─────────┼────────────────┼────────────────────────────────────┘
          │                │
          ▼                ▼
┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐
│  External APIs   │  │  Storage (S3/R2) │  │  Paddle      │
│                  │  │                  │  │              │
│ • Anthropic API  │  │ • Generated PDFs │  │ • Payments   │
│ • Resend (email) │  │ • Evidence files │  │ • Webhooks   │
│ • Sentry         │  │ • Badges         │  │ • Subscriptions│
│ • PostHog        │  │                  │  │              │
└──────────────────┘  └──────────────────┘  └──────────────┘
```

## Request Flow

### Authenticated Request (Dashboard)
```
Browser → Next.js App Router → Middleware (auth + locale) →
Server Component → tRPC Router → Service Layer → Prisma → PostgreSQL
```

### Classification Request (Async)
```
User submits wizard → tRPC → Save to DB (status: PENDING) →
Enqueue BullMQ job → Return job ID to user →
Worker picks up job → Rule engine → Claude API → Validation →
Save results to DB → Send notification (email + websocket)
```

### Public API Request (CI/CD)
```
External system → /api/public/v1/classify →
API key validation → Rate limiting (Redis) →
Classification engine → Return JSON result
```

### Webhook (Paddle)
```
Paddle → /api/webhooks/paddle → Verify signature →
Process event (subscription created/updated/cancelled) →
Update organization plan in DB
```

## Data Flow: Classification Engine

```
┌──────────────┐
│ User Input   │ (wizard form data)
└──────┬───────┘
       ▼
┌──────────────┐
│ Pre-Filter   │ Hard rules:
│ (rule-based) │ • profilesUsers → HIGH
│              │ • no EU market → skip EU classification
│              │ • no decisions + no personal data → MINIMAL
└──────┬───────┘
       ▼
┌──────────────┐
│ LLM Engine   │ Claude Sonnet, temp=0
│ (Anthropic)  │ System prompt: full Annex III + Article 6
│              │ Output: structured JSON
└──────┬───────┘
       ▼
┌──────────────┐
│ Validator    │ Post-LLM checks:
│ (rule-based) │ • Valid Annex III category?
│              │ • Reasoning references articles?
│              │ • Override if contradicts hard rules
└──────┬───────┘
       ▼
┌──────────────┐
│ Multi-Reg    │ Apply same system to additional regulations:
│ Mapper       │ • Colorado AI Act
│              │ • NYC LL144
│              │ • NIST RMF mapping
│              │ • UAE requirements
└──────┬───────┘
       ▼
┌──────────────┐
│ Gap Analysis │ Based on risk level, generate:
│ Generator    │ • Required articles checklist
│              │ • Priority scoring
│              │ • Compliance score calculation
└──────────────┘
```

## Scaling Considerations

### Phase 1 (0-1000 users)
- Single Railway instance, 1 worker
- Railway managed Postgres (basic plan)
- S3 for file storage
- No caching needed

### Phase 2 (1000-10,000 users)
- Horizontal scaling: 2+ web instances behind Railway load balancer
- 2+ workers for parallel job processing
- Redis caching for classification results
- CDN for static assets (Cloudflare)
- Database read replicas if needed

### Phase 3 (10,000+ users)
- Dedicated database (Railway pro or external)
- Separate Redis for cache vs queue
- API rate limiting per tier
- Consider moving heavy PDF generation to dedicated service

## Security Architecture

> Full audit: [SECURITY_AUDIT.md](./SECURITY_AUDIT.md)

### Authentication & Authorization
- **NextAuth.js v5** with JWT strategy + httpOnly cookies
- **bcrypt** password hashing (cost factor 12)
- **3-tier tRPC procedures:** `publicProcedure` → `protectedProcedure` → `adminProcedure`
- **Data isolation:** every query scoped by `ctx.organization.id` — no cross-tenant access

### Rate Limiting (`src/lib/rate-limit.ts`)
- Login: 5 attempts / 15 min per email
- Registration: 3 / hour per IP
- Password reset: 3 / 15 min per IP
- Contact/partner forms: 5 / hour per IP
- Public API (classify, deep-scan): 10 / hour per IP
- Public API (middleware): 100 / min per IP

### HTTP Security Headers (via `next.config.mjs`)
- HSTS with preload, X-Frame-Options: DENY, CSP strict whitelist
- Permissions-Policy: camera/mic/geolocation disabled
- `X-Robots-Tag: noindex` on protected routes

### Input Handling
- **Zod validation** on all API endpoints
- **HTML escaping** (`src/lib/sanitize.ts`) in email templates — prevents XSS
- **Prisma ORM only** — no raw SQL, SQL injection not possible

### Webhook & API Security
- Paddle: HMAC-SHA256 + `crypto.timingSafeEqual`
- Cron endpoints: `CRON_SECRET` verification
- SDK events: Bearer API key authentication
- CORS: restricted to app domain (badge API allows `*` for embeds)

### CI/CD Security (`.github/`)
- **CodeQL** (SAST) — static analysis on every PR and weekly
- **npm audit** — dependency CVE scanning on every PR
- **Dependency review** — blocks new deps with high/critical CVEs or copyleft licenses
- **Dependabot** — automatic PRs for vulnerable dependency updates

### Infrastructure
- Data encrypted at rest (Railway Postgres) and in transit (TLS)
- Secrets in Railway environment variables (not in code)
- Standalone Docker output with minimal image surface

