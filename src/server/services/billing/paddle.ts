import crypto from 'crypto';
import { Plan } from '@prisma/client';

// Paddle product IDs mapped to plans
// TODO: Replace with actual Paddle product IDs after creating products in Paddle dashboard
export const PADDLE_PRODUCT_MAP: Record<string, Plan> = {
  'pri_01j...starter': Plan.STARTER,
  'pri_01j...professional': Plan.PROFESSIONAL,
  'pri_01j...scale': Plan.SCALE,
};

// Plan limits
export const PLAN_LIMITS = {
  [Plan.FREE]: {
    systems: 1,
    regulations: ['EU_AI_ACT'],
    vendors: 0,
    documents: false,
    evidenceVault: false,
    biasTesting: 0,
    cicdAPI: false,
    teamMembers: 1,
    regulatoryAlerts: false,
    incidentRegister: false,
    gdprModule: false,
  },
  [Plan.STARTER]: {
    systems: 5,
    regulations: ['EU_AI_ACT', 'COLORADO_AI', 'NYC_LL144', 'NIST_RMF'],
    vendors: 2,
    documents: true,
    evidenceVault: false,
    biasTesting: 0,
    cicdAPI: false,
    teamMembers: 1,
    regulatoryAlerts: 'EMAIL_WEEKLY',
    incidentRegister: false,
    gdprModule: false,
  },
  [Plan.PROFESSIONAL]: {
    systems: 20,
    regulations: 'ALL',
    vendors: 10,
    documents: true,
    evidenceVault: true,
    biasTesting: 3,
    cicdAPI: false,
    teamMembers: 3,
    regulatoryAlerts: 'REALTIME',
    incidentRegister: false,
    gdprModule: false,
  },
  [Plan.SCALE]: {
    systems: 50,
    regulations: 'ALL',
    vendors: 999999, // Unlimited
    documents: true,
    evidenceVault: true,
    biasTesting: 999999, // Unlimited
    cicdAPI: true,
    teamMembers: 10,
    regulatoryAlerts: 'REALTIME',
    incidentRegister: true,
    gdprModule: true,
  },
  [Plan.ENTERPRISE]: {
    systems: 999999,
    regulations: 'ALL',
    vendors: 999999,
    documents: true,
    evidenceVault: true,
    biasTesting: 999999,
    cicdAPI: true,
    teamMembers: 999999,
    regulatoryAlerts: 'REALTIME',
    incidentRegister: true,
    gdprModule: true,
  },
} as const;

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

// Get effective system limit including bonus systems from referrals
export function getEffectiveSystemLimit(plan: Plan, bonusSystems: number = 0): number {
  const planLimit = PLAN_LIMITS[plan].systems;
  return planLimit + bonusSystems;
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
      return limits.documents;
    case 'biasTesting':
      return currentUsage < limits.biasTesting;
    case 'cicdAPI':
      return limits.cicdAPI;
    default:
      return false;
  }
}
