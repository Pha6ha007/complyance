import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import { Plan } from '@prisma/client';
import { PLAN_LIMITS } from '@/lib/constants';
import {
  calculateMetadataHash,
  verifyIntegrity,
  EVIDENCE_TYPES,
  EVIDENCE_ARTICLES,
  generatePlaceholderFileUrl,
} from '@/server/services/evidence/integrity';

/**
 * Check if evidence vault is available for the plan
 */
function hasEvidenceVaultAccess(plan: Plan): boolean {
  return PLAN_LIMITS[plan].evidenceVault === true;
}

/**
 * Evidence input validation schemas
 */
const createEvidenceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional().nullable(),
  evidenceType: z.enum(EVIDENCE_TYPES),
  article: z.string().optional().nullable(),
  systemId: z.string().optional().nullable(),
  // For MVP: accept file metadata, actual file handling will be via presigned URLs later
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
});

const updateEvidenceSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required').max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  article: z.string().optional().nullable(),
});

const listEvidenceSchema = z.object({
  systemId: z.string().optional(),
  article: z.string().optional(),
  evidenceType: z.enum(EVIDENCE_TYPES).optional(),
  limit: z.number().min(1).max(100).default(50),
  cursor: z.string().optional(),
});

/**
 * Evidence tRPC router
 */
