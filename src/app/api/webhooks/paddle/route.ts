import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/client';
import { getPlanFromPaddlePrice } from '@/server/services/billing/paddle';
import { grantReferrerReward, revokeReferrerReward } from '@/server/services/referrals/rewards';

// Paddle webhook signature verification
async function verifyPaddleSignature(
  request: NextRequest,
  body: string
): Promise<boolean> {
  const signature = request.headers.get('paddle-signature');
  if (!signature) {
    return false;
  }

  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('PADDLE_WEBHOOK_SECRET not configured');
    return false;
  }

  try {
    // Extract signature parts
    const parts = signature.split(';');
    const timestamp = parts.find((p) => p.startsWith('ts='))?.substring(3);
    const signatureHash = parts.find((p) => p.startsWith('h1='))?.substring(3);

    if (!timestamp || !signatureHash) {
      return false;
    }

    // Verify signature
    const signedPayload = `${timestamp}:${body}`;
    const expectedHash = crypto
      .createHmac('sha256', webhookSecret)
      .update(signedPayload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signatureHash),
      Buffer.from(expectedHash)
    );
  } catch (error) {
    console.error('Failed to verify Paddle signature:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    // Verify webhook signature
    const isValid = await verifyPaddleSignature(request, body);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);
    const eventType = event.event_type;

    switch (eventType) {
      case 'subscription.created':
      case 'subscription.updated': {
        const subscription = event.data;
        const customerId = subscription.customer_id;
        const subscriptionId = subscription.id;
        const status = subscription.status;

        // Find user by Paddle customer ID
        const user = await prisma.user.findFirst({
          where: {
            organization: {
              paddleCustomerId: customerId,
            },
          },
        });

        if (!user) {
          console.error('Paddle webhook: user not found for customer', customerId);
          return NextResponse.json({ received: true });
        }

        // Resolve plan from Paddle price ID via unified mapping
        const priceId = subscription.items?.[0]?.price?.id ?? subscription.price_id;
        const plan = priceId ? getPlanFromPaddlePrice(priceId) : null;

        if (status === 'active' && plan) {
          await prisma.organization.update({
            where: { id: user.organizationId },
            data: {
              plan,
              paddleSubscriptionId: subscriptionId,
              paddleCustomerId: customerId,
            },
          });

          // Grant referrer reward if this user was referred
          if (eventType === 'subscription.created') {
            await grantReferrerReward(user.id);
          }
        }

        break;
      }

      case 'subscription.canceled': {
        const subscription = event.data;
        const subscriptionId = subscription.id;

        // Find organization by subscription ID
        const organization = await prisma.organization.findFirst({
          where: { paddleSubscriptionId: subscriptionId },
          include: { users: true },
        });

        if (!organization) {
          console.error('Paddle webhook: org not found for subscription', subscriptionId);
          return NextResponse.json({ received: true });
        }

        // Downgrade to FREE plan
        await prisma.organization.update({
          where: { id: organization.id },
          data: {
            plan: 'FREE',
            paddleSubscriptionId: null,
          },
        });

        // Revoke referrer reward if canceled within 7 days
        if (organization.users[0]) {
          await revokeReferrerReward(organization.users[0].id);
        }

        break;
      }

      case 'subscription.payment_succeeded':
      case 'subscription.payment_failed':
        // Payment events — no action needed, Paddle handles retries.
        // Could add Resend notification here in the future.
        break;

      default:
        // Unknown event type — ignore gracefully
        break;
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
