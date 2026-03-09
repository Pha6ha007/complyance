import { NextRequest, NextResponse } from 'next/server';
import { verifyPaddleWebhook, getPlanFromPaddlePrice } from '@/server/services/billing/paddle';
import { prisma } from '@/server/db/client';
import { Plan } from '@prisma/client';

/**
 * Helper to determine if plan change is an upgrade
 */
function isPlanUpgrade(fromPlan: Plan, toPlan: Plan): boolean {
  const planOrder: Record<Plan, number> = {
    [Plan.FREE]: 0,
    [Plan.STARTER]: 1,
    [Plan.PROFESSIONAL]: 2,
    [Plan.SCALE]: 3,
    [Plan.ENTERPRISE]: 4,
  };
  return planOrder[toPlan] > planOrder[fromPlan];
}

// Disable body parsing to get raw body for signature verification
export const runtime = 'nodejs';

interface PaddleWebhookEvent {
  event_type: string;
  data: {
    id: string;
    status: string;
    customer_id: string;
    items: Array<{
      price: {
        id: string;
      };
    }>;
    custom_data?: {
      user_id?: string;
    };
  };
}

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('paddle-signature');
    const rawBody = await req.text();

    if (!signature) {
      console.error('Missing Paddle signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('PADDLE_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Verify webhook signature
    const isValid = verifyPaddleWebhook(signature, rawBody, webhookSecret);
    if (!isValid) {
      console.error('Invalid Paddle webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event: PaddleWebhookEvent = JSON.parse(rawBody);
    console.log('Paddle webhook received:', event.event_type, event.data.id);

    // Handle different event types
    switch (event.event_type) {
      case 'subscription.created':
        await handleSubscriptionCreated(event);
        break;

      case 'subscription.updated':
        await handleSubscriptionUpdated(event);
        break;

      case 'subscription.canceled':
        await handleSubscriptionCanceled(event);
        break;

      case 'subscription.past_due':
        await handleSubscriptionPastDue(event);
        break;

      default:
        console.log('Unhandled Paddle event type:', event.event_type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Paddle webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(event: PaddleWebhookEvent) {
  const { data } = event;
  const priceId = data.items[0]?.price?.id;

  if (!priceId) {
    console.error('No price ID in subscription.created event');
    return;
  }

  const plan = getPlanFromPaddlePrice(priceId);
  if (!plan) {
    console.error('Unknown Paddle price ID:', priceId);
    return;
  }

  // Find organization by Paddle customer ID
  const organization = await prisma.organization.findUnique({
    where: { paddleCustomerId: data.customer_id },
  });

  if (!organization) {
    console.error('Organization not found for Paddle customer:', data.customer_id);
    return;
  }

  const previousPlan = organization.plan;

  // Update organization plan
  await prisma.organization.update({
    where: { id: organization.id },
    data: {
      plan,
      updatedAt: new Date(),
    },
  });

  console.log(`Organization ${organization.id} upgraded to ${plan}`);

  // Track plan upgrade
  console.log('📊 Analytics: plan_upgraded', {
    organization_id: organization.id,
    from_plan: previousPlan,
    to_plan: plan,
    subscription_id: data.id,
  });

  // Grant referral rewards if applicable
  const users = await prisma.user.findMany({
    where: { organizationId: organization.id },
  });

  for (const user of users) {
    if (user.referredByCode) {
      await grantReferrerReward(data.id, user.id);
    }
  }
}

async function handleSubscriptionUpdated(event: PaddleWebhookEvent) {
  const { data } = event;
  const priceId = data.items[0]?.price?.id;

  if (!priceId) {
    console.error('No price ID in subscription.updated event');
    return;
  }

  const plan = getPlanFromPaddlePrice(priceId);
  if (!plan) {
    console.error('Unknown Paddle price ID:', priceId);
    return;
  }

  const organization = await prisma.organization.findUnique({
    where: { paddleCustomerId: data.customer_id },
  });

  if (!organization) {
    console.error('Organization not found for Paddle customer:', data.customer_id);
    return;
  }

  const previousPlan = organization.plan;

  await prisma.organization.update({
    where: { id: organization.id },
    data: {
      plan,
      updatedAt: new Date(),
    },
  });

  console.log(`Organization ${organization.id} plan updated to ${plan}`);

  // Track plan change (upgrade or downgrade)
  if (previousPlan !== plan) {
    const eventName = isPlanUpgrade(previousPlan, plan) ? 'plan_upgraded' : 'plan_downgraded';
    console.log(`📊 Analytics: ${eventName}`, {
      organization_id: organization.id,
      from_plan: previousPlan,
      to_plan: plan,
      subscription_id: data.id,
    });
  }
}

async function handleSubscriptionCanceled(event: PaddleWebhookEvent) {
  const { data } = event;

  const organization = await prisma.organization.findUnique({
    where: { paddleCustomerId: data.customer_id },
  });

  if (!organization) {
    console.error('Organization not found for Paddle customer:', data.customer_id);
    return;
  }

  const previousPlan = organization.plan;

  // Downgrade to FREE plan
  await prisma.organization.update({
    where: { id: organization.id },
    data: {
      plan: Plan.FREE,
      updatedAt: new Date(),
    },
  });

  console.log(`Organization ${organization.id} downgraded to FREE (subscription canceled)`);

  // Track subscription cancellation
  console.log('📊 Analytics: subscription_cancelled', {
    organization_id: organization.id,
    plan: previousPlan,
    subscription_id: data.id,
  });
}

async function handleSubscriptionPastDue(event: PaddleWebhookEvent) {
  const { data } = event;

  const organization = await prisma.organization.findUnique({
    where: { paddleCustomerId: data.customer_id },
  });

  if (!organization) {
    console.error('Organization not found for Paddle customer:', data.customer_id);
    return;
  }

  // TODO: Send email notification about past due payment
  console.log(`Organization ${organization.id} subscription past due`);
}

// Grant referral reward to referrer when referred user starts paid plan
async function grantReferrerReward(paddleSubscriptionId: string, referredUserId: string) {
  const pendingReward = await prisma.referralReward.findFirst({
    where: {
      referredId: referredUserId,
      status: 'PENDING',
    },
  });

  if (!pendingReward) {
    return;
  }

  // Grant reward to referrer
  await prisma.referralReward.update({
    where: { id: pendingReward.id },
    data: {
      status: 'GRANTED',
      grantedAt: new Date(),
      paddleSubscriptionId,
    },
  });

  // Apply bonus systems to referrer's organization
  const referrer = await prisma.user.findUnique({
    where: { id: pendingReward.referrerId },
  });

  if (referrer) {
    await prisma.organization.update({
      where: { id: referrer.organizationId },
      data: {
        bonusSystems: {
          increment: pendingReward.amount,
        },
      },
    });

    console.log(`Granted ${pendingReward.amount} bonus systems to referrer ${referrer.id}`);
    // TODO: Send email notification to referrer
  }
}
