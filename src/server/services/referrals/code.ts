import { prisma } from '@/server/db/client';
import { TRPCError } from '@trpc/server';

// Characters without ambiguous ones (0/O, 1/I/L removed)
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/**
 * Generate a unique referral code in format COMP-XXXX
 */
export async function generateReferralCode(userId: string): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    // Generate 4 random characters
    let randomPart = '';
    for (let i = 0; i < 4; i++) {
      randomPart += CODE_CHARS.charAt(
        Math.floor(Math.random() * CODE_CHARS.length)
      );
    }

    const code = `COMP-${randomPart}`;

    // Check if code already exists
    const existing = await prisma.referralCode.findUnique({
      where: { code },
    });

    if (!existing) {
      // Create the code
      await prisma.referralCode.create({
        data: {
          code,
          userId,
          usesCount: 0,
          rewardType: 'EXTRA_SYSTEMS',
          rewardAmount: 2,
          isActive: true,
        },
      });

      return code;
    }

    attempts++;
  }

  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Failed to generate unique referral code',
  });
}

/**
 * Get or create referral code for user
 */
export async function getOrCreateReferralCode(userId: string): Promise<string> {
  // Check if user already has a code
  const existingCode = await prisma.referralCode.findUnique({
    where: { userId },
  });

  if (existingCode) {
    return existingCode.code;
  }

  // Generate new code
  return await generateReferralCode(userId);
}

/**
 * Validate referral code format
 */
export function validateReferralCodeFormat(code: string): boolean {
  // Must be COMP-XXXX format
  const regex = /^COMP-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{4}$/;
  return regex.test(code);
}

/**
 * Apply referral code to a new user
 * Returns true if successful, false if code invalid/already used
 */
export async function applyReferralCode(
  newUserId: string,
  code: string
): Promise<boolean> {
  // Validate format
  if (!validateReferralCodeFormat(code)) {
    return false;
  }

  // Find the code
  const referralCode = await prisma.referralCode.findUnique({
    where: { code },
    include: {
      user: {
        include: {
          organization: true,
        },
      },
    },
  });

  if (!referralCode || !referralCode.isActive) {
    return false;
  }

  // Anti-fraud: cannot refer yourself
  if (referralCode.userId === newUserId) {
    return false;
  }

  // Check if new user already used a referral code
  const existingReward = await prisma.referralReward.findFirst({
    where: {
      referredId: newUserId,
    },
  });

  if (existingReward) {
    // User already used a referral code
    return false;
  }

  // Check max uses limit
  if (
    referralCode.maxUses !== null &&
    referralCode.usesCount >= referralCode.maxUses
  ) {
    return false;
  }

  // Get the new user's organization
  const newUser = await prisma.user.findUnique({
    where: { id: newUserId },
    include: { organization: true },
  });

  if (!newUser) {
    return false;
  }

  await prisma.$transaction(async (tx) => {
    // Create pending reward for referrer (granted when referred user subscribes)
    await tx.referralReward.create({
      data: {
        rewardType: 'EXTRA_SYSTEMS',
        amount: 2,
        status: 'PENDING',
        referrerId: referralCode.userId,
        referredId: newUserId,
        codeId: referralCode.id,
      },
    });

    // Grant immediate bonus to referred user (+1 system on Free plan)
    await tx.organization.update({
      where: { id: newUser.organizationId },
      data: {
        bonusSystems: {
          increment: 1,
        },
      },
    });

    // Increment uses count
    await tx.referralCode.update({
      where: { id: referralCode.id },
      data: {
        usesCount: {
          increment: 1,
        },
      },
    });

    // Store the referral code on user for later webhook processing
    await tx.user.update({
      where: { id: newUserId },
      data: {
        referredByCode: code,
      },
    });
  });

  return true;
}

/**
 * Get referral statistics for a user
 */
export async function getReferralStats(userId: string) {
  const referralCode = await prisma.referralCode.findUnique({
    where: { userId },
  });

  if (!referralCode) {
    return {
      code: null,
      totalInvited: 0,
      totalConverted: 0,
      totalPending: 0,
      totalBonusSystems: 0,
      recentReferrals: [],
    };
  }

  // Get all rewards for this referrer
  const rewards = await prisma.referralReward.findMany({
    where: {
      referrerId: userId,
    },
    include: {
      referred: {
        select: {
          name: true,
          email: true,
          organization: {
            select: {
              plan: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const totalInvited = rewards.length;
  const totalConverted = rewards.filter((r) => r.status === 'GRANTED').length;
  const totalPending = rewards.filter((r) => r.status === 'PENDING').length;
  const totalBonusSystems = rewards
    .filter((r) => r.status === 'GRANTED')
    .reduce((sum, r) => sum + r.amount, 0);

  const recentReferrals = rewards.slice(0, 10).map((r) => ({
    id: r.id,
    referredName: r.referred.name || r.referred.email,
    referredEmail: r.referred.email,
    plan: r.referred.organization?.plan || 'FREE',
    status: r.status,
    amount: r.amount,
    createdAt: r.createdAt,
    grantedAt: r.grantedAt,
  }));

  return {
    code: referralCode.code,
    totalInvited,
    totalConverted,
    totalPending,
    totalBonusSystems,
    recentReferrals,
  };
}
