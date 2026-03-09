import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import { AIType, RiskLevel } from '@prisma/client';
import { getEffectiveSystemLimit } from '@/lib/constants';

/**
 * AI System input validation schema
 */
const createSystemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  aiType: z.nativeEnum(AIType),
  domain: z.string().min(1, 'Domain is required'),
  makesDecisions: z.boolean(),
  processesPersonalData: z.boolean(),
  profilesUsers: z.boolean(),
  endUsers: z.array(z.string()).min(1, 'Select at least one end user type'),
  markets: z.array(z.string()).min(1, 'Select at least one market'),
});

const updateSystemSchema = createSystemSchema.partial().extend({
  id: z.string(),
});

/**
 * AI System tRPC router
 */
export const systemRouter = router({
  /**
   * List all AI systems for the current organization
   */
  list: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50),
          cursor: z.string().optional(),
          riskLevel: z.nativeEnum(RiskLevel).optional(),
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
            { description: { contains: search, mode: 'insensitive' as const } },
            { domain: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
      };

      const systems = await ctx.prisma.aiSystem.findMany({
        where,
        take: limit + 1,
        ...(cursor && {
          cursor: { id: cursor },
          skip: 1,
        }),
        orderBy: { createdAt: 'desc' },
        include: {
          gaps: {
            where: { status: { not: 'COMPLETED' } },
            orderBy: { priority: 'desc' },
            take: 3,
          },
          _count: {
            select: {
              gaps: true,
              documents: true,
              evidence: true,
              incidents: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (systems.length > limit) {
        const nextItem = systems.pop();
        nextCursor = nextItem?.id;
      }

      return {
        systems,
        nextCursor,
      };
    }),

  /**
   * Get a single AI system by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const system = await ctx.prisma.aiSystem.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.organization.id,
        },
        include: {
          gaps: {
            orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
          },
          documents: {
            orderBy: { generatedAt: 'desc' },
          },
          evidence: {
            orderBy: { createdAt: 'desc' },
          },
          incidents: {
            orderBy: { occurredAt: 'desc' },
          },
          vendorLinks: {
            include: {
              vendor: true,
            },
          },
        },
      });

      if (!system) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'AI System not found',
        });
      }

      return system;
    }),

  /**
   * Create a new AI system
   */
  create: protectedProcedure
    .input(createSystemSchema)
    .mutation(async ({ ctx, input }) => {
      // Check plan limits
      const systemCount = await ctx.prisma.aiSystem.count({
        where: { organizationId: ctx.organization.id },
      });

      const effectiveLimit = getEffectiveSystemLimit(
        ctx.organization.plan,
        ctx.organization.bonusSystems
      );

      if (systemCount >= effectiveLimit) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `You have reached your plan limit of ${effectiveLimit} AI systems. Please upgrade your plan.`,
        });
      }

      // Create the system
      const system = await ctx.prisma.aiSystem.create({
        data: {
          ...input,
          organizationId: ctx.organization.id,
        },
      });

      // Track system creation
      console.log('📊 Analytics: system_created', {
        system_id: system.id,
        system_name: system.name,
        ai_type: system.aiType,
        domain: system.domain,
        user_id: ctx.user.id,
        organization_id: ctx.organization.id,
      });

      // TODO: Queue classification job here
      // await queueClassificationJob(system.id);

      return system;
    }),

  /**
   * Update an existing AI system
   */
  update: protectedProcedure
    .input(updateSystemSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Verify ownership
      const existing = await ctx.prisma.aiSystem.findFirst({
        where: {
          id,
          organizationId: ctx.organization.id,
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'AI System not found',
        });
      }

      // Update the system
      const system = await ctx.prisma.aiSystem.update({
        where: { id },
        data,
      });

      // If key fields changed, re-classify
      const keyFieldsChanged =
        data.aiType ||
        data.domain ||
        data.makesDecisions !== undefined ||
        data.processesPersonalData !== undefined ||
        data.profilesUsers !== undefined;

      if (keyFieldsChanged) {
        // TODO: Queue re-classification job
        // await queueClassificationJob(system.id);
      }

      return system;
    }),

  /**
   * Delete an AI system
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await ctx.prisma.aiSystem.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.organization.id,
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'AI System not found',
        });
      }

      // Delete the system (cascade will handle related records)
      await ctx.prisma.aiSystem.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Get system count for current organization
   */
  getCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.prisma.aiSystem.count({
      where: { organizationId: ctx.organization.id },
    });

    const effectiveLimit = getEffectiveSystemLimit(
      ctx.organization.plan,
      ctx.organization.bonusSystems
    );

    return {
      count,
      limit: effectiveLimit,
      remaining: Math.max(0, effectiveLimit - count),
    };
  }),

  /**
   * Get dashboard stats
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const systems = await ctx.prisma.aiSystem.findMany({
      where: { organizationId: ctx.organization.id },
      select: {
        riskLevel: true,
        complianceScore: true,
      },
    });

    const totalSystems = systems.length;
    const classifiedSystems = systems.filter((s) => s.riskLevel).length;

    // Risk distribution
    const riskDistribution = {
      UNACCEPTABLE: systems.filter((s) => s.riskLevel === 'UNACCEPTABLE').length,
      HIGH: systems.filter((s) => s.riskLevel === 'HIGH').length,
      LIMITED: systems.filter((s) => s.riskLevel === 'LIMITED').length,
      MINIMAL: systems.filter((s) => s.riskLevel === 'MINIMAL').length,
    };

    // Average compliance score
    const scoresArray = systems
      .filter((s) => s.complianceScore !== null)
      .map((s) => s.complianceScore as number);
    const avgComplianceScore =
      scoresArray.length > 0
        ? Math.round(
            scoresArray.reduce((sum, score) => sum + score, 0) / scoresArray.length
          )
        : null;

    // Critical gaps across all systems
    const criticalGaps = await ctx.prisma.complianceGap.count({
      where: {
        system: {
          organizationId: ctx.organization.id,
        },
        priority: 'CRITICAL',
        status: { not: 'COMPLETED' },
      },
    });

    return {
      totalSystems,
      classifiedSystems,
      riskDistribution,
      avgComplianceScore,
      criticalGaps,
    };
  }),
});
