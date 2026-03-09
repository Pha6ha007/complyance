import { prisma } from '@/server/db/client';
import type { ClassificationInput } from '@/server/ai/schemas/classification-result';
import { preFilterClassification } from './rules';
import { classifyWithLLM, ClassificationError } from './llm';
import { validateClassification, crossCheckClassification } from './validator';
import { generateComplianceGaps, calculateComplianceScore } from './gaps';
import type { RiskLevel } from '@prisma/client';

/**
 * Complete classification result with metadata
 */
export type ClassificationEngineResult = {
  riskLevel: RiskLevel;
  annexIIICategory: string | null;
  annexIIISubcategory: string | null;
  classificationReasoning: string;
  providerOrDeployer: string;
  exceptionApplies: boolean;
  exceptionReason: string | null;
  confidenceScore: number;
  transparencyObligations: string[];
  flaggedForReview: boolean;
  validationWarnings: string[];
  complianceScore: number;
  gapCount: number;
};

/**
 * Main classification engine orchestrator
 * Coordinates: pre-filter → LLM → validation → gap generation
 */
export async function classifyAISystem(
  systemId: string,
  input: ClassificationInput
): Promise<ClassificationEngineResult> {
  console.log(`[Classification Engine] Starting classification for: ${input.name}`);

  try {
    // STEP 1: Rule-based pre-filter
    console.log('[Classification Engine] Running pre-filter rules...');
    const preFilterResult = preFilterClassification(input);

    // If pre-filter gives definitive result, skip LLM
    if (preFilterResult.isDefinitive && preFilterResult.riskLevel) {
      console.log(
        `[Classification Engine] Pre-filter definitive: ${preFilterResult.riskLevel}`
      );

      // Save result to database
      await saveClassificationResult(systemId, {
        riskLevel: preFilterResult.riskLevel as RiskLevel,
        annexIIICategory: null,
        annexIIISubcategory: null,
        classificationReasoning:
          preFilterResult.reason || 'Rule-based classification',
        providerOrDeployer: 'BOTH',
        exceptionApplies: false,
        exceptionReason: null,
        confidenceScore: 1.0, // Rule-based is always confident
        transparencyObligations: [],
        flaggedForReview: false,
        validationWarnings: [],
        complianceScore: 0, // Will be calculated after gap generation
      });

      // Generate gaps
      const gaps = generateComplianceGaps({
        riskLevel: preFilterResult.riskLevel,
        annexIIICategory: null,
        annexIIISubcategory: null,
        exceptionApplies: false,
        exceptionReason: null,
        providerOrDeployer: 'BOTH',
        reasoning: preFilterResult.reason || 'Rule-based classification',
        confidenceScore: 1.0,
        transparencyObligations: [],
      });

      await saveComplianceGaps(systemId, gaps);

      // Calculate compliance score
      const complianceScore = calculateComplianceScore(
        gaps.map((g) => ({ priority: g.priority, status: 'NOT_STARTED' }))
      );

      await updateComplianceScore(systemId, complianceScore);

      return {
        riskLevel: preFilterResult.riskLevel as RiskLevel,
        annexIIICategory: null,
        annexIIISubcategory: null,
        classificationReasoning:
          preFilterResult.reason || 'Rule-based classification',
        providerOrDeployer: 'BOTH',
        exceptionApplies: false,
        exceptionReason: null,
        confidenceScore: 1.0,
        transparencyObligations: [],
        flaggedForReview: false,
        validationWarnings: [],
        complianceScore,
        gapCount: gaps.length,
      };
    }

    // STEP 2: LLM Classification
    console.log('[Classification Engine] Calling LLM for classification...');
    const llmResult = await classifyWithLLM(input);

    // STEP 3: Validation
    console.log('[Classification Engine] Validating LLM result...');
    const validationResult = validateClassification(input, llmResult);

    // STEP 4: Cross-checks
    const crossCheckIssues = crossCheckClassification(
      input,
      validationResult.result
    );
    if (crossCheckIssues.length > 0) {
      console.warn(
        '[Classification Engine] Cross-check issues:',
        crossCheckIssues
      );
      validationResult.validationWarnings.push(...crossCheckIssues);
    }

    // STEP 5: Generate compliance gaps
    console.log('[Classification Engine] Generating compliance gaps...');
    const gaps = generateComplianceGaps(validationResult.result);

    // STEP 6: Calculate compliance score
    const complianceScore = calculateComplianceScore(
      gaps.map((g) => ({ priority: g.priority, status: 'NOT_STARTED' }))
    );

    // STEP 7: Save to database
    console.log('[Classification Engine] Saving results to database...');
    await saveClassificationResult(systemId, {
      riskLevel: validationResult.result.riskLevel as RiskLevel,
      annexIIICategory: validationResult.result.annexIIICategory,
      annexIIISubcategory: validationResult.result.annexIIISubcategory,
      classificationReasoning: validationResult.result.reasoning,
      providerOrDeployer: validationResult.result.providerOrDeployer,
      exceptionApplies: validationResult.result.exceptionApplies,
      exceptionReason: validationResult.result.exceptionReason,
      confidenceScore: validationResult.result.confidenceScore,
      transparencyObligations: validationResult.result.transparencyObligations,
      flaggedForReview: validationResult.flaggedForReview,
      validationWarnings: validationResult.validationWarnings,
      complianceScore,
    });

    await saveComplianceGaps(systemId, gaps);
    await updateComplianceScore(systemId, complianceScore);

    console.log(
      `[Classification Engine] Classification complete: ${validationResult.result.riskLevel} (${gaps.length} gaps, score: ${complianceScore}%)`
    );

    // Track classification completion
    console.log('📊 Analytics: system_classified', {
      system_id: systemId,
      risk_level: validationResult.result.riskLevel,
      confidence_score: validationResult.result.confidenceScore,
      annex_iii_category: validationResult.result.annexIIICategory,
      compliance_score: complianceScore,
      gap_count: gaps.length,
      flagged_for_review: validationResult.flaggedForReview,
    });

    return {
      riskLevel: validationResult.result.riskLevel as RiskLevel,
      annexIIICategory: validationResult.result.annexIIICategory,
      annexIIISubcategory: validationResult.result.annexIIISubcategory,
      classificationReasoning: validationResult.result.reasoning,
      providerOrDeployer: validationResult.result.providerOrDeployer,
      exceptionApplies: validationResult.result.exceptionApplies,
      exceptionReason: validationResult.result.exceptionReason,
      confidenceScore: validationResult.result.confidenceScore,
      transparencyObligations: validationResult.result.transparencyObligations,
      flaggedForReview: validationResult.flaggedForReview,
      validationWarnings: validationResult.validationWarnings,
      complianceScore,
      gapCount: gaps.length,
    };
  } catch (error) {
    console.error('[Classification Engine] Error during classification:', error);

    // If classification completely failed, mark as pending review
    await prisma.aISystem.update({
      where: { id: systemId },
      data: {
        flaggedForReview: true,
        classificationReasoning:
          error instanceof ClassificationError
            ? `Classification failed: ${error.message}`
            : 'Classification failed due to unexpected error. Manual review required.',
      },
    });

    throw error;
  }
}

