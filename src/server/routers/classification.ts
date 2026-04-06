import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import { classificationInputSchema } from '../ai/schemas/classification-result';
import { classifyAISystem, getClassificationResult } from '../services/classification/engine';
import { syncSystemToTraceHawkInBackground } from '../services/integrations/tracehawk';

/**
 * Classification tRPC router
 */
export const classificationRouter = router({
  /**
   * Classify an AI system
   * Runs the full classification engine pipeline
   */
  classify: protectedProcedure
    .input(
      z.object({
        systemId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get the system
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

      // Build classification input from system data
      const classificationInput = classificationInputSchema.parse({
        name: system.name,
        description: system.description,
        aiType: system.aiType,
        domain: system.domain,
        makesDecisions: system.makesDecisions,
        processesPersonalData: system.processesPersonalData,
        profilesUsers: system.profilesUsers,
        endUsers: system.endUsers,
        markets: system.markets,
      });

      // Run classification
      const result = await classifyAISystem(system.id, classificationInput);

      // Fire-and-forget push to TraceHawk if this system is linked.
      syncSystemToTraceHawkInBackground(ctx.prisma, system.id);

      return result;
    }),

  /**
   * Get classification result for a system
   * Returns classification details and compliance gaps
   */
  getResult: protectedProcedure
    .input(
      z.object({
        systemId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify ownership
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

      return getClassificationResult(input.systemId);
    }),

  /**
   * Re-classify a system (after updates)
   */
  reclassify: protectedProcedure
    .input(
      z.object({
        systemId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get the system
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

      // Build classification input
      const classificationInput = classificationInputSchema.parse({
        name: system.name,
        description: system.description,
        aiType: system.aiType,
        domain: system.domain,
        makesDecisions: system.makesDecisions,
        processesPersonalData: system.processesPersonalData,
        profilesUsers: system.profilesUsers,
        endUsers: system.endUsers,
        markets: system.markets,
      });

      // Run classification
      const result = await classifyAISystem(system.id, classificationInput);

      // Fire-and-forget push to TraceHawk if this system is linked.
      syncSystemToTraceHawkInBackground(ctx.prisma, system.id);

      return result;
    }),

  /**
   * Update a single compliance gap status
   */
  updateGapStatus: protectedProcedure
    .input(
      z.object({
        gapId: z.string(),
        status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get the gap with system to verify ownership
      const gap = await ctx.prisma.complianceGap.findFirst({
        where: {
          id: input.gapId,
        },
        include: {
          system: true,
        },
      });

      if (!gap || gap.system.organizationId !== ctx.organization.id) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Compliance gap not found',
        });
      }

      // Update the gap
      const updatedGap = await ctx.prisma.complianceGap.update({
        where: { id: input.gapId },
        data: {
          status: input.status,
          ...(input.notes && { notes: input.notes }),
        },
      });

      // Recalculate compliance score for the system
      const allGaps = await ctx.prisma.complianceGap.findMany({
        where: { systemId: gap.systemId },
        select: { priority: true, status: true },
      });

      const weights = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      const statusMultiplier = {
        COMPLETED: 1,
        IN_PROGRESS: 0.5,
        NOT_STARTED: 0,
      };

      let totalWeight = 0;
      let achievedWeight = 0;

      for (const g of allGaps) {
        const weight = weights[g.priority];
        totalWeight += weight;
        achievedWeight += weight * statusMultiplier[g.status];
      }

      const complianceScore =
        totalWeight > 0 ? Math.round((achievedWeight / totalWeight) * 100) : 100;

      // Update system compliance score
      await ctx.prisma.aISystem.update({
        where: { id: gap.systemId },
        data: { complianceScore },
      });

      // Fire-and-forget push to TraceHawk if this system is linked.
      syncSystemToTraceHawkInBackground(ctx.prisma, gap.systemId);

      return {
        gap: updatedGap,
        newComplianceScore: complianceScore,
      };
    }),

  /**
   * Get all gaps for a system
   */
  getGaps: protectedProcedure
    .input(
      z.object({
        systemId: z.string(),
        status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']).optional(),
        priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
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

      const gaps = await ctx.prisma.complianceGap.findMany({
        where: {
          systemId: input.systemId,
          ...(input.status && { status: input.status }),
          ...(input.priority && { priority: input.priority }),
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
      });

      return gaps;
    }),
});
