import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure, publicProcedure, adminProcedure } from '../trpc';
import { ChangeType, Plan } from '@prisma/client';
import { PLAN_LIMITS } from '@/lib/constants';

/**
 * Regulation codes used in the system
 */
const REGULATION_CODES = [
  'EU_AI_ACT',
  'COLORADO',
  'NYC_LL144',
  'NIST_RMF',
  'ISO_42001',
  'UAE_AI',
] as const;

/**
 * Map regulations to market codes for personalization
 */
const REGULATION_TO_MARKETS: Record<string, string[]> = {
  EU_AI_ACT: ['EU'],
  COLORADO: ['US'],
  NYC_LL144: ['US'],
  NIST_RMF: ['US'],
  ISO_42001: ['EU', 'US', 'UAE'], // International standard
  UAE_AI: ['UAE'],
};

/**
 * Check if user has access to full content (not just titles)
 */
function hasFullAccess(plan: Plan): boolean {
  return plan !== Plan.FREE;
}

/**
 * Intelligence tRPC router
 */
export const intelligenceRouter = router({
  /**
   * List regulatory updates with filters and pagination
   */
  list: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).default(20),
          cursor: z.string().optional(),
          regulation: z.enum(REGULATION_CODES).optional(),
          changeType: z.nativeEnum(ChangeType).optional(),
          personalized: z.boolean().default(false),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { limit = 20, cursor, regulation, changeType, personalized } =
        input || {};

      // Build where clause
      const where: {
        regulation?: string | { in: string[] };
        changeType?: ChangeType;
      } = {};

      if (regulation) {
        where.regulation = regulation;
      } else if (personalized && ctx.organization.markets.length > 0) {
        // Filter by regulations relevant to user's markets
        const relevantRegulations = Object.entries(REGULATION_TO_MARKETS)
          .filter(([, markets]) =>
            markets.some((m) => ctx.organization.markets.includes(m))
          )
          .map(([reg]) => reg);

        if (relevantRegulations.length > 0) {
          where.regulation = { in: relevantRegulations };
        }
      }

      if (changeType) {
        where.changeType = changeType;
      }

      // Fetch updates
      const updates = await ctx.prisma.regulatoryUpdate.findMany({
        where,
        take: limit + 1,
        ...(cursor && {
          cursor: { id: cursor },
          skip: 1,
        }),
        orderBy: { publishedAt: 'desc' },
      });

      // Get read status for user
      const updateIds = updates.map((u) => u.id);
      const readUpdates = await ctx.prisma.regulatoryUpdateRead.findMany({
        where: {
          userId: ctx.user.id,
          updateId: { in: updateIds },
        },
        select: { updateId: true },
      });
      const readSet = new Set(readUpdates.map((r) => r.updateId));

      // Handle pagination
      let nextCursor: typeof cursor | undefined = undefined;
      if (updates.length > limit) {
        const nextItem = updates.pop();
        nextCursor = nextItem?.id;
      }

      // Check plan access
      const fullAccess = hasFullAccess(ctx.organization.plan);

      // Map updates with read status and plan-gated content
      const mappedUpdates = updates.map((update) => ({
        id: update.id,
        title: update.title,
        summary: fullAccess ? update.summary : null, // Hide summary for Free plan
        source: fullAccess ? update.source : null,
        regulation: update.regulation,
        changeType: update.changeType,
        impact: fullAccess ? update.impact : null,
        affectedArticles: update.affectedArticles,
        publishedAt: update.publishedAt,
        isRead: readSet.has(update.id),
      }));

      return {
        updates: mappedUpdates,
        nextCursor,
        hasFullAccess: fullAccess,
      };
    }),

  /**
   * Get a single regulatory update by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const update = await ctx.prisma.regulatoryUpdate.findUnique({
        where: { id: input.id },
      });

      if (!update) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Regulatory update not found',
        });
      }

      // Check if user has read this update
      const readRecord = await ctx.prisma.regulatoryUpdateRead.findUnique({
        where: {
          userId_updateId: {
            userId: ctx.user.id,
            updateId: input.id,
          },
        },
      });

      // Check plan access
      const fullAccess = hasFullAccess(ctx.organization.plan);

      return {
        ...update,
        summary: fullAccess ? update.summary : null,
        source: fullAccess ? update.source : null,
        impact: fullAccess ? update.impact : null,
        isRead: !!readRecord,
        hasFullAccess: fullAccess,
      };
    }),

  /**
   * Mark an update as read
   */
  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify update exists
      const update = await ctx.prisma.regulatoryUpdate.findUnique({
        where: { id: input.id },
      });

      if (!update) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Regulatory update not found',
        });
      }

      // Upsert read record
      await ctx.prisma.regulatoryUpdateRead.upsert({
        where: {
          userId_updateId: {
            userId: ctx.user.id,
            updateId: input.id,
          },
        },
        create: {
          userId: ctx.user.id,
          updateId: input.id,
        },
        update: {
          readAt: new Date(),
        },
      });

      return { success: true };
    }),

  /**
   * Mark all updates as read
   */
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    // Get all update IDs
    const updates = await ctx.prisma.regulatoryUpdate.findMany({
      select: { id: true },
    });

    // Get already read updates
    const alreadyRead = await ctx.prisma.regulatoryUpdateRead.findMany({
      where: { userId: ctx.user.id },
      select: { updateId: true },
    });
    const readSet = new Set(alreadyRead.map((r) => r.updateId));

    // Create read records for unread updates
    const unreadIds = updates
      .filter((u) => !readSet.has(u.id))
      .map((u) => u.id);

    if (unreadIds.length > 0) {
      await ctx.prisma.regulatoryUpdateRead.createMany({
        data: unreadIds.map((updateId) => ({
          userId: ctx.user.id,
          updateId,
        })),
        skipDuplicates: true,
      });
    }

    return { marked: unreadIds.length };
  }),

  /**
   * Get unread count for the current user
   */
  getUnreadCount: protectedProcedure
    .input(
      z
        .object({
          personalized: z.boolean().default(false),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const personalized = input?.personalized ?? false;

      // Build where clause for relevant updates
      let where: { regulation?: { in: string[] } } = {};

      if (personalized && ctx.organization.markets.length > 0) {
        const relevantRegulations = Object.entries(REGULATION_TO_MARKETS)
          .filter(([, markets]) =>
            markets.some((m) => ctx.organization.markets.includes(m))
          )
          .map(([reg]) => reg);

        if (relevantRegulations.length > 0) {
          where = { regulation: { in: relevantRegulations } };
        }
      }

      // Get total count
      const totalCount = await ctx.prisma.regulatoryUpdate.count({ where });

      // Get read count
      const readCount = await ctx.prisma.regulatoryUpdateRead.count({
        where: {
          userId: ctx.user.id,
          updateId: {
            in: (
              await ctx.prisma.regulatoryUpdate.findMany({
                where,
                select: { id: true },
              })
            ).map((u) => u.id),
          },
        },
      });

      return {
        total: totalCount,
        unread: totalCount - readCount,
      };
    }),

  /**
   * Get latest updates for dashboard widget
   */
  getLatest: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(10).default(3) }).optional())
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 3;

      const updates = await ctx.prisma.regulatoryUpdate.findMany({
        take: limit,
        orderBy: { publishedAt: 'desc' },
        select: {
          id: true,
          title: true,
          regulation: true,
          changeType: true,
          publishedAt: true,
        },
      });

      // Get read status
      const readUpdates = await ctx.prisma.regulatoryUpdateRead.findMany({
        where: {
          userId: ctx.user.id,
          updateId: { in: updates.map((u) => u.id) },
        },
        select: { updateId: true },
      });
      const readSet = new Set(readUpdates.map((r) => r.updateId));

      return updates.map((update) => ({
        ...update,
        isRead: readSet.has(update.id),
      }));
    }),

  // ============================================
  // ADMIN PROCEDURES
  // ============================================

  /**
   * Create a new regulatory update (admin only)
   */
  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1).max(500),
        summary: z.string().min(1),
        source: z.string().url(),
        regulation: z.enum(REGULATION_CODES),
        changeType: z.nativeEnum(ChangeType),
        impact: z.string().optional(),
        affectedArticles: z.array(z.string()).default([]),
        publishedAt: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const update = await ctx.prisma.regulatoryUpdate.create({
        data: input,
      });

      return update;
    }),

  /**
   * Update an existing regulatory update (admin only)
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(500).optional(),
        summary: z.string().min(1).optional(),
        source: z.string().url().optional(),
        regulation: z.enum(REGULATION_CODES).optional(),
        changeType: z.nativeEnum(ChangeType).optional(),
        impact: z.string().nullable().optional(),
        affectedArticles: z.array(z.string()).optional(),
        publishedAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existing = await ctx.prisma.regulatoryUpdate.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Regulatory update not found',
        });
      }

      const update = await ctx.prisma.regulatoryUpdate.update({
        where: { id },
        data,
      });

      return update;
    }),

  /**
   * Delete a regulatory update (admin only)
   */
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.regulatoryUpdate.findUnique({
        where: { id: input.id },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Regulatory update not found',
        });
      }

      // Delete related read records first
      await ctx.prisma.regulatoryUpdateRead.deleteMany({
        where: { updateId: input.id },
      });

      // Delete the update
      await ctx.prisma.regulatoryUpdate.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * List all updates for admin (includes all fields)
   */
  adminList: adminProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50),
          cursor: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const { limit = 50, cursor } = input || {};

      const updates = await ctx.prisma.regulatoryUpdate.findMany({
        take: limit + 1,
        ...(cursor && {
          cursor: { id: cursor },
          skip: 1,
        }),
        orderBy: { publishedAt: 'desc' },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (updates.length > limit) {
        const nextItem = updates.pop();
        nextCursor = nextItem?.id;
      }

      return {
        updates,
        nextCursor,
      };
    }),

  /**
   * List legislation entries with filters and pagination
   * Titles visible to all plans; full content (summary, keyProvisions) requires Starter+
   */
  getLegislation: protectedProcedure
    .input(
      z
        .object({
          jurisdiction: z.string().optional(),
          status: z.string().optional(),
          region: z.string().optional(),
          limit: z.number().min(1).max(50).default(20),
          cursor: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input, ctx }) => {
      const { jurisdiction, status, region, limit = 20, cursor } = input ?? {};
      const plan = ctx.organization.plan;

      const where: Record<string, unknown> = {};
      if (jurisdiction) where.jurisdiction = jurisdiction;
      if (status) where.status = status;
      if (region) where.region = region;

      const entries = await ctx.prisma.legislationEntry.findMany({
        where,
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        orderBy: [{ impactLevel: 'asc' }, { updatedAt: 'desc' }],
      });

      let nextCursor: string | undefined = undefined;
      if (entries.length > limit) {
        const nextItem = entries.pop();
        nextCursor = nextItem?.id;
      }

      // Free plan: titles and metadata only, no summary/keyProvisions
      const hasFullAccess = plan !== Plan.FREE;

      return {
        entries: entries.map((entry) => ({
          id: entry.id,
          externalId: entry.externalId,
          jurisdiction: entry.jurisdiction,
          region: entry.region,
          title: entry.title,
          status: entry.status,
          effectiveDate: entry.effectiveDate,
          impactLevel: entry.impactLevel,
          sourceUrl: entry.sourceUrl,
          tags: entry.tags,
          lastVerified: entry.lastVerified,
          summary: hasFullAccess ? entry.summary : null,
          keyProvisions: hasFullAccess ? entry.keyProvisions : null,
        })),
        nextCursor,
        totalEstimate: await ctx.prisma.legislationEntry.count({ where }),
      };
    }),
});
