# Security Audit — Complyance

**Date:** March 27, 2026  
**Scope:** Full application security review (auth, API, data access, headers, input handling)

---

## Architecture Security Summary

| Layer | Mechanism | Status |
|-------|-----------|--------|
| Authentication | NextAuth v5, JWT strategy, bcrypt (12 rounds) | ✅ Solid |
| Authorization | 3-tier tRPC procedures (public / protected / admin) | ✅ Solid |
| Data Isolation | All queries scoped by `organizationId` from session | ✅ Solid |
| HTTP Headers | HSTS, CSP, X-Frame-Options, Permissions-Policy | ✅ Solid |
| Input Validation | Zod schemas on all endpoints | ✅ Solid |
| SQL Injection | Prisma ORM only, no raw queries | ✅ N/A (not vulnerable) |
| Rate Limiting | Centralized `src/lib/rate-limit.ts` on all public endpoints | ✅ Fixed |
| XSS (Email) | HTML escaping via `src/lib/sanitize.ts` | ✅ Fixed |
| Webhook Security | Paddle HMAC-SHA256 with `timingSafeEqual` | ✅ Solid |
| CSRF | NextAuth built-in + SameSite cookies for tRPC | ✅ Solid |

---

## Authentication & Authorization

### NextAuth v5 Configuration
- **Strategy:** JWT (stateless, no server-side session store needed)
- **Providers:** Google OAuth + Credentials (email/password)
- **Password hashing:** bcrypt with cost factor 12
- **Session data:** user ID, organizationId, role embedded in JWT token

### tRPC Procedure Levels
```
publicProcedure    → No auth required (free classifier, badge verification)
protectedProcedure → Valid session + user + organization loaded from DB
adminProcedure     → protectedProcedure + role === 'ADMIN'
```

### Data Isolation
Every protected query filters by `ctx.organization.id`:
- `system.getById` → `WHERE id = ? AND organizationId = ?`
- `system.update` → ownership check via `findFirst` before `update`
- `system.delete` → ownership check via `findFirst` before `delete`
- Same pattern across: vendors, documents, evidence, classification, incidents

**No cross-tenant data access is possible through tRPC endpoints.**

---

## Middleware (`src/middleware.ts`)

### Route Protection
Protected path segments:
```
/dashboard, /admin, /settings, /systems, /vendors,
/evidence, /incidents, /intelligence, /referrals, /reports, /team
```

Unauthenticated requests → redirect to `/{locale}/login?callbackUrl=...`

### Rate Limiting (Middleware Level)
- Public API routes (`/api/public/*`) → 100 req/min per IP (in-memory)
- Cleanup on overflow (>10,000 stored IPs)

### SEO Protection
- Protected routes return `X-Robots-Tag: noindex, nofollow`

---

## HTTP Security Headers

Applied to all routes via `next.config.mjs`:

| Header | Value | Purpose |
|--------|-------|---------|
| Strict-Transport-Security | max-age=63072000; includeSubDomains; preload | Force HTTPS |
| X-Frame-Options | DENY | Prevent clickjacking |
| X-Content-Type-Options | nosniff | Prevent MIME sniffing |
| X-XSS-Protection | 1; mode=block | Legacy XSS filter |
| Referrer-Policy | origin-when-cross-origin | Limit referrer leakage |
| Permissions-Policy | camera=(), microphone=(), geolocation=(), interest-cohort=() | Disable sensitive APIs |
| Content-Security-Policy | Strict whitelist (see below) | Prevent XSS/injection |

### CSP Whitelist
- **Scripts:** self, Paddle CDN, PostHog, Sentry
- **Connect:** self, Anthropic API, Paddle API, PostHog, Sentry, AWS S3, R2
- **Frames:** self, Paddle CDN
- **Objects:** none
- **Base-URI:** self
- **Form-action:** self
- **Frame-ancestors:** self (no embedding)

---

## Rate Limiting

### Centralized Limiter (`src/lib/rate-limit.ts`)

