import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import { AIType, RiskLevel } from '@prisma/client';
import { getEffectiveSystemLimit } from '@/lib/constants';
import { randomBytes } from 'crypto';
import { pushComplianceToTraceHawk } from '../services/integrations/tracehawk';

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

      const systems = await ctx.prisma.aISystem.findMany({
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

      // Strip the TraceHawk API key — it's a credential for an external
      // service and must never reach the client. (Prisma 5.18 query-level
      // `omit` is gated behind the omitApi preview feature; we strip in
      // memory instead to avoid touching schema preview flags.)
      for (const s of systems) {
        // @ts-expect-error — runtime field, type still includes it.
        delete s.tracehawkOrgApiKey;
      }

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
      const system = await ctx.prisma.aISystem.findFirst({
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

      // Strip the TraceHawk API key — it's a credential for an external
      // service and must never reach the client. (Prisma 5.18 query-level
      // `omit` is gated behind the omitApi preview feature; we strip in
      // memory instead to avoid touching schema preview flags.)
      // @ts-expect-error — runtime field, type still includes it.
      delete system.tracehawkOrgApiKey;

      return system;
    }),

  /**
   * Create a new AI system
   */
  create: protectedProcedure
    .input(createSystemSchema)
    .mutation(async ({ ctx, input }) => {
      // Check plan limits
      const systemCount = await ctx.prisma.aISystem.count({
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
      const system = await ctx.prisma.aISystem.create({
        data: {
          ...input,
          organizationId: ctx.organization.id,
        },
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
      const existing = await ctx.prisma.aISystem.findFirst({
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
      const system = await ctx.prisma.aISystem.update({
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
      const existing = await ctx.prisma.aISystem.findFirst({
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
      await ctx.prisma.aISystem.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Get system count for current organization
   */
  getCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await ctx.prisma.aISystem.count({
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
    const systems = await ctx.prisma.aISystem.findMany({
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

  /**
   * Get current user and organization settings
   */
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    return {
      user: {
        name: ctx.user.name ?? '',
        email: ctx.user.email,
      },
      organization: {
        name: ctx.organization.name,
        plan: ctx.organization.plan,
        locale: ctx.organization.locale,
      },
    };
  }),

  /**
   * Update user profile (name, email)
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required').max(200),
        email: z.string().email('Invalid email address'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check email uniqueness if changed
      if (input.email !== ctx.user.email) {
        const existing = await ctx.prisma.user.findUnique({
          where: { email: input.email },
        });
        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Email is already in use',
          });
        }
      }

      const user = await ctx.prisma.user.update({
        where: { id: ctx.user.id },
        data: {
          name: input.name,
          email: input.email,
        },
      });

      return { name: user.name, email: user.email };
    }),

  /**
   * Update organization name
   */
  updateOrganization: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Organization name is required').max(200),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const org = await ctx.prisma.organization.update({
        where: { id: ctx.organization.id },
        data: { name: input.name },
      });

      return { name: org.name };
    }),

  /**
   * Get API key status (masked) for the organization.
   */
  getApiKey: protectedProcedure.query(async ({ ctx }) => {
    const org = await ctx.prisma.organization.findUnique({
      where: { id: ctx.organization.id },
      select: { apiKey: true, plan: true },
    });

    if (!org?.apiKey) {
      return { hasKey: false, maskedKey: null, plan: org?.plan ?? 'FREE' };
    }

    // Mask: show first 4 and last 4 chars
    const key = org.apiKey;
    const masked = key.length > 10
      ? `${key.slice(0, 7)}${'•'.repeat(key.length - 11)}${key.slice(-4)}`
      : '•'.repeat(key.length);

    return { hasKey: true, maskedKey: masked, plan: org.plan };
  }),

  /**
   * Generate or regenerate API key.
   * Returns the full key ONCE — subsequent reads only show masked version.
   */
  generateApiKey: protectedProcedure.mutation(async ({ ctx }) => {
    // Plan gate — Professional+ can use SDK
    const sdkPlans = ['PROFESSIONAL', 'SCALE', 'ENTERPRISE'];
    if (!sdkPlans.includes(ctx.organization.plan)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'SDK integration requires Professional plan or higher',
      });
    }

    const apiKey = `cmp_${randomBytes(24).toString('hex')}`;

    await ctx.prisma.organization.update({
      where: { id: ctx.organization.id },
      data: { apiKey },
    });

    return { apiKey };
  }),

  /**
   * Revoke API key.
   */
  revokeApiKey: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.organization.update({
      where: { id: ctx.organization.id },
      data: { apiKey: null },
    });

    return { revoked: true };
  }),

  /**
   * Link an AI system to a TraceHawk agent.
   *
   * Stores the TraceHawk agent ID + org API key, then synchronously pushes
   * the current compliance state to TraceHawk so the agent shows up with
   * compliance context immediately. Push errors are returned in the result
   * (not thrown) so the link still saves even if TraceHawk is unreachable.
   */
  linkTraceHawk: protectedProcedure
    .input(
      z.object({
        systemId: z.string(),
        tracehawkAgentId: z.string().min(1, 'TraceHawk agent ID is required'),
        tracehawkOrgApiKey: z
          .string()
          .min(1, 'TraceHawk API key is required')
          .startsWith('th-', 'Expected TraceHawk API key to start with "th-"'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.aISystem.findFirst({
        where: { id: input.systemId, organizationId: ctx.organization.id },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'AI System not found',
        });
      }

      const updated = await ctx.prisma.aISystem.update({
        where: { id: input.systemId },
        data: {
          tracehawkAgentId: input.tracehawkAgentId,
          tracehawkOrgApiKey: input.tracehawkOrgApiKey,
        },
        select: {
          id: true,
          riskLevel: true,
          complianceScore: true,
          annexIIICategory: true,
          processesPersonalData: true,
          tracehawkAgentId: true,
          tracehawkOrgApiKey: true,
        },
      });

      // Synchronous push with a 5s budget so the UI doesn't hang.
      const ac = new AbortController();
      const timer = setTimeout(() => ac.abort(), 5000);

      let pushResult;
      try {
        pushResult = await pushComplianceToTraceHawk(updated, { signal: ac.signal });
      } finally {
        clearTimeout(timer);
      }

      if (pushResult.pushed) {
        await ctx.prisma.aISystem.update({
          where: { id: input.systemId },
          data: { lastTracehawkSync: new Date() },
        });
      }

      return {
        linked: true,
        tracehawkAgentId: input.tracehawkAgentId,
        synced: pushResult.pushed,
        syncReason: pushResult.reason ?? null,
        syncStatus: pushResult.status ?? null,
        syncError: pushResult.error ?? null,
      };
    }),

  /**
   * Re-push current compliance state to the linked TraceHawk agent.
   *
   * Uses the credentials already stored on the system (the API key is
   * never returned to the client). Returns the same shape as linkTraceHawk
   * so the UI can show success / failure consistently.
   */
  resyncTraceHawk: protectedProcedure
    .input(z.object({ systemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const system = await ctx.prisma.aISystem.findFirst({
        where: { id: input.systemId, organizationId: ctx.organization.id },
        select: {
          id: true,
          riskLevel: true,
          complianceScore: true,
          annexIIICategory: true,
          processesPersonalData: true,
          tracehawkAgentId: true,
          tracehawkOrgApiKey: true,
        },
      });

      if (!system) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'AI System not found',
        });
      }

      if (!system.tracehawkAgentId || !system.tracehawkOrgApiKey) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'System is not linked to TraceHawk',
        });
      }

      const ac = new AbortController();
      const timer = setTimeout(() => ac.abort(), 5000);

      let pushResult;
      try {
        pushResult = await pushComplianceToTraceHawk(system, { signal: ac.signal });
      } finally {
        clearTimeout(timer);
      }

      if (pushResult.pushed) {
        await ctx.prisma.aISystem.update({
          where: { id: input.systemId },
          data: { lastTracehawkSync: new Date() },
        });
      }

      return {
        synced: pushResult.pushed,
        syncReason: pushResult.reason ?? null,
        syncStatus: pushResult.status ?? null,
        syncError: pushResult.error ?? null,
      };
    }),

  /**
   * Unlink an AI system from its TraceHawk agent.
   * Clears the stored credentials and lastTracehawkSync timestamp.
   */
  unlinkTraceHawk: protectedProcedure
    .input(z.object({ systemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.aISystem.findFirst({
        where: { id: input.systemId, organizationId: ctx.organization.id },
        select: { id: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'AI System not found',
        });
      }

      await ctx.prisma.aISystem.update({
        where: { id: input.systemId },
        data: {
          tracehawkAgentId: null,
          tracehawkOrgApiKey: null,
          lastTracehawkSync: null,
        },
      });

      return { unlinked: true };
    }),

  /**
   * Get onboarding status for the current organization
   */
  getOnboardingStatus: protectedProcedure.query(async ({ ctx }) => {
    const org = await ctx.prisma.organization.findUniqueOrThrow({
      where: { id: ctx.organization.id },
      select: {
        onboardingCompletedAt: true,
        plan: true,
      },
    });

    // Check real progress
    const systemCount = await ctx.prisma.aISystem.count({
      where: { organizationId: ctx.organization.id },
    });

    const classifiedSystem = await ctx.prisma.aISystem.findFirst({
      where: {
        organizationId: ctx.organization.id,
        riskLevel: { not: null },
      },
      select: { id: true },
    });

    const systemWithGaps = await ctx.prisma.aISystem.findFirst({
      where: {
        organizationId: ctx.organization.id,
        riskLevel: { not: null },
        gaps: { some: {} },
      },
      select: { id: true },
    });

    const hasDocument = await ctx.prisma.document.count({
      where: {
        organizationId: ctx.organization.id,
      },
    });

    return {
      completed: org.onboardingCompletedAt !== null,
      steps: {
        systemAdded: systemCount > 0,
        classificationDone: classifiedSystem !== null,
        gapsReviewed: systemWithGaps !== null,
        reportGenerated: hasDocument > 0,
      },
      firstSystemId: classifiedSystem?.id ?? systemWithGaps?.id ?? null,
    };
  }),

  /**
   * Mark onboarding as completed
   */
  completeOnboarding: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.organization.update({
      where: { id: ctx.organization.id },
      data: { onboardingCompletedAt: new Date() },
    });
    return { success: true };
  }),
});
