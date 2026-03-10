# REFERRAL_SYSTEM.md — Complyance Referral System Spec

## Overview

Referral program incentivizes users to invite other SaaS founders. Compliance products spread through trust networks.

## Reward Structure

| Who | Reward | When Granted |
|-----|--------|-------------|
| Referrer (existing user) | +2 extra AI systems | When referred user starts any paid plan |
| Referred (new user) | +1 extra AI system on Free OR 14-day Starter trial | At signup with valid code |

## Referral Code Format

`COMP-XXXX` (e.g. COMP-A7X2) — 4 alphanumeric chars, no ambiguous chars (0/O/1/I/L removed). ~450K unique combinations.

## Database Models

Already in prisma/schema.prisma: ReferralCode, ReferralReward models.
Organization.bonusSystems tracks extra systems from referrals.

## Backend Services

### code.ts — Generate & Apply Codes

```ts
function generateReferralCode(userId: string): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  // Generate COMP-XXXX, check uniqueness, save to DB
}

async function applyReferralCode(newUserId: string, code: string): Promise<boolean> {
  // Validate code, create pending reward, grant referred bonus, increment uses
}
```

### rewards.ts — Grant Rewards

```ts
async function grantReferrerReward(paddleSubscriptionId: string, referredUserId: string) {
  // Called from Paddle webhook on subscription.created
  // Find pending reward, mark GRANTED, apply bonus systems, send email
}
```

## tRPC Router

```ts
referralRouter = router({
  getMyCode: protectedProcedure.query(...)     // Get or create code
  getStats: protectedProcedure.query(...)      // Invited, converted, pending, total extra systems
  applyCode: publicProcedure.mutation(...)     // Apply code at signup
})
```

## Frontend

- Dashboard page: `/[locale]/dashboard/referrals` — link, code, stats, recent referrals
- Sidebar badge: gift icon with pending count
- Signup page: referral code field, pre-filled from URL param `?ref=COMP-XXXX`

## Paddle Integration

In webhook handler, on `subscription.created`:
```ts
const referredUser = await getUserByPaddleCustomer(event.data.customer_id);
if (referredUser?.referredByCode) {
  await grantReferrerReward(event.data.id, referredUser.id);
}
```

## Anti-Fraud

- Cannot refer yourself
- Reward only after first PAID subscription
- Cancel within 7 days → revoke reward
- Max 50 applications/day/code
- One reward per referred email ever

## i18n Keys

Namespace: `referrals` — title, subtitle, yourLink, yourCode, copy, copied, stats.*, howItWorks.*, recent, status.*, reward

## Status: NOT YET IMPLEMENTED — scheduled for post-launch
