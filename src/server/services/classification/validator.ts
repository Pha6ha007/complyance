import type {
  ClassificationInput,
  ClassificationResult,
} from '@/server/ai/schemas/classification-result';

/**
 * Valid Annex III categories
 */
const VALID_ANNEX_III_CATEGORIES = [
  '§1',
  '§2',
  '§3',
  '§4',
  '§5',
  '§6',
  '§7',
  '§8',
] as const;

/**
 * Valid risk levels
 */
const VALID_RISK_LEVELS = [
  'UNACCEPTABLE',
  'HIGH',
  'LIMITED',
  'MINIMAL',
] as const;

/**
 * Result of validation with any modifications applied
 */
export type ValidationResult = {
  result: ClassificationResult;
  flaggedForReview: boolean;
  validationWarnings: string[];
};

/**
 * Validate and potentially override LLM classification result
 * Applies hard rules that must always be enforced
 */
export function validateClassification(
  input: ClassificationInput,
  llmResult: ClassificationResult
): ValidationResult {
  const warnings: string[] = [];
  let flagged = false;
  let result = { ...llmResult };

  // VALIDATION 1: Check riskLevel is valid
  if (!VALID_RISK_LEVELS.includes(result.riskLevel)) {
    warnings.push(
      `Invalid risk level from LLM: ${result.riskLevel}. This should not happen.`
    );
    flagged = true;
  }

  // VALIDATION 2: If HIGH, must have annexIIICategory
  if (result.riskLevel === 'HIGH' && !result.annexIIICategory) {
    warnings.push(
      'HIGH risk classification without Annex III category. Attempting to infer from reasoning.'
    );

    // Try to infer from reasoning
    const reasoning = result.reasoning.toLowerCase();
    for (const category of VALID_ANNEX_III_CATEGORIES) {
      if (reasoning.includes(category.toLowerCase())) {
        result.annexIIICategory = category;
        warnings.push(`Inferred Annex III category: ${category}`);
        break;
      }
    }

    // If still no category, flag for review
    if (!result.annexIIICategory) {
      flagged = true;
      warnings.push(
        'Could not infer Annex III category - system flagged for manual review'
      );
    }
  }

  // VALIDATION 3: CRITICAL - Profiling = always HIGH
  if (
    input.profilesUsers &&
    result.riskLevel !== 'HIGH' &&
    result.riskLevel !== 'UNACCEPTABLE'
  ) {
    warnings.push(
      `OVERRIDE: LLM classified as ${result.riskLevel} but system profiles users. Article 6(3) mandates HIGH risk.`
    );
    result.riskLevel = 'HIGH';
    result.reasoning +=
      ' [VALIDATION OVERRIDE: Profiling of natural persons detected. Article 6(3) explicitly states that profiling always triggers high-risk classification with no exceptions.]';

    // If no Annex III category set, this is an error
    if (!result.annexIIICategory) {
      warnings.push(
        'Profiling detected but no Annex III category. Manual review required.'
      );
      flagged = true;
    }
  }

  // VALIDATION 4: Validate annexIIICategory format if present
  if (
    result.annexIIICategory &&
    !VALID_ANNEX_III_CATEGORIES.includes(result.annexIIICategory as any)
  ) {
    warnings.push(
      `Invalid Annex III category format: ${result.annexIIICategory}`
    );
    flagged = true;
  }

  // VALIDATION 5: If annexIIICategory is set but risk is not HIGH, something is wrong
  if (
    result.annexIIICategory &&
    result.riskLevel !== 'HIGH' &&
    result.riskLevel !== 'UNACCEPTABLE'
  ) {
    warnings.push(
      `Annex III category ${result.annexIIICategory} specified but risk level is ${result.riskLevel}. This suggests an exception was applied.`
    );

    // Check if exception is properly documented
    if (!result.exceptionApplies || !result.exceptionReason) {
      warnings.push(
        'Exception appears to apply but is not properly documented. Flagging for review.'
      );
      flagged = true;
    }
  }

  // VALIDATION 6: Low confidence → flag for manual review
  if (result.confidenceScore < 0.7) {
    warnings.push(
      `Low confidence score (${result.confidenceScore}). Flagging for manual review.`
    );
    flagged = true;
  }

  // VALIDATION 7: UNACCEPTABLE risk requires clear reasoning
  if (result.riskLevel === 'UNACCEPTABLE') {
    if (
      !result.reasoning.toLowerCase().includes('article 5') &&
      !result.reasoning.toLowerCase().includes('prohibited')
    ) {
      warnings.push(
        'UNACCEPTABLE risk without clear Article 5 reference in reasoning'
      );
      flagged = true;
    }
  }

  // VALIDATION 8: Transparency obligations consistency
  if (
    result.riskLevel === 'LIMITED' &&
    result.transparencyObligations.length === 0
  ) {
    warnings.push(
      'LIMITED risk should have transparency obligations (Article 50)'
    );
    flagged = true;
  }

  // VALIDATION 9: Exception logic validation
  if (result.exceptionApplies) {
    if (input.profilesUsers) {
      warnings.push(
        'CRITICAL: Exception applied despite profiling. This violates Article 6(3). Overriding to HIGH risk.'
      );
      result.riskLevel = 'HIGH';
      result.exceptionApplies = false;
      result.exceptionReason = null;
      result.reasoning +=
        ' [VALIDATION OVERRIDE: Exception cannot apply when profiling is involved per Article 6(3)]';
      flagged = true;
    }

    if (!result.exceptionReason) {
      warnings.push('Exception marked as applies but no reason provided');
      flagged = true;
    }
  }

  // VALIDATION 10: Provider/Deployer should be set
  if (!result.providerOrDeployer) {
    warnings.push('Provider/Deployer status not set');
    result.providerOrDeployer = 'BOTH'; // Default assumption
  }

  // VALIDATION 11: Cross-check domain with Annex III category
  if (result.annexIIICategory && result.riskLevel === 'HIGH') {
    const domainCategoryMapping: Record<
      string,
      string[]
    > = {
      BIOMETRICS: ['§1'],
      CRITICAL_INFRASTRUCTURE: ['§2'],
      EDUCATION: ['§3'],
      EMPLOYMENT: ['§4'],
      ESSENTIAL_SERVICES: ['§5'],
      LAW_ENFORCEMENT: ['§6'],
      MIGRATION: ['§7'],
      JUSTICE: ['§8'],
    };

    const expectedCategories = domainCategoryMapping[input.domain];
    if (
      expectedCategories &&
      !expectedCategories.includes(result.annexIIICategory)
    ) {
      warnings.push(
        `Domain ${input.domain} classified as ${result.annexIIICategory}. Verify this is correct.`
      );
      // Not necessarily wrong (LLM might have good reason), but worth flagging
      if (result.confidenceScore < 0.85) {
        flagged = true;
      }
    }
  }

  // Log all warnings
  if (warnings.length > 0) {
    console.warn(
      `[Classification Validation] Warnings for ${input.name}:`,
      warnings
    );
  }

  return {
    result,
    flaggedForReview: flagged,
    validationWarnings: warnings,
  };
}

