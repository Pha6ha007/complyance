import { z } from 'zod';

/**
 * Schema for LLM classification output
 * Based on EU AI Act classification framework
 */
export const classificationResultSchema = z.object({
  riskLevel: z.enum(['UNACCEPTABLE', 'HIGH', 'LIMITED', 'MINIMAL']),
  annexIIICategory: z.string().nullable(),
  annexIIISubcategory: z.string().nullable(),
  exceptionApplies: z.boolean(),
  exceptionReason: z.string().nullable(),
  providerOrDeployer: z.enum(['PROVIDER', 'DEPLOYER', 'BOTH']),
  reasoning: z.string(),
  confidenceScore: z.number().min(0).max(1),
  transparencyObligations: z.array(z.string()),
});

export type ClassificationResult = z.infer<typeof classificationResultSchema>;

/**
 * Input for classification
 */
export const classificationInputSchema = z.object({
  name: z.string(),
  description: z.string(),
  aiType: z.enum(['ML_MODEL', 'LLM', 'RULE_BASED', 'HYBRID']),
  domain: z.string(),
  makesDecisions: z.boolean(),
  processesPersonalData: z.boolean(),
  profilesUsers: z.boolean(),
  endUsers: z.array(z.string()),
  markets: z.array(z.string()),
  additionalContext: z.string().optional(),
});

export type ClassificationInput = z.infer<typeof classificationInputSchema>;

/**
 * Pre-filter result (from rule-based system)
 */
export type PreFilterResult = {
  isDefinitive: boolean;
  riskLevel?: 'UNACCEPTABLE' | 'HIGH' | 'LIMITED' | 'MINIMAL';
  reason?: string;
  skipEUClassification?: boolean;
};
