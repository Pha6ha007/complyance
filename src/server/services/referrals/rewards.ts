import { prisma } from '@/server/db/client';
import { sendEmail } from '@/server/services/email';

/**
 * Grant reward to referrer when referred user starts a paid subscription
 * Called from Paddle webhook on subscription.created
 */
export async function grantReferrerReward(
  referredUserId: string
): Promise<boolean> {
  // Find pending reward for this referred user
  const pendingReward = await prisma.referralReward.findFirst({
    where: {
      referredId: referredUserId,
      status: 'PENDING',
    },
    include: {
      referrer: {
        include: {
          organization: true,
        },
      },
      referred: {
        include: {
          organization: true,
        },
      },
    },
  });

  if (!pendingReward) {
    // No pending reward found
    return false;
  }

  // Check if referred user has paid subscription
  const referredOrg = pendingReward.referred.organization;
  if (!referredOrg || referredOrg.plan === 'FREE') {
    // Not on a paid plan yet
    return false;
  }

  await prisma.$transaction(async (tx) => {
    // Grant bonus systems to referrer
    await tx.organization.update({
      where: { id: pendingReward.referrer.organizationId },
      data: {
        bonusSystems: {
          increment: pendingReward.amount,
        },
      },
    });

    // Mark reward as granted
    await tx.referralReward.update({
      where: { id: pendingReward.id },
      data: {
        status: 'GRANTED',
        grantedAt: new Date(),
      },
    });
  });

  // Send notification email to referrer
  try {
    await sendEmail({
      to: pendingReward.referrer.email,
      subject: `🎉 You earned ${pendingReward.amount} bonus AI systems!`,
      html: `
        <h2>Referral Reward Granted!</h2>
        <p>Great news! Your referral has upgraded to a paid plan.</p>
        <p><strong>Your reward:</strong> ${pendingReward.amount} extra AI systems have been added to your account.</p>
        <p>You can now add up to ${pendingReward.referrer.organization?.bonusSystems || 0} additional AI systems beyond your plan limit.</p>
        <p>Keep sharing your referral link to earn more!</p>
        <br>
        <p>— The Complyance Team</p>
      `,
    });
  } catch (error) {
    // Email failure shouldn't block reward granting
    console.error('Failed to send referral reward email:', error);
  }

  return true;
}

/**
 * Revoke reward if subscription is canceled within 7 days (anti-fraud)
 */
export async function revokeReferrerReward(
  referredUserId: string
): Promise<boolean> {
  // Find granted reward for this referred user
  const grantedReward = await prisma.referralReward.findFirst({
    where: {
      referredId: referredUserId,
      status: 'GRANTED',
    },
    include: {
      referrer: {
        include: {
          organization: true,
        },
      },
    },
  });

  if (!grantedReward) {
    return false;
  }

  // Check if reward was granted less than 7 days ago
  const daysSinceGrant =
    (Date.now() - grantedReward.grantedAt!.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceGrant > 7) {
    // Too late to revoke
    return false;
  }

  await prisma.$transaction(async (tx) => {
    // Remove bonus systems from referrer
    const currentBonus = grantedReward.referrer.organization?.bonusSystems || 0;
    const newBonus = Math.max(0, currentBonus - grantedReward.amount);

    await tx.organization.update({
      where: { id: grantedReward.referrer.organizationId },
      data: {
        bonusSystems: newBonus,
      },
    });

    // Mark reward as revoked
    await tx.referralReward.update({
      where: { id: grantedReward.id },
      data: {
        status: 'REVOKED',
      },
    });
  });

  // Send notification email to referrer
  try {
    await sendEmail({
      to: grantedReward.referrer.email,
      subject: 'Referral reward revoked',
      html: `
        <h2>Referral Reward Revoked</h2>
        <p>Your referred user canceled their subscription within 7 days.</p>
        <p>As per our referral policy, the ${grantedReward.amount} bonus AI systems have been removed from your account.</p>
        <p>Your current bonus systems: ${Math.max(0, (grantedReward.referrer.organization?.bonusSystems || 0) - grantedReward.amount)}</p>
        <br>
        <p>— The Complyance Team</p>
      `,
    });
  } catch (error) {
    console.error('Failed to send reward revocation email:', error);
  }

  return true;
}

/**
 * Get pending rewards count for a user (for sidebar badge)
 */
export async function getPendingRewardsCount(userId: string): Promise<number> {
  const count = await prisma.referralReward.count({
    where: {
      referrerId: userId,
      status: 'PENDING',
    },
  });

  return count;
}
