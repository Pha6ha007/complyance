# API Layer Reference

## 10 tRPC Routers (all must exist and be registered):
system.ts, classification.ts, vendor.ts, document.ts, evidence.ts, incident.ts, intelligence.ts, team.ts, billing.ts, referral.ts

## Every procedure needs: Zod input validation, protectedProcedure (except public endpoints), plan limit enforcement where applicable

## Plan Limits:
FREE: systems=1, vendors=0, docs=false, evidence=false
STARTER: systems=5, vendors=2, docs=true, evidence=false
PROFESSIONAL: systems=20, vendors=10, evidence=true
SCALE: systems=50, vendors=unlimited, api=true

Effective limit = PLAN_LIMITS[plan].systems + org.bonusSystems

## API Routes:
GET /api/health, POST /api/webhooks/paddle (verify HMAC!), /api/trpc/[trpc], POST /api/public/v1/classify (API key), GET /api/public/v1/badge/[id] (CORS), GET /api/cron/* (CRON_SECRET)

## Paddle webhooks must handle: subscription.created (+ referral reward), subscription.updated, subscription.canceled, subscription.past_due