/**
 * Perform additional cross-checks between input and result
 * Returns array of potential issues (not necessarily errors)
 */
export function crossCheckClassification(
  input: ClassificationInput,
  result: ClassificationResult
): string[] {
  const issues: string[] = [];

  // Check 1: If system doesn't make decisions and is HIGH risk, verify reasoning
  if (!input.makesDecisions && result.riskLevel === 'HIGH') {
    if (!result.annexIIICategory) {
      issues.push(
        'System does not make decisions but is HIGH risk without clear Annex III match'
      );
    }
  }

  // Check 2: If no personal data and HIGH risk, should be safety component
  if (!input.processesPersonalData && result.riskLevel === 'HIGH') {
    if (result.annexIIICategory !== '§2') {
      issues.push(
        'HIGH risk without personal data processing should typically be critical infrastructure (§2)'
      );
    }
  }

  // Check 3: B2C or B2B in sensitive domains
  if (
    ['EMPLOYMENT', 'EDUCATION', 'ESSENTIAL_SERVICES'].includes(
      input.domain
    ) &&
    !input.endUsers.includes('B2B') &&
    !input.endUsers.includes('B2C') &&
    !input.endUsers.includes('EMPLOYEES')
  ) {
    issues.push(
      `Sensitive domain (${input.domain}) but end users unclear: ${input.endUsers.join(', ')}`
    );
  }

  // Check 4: EU market and classification
  if (input.markets.includes('EU') && result.riskLevel === 'MINIMAL') {
    // This is fine, but verify it's not just a chatbot that needs LIMITED
    if (
      input.description.toLowerCase().includes('chat') ||
      input.description.toLowerCase().includes('conversation')
    ) {
      issues.push(
        'Chatbot classified as MINIMAL - verify it does not need LIMITED (Article 50) transparency obligations'
      );
    }
  }

  return issues;
}
