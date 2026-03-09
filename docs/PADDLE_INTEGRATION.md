# PADDLE_INTEGRATION.md — Paddle Billing Integration

## Why Paddle

Paddle is a Merchant of Record (MoR). This means:
- Paddle handles all taxes (VAT, sales tax) — critical for selling to EU/US/UAE
- Paddle is the legal seller, not you — simplifies legal structure from Belarus
- No need for tax registration in every country
- Supports all 3 target markets (US, EU, UAE)
- Works with Belarusian residents/entities

## Paddle Setup

### Products & Prices

| Plan | Monthly Price | Paddle Product ID | Price IDs (per currency) |
|------|-------------|-------------------|------------------------|
| Starter | $99/mo | `pro_starter` | USD, EUR, GBP, AED |
| Professional | $249/mo | `pro_professional` | USD, EUR, GBP, AED |
| Scale | $499/mo | `pro_scale` | USD, EUR, GBP, AED |

Free tier doesn't go through Paddle — handled internally.

### Integration Pattern

**Paddle Billing (v2)** — use the latest Paddle.js + webhooks.

#### Frontend: Paddle.js Checkout

```tsx
// src/components/billing/checkout-button.tsx
'use client';

import { initializePaddle } from '@paddle/paddle-js';

export function CheckoutButton({ priceId, locale }: { priceId: string; locale: string }) {
  const openCheckout = async () => {
    const paddle = await initializePaddle({
      environment: process.env.NEXT_PUBLIC_PADDLE_ENV,
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
    });

    paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      settings: {
        locale: locale, // Paddle supports all our locales
        theme: 'dark',
        successUrl: `${window.location.origin}/${locale}/dashboard?upgraded=true`,
      },
      customData: {
        organizationId: currentOrg.id,
      },
    });
  };

  return <button onClick={openCheckout}>{t('billing.upgrade')}</button>;
}
```

#### Backend: Webhook Handler

```ts
// src/app/api/webhooks/paddle/route.ts
import { verifyPaddleWebhook } from '@/server/services/billing/paddle';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('paddle-signature');

  // Verify webhook signature
  if (!verifyPaddleWebhook(body, signature)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);

  switch (event.event_type) {
    case 'subscription.created':
      await handleSubscriptionCreated(event.data);
      break;
    case 'subscription.updated':
      await handleSubscriptionUpdated(event.data);
      break;
    case 'subscription.canceled':
      await handleSubscriptionCanceled(event.data);
      break;
    case 'subscription.past_due':
      await handleSubscriptionPastDue(event.data);
      break;
  }

  return Response.json({ received: true });
}

async function handleSubscriptionCreated(data: any) {
  const organizationId = data.custom_data?.organizationId;
  const plan = mapPaddleProductToPlan(data.items[0].price.product_id);

  await prisma.organization.update({
    where: { id: organizationId },
    data: {
      plan,
      paddleCustomerId: data.customer_id,
      paddleSubscriptionId: data.id,
    },
  });
}
```

### Plan Limit Enforcement

```ts
// src/server/services/billing/limits.ts
export const PLAN_LIMITS = {
  FREE:         { systems: 1,  vendors: 0,   docs: false, evidence: false, api: false, team: 1  },
  STARTER:      { systems: 5,  vendors: 2,   docs: true,  evidence: false, api: false, team: 1  },
  PROFESSIONAL: { systems: 20, vendors: 10,  docs: true,  evidence: true,  api: false, team: 3  },
  SCALE:        { systems: 50, vendors: 999, docs: true,  evidence: true,  api: true,  team: 10 },
  ENTERPRISE:   { systems: 999,vendors: 999, docs: true,  evidence: true,  api: true,  team: 999},
} as const;

export async function checkPlanLimit(orgId: string, resource: keyof PlanLimits): Promise<boolean> {
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  const limits = PLAN_LIMITS[org.plan];
  
  // Count current usage
  const currentCount = await countResource(orgId, resource);
  return currentCount < limits[resource];
}

// Middleware for tRPC routers
export const enforcePlanLimit = (resource: string) =>
  middleware(async ({ ctx, next }) => {
    const allowed = await checkPlanLimit(ctx.organizationId, resource);
    if (!allowed) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Plan limit reached for ${resource}. Please upgrade.`,
      });
    }
    return next();
  });
```

### Customer Portal (Self-Service)

Paddle provides a hosted customer portal for subscription management:

```ts
// Generate portal session URL
const portalUrl = `https://customer-portal.paddle.com/cpl_${paddleCustomerId}`;
// Or use Paddle API to generate a one-time portal link
```

Users can:
- Update payment method
- View invoices
- Cancel subscription
- Change plan (upgrade/downgrade handled via Paddle proration)

### Testing

- Use Paddle Sandbox environment for development
- Test webhook delivery via Paddle Dashboard → Developer Tools → Events
- Use Paddle test cards for checkout testing
