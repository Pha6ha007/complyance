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

- Auth: NextAuth.js with JWT + httpOnly cookies
- API: tRPC procedures with auth middleware
- Public API: API key in header, rate limited per key
- Webhooks: signature verification (Paddle HMAC)
- File uploads: presigned S3 URLs, virus scanning
- Data: encrypted at rest (Railway Postgres), in transit (TLS)
- Secrets: Railway environment variables (not in code)
- CORS: restricted to app domain
- CSP: strict Content Security Policy headers
