import { z } from 'zod';
import { anthropic } from '@/server/ai/client';
import type { Vendor } from '@prisma/client';

/**
 * AI vendor assessment result schema
 */
export const aiVendorAssessmentResultSchema = z.object({
  riskFactors: z.array(z.string()).describe('List of identified risk factors'),
  mitigationRecommendations: z
    .array(z.string())
    .describe('Recommended actions to mitigate identified risks'),
  complianceSummary: z
    .string()
    .describe('Brief summary of vendor compliance posture'),
});

export type AIVendorAssessmentResult = z.infer<
  typeof aiVendorAssessmentResultSchema
>;

/**
 * System prompt for vendor assessment
 */
const VENDOR_ASSESSMENT_SYSTEM_PROMPT = `You are an AI compliance expert specializing in the EU AI Act, GDPR, and vendor risk assessment.

Your task is to analyze AI vendor information and provide a structured risk assessment focused on:
1. Data protection and sovereignty compliance (GDPR, EU AI Act)
2. AI system transparency requirements (model cards, documentation)
3. Supply chain risks (subprocessors, data flows)
4. Contractual safeguards (DPA, AI Act support)

Be concise and actionable. Focus on practical compliance risks that affect companies using this vendor for AI systems.

Always respond with valid JSON matching this structure:
{
  "riskFactors": ["string array of identified risks"],
  "mitigationRecommendations": ["string array of recommended actions"],
  "complianceSummary": "brief 2-3 sentence summary"
}`;

/**
 * Analyze a vendor using Claude API for detailed compliance assessment
 */
export async function analyzeVendorWithAI(
  vendor: Pick<
    Vendor,
    | 'name'
    | 'vendorType'
    | 'dataUsedForTraining'
    | 'dataProcessingLocation'
    | 'hasDPA'
    | 'hasModelCard'
    | 'supportsAIAct'
    | 'usesSubprocessors'
    | 'subprocessorsDocumented'
    | 'assessmentData'
  >,
  organizationMarkets: string[]
): Promise<AIVendorAssessmentResult> {
  // Build vendor context for analysis
  const vendorContext = buildVendorContext(vendor, organizationMarkets);

  // Call Claude API for analysis
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    temperature: 0, // Deterministic for consistency
    system: VENDOR_ASSESSMENT_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Analyze the following AI vendor for compliance risks:\n\n${vendorContext}`,
      },
    ],
  });

  // Extract text content from response
  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude API');
  }

  // Parse and validate the response
  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in Claude API response');
  }

  try {
    const rawResult = JSON.parse(jsonMatch[0]);
    return aiVendorAssessmentResultSchema.parse(rawResult);
  } catch (error) {
    // Return a fallback result if parsing fails
    console.error('Failed to parse AI assessment result:', error);
    return {
      riskFactors: ['Unable to complete automated assessment'],
      mitigationRecommendations: [
        'Review vendor documentation manually',
        'Contact vendor for compliance clarification',
      ],
      complianceSummary:
        'Automated assessment could not be completed. Manual review recommended.',
    };
  }
}

/**
 * Build context string for vendor analysis
 */
function buildVendorContext(
  vendor: Pick<
    Vendor,
    | 'name'
    | 'vendorType'
    | 'dataUsedForTraining'
    | 'dataProcessingLocation'
    | 'hasDPA'
    | 'hasModelCard'
    | 'supportsAIAct'
    | 'usesSubprocessors'
    | 'subprocessorsDocumented'
    | 'assessmentData'
  >,
  organizationMarkets: string[]
): string {
  const dataTrainingStatus =
    vendor.dataUsedForTraining === null
      ? 'Unknown'
      : vendor.dataUsedForTraining
        ? 'Yes'
        : 'No';

  const aiActStatus =
    vendor.supportsAIAct === null
      ? 'Unknown'
      : vendor.supportsAIAct
        ? 'Yes'
        : 'No';

  let context = `
Vendor Information:
- Name: ${vendor.name}
- Type: ${vendor.vendorType}
- Data Processing Location: ${vendor.dataProcessingLocation || 'Unknown'}
- Data Used for Training: ${dataTrainingStatus}
- Has DPA (Data Processing Agreement): ${vendor.hasDPA ? 'Yes' : 'No'}
- Has Model Card: ${vendor.hasModelCard ? 'Yes' : 'No'}
- Supports EU AI Act: ${aiActStatus}
- Uses Subprocessors: ${vendor.usesSubprocessors ? 'Yes' : 'No'}
- Subprocessors Documented: ${vendor.subprocessorsDocumented ? 'Yes' : 'No'}

Organization Context:
- Target Markets: ${organizationMarkets.join(', ')}
- EU Market: ${organizationMarkets.includes('EU') ? 'Yes (EU AI Act applies)' : 'No'}
- US Market: ${organizationMarkets.includes('US') ? 'Yes' : 'No'}
- UAE Market: ${organizationMarkets.includes('UAE') ? 'Yes' : 'No'}
`;

  // Add any additional assessment data if available
  if (vendor.assessmentData && typeof vendor.assessmentData === 'object') {
    context += `\nAdditional Assessment Data:\n${JSON.stringify(vendor.assessmentData, null, 2)}`;
  }

  return context;
}

/**
 * Check if vendor assessment requires AI analysis
 * (to avoid unnecessary API calls)
 */
export function shouldRunAIAssessment(vendor: Pick<Vendor, 'name'>): boolean {
  // Always run AI assessment for vendors with available data
  // Could add conditions to skip known safe vendors in the future
  return true;
}
