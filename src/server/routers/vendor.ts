import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import { VendorRisk, Plan, Prisma } from '@prisma/client';
import { PLAN_LIMITS } from '@/lib/constants';
import {
  calculateVendorRiskScore,
  type VendorAssessmentInput,
} from '@/server/services/vendors/assessment';
import { analyzeVendorWithAI } from '@/server/services/vendors/ai-assessment';

/**
 * Get effective vendor limit for a plan
 */
function getEffectiveVendorLimit(plan: Plan): number {
  const limit = PLAN_LIMITS[plan].vendors;
  return limit >= 999 ? Infinity : limit;
}

/**
 * Vendor input validation schemas
 */
const createVendorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  vendorType: z.enum(['API_PROVIDER', 'SAAS_WITH_AI', 'MODEL_HOST']),
  dataUsedForTraining: z.boolean().nullable().optional(),
  dataProcessingLocation: z.string().nullable().optional(),
  hasDPA: z.boolean().default(false),
  hasModelCard: z.boolean().default(false),
  supportsAIAct: z.boolean().nullable().optional(),
  usesSubprocessors: z.boolean().default(false),
  subprocessorsDocumented: z.boolean().default(false),
});

const updateVendorSchema = createVendorSchema.partial().extend({
  id: z.string(),
});

/**
 * Vendor tRPC router
 */