export const evidenceRouter = router({
  /**
   * List all evidence for the current organization
   * Supports filtering by system, article, and type with pagination
   */
  list: protectedProcedure
    .input(listEvidenceSchema.optional())
    .query(async ({ ctx, input }) => {
      // Check plan access
      if (!hasEvidenceVaultAccess(ctx.organization.plan)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Evidence Vault is available on Professional plan and above',
        });
      }

      const { systemId, article, evidenceType, limit = 50, cursor } = input || {};

      const where = {
        organizationId: ctx.organization.id,
        ...(systemId && { systemId }),
        ...(article && { article }),
        ...(evidenceType && { evidenceType }),
      };

      const evidence = await ctx.prisma.evidence.findMany({
        where,
        take: limit + 1,
        ...(cursor && {
          cursor: { id: cursor },
          skip: 1,
        }),
        orderBy: { createdAt: 'desc' },
        include: {
          system: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (evidence.length > limit) {
        const nextItem = evidence.pop();
        nextCursor = nextItem?.id;
      }

      return {
        evidence,
        nextCursor,
      };
    }),

  /**
   * Get a single evidence item by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check plan access
      if (!hasEvidenceVaultAccess(ctx.organization.plan)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Evidence Vault is available on Professional plan and above',
        });
      }

      const evidence = await ctx.prisma.evidence.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.organization.id,
        },
        include: {
          system: {
            select: {
              id: true,
              name: true,
              riskLevel: true,
            },
          },
        },
      });

      if (!evidence) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Evidence not found',
        });
      }

      return evidence;
    }),

  /**
   * Create new evidence
   */
  create: protectedProcedure
    .input(createEvidenceSchema)
    .mutation(async ({ ctx, input }) => {
      // Check plan access
      if (!hasEvidenceVaultAccess(ctx.organization.plan)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Evidence Vault is available on Professional plan and above',
        });
      }

      // Validate system belongs to organization if provided
      if (input.systemId) {
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
      }

      // Create evidence
      const evidence = await ctx.prisma.evidence.create({
        data: {
          title: input.title,
          description: input.description,
          evidenceType: input.evidenceType,
          article: input.article,
          systemId: input.systemId,
          organizationId: ctx.organization.id,
          // For MVP: generate placeholder file URL
          fileUrl: input.fileName
            ? generatePlaceholderFileUrl(
                ctx.organization.id,
                'temp-id',
                input.fileName
              )
            : null,
        },
      });

      // Calculate and store integrity hash based on metadata
      const integrityHash = calculateMetadataHash({
        title: evidence.title,
        description: evidence.description,
        evidenceType: evidence.evidenceType,
        article: evidence.article,
        systemId: evidence.systemId,
        organizationId: evidence.organizationId,
        createdAt: evidence.createdAt,
      });

      // Update with hash and correct file URL
      const updatedEvidence = await ctx.prisma.evidence.update({
        where: { id: evidence.id },
        data: {
          integrityHash,
          fileUrl: input.fileName
            ? generatePlaceholderFileUrl(
                ctx.organization.id,
                evidence.id,
                input.fileName
              )
            : null,
        },
      });

      return updatedEvidence;
    }),

  /**
   * Update evidence metadata
   */
  update: protectedProcedure
    .input(updateEvidenceSchema)
    .mutation(async ({ ctx, input }) => {
      // Check plan access
      if (!hasEvidenceVaultAccess(ctx.organization.plan)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Evidence Vault is available on Professional plan and above',
        });
      }

      const { id, ...data } = input;

      // Verify ownership
      const existing = await ctx.prisma.evidence.findFirst({
        where: {
          id,
          organizationId: ctx.organization.id,
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Evidence not found',
        });
      }

      // Update evidence
      const evidence = await ctx.prisma.evidence.update({
        where: { id },
        data,
      });

      return evidence;
    }),

  /**
   * Delete evidence
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check plan access
      if (!hasEvidenceVaultAccess(ctx.organization.plan)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Evidence Vault is available on Professional plan and above',
        });
      }

      // Verify ownership
      const existing = await ctx.prisma.evidence.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.organization.id,
        },
      });

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Evidence not found',
        });
      }

      // Delete evidence
      // Note: In production, also delete file from S3
      await ctx.prisma.evidence.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  /**
   * Get evidence stats for the organization
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    // Check plan access
    if (!hasEvidenceVaultAccess(ctx.organization.plan)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Evidence Vault is available on Professional plan and above',
      });
    }

    const evidence = await ctx.prisma.evidence.findMany({
      where: { organizationId: ctx.organization.id },
      select: {
        evidenceType: true,
        article: true,
        systemId: true,
      },
    });

    const totalEvidence = evidence.length;

    // Count by type
    const byType = {
      DOCUMENT: evidence.filter((e) => e.evidenceType === 'DOCUMENT').length,
      SCREENSHOT: evidence.filter((e) => e.evidenceType === 'SCREENSHOT').length,
      LOG: evidence.filter((e) => e.evidenceType === 'LOG').length,
      TEST_RESULT: evidence.filter((e) => e.evidenceType === 'TEST_RESULT').length,
    };

    // Count by article (top 5)
    const articleCounts: Record<string, number> = {};
    evidence.forEach((e) => {
      if (e.article) {
        articleCounts[e.article] = (articleCounts[e.article] || 0) + 1;
      }
    });
    const byArticle = Object.entries(articleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Count by system
    const linkedToSystem = evidence.filter((e) => e.systemId).length;

    return {
      totalEvidence,
      byType,
      byArticle,
      linkedToSystem,
    };
  }),

  /**
   * Verify evidence integrity
   * Recalculates hash and compares with stored hash
   */
  verifyIntegrity: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check plan access
      if (!hasEvidenceVaultAccess(ctx.organization.plan)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Evidence Vault is available on Professional plan and above',
        });
      }

      // Fetch evidence
      const evidence = await ctx.prisma.evidence.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.organization.id,
        },
      });

      if (!evidence) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Evidence not found',
        });
      }

      // Recalculate hash from metadata
      // In production, this would also verify file hash from S3
      const currentHash = calculateMetadataHash({
        title: evidence.title,
        description: evidence.description,
        evidenceType: evidence.evidenceType,
        article: evidence.article,
        systemId: evidence.systemId,
        organizationId: evidence.organizationId,
        createdAt: evidence.createdAt,
      });

      // Compare hashes
      const result = verifyIntegrity(evidence.integrityHash, currentHash);

      return {
        evidenceId: evidence.id,
        storedHash: evidence.integrityHash,
        calculatedHash: currentHash,
        ...result,
      };
    }),

  /**
   * Get all evidence for audit export
   */
  getEvidenceForAudit: protectedProcedure.query(async ({ ctx }) => {
    // Check plan access
    if (!hasEvidenceVaultAccess(ctx.organization.plan)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Evidence Vault is available on Professional plan and above',
      });
    }

    const evidence = await ctx.prisma.evidence.findMany({
      where: { organizationId: ctx.organization.id },
      orderBy: { createdAt: 'desc' },
      include: {
        system: {
          select: {
            id: true,
            name: true,
            riskLevel: true,
          },
        },
      },
    });

    // Return audit-ready format
    return {
      organization: {
        id: ctx.organization.id,
        name: ctx.organization.name,
      },
      exportedAt: new Date().toISOString(),
      totalItems: evidence.length,
      evidence: evidence.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        type: e.evidenceType,
        relatedArticle: e.article,
        linkedSystem: e.system?.name || null,
        fileUrl: e.fileUrl,
        integrityHash: e.integrityHash,
        createdAt: e.createdAt.toISOString(),
      })),
    };
  }),

  /**
   * Check if user has access to Evidence Vault
   */
  checkAccess: protectedProcedure.query(async ({ ctx }) => {
    const hasAccess = hasEvidenceVaultAccess(ctx.organization.plan);
    return {
      hasAccess,
      currentPlan: ctx.organization.plan,
      requiredPlan: 'PROFESSIONAL',
    };
  }),

  /**
   * Get available systems for linking evidence
   */
  getAvailableSystems: protectedProcedure.query(async ({ ctx }) => {
    // Check plan access
    if (!hasEvidenceVaultAccess(ctx.organization.plan)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Evidence Vault is available on Professional plan and above',
      });
    }

    const systems = await ctx.prisma.aISystem.findMany({
      where: { organizationId: ctx.organization.id },
      select: {
        id: true,
        name: true,
        riskLevel: true,
      },
      orderBy: { name: 'asc' },
    });

    return systems;
  }),

  /**
   * Get article options for the form
   */
  getArticleOptions: protectedProcedure.query(() => {
    return EVIDENCE_ARTICLES;
  }),
});
