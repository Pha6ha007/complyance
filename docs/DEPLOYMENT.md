# DEPLOYMENT.md — Railway Deployment Guide

## Why Railway (Single Platform)

Railway handles both frontend and backend in one platform:
- Monorepo support — one repo, multiple services
- Managed PostgreSQL and Redis
- Automatic deploys from GitHub
- Environment variable management
- Built-in logging and metrics
- Cron jobs support
- Custom domains with auto-SSL
- ~$20-50/mo for early stage, scales to $200-500/mo at growth

**Decision: NO separate platform for frontend/backend.** Everything on Railway.

## Project Setup on Railway

### 1. Create Railway Project

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init
```

### 2. Services Structure

Create 4 services in Railway dashboard:

| Service | Type | Source | Start Command |
|---------|------|--------|--------------|
| `web` | Docker | `./Dockerfile` | `node server.js` |
| `worker` | Docker | `./Dockerfile.worker` | `node worker.js` |
| `postgres` | Railway Plugin | — | — |
| `redis` | Railway Plugin | — | — |

### 3. Railway Configuration

**railway.toml** (in repo root):
```toml
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile"

[deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 300
numReplicas = 1
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 3
```

### 4. Domains

- Production: `app.complyance.io` → `web` service
- Public API: `api.complyance.io` → `web` service (same, routed via path)
- Badge verification: `badge.complyance.io` → `web` service

### 5. Environment Variables

Set via Railway dashboard (not in code):

```
# Shared (all services)
DATABASE_URL=              # Auto-populated by Railway Postgres plugin
REDIS_URL=                 # Auto-populated by Railway Redis plugin
NODE_ENV=production

# Web service
NEXTAUTH_SECRET=           # openssl rand -base64 32
NEXTAUTH_URL=https://app.complyance.io
ANTHROPIC_API_KEY=
PADDLE_API_KEY=
PADDLE_WEBHOOK_SECRET=
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=
NEXT_PUBLIC_PADDLE_ENV=production
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=complyance-docs
AWS_REGION=eu-central-1
RESEND_API_KEY=
SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_APP_URL=https://app.complyance.io

# Worker service (same DB + Redis + API keys)
DATABASE_URL=
REDIS_URL=
ANTHROPIC_API_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
RESEND_API_KEY=
```

## Deployment Workflow

### Automatic Deploys (Production)

```
git push origin main → Railway detects push →
Builds Docker image → Runs prisma migrate deploy →
Health check passes → Zero-downtime swap → Live
```

### Manual Deploy

```bash
railway up
```

### Database Migrations

Migrations run automatically on deploy via Dockerfile CMD:
```dockerfile
CMD npx prisma migrate deploy && node server.js
```

For the worker:
```dockerfile
# Dockerfile.worker
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
RUN npx prisma generate
CMD ["node", "dist/worker.js"]
```

## Cron Jobs

Railway supports cron via separate services or cron triggers:

| Job | Schedule | Purpose |
|-----|----------|---------|
| `regulatory-scan` | Daily 06:00 UTC | Scan for new regulatory updates |
| `compliance-recheck` | Weekly Monday 00:00 | Recalculate compliance scores |
| `digest-email` | Weekly Friday 09:00 | Send weekly regulatory digest |
| `badge-refresh` | Daily 00:00 | Refresh badge verification data |

Configure in Railway dashboard under Cron tab, pointing to API endpoints:
- `GET /api/cron/regulatory-scan?key=CRON_SECRET`
- `GET /api/cron/compliance-recheck?key=CRON_SECRET`

## Monitoring

### Health Check Endpoint

```ts
// src/app/api/health/route.ts
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch {
    return Response.json({ status: 'error' }, { status: 500 });
  }
}
```

### Logging

Railway captures stdout/stderr automatically. Use structured logging:
```ts
console.log(JSON.stringify({
  level: 'info',
  service: 'classification',
  systemId: '...',
  duration: 1234,
  result: 'HIGH'
}));
```

### Error Tracking

Sentry initialized in `instrumentation.ts`:
```ts
import * as Sentry from '@sentry/nextjs';
Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 });
```

## Cost Estimate (Railway)

| Stage | Users | Monthly Cost |
|-------|-------|-------------|
| Pre-launch | 0-100 | ~$25 (Hobby plan) |
| Early growth | 100-1,000 | ~$50-100 |
| Growth | 1,000-5,000 | ~$150-300 |
| Scale | 5,000-20,000 | ~$300-700 |

Plus external costs:
- Anthropic API: ~$50-500/mo depending on usage
- S3/R2: ~$5-20/mo
- Resend: $20/mo (50k emails)
- Sentry: Free tier
- PostHog: Free tier (1M events)
- Paddle: 5% + $0.50 per transaction (no monthly fee)

## Rollback

```bash
# Railway maintains deploy history
# Rollback via dashboard: click previous deployment → "Rollback"

# Or via CLI:
railway rollback
```
