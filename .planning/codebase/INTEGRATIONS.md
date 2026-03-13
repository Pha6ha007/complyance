# External Integrations

**Analysis Date:** 2026-03-13

## APIs & External Services

**AI Classification:**
- Anthropic Claude API (Claude Sonnet model with temperature=0)
  - SDK: `@anthropic-ai/sdk` v0.27.0
  - Client: `src/server/ai/client.ts` (singleton instance)
  - Auth: `ANTHROPIC_API_KEY` env var
  - Usage: Deterministic classification, document analysis, structured JSON responses

**Free Classifier Public Tool:**
- Endpoint: `/api/public/v1/classify` (Route Handler)
- Public, unauthenticated access
- Uses same Claude classification engine as authenticated users

## Data Storage

**Databases:**
- PostgreSQL 14+
  - Provider: Railway managed database
  - Connection: `DATABASE_URL` env var
  - ORM: Prisma v5.18.0
  - Client: `@prisma/client`
  - Models: Organization, User, Account, Session, AISystem, Vendor, Evidence, Document, etc.

**File Storage:**
- AWS S3 (primary) or Cloudflare R2 (compatible)
  - SDK: `@aws-sdk/client-s3` v3.616.0
  - Credentials: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
  - Region: `AWS_REGION` (e.g., eu-central-1)
  - Bucket: `AWS_S3_BUCKET` (e.g., complyance-docs)
  - Presigner: `@aws-sdk/s3-request-presigner` for signed URLs
  - Service: `src/server/services/documents/storage.ts`
  - Features:
    - Presigned upload URLs (15-minute expiry)
    - Presigned download URLs (1-hour expiry)
    - Server-side AES-256 encryption at rest
    - Document organization: `documents/{orgId}/{systemId}/{timestamp}-{filename}`
    - Generated PDFs: `generated/{orgId}/{filename}`

**Caching:**
- Redis 6+ for BullMQ job queue
  - Connection: `REDIS_URL` env var
  - Client: `ioredis` v5.4.1
  - Platform: Railway managed Redis
  - Usage: Async job processing via BullMQ

## Authentication & Identity

**Auth Provider:**
- NextAuth.js v5.0.0-beta.19 (custom implementation)
  - Config: `auth.config.ts` and `src/app/api/auth/[...nextauth]/route.ts`

**Providers:**
1. **Google OAuth 2.0**
   - Client ID: `GOOGLE_CLIENT_ID` env var
   - Client Secret: `GOOGLE_CLIENT_SECRET` env var
   - Profile images from `lh3.googleusercontent.com` (allowed in CSP)
   - Adapter: @auth/prisma-adapter

2. **Email/Password (Credentials)**
   - Password hashing: bcryptjs v2.4.3
   - Validation: Zod schema in `auth.config.ts`
   - Storage: `User.passwordHash` in Prisma

