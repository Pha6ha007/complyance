import { z } from 'zod';
import { AIType } from '@prisma/client';

export const detectedRiskSchema = z.object({
  category: z.string(), // "PROFILING", "PERSONAL_DATA", "AUTOMATED_DECISIONS"
  description: z.string(), // What was found
  sourceFile: z.string(), // Which document
  quote: z.string(), // Exact text from document
  severity: z.enum(['HIGH', 'MEDIUM', 'LOW']),
});

export const extractedQuoteSchema = z.object({
  text: z.string(), // Exact quote from document
  sourceFile: z.string(),
  relevance: z.string(), // Why this quote matters for classification
});

export const documentAnalysisResultSchema = z.object({
  systemName: z.string().nullable(),
  description: z.string().nullable(),
  aiType: z.nativeEnum(AIType).nullable(), // ML_MODEL, LLM, RULE_BASED, HYBRID
  domain: z.string().nullable(), // HR, FINANCE, HEALTHCARE, etc.
  makesDecisions: z.boolean().nullable(),
  processesPersonalData: z.boolean().nullable(),
  profilesUsers: z.boolean().nullable(),
  endUsers: z.array(z.string()), // B2C, B2B, EMPLOYEES, GOVERNMENT
  markets: z.array(z.string()), // EU, US, UAE
  detectedRisks: z.array(detectedRiskSchema),
  extractedQuotes: z.array(extractedQuoteSchema),
  confidence: z.number().min(0).max(1), // 0-1 how confident the analysis is
});

export type DetectedRisk = z.infer<typeof detectedRiskSchema>;
export type ExtractedQuote = z.infer<typeof extractedQuoteSchema>;
export type DocumentAnalysisResult = z.infer<typeof documentAnalysisResultSchema>;