/**
 * Save classification result to database
 */
async function saveClassificationResult(
  systemId: string,
  result: Omit<ClassificationEngineResult, 'gapCount'>
): Promise<void> {
  await prisma.aISystem.update({
    where: { id: systemId },
    data: {
      riskLevel: result.riskLevel,
      annexIIICategory: result.annexIIICategory,
      annexIIISubcategory: result.annexIIISubcategory,
      classificationReasoning: result.classificationReasoning,
      providerOrDeployer: result.providerOrDeployer,
      exceptionApplies: result.exceptionApplies,
      exceptionReason: result.exceptionReason,
      confidenceScore: result.confidenceScore,
      transparencyObligations: result.transparencyObligations,
      flaggedForReview: result.flaggedForReview,
      classifiedAt: new Date(),
      complianceScore: result.complianceScore,
    },
  });
}

/**
 * Save compliance gaps to database
 */
async function saveComplianceGaps(
  systemId: string,
  gaps: Array<{
    article: string;
    requirement: string;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    notes?: string;
  }>
): Promise<void> {
  // Delete existing gaps for this system (in case of re-classification)
  await prisma.complianceGap.deleteMany({
    where: { systemId },
  });

  // Create new gaps
  await prisma.complianceGap.createMany({
    data: gaps.map((gap) => ({
      systemId,
      article: gap.article,
      requirement: gap.requirement,
      priority: gap.priority,
      notes: gap.notes,
      status: 'NOT_STARTED',
    })),
  });
}

/**
 * Update compliance score for system
 */
async function updateComplianceScore(
  systemId: string,
  score: number
): Promise<void> {
  await prisma.aISystem.update({
    where: { id: systemId },
    data: { complianceScore: score },
  });
}

/**
 * Get classification result for a system
 */
export async function getClassificationResult(systemId: string) {
  const system = await prisma.aISystem.findUnique({
    where: { id: systemId },
    include: {
      gaps: {
        orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
      },
    },
  });

  if (!system) {
    throw new Error('System not found');
  }

  return {
    system: {
      id: system.id,
      name: system.name,
      description: system.description,
      riskLevel: system.riskLevel,
      annexIIICategory: system.annexIIICategory,
      annexIIISubcategory: system.annexIIISubcategory,
      classificationReasoning: system.classificationReasoning,
      providerOrDeployer: system.providerOrDeployer,
      exceptionApplies: system.exceptionApplies,
      exceptionReason: system.exceptionReason,
      confidenceScore: system.confidenceScore,
      transparencyObligations: system.transparencyObligations,
      complianceScore: system.complianceScore,
      flaggedForReview: system.flaggedForReview,
      classifiedAt: system.classifiedAt,
    },
    gaps: system.gaps,
  };
}