**Session Management:**
- JWT-based sessions
- Database adapter: @auth/prisma-adapter
- Models: `Account`, `Session` (NextAuth required)
- Secret: `NEXTAUTH_SECRET` (generate: `openssl rand -base64 32`)
- URL: `NEXTAUTH_URL` (dev: http://localhost:3000, prod: https://app.complyance.io)

**Registration:**
- Route: `/api/auth/register` (POST endpoint)
- Input validation with Zod
- Creates Organization and User records

## Monitoring & Observability

**Error Tracking:**
- Sentry
  - SDK: `@sentry/nextjs` v8.26.0 (optional - gracefully disabled if not installed)
  - Initialization: `src/instrumentation.ts` (Node.js and Edge runtime)
  - DSN: `SENTRY_DSN` env var
  - Configuration:
    - Traces sample rate: 10% (performance monitoring)
    - Release tracking via `VERCEL_GIT_COMMIT_SHA`
    - Environment: NODE_ENV
    - Sensitive data filtering (removes authorization headers, cookies)
    - Ignored errors: ResizeObserver loop limit, promise rejections
  - Build-time config: `SENTRY_ORG`, `SENTRY_PROJECT` env vars
  - Features:
    - Source map upload and hiding
    - Session replay support (disabled by default)
    - CSP tunnel route: `/monitoring`

**Product Analytics:**
- PostHog
  - SDK: `posthog-js` v1.157.2
  - Provider: `src/components/shared/posthog-provider.tsx`
  - Key: `NEXT_PUBLIC_POSTHOG_KEY` env var
  - Host: `NEXT_PUBLIC_POSTHOG_HOST` (default: https://app.posthog.com)
  - Tracking: `src/lib/analytics.ts` with predefined events
  - Events tracked:
    - User auth: signup, login, logout
    - Systems: created, classified, deleted
    - Documents: generated, downloaded
    - Vendors: added, assessed
    - Evidence: uploaded
    - Billing: plan upgrades, downgrades, cancellations
    - Free classifier: usage tracking
    - Regulatory intelligence: viewed
    - Referrals: link copied, code used

**Logs:**
- Console logging in server-side code
- Structured logging via Sentry for errors
- PostHog for event tracking
- No centralized log aggregation (local environment variables track via console)

## CI/CD & Deployment

**Hosting:**
- Railway.app platform
  - Services: web (Next.js), postgres, redis, worker (BullMQ)
  - Config: `railway.toml`
  - Builder: Dockerfile-based (Node.js 20-Alpine)
  - Health check: `/api/health` with 300s timeout

**Build Process:**
- Dockerfile (multi-stage)
  - Base: `node:20-alpine`
  - Dependencies: `npm ci` from package-lock.json
  - Build: `npm run build` (compiles Next.js, generates Prisma)
  - Runtime: Alpine with nodejs user (UID 1001)
  - Binary targets: native + linux-musl-openssl-3.0.x (Alpine compatibility)
  - Migrations: auto-run on deploy with `prisma db push --accept-data-loss`

**CI Pipeline:**
- Git-based (push to main → Railway auto-builds)
- No separate CI service configured

## Environment Configuration

**Required env vars (Critical):**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - JWT signing secret (generate with openssl)
- `NEXTAUTH_URL` - Auth callback URL
- `ANTHROPIC_API_KEY` - Claude API key
- `PADDLE_API_KEY` - Paddle payments API key
- `PADDLE_WEBHOOK_SECRET` - Paddle webhook signature verification
- `AWS_ACCESS_KEY_ID` - S3/R2 access key
- `AWS_SECRET_ACCESS_KEY` - S3/R2 secret key
- `REDIS_URL` - Redis connection for BullMQ

**Optional env vars:**
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `SENTRY_DSN` - Sentry error tracking DSN
- `SENTRY_ORG` - Sentry organization (build-time)
- `SENTRY_PROJECT` - Sentry project (build-time)
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog API key
- `RESEND_API_KEY` - Resend email service key
- `ADMIN_EMAIL` - Admin panel access email
- `CRON_SECRET` - Scheduled tasks authentication
- `RATE_LIMIT_MAX` - Rate limiting requests (default: 100)
- `RATE_LIMIT_WINDOW` - Rate limiting window ms (default: 60000)

**Secrets location:**
- `.env.local` (development, not committed)
- `.env.example` (template for variables)
- Railway environment variables dashboard (production)

## Webhooks & Callbacks

**Incoming Webhooks:**
- Paddle Payments Webhook: `/api/webhooks/paddle` (POST)
  - Signature verification: HMAC-SHA256 with `PADDLE_WEBHOOK_SECRET`
  - Events handled:
    - `subscription.created` - New subscription, update plan
    - `subscription.updated` - Subscription change, update plan
    - `subscription.canceled` - Downgrade to FREE plan
    - `subscription.payment_succeeded` - Log payment
    - `subscription.payment_failed` - Log payment failure
  - Referral processing: grants/revokes referrer rewards on subscription changes

**Outgoing Webhooks:**
- None detected (no outbound webhooks configured)

## Payment Processing

**Provider:**
- Paddle (Merchant of Record pattern)
  - SDK: `@paddle/paddle-node-sdk` v1.5.0
  - API Key: `PADDLE_API_KEY`
  - Webhook Secret: `PADDLE_WEBHOOK_SECRET`
  - Public Token: `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`
  - Environment: `NEXT_PUBLIC_PADDLE_ENV` (sandbox/production)

**Integration Points:**
- Service: `src/server/services/billing/paddle.ts`
  - Plan mapping: Price IDs to Plan enums (STARTER, PROFESSIONAL, SCALE, ENTERPRISE)
  - Plan limits: Systems, vendors, documents, evidence vault, team members, regulatory alerts
  - Webhook handling: subscription lifecycle events
  - Referral rewards: automatic grant on first subscription, revoke on cancellation within 7 days

## Email Service

**Provider:**
- Resend
  - SDK: `resend` v3.5.0
  - API Key: `RESEND_API_KEY`
  - Service: `src/server/services/email.ts`
  - Graceful fallback: logs warning if RESEND_API_KEY not configured

**Usage:**
- Transactional emails (notifications, verification)
- From address: Configurable via `from` parameter (default: "Complyance <notifications@complyance.io>")

## Document Processing

**Text Extraction:**
- Service: `src/server/services/documents/text-extractor.ts`
- Supported formats:
  - PDF: `pdf-parse` v2.4.5
  - DOCX: `mammoth` v1.11.1
  - Plain text / Markdown: Native buffer parsing
- Input: Files from S3/R2 storage via `getFileFromStorage()`
- Output: Extracted text for Claude analysis

**PDF Generation:**
- Library: `@react-pdf/renderer` v3.4.4
- Service: `src/server/services/documents/pdf.tsx`
- Templates:
  - Classification Report (`src/server/services/documents/templates/classification-report.tsx`)
  - Annex IV Gap Analysis (`src/server/services/documents/templates/annex-iv.tsx`)
  - Roadmap (`src/server/services/documents/templates/roadmap.tsx`)
- Localization: All 7 languages supported (en, fr, de, pt, ar, pl, it)
- RTL Support: Arabic layout via CSS logical properties
- Server-side generation: PDFs generated on server, uploaded to S3/R2

## Security Headers & CSP

**Content Security Policy (CSP):**
- Frame: `https://cdn.paddle.com` (Paddle checkout)
- Scripts:
  - `https://cdn.paddle.com` (Paddle)
  - `https://app.posthog.com` (PostHog analytics)
  - `https://browser.sentry-cdn.com` (Sentry)
- Connects:
  - `https://api.anthropic.com` (Claude API)
  - `https://cdn.paddle.com`, `https://api.paddle.com` (Paddle)
  - `https://app.posthog.com` (PostHog)
  - `https://*.sentry.io` (Sentry)
  - `https://*.amazonaws.com`, `https://*.r2.dev` (S3/R2)

**Other Headers:**
- HSTS: max-age=63072000 (2 years), preload enabled
- X-Frame-Options: DENY (no framing)
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: origin-when-cross-origin

**Public Badge API (Permissive CORS):**
- Route: `/api/public/v1/badge/:path*`
- CORS: `Access-Control-Allow-Origin: *`
- Methods: GET, OPTIONS

---

*Integration audit: 2026-03-13*
