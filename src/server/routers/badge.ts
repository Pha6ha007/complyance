import { router, protectedProcedure } from '../trpc';
import { BadgeLevel } from '@prisma/client';
import {
  determineBadgeLevel,
  generateBadgeHTML,
  generateBadgeMarkdown,
  updateOrganizationBadge,
} from '../services/badge/generator';

export const badgeRouter = router({
  /**
   * Get badge information for the current user's organization
   */
  getMyBadge: protectedProcedure.query(async ({ ctx }) => {
    const org = await ctx.prisma.organization.findUnique({
      where: { id: ctx.organization.id },
      include: {
        aiSystems: {
          include: {
            gaps: {
              select: { status: true },
            },
          },
        },
      },
    });

    if (!org) {
      return null;
    }

    const result = determineBadgeLevel(org);

    // Generate embed codes
    const htmlCode = generateBadgeHTML(org.id, result.level);
    const markdownCode = generateBadgeMarkdown(org.id, result.level);

    return {
      orgId: org.id,
      orgName: org.name,
      badgeLevel: result.level,
      badgeEnabled: org.badgeEnabled,
      verifiedAt: org.badgeLastVerifiedAt,
      isEligible: result.isEligible,
      reason: result.reason,
      nextLevel: result.nextLevel,
      nextLevelRequirements: result.nextLevelRequirements,
      htmlCode,
      markdownCode,
    };
  }),

  /**
   * Update badge level for the current organization
   */
  updateBadge: protectedProcedure.mutation(async ({ ctx }) => {
    const newLevel = await updateOrganizationBadge(ctx.organization.id);
    return { badgeLevel: newLevel };
  }),

  /**
   * Toggle badge enabled/disabled
   */
  toggleBadge: protectedProcedure.mutation(async ({ ctx }) => {
    const org = await ctx.prisma.organization.findUnique({
      where: { id: ctx.organization.id },
      select: { badgeEnabled: true },
    });

    if (!org) {
      throw new Error('Organization not found');
    }

    await ctx.prisma.organization.update({
      where: { id: ctx.organization.id },
      data: {
        badgeEnabled: !org.badgeEnabled,
      },
    });

    return { badgeEnabled: !org.badgeEnabled };
  }),
});
