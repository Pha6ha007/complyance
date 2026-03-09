# Security & Deploy Reference

## Security headers (next.config): CSP, HSTS, X-Frame-Options SAMEORIGIN, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy
## CORS: badge API allows all origins, everything else same-origin
## Rate limiting: /api/public/* — 100 req/min per IP
## Env vars required: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, ANTHROPIC_API_KEY, PADDLE_API_KEY, PADDLE_WEBHOOK_SECRET, RESEND_API_KEY, ADMIN_EMAIL, CRON_SECRET
## Optional: SENTRY_DSN, NEXT_PUBLIC_POSTHOG_KEY

## Dockerfile: multi-stage, node:20-alpine, non-root user, prisma migrate deploy before server.js, EXPOSE 3000
## railway.toml: healthcheckPath=/api/health, healthcheckTimeout=300, restartPolicyType=on_failure, maxRetries=3

## Pre-deploy: rm -rf .next node_modules → pnpm install → pnpm tsc --noEmit → pnpm lint → pnpm build → npx prisma validate
