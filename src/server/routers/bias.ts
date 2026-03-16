import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, protectedProcedure } from '../trpc';
import { PLAN_LIMITS } from '@/lib/constants';
import { Plan } from '@prisma/client';
import { analyzeBias, parseCSV } from '@/server/services/bias/analyzer';
import type { BiasAnalysisResult } from '@/server/services/bias/analyzer';
import { calculateMetadataHash } from '@/server/services/evidence/integrity';

/**
 * Check if bias testing is available for the plan.
 * Free and Starter have 0 tests allowed; Professional+ have > 0.
 */
function hasBiasTestingAccess(plan: Plan): boolean {
  return PLAN_LIMITS[plan].biasTesting > 0;
}

const analyzeInputSchema = z.object({
  /** AI system to link the analysis to */
  systemId: z.string(),
  /** Raw CSV content (max 5MB) */
  csvContent: z.string().max(5 * 1024 * 1024, 'CSV content exceeds 5MB limit'),
  /** Column name with binary outcome */
  labelColumn: z.string().min(1),
  /** Column name with protected attribute */
  protectedAttribute: z.string().min(1),
  /** Value representing the privileged group */
  privilegedValue: z.string().min(1),
  /** Value representing favorable outcome (default '1') */
  favorableLabel: z.string().default('1'),
});

export const biasRouter = router({
  /**
   * Run bias analysis on uploaded CSV data.
   * Parses CSV server-side, computes metrics, stores results as Evidence.
   */
  analyze: protectedProcedure
    .input(analyzeInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Plan gate
      if (!hasBiasTestingAccess(ctx.organization.plan)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Bias Testing requires Professional plan or higher',
        });
      }

      // Verify system belongs to org
      const system = await ctx.prisma.aISystem.findFirst({
        where: {
          id: input.systemId,
          organizationId: ctx.organization.id,
        },
        select: { id: true, name: true },
      });

      if (!system) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'AI System not found',
        });
      }

      // Parse CSV
      const rows = parseCSV(input.csvContent);
      if (rows.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'CSV is empty or could not be parsed. Ensure it has a header row and data rows.',
        });
      }

      // Run analysis
      const result = analyzeBias({
        rows,
        labelColumn: input.labelColumn,
        protectedAttribute: input.protectedAttribute,
        privilegedValue: input.privilegedValue,
        favorableLabel: input.favorableLabel,
      });

      if (!result.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.error,
        });
      }

      // Store as Evidence
      const analysisResult = result as BiasAnalysisResult;
      const evidenceTitle = `Bias Analysis: ${system.name} — ${input.protectedAttribute}`;
      const evidenceDescription = [
        `Protected attribute: ${input.protectedAttribute} (privileged: ${input.privilegedValue})`,
        `Disparate Impact: ${analysisResult.metrics.disparateImpact}`,
        `Statistical Parity Difference: ${analysisResult.metrics.statisticalParityDifference}`,
        `Overall compliant: ${analysisResult.compliance.overallCompliant ? 'Yes' : 'No'}`,
        `Rows analyzed: ${analysisResult.metrics.rowsAnalyzed}`,
      ].join('\n');

      const evidence = await ctx.prisma.evidence.create({
        data: {
          title: evidenceTitle,
          description: evidenceDescription,
          evidenceType: 'TEST_RESULT',
          article: 'Article 10, Article 15',
          systemId: system.id,
          organizationId: ctx.organization.id,
          // Store full result as JSON in fileUrl field (MVP — no S3)
          fileUrl: `data:application/json;base64,${Buffer.from(JSON.stringify(analysisResult)).toString('base64')}`,
        },
      });

      // Calculate integrity hash
      const integrityHash = calculateMetadataHash({
        title: evidence.title,
        description: evidence.description,
        evidenceType: evidence.evidenceType,
        article: evidence.article,
        systemId: evidence.systemId,
        organizationId: evidence.organizationId,
        createdAt: evidence.createdAt,
      });

      await ctx.prisma.evidence.update({
        where: { id: evidence.id },
        data: { integrityHash },
      });

      return {
        evidenceId: evidence.id,
        ...analysisResult,
      };
    }),

  /**
   * Get past bias analysis results for a system.
   */
  getResults: protectedProcedure
    .input(z.object({
      systemId: z.string(),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      if (!hasBiasTestingAccess(ctx.organization.plan)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Bias Testing requires Professional plan or higher',
        });
      }

      const evidence = await ctx.prisma.evidence.findMany({
        where: {
          systemId: input.systemId,
          organizationId: ctx.organization.id,
          evidenceType: 'TEST_RESULT',
          title: { startsWith: 'Bias Analysis:' },
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
      });

      // Parse stored JSON results from fileUrl
      return evidence.map((e) => {
        let analysisData: BiasAnalysisResult | null = null;
        if (e.fileUrl?.startsWith('data:application/json;base64,')) {
          try {
            const base64 = e.fileUrl.replace('data:application/json;base64,', '');
            analysisData = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
          } catch {
            // Corrupt data — skip
          }
        }

        return {
          id: e.id,
          title: e.title,
          createdAt: e.createdAt,
          integrityHash: e.integrityHash,
          analysis: analysisData,
        };
      });
    }),

  /**
   * Check if user has access to bias testing.
   */
  checkAccess: protectedProcedure.query(({ ctx }) => {
    const hasAccess = hasBiasTestingAccess(ctx.organization.plan);
    return {
      hasAccess,
      currentPlan: ctx.organization.plan,
      requiredPlan: 'PROFESSIONAL',
    };
  }),

  /**
   * Get systems available for bias testing.
   */
  getAvailableSystems: protectedProcedure.query(async ({ ctx }) => {
    if (!hasBiasTestingAccess(ctx.organization.plan)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Bias Testing requires Professional plan or higher',
      });
    }

    return ctx.prisma.aISystem.findMany({
      where: { organizationId: ctx.organization.id },
      select: { id: true, name: true, riskLevel: true },
      orderBy: { name: 'asc' },
    });
  }),
});
