import crypto from 'crypto';
import { Plan } from '@prisma/client';
import { PLAN_LIMITS, getEffectiveSystemLimit } from '@/lib/constants';

// Re-export so existing consumers don't break
export { PLAN_LIMITS, getEffectiveSystemLimit };

// Paddle price IDs → plans. Configured via env vars so sandbox/prod use different IDs
// without code changes. Set PADDLE_PRICE_STARTER, PADDLE_PRICE_PROFESSIONAL,
// PADDLE_PRICE_SCALE in Railway env vars (or .env.local for dev).
function buildPaddlePriceMap(): Record<string, Plan> {
  const map: Record<string, Plan> = {};
  const { PADDLE_PRICE_STARTER, PADDLE_PRICE_PROFESSIONAL, PADDLE_PRICE_SCALE } = process.env;
  if (PADDLE_PRICE_STARTER) map[PADDLE_PRICE_STARTER] = Plan.STARTER;
  if (PADDLE_PRICE_PROFESSIONAL) map[PADDLE_PRICE_PROFESSIONAL] = Plan.PROFESSIONAL;
  if (PADDLE_PRICE_SCALE) map[PADDLE_PRICE_SCALE] = Plan.SCALE;
  return map;
}

export const PADDLE_PRODUCT_MAP: Record<string, Plan> = buildPaddlePriceMap();

// Paddle webhook signature verification
export function verifyPaddleWebhook(
  signature: string,
  rawBody: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(rawBody);
  const digest = hmac.digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

// Map Paddle price ID to Plan
export function getPlanFromPaddlePrice(priceId: string): Plan | null {
  return PADDLE_PRODUCT_MAP[priceId] || null;
}

// Check if organization can perform action based on plan limits
export function canPerformAction(
  plan: Plan,
  action: 'addSystem' | 'addVendor' | 'generateDocument' | 'biasTesting' | 'cicdAPI',
  currentUsage: number,
  bonusSystems: number = 0
): boolean {
  const limits = PLAN_LIMITS[plan];

  switch (action) {
    case 'addSystem':
      return currentUsage < getEffectiveSystemLimit(plan, bonusSystems);
    case 'addVendor':
      return currentUsage < limits.vendors;
    case 'generateDocument':
      return limits.docGeneration;
    case 'biasTesting':
      return currentUsage < limits.biasTesting;
    case 'cicdAPI':
      return limits.cicdApi;
    default:
      return false;
  }
}
