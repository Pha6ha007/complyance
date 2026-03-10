import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../trpc';
import {
  getOrCreateReferralCode,
  getReferralStats,
  applyReferralCode,
} from '../services/referrals/code';
import { getPendingRewardsCount } from '../services/referrals/rewards';
import { TRPCError } from '@trpc/server';

export const referralRouter = router({
  /**
   * Get or create referral code for current user
   */
  getMyCode: protectedProcedure.query(async ({ ctx }) => {
    const code = await getOrCreateReferralCode(ctx.user.id);
    return { code };
  }),

  /**
   * Get referral statistics for current user
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const stats = await getReferralStats(ctx.user.id);
    return stats;
  }),

  /**
   * Get pending rewards count (for sidebar badge)
   */
  getPendingCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await getPendingRewardsCount(ctx.user.id);
    return { count };
  }),

  /**
   * Apply referral code (called during signup)
   * Public procedure - can be called before authentication
   */
  applyCode: publicProcedure
    .input(
      z.object({
        code: z.string().min(1),
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await applyReferralCode(input.userId, input.code);

      if (!success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid or expired referral code',
        });
      }

      return { success: true };
    }),
});