All rate limiters use a shared `createRateLimiter()` factory that provides:
- Configurable max requests and window duration
- Automatic cleanup of expired entries
- Standard `X-RateLimit-*` and `Retry-After` response headers
- IP extraction via `x-forwarded-for` / `x-real-ip`

### Per-Endpoint Limits

| Endpoint | Limit | Window | Key |
|----------|-------|--------|-----|
| `POST /api/auth/register` | 3 requests | 1 hour | IP |
| NextAuth credentials login | 5 attempts | 15 minutes | email |
| `POST /api/auth/forgot-password` | 3 requests | 15 minutes | IP |
| `POST /api/auth/reset-password` | 3 requests | 15 minutes | IP |
| `POST /api/contact` | 5 submissions | 1 hour | IP |
| `POST /api/partners` | 5 submissions | 1 hour | IP |
| `POST /api/referral/apply` | 5 attempts | 1 hour | IP |
| `POST /api/public/v1/classify` | 10 requests | 1 hour | IP |
| `POST /api/public/v1/deep-scan` | 10 requests | 1 hour | IP |
| `GET /api/public/*` (middleware) | 100 requests | 1 minute | IP |

### Scaling Note
Current rate limiters use in-memory stores. For single Railway instance this is adequate. If scaling horizontally, migrate to Redis-backed limiter (Redis already in stack for BullMQ).

---

## Input Validation & Sanitization

### Zod Validation
Every API endpoint validates input with Zod schemas before processing:
- Registration: name (1-200), email, password (min 8 chars)
- Contact form: name (1-200), email, subject (enum), message (10-5000)
- Partnership form: company (1-200), URL, contact (1-200), email, type (enum), message (10-5000)
- Classification: description (10-5000), aiType (enum), domain (1-100), booleans, arrays
- Password reset: email, token (min 1), password (min 8)

### HTML Sanitization (`src/lib/sanitize.ts`)
All user-supplied text is escaped before embedding in HTML email templates:
- `escapeHtml()` → converts `& < > " '` to HTML entities
- `escapeHtmlWithBreaks()` → escape + newline-to-`<br>` conversion

Applied in: contact form emails, partnership application emails.

### No Raw SQL
All database operations use Prisma ORM. No `$queryRaw` or `$executeRaw` calls exist in the codebase. SQL injection is not possible.

### No Unsafe HTML Rendering
`dangerouslySetInnerHTML` is used only for JSON-LD structured data (controlled content, no user input).

---

## Webhook Security

### Paddle Webhooks (`/api/webhooks/paddle`)
- HMAC-SHA256 signature verification using `PADDLE_WEBHOOK_SECRET`
- Timing-safe comparison via `crypto.timingSafeEqual`
- Timestamp + hash extraction from `paddle-signature` header
- Returns 401 on missing/invalid signature

### Cron Endpoints (`/api/cron/legislation-sync`)
- Protected by `CRON_SECRET` query parameter
- Returns 401 if secret doesn't match

### SDK Events (`/api/sdk/events`)
- Bearer token authentication via `Organization.apiKey`
- Verified against database before processing

---

## Referral System Security

### Anti-Fraud Measures
- Cannot refer yourself (userId check)
- One referral code per user (unique constraint)
- Max uses limit per code
- User can only use one referral code (existing reward check)
- **Time-bound application:** referral can only be applied to accounts created within the last 5 minutes (prevents arbitrary userId abuse)
- Rate limited: 5 attempts per hour per IP

---

## Password Policy

| Rule | Value |
|------|-------|
| Minimum length | 8 characters |
| Hashing | bcrypt, cost factor 12 |
| Reset token | 32 random bytes (hex), 1-hour expiry |
| Reset token cleanup | Deleted after use, old tokens cleared on new request |
| Email enumeration | Prevented (always returns success on forgot-password) |

---

## Identified Risks & Mitigations