export const vendorRouter = router({
  /**
   * List all vendors for the current organization
   */
  list: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50),
          cursor: z.string().optional(),
          riskLevel: z.nativeEnum(VendorRisk).optional(),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { limit = 50, cursor, riskLevel, search } = input || {};

      const where = {
        organizationId: ctx.organization.id,
        ...(riskLevel && { riskLevel }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { vendorType: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
      };

      const vendors = await ctx.prisma.vendor.findMany({
        where,
        take: limit + 1,
        ...(cursor && {
          cursor: { id: cursor },
          skip: 1,
        }),
        orderBy: [{ riskLevel: 'desc' }, { createdAt: 'desc' }],
        include: {
          _count: {
            select: {
              systemLinks: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (vendors.length > limit) {
        const nextItem = vendors.pop();
        nextCursor = nextItem?.id;
      }

      return {
        vendors,
        nextCursor,
      };
    }),

  /**
   * Get a single vendor by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const vendor = await ctx.prisma.vendor.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.organization.id,
        },
        include: {
          systemLinks: {
            include: {
              system: {
                select: {
                  id: true,
                  name: true,
                  riskLevel: true,
                  complianceScore: true,
                },
              },
            },
          },
        },
      });

      if (!vendor) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Vendor not found',
        });
      }

      return vendor;
    }),

  /**
   * Create a new vendor
   */
  create: protectedProcedure
    .input(createVendorSchema)
    .mutation(async ({ ctx, input }) => {
      // Check plan limits
      const vendorCount = await ctx.prisma.vendor.count({
        where: { organizationId: ctx.organization.id },
      });

      const effectiveLimit = getEffectiveVendorLimit(ctx.organization.plan);

      if (vendorCount >= effectiveLimit) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            effectiveLimit === 0
              ? 'Vendor assessments are not available on your plan. Please upgrade to Starter or higher.'
              : `You have reached your plan limit of ${effectiveLimit} vendors. Please upgrade your plan.`,
        });
      }

      // Create the vendor
      const vendor = await ctx.prisma.vendor.create({
        data: {
          ...input,
          organizationId: ctx.organization.id,
        },
      });

      return vendor;
    }),

  /**
   * Update an existing vendor
   */
  update: protectedProcedure
    .input(updateVendorSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Verify ownership
      const existing = await ctx.prisma.vendor.findFirst({
        where: {
          id,
          organizationId: ctx.organization.id,
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Vendor not found',
        });
      }

      // Update the vendor
      const vendor = await ctx.prisma.vendor.update({
        where: { id },
        data,
      });

      return vendor;
    }),

  /**
   * Delete a vendor
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.prisma.vendor.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.organization.id,
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Vendor not found',
        });
      }

      // Delete the vendor (cascade will handle system links)
      await ctx.prisma.vendor.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Assess a vendor's risk score
   * Calculates rule-based score and optionally runs AI analysis
   */
  assess: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        runAIAnalysis: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Fetch vendor
      const vendor = await ctx.prisma.vendor.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.organization.id,
        },
      });

      if (!vendor) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Vendor not found',
        });
      }

      // Prepare assessment input
      const assessmentInput: VendorAssessmentInput = {
        dataUsedForTraining: vendor.dataUsedForTraining,
        dataProcessingLocation: vendor.dataProcessingLocation,
        hasDPA: vendor.hasDPA,
        hasModelCard: vendor.hasModelCard,
        supportsAIAct: vendor.supportsAIAct,
        usesSubprocessors: vendor.usesSubprocessors,
        subprocessorsDocumented: vendor.subprocessorsDocumented,
      };

      // Calculate rule-based risk score
      const riskScoreResult = calculateVendorRiskScore(assessmentInput, {
        markets: ctx.organization.markets,
      });

      // Run AI analysis if requested
      let aiAssessment = null;
      if (input.runAIAnalysis) {
        try {
          aiAssessment = await analyzeVendorWithAI(
            vendor,
            ctx.organization.markets
          );
        } catch (error) {
          console.error('AI vendor assessment failed:', error);
          // Continue without AI assessment - rule-based score is still valid
        }
      }

      // Build assessment data to store
      const assessmentData = {
        ruleBasedAssessment: {
          score: riskScoreResult.score,
          riskLevel: riskScoreResult.riskLevel,
          riskFactors: riskScoreResult.riskFactors,
          assessedAt: new Date().toISOString(),
        },
        ...(aiAssessment && {
          aiAssessment: {
            ...aiAssessment,
            assessedAt: new Date().toISOString(),
          },
        }),
      };

      // Update vendor with assessment results
      const updatedVendor = await ctx.prisma.vendor.update({
        where: { id: input.id },
        data: {
          riskScore: riskScoreResult.score,
          riskLevel: riskScoreResult.riskLevel,
          assessmentData: assessmentData as unknown as Prisma.InputJsonValue,
          lastAssessedAt: new Date(),
        },
      });

      return {
        vendor: updatedVendor,
        ruleBasedAssessment: riskScoreResult,
        aiAssessment,
      };
    }),

  /**
   * Link a vendor to an AI system
   */
  linkToSystem: protectedProcedure
    .input(
      z.object({
        vendorId: z.string(),
        systemId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify vendor ownership
      const vendor = await ctx.prisma.vendor.findFirst({
        where: {
          id: input.vendorId,
          organizationId: ctx.organization.id,
        },
      });

      if (!vendor) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Vendor not found',
        });
      }

      // Verify system ownership
      const system = await ctx.prisma.aISystem.findFirst({
        where: {
          id: input.systemId,
          organizationId: ctx.organization.id,
        },
      });

      if (!system) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'AI System not found',
        });
      }

      // Check if link already exists
      const existingLink = await ctx.prisma.systemVendorLink.findUnique({
        where: {
          systemId_vendorId: {
            systemId: input.systemId,
            vendorId: input.vendorId,
          },
        },
      });

      if (existingLink) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Vendor is already linked to this system',
        });
      }

      // Create the link
      const link = await ctx.prisma.systemVendorLink.create({
        data: {
          systemId: input.systemId,
          vendorId: input.vendorId,
        },
        include: {
          vendor: true,
          system: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return link;
    }),

  /**
   * Unlink a vendor from an AI system
   */
  unlinkFromSystem: protectedProcedure
    .input(
      z.object({
        vendorId: z.string(),
        systemId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify vendor ownership
      const vendor = await ctx.prisma.vendor.findFirst({
        where: {
          id: input.vendorId,
          organizationId: ctx.organization.id,
        },
      });

      if (!vendor) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Vendor not found',
        });
      }

      // Find and delete the link
      const link = await ctx.prisma.systemVendorLink.findUnique({
        where: {
          systemId_vendorId: {
            systemId: input.systemId,
            vendorId: input.vendorId,
          },
        },
      });

      if (!link) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Vendor link not found',
        });
      }

      await ctx.prisma.systemVendorLink.delete({
        where: { id: link.id },
      });

      return { success: true };
    }),

  /**
   * Get vendor count for current organization
   */
  getCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.prisma.vendor.count({
      where: { organizationId: ctx.organization.id },
    });

    const effectiveLimit = getEffectiveVendorLimit(ctx.organization.plan);

    return {
      count,
      limit: effectiveLimit === Infinity ? null : effectiveLimit,
      remaining:
        effectiveLimit === Infinity ? null : Math.max(0, effectiveLimit - count),
      canCreate: count < effectiveLimit,
    };
  }),

  /**
   * Get vendor stats for dashboard
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const vendors = await ctx.prisma.vendor.findMany({
      where: { organizationId: ctx.organization.id },
      select: {
        riskLevel: true,
        riskScore: true,
      },
    });

    const totalVendors = vendors.length;
    const assessedVendors = vendors.filter((v) => v.riskLevel !== null).length;

    // Risk distribution
    const riskDistribution = {
      LOW: vendors.filter((v) => v.riskLevel === 'LOW').length,
      MEDIUM: vendors.filter((v) => v.riskLevel === 'MEDIUM').length,
      HIGH: vendors.filter((v) => v.riskLevel === 'HIGH').length,
      CRITICAL: vendors.filter((v) => v.riskLevel === 'CRITICAL').length,
    };

    // Average risk score
    const scoresArray = vendors
      .filter((v) => v.riskScore !== null)
      .map((v) => v.riskScore as number);
    const avgRiskScore =
      scoresArray.length > 0
        ? Math.round(
            scoresArray.reduce((sum, score) => sum + score, 0) / scoresArray.length
          )
        : null;

    // Critical vendors count
    const criticalVendors = vendors.filter(
      (v) => v.riskLevel === 'CRITICAL' || v.riskLevel === 'HIGH'
    ).length;

    return {
      totalVendors,
      assessedVendors,
      riskDistribution,
      avgRiskScore,
      criticalVendors,
    };
  }),
});