### Low Risk
| Risk | Status | Notes |
|------|--------|-------|
| In-memory rate limiting resets on deploy | Accepted | Single instance on Railway. Short windows (15 min - 1 hour) limit exposure. Migrate to Redis for horizontal scaling. |
| `console.error` in API routes | Accepted | Logged server-side only. No sensitive data in error messages returned to clients. Sentry captures server errors. |

### Previously Fixed (This Audit)
| Risk | Fix |
|------|-----|
| No rate limit on registration | Added: 3/hour per IP |
| No rate limit on login | Added: 5/15min per email |
| No rate limit on forgot-password | Added: 3/15min per IP |
| No rate limit on reset-password | Added: 3/15min per IP |
| No rate limit on contact/partner forms | Added: 5/hour per IP |
| No rate limit on referral apply | Added: 5/hour per IP |
| XSS in email templates (contact, partners) | Fixed: HTML escaping via `escapeHtml()` |
| Referral apply accepts arbitrary userId | Fixed: Time-bound check (5 min after account creation) |
| Inconsistent password minimum (6 vs 8) | Fixed: Standardized to 8 characters |
| Duplicated rate limit code across 3 files | Fixed: Centralized to `src/lib/rate-limit.ts` |

---

## File Reference

| File | Purpose |
|------|---------|
| `src/lib/rate-limit.ts` | Centralized rate limiter factory + pre-configured limiters |
| `src/lib/sanitize.ts` | HTML escaping utilities for email templates |
| `src/server/trpc.ts` | tRPC context, auth middleware, procedure definitions |
| `src/middleware.ts` | Route protection, i18n, public API rate limiting |
| `auth.ts` | NextAuth configuration (JWT, callbacks) |
| `auth.config.ts` | Auth providers (Google, Credentials with rate limiting) |
| `next.config.mjs` | Security headers, CSP |

---

## Automated Security Tooling (CI/CD)

### GitHub Actions — `.github/workflows/security.yml`

Runs on every push to `main`, every PR, and weekly (Monday 08:00 UTC):

| Job | Tool | What It Does |
|-----|------|-------------|
| **Dependency Audit** | `npm audit` | Checks all dependencies for known CVEs. Fails on high/critical. Summary table in PR. |
| **CodeQL Analysis** | GitHub CodeQL | Static analysis (SAST) — finds XSS, SQL injection, path traversal, insecure crypto, prototype pollution, etc. Results appear in GitHub Security tab. |
| **Dependency Review** | `actions/dependency-review-action` | On PRs only — blocks new dependencies with high/critical vulnerabilities or copyleft licenses (GPL, AGPL). |

### Dependabot — `.github/dependabot.yml`

Automatically creates PRs when vulnerable dependencies are found:
- **npm packages**: weekly scan, security updates only, grouped minor/patch PRs
- **GitHub Actions**: weekly version bumps for CI actions
- Labels: `dependencies`, `security`
- Max 10 open PRs at a time

### Local Security Check

```bash
pnpm security:audit    # npm audit --audit-level=high
```

### Current Dependency Vulnerabilities (as of March 2026)

| Severity | Count | Notes |
|----------|-------|-------|
| High | 10 | Mostly transitive (rollup, picomatch) — no direct exploit path |
| Moderate | 18 | brace-expansion, yaml — dev/build dependencies |
| Low | 1 | aws-sdk v2 region validation |
| **Total** | **29** | All in transitive dependencies, not directly exploitable |

---

## Recommendations for Post-Launch

1. **Redis rate limiting** — when scaling beyond 1 instance, swap in-memory stores for Redis (already available via BullMQ stack)
2. **Account lockout notification** — email user when login rate limit is hit (may indicate attack)
3. **Audit log** — log security-relevant events (login, password change, API key generation) to a dedicated table
4. **CAPTCHA** — consider adding Turnstile/hCaptcha to registration and contact forms as secondary defense
5. **CSP reporting** — add `report-uri` or `report-to` directive to capture CSP violations
