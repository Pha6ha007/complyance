import { VendorRisk } from '@prisma/client';

/**
 * Vendor risk assessment input
 */
export interface VendorAssessmentInput {
  dataUsedForTraining: boolean | null;
  dataProcessingLocation: string | null;
  hasDPA: boolean;
  hasModelCard: boolean;
  supportsAIAct: boolean | null;
  usesSubprocessors: boolean;
  subprocessorsDocumented: boolean;
}

/**
 * Markets context for assessment
 */
export interface MarketsContext {
  markets: string[]; // ["EU", "US", "UAE"]
}

/**
 * Vendor risk score result
 */
export interface VendorRiskScoreResult {
  score: number; // 0-100
  riskLevel: VendorRisk;
  riskFactors: RiskFactor[];
}

/**
 * Individual risk factor with deduction details
 */
export interface RiskFactor {
  factor: string;
  deduction: number;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Optional MCP trust score input. When the vendor relies on MCP servers
 * (e.g. an Anthropic-based agent that uses filesystem/github/slack tools),
 * the caller may pass an enrichment result from `enrichVendorWithMCPTrust`
 * here. A low average MCP trust score (< 50) becomes an additional
 * supply-chain risk factor.
 */
export interface MCPRiskInput {
  /** Average trust score 0-100 across the vendor's MCP servers. */
  avgTrustScore: number;
  /** Number of MCP servers contributing to the average. */
  serverCount: number;
}

/**
 * Calculate vendor risk score based on vendor attributes and target markets
 *
 * Score starts at 100 and deductions are applied based on risk factors.
 * Lower score = higher risk
 *
 * Risk levels:
 * - 80-100: LOW
 * - 60-79: MEDIUM
 * - 40-59: HIGH
 * - 0-39: CRITICAL
 *
 * @param vendor   Vendor attributes (DPA, training data, etc.)
 * @param context  Markets context (where the org sells)
 * @param mcp      Optional MCP trust score enrichment from TraceHawk
 */
export function calculateVendorRiskScore(
  vendor: VendorAssessmentInput,
  context: MarketsContext,
  mcp?: MCPRiskInput | null
): VendorRiskScoreResult {
  let score = 100;
  const riskFactors: RiskFactor[] = [];

  // Data training risk - major concern for AI Act compliance
  if (vendor.dataUsedForTraining === true) {
    score -= 25;
    riskFactors.push({
      factor: 'DATA_USED_FOR_TRAINING',
      deduction: 25,
      description:
        'Vendor uses customer data for model training, posing data sovereignty and GDPR risks',
      severity: 'CRITICAL',
    });
  }

  // Data processing location vs target markets
  if (
    vendor.dataProcessingLocation === 'US' &&
    context.markets.includes('EU')
  ) {
    score -= 15;
    riskFactors.push({
      factor: 'US_PROCESSING_EU_MARKET',
      deduction: 15,
      description:
        'Data processed in US while selling to EU market - potential GDPR/AI Act conflict',
      severity: 'HIGH',
    });
  }

  // Unknown data processing location
  if (vendor.dataProcessingLocation === null) {
    score -= 20;
    riskFactors.push({
      factor: 'UNKNOWN_DATA_LOCATION',
      deduction: 20,
      description:
        'Data processing location unknown - cannot assess data sovereignty compliance',
      severity: 'HIGH',
    });
  }

  // No Data Processing Agreement
  if (!vendor.hasDPA) {
    score -= 20;
    riskFactors.push({
      factor: 'NO_DPA',
      deduction: 20,
      description:
        'No Data Processing Agreement in place - required for GDPR compliance',
      severity: 'HIGH',
    });
  }

  // No Model Card - transparency concern
  if (!vendor.hasModelCard) {
    score -= 10;
    riskFactors.push({
      factor: 'NO_MODEL_CARD',
      deduction: 10,
      description:
        'No model card available - limits transparency and bias assessment',
      severity: 'MEDIUM',
    });
  }

  // AI Act support
  if (vendor.supportsAIAct === false) {
    score -= 10;
    riskFactors.push({
      factor: 'NO_AI_ACT_SUPPORT',
      deduction: 10,
      description:
        'Vendor explicitly does not support EU AI Act compliance requirements',
      severity: 'HIGH',
    });
  } else if (vendor.supportsAIAct === null) {
    score -= 5;
    riskFactors.push({
      factor: 'UNKNOWN_AI_ACT_SUPPORT',
      deduction: 5,
      description:
        'AI Act support status unknown - clarification needed for compliance',
      severity: 'LOW',
    });
  }

  // Subprocessors risk
  if (vendor.usesSubprocessors && !vendor.subprocessorsDocumented) {
    score -= 15;
    riskFactors.push({
      factor: 'UNDOCUMENTED_SUBPROCESSORS',
      deduction: 15,
      description:
        'Vendor uses subprocessors but they are not documented - supply chain risk',
      severity: 'HIGH',
    });
  }

  // MCP trust score (optional, from TraceHawk public API).
  // Only apply if at least one MCP server was successfully scored — a
  // skipped/failed enrichment must not penalize the vendor.
  if (mcp && mcp.serverCount > 0 && mcp.avgTrustScore > 0) {
    if (mcp.avgTrustScore < 50) {
      // Severe: < 50 means majority of MCP servers are untrusted.
      score -= 15;
      riskFactors.push({
        factor: 'LOW_MCP_TRUST_SCORE',
        deduction: 15,
        description: `MCP servers used by this vendor average a trust score of ${mcp.avgTrustScore}/100 (below 50). Investigate before deploying in high-risk systems.`,
        severity: 'HIGH',
      });
    } else if (mcp.avgTrustScore < 70) {
      // Moderate: 50-69 is "watch this".
      score -= 5;
      riskFactors.push({
        factor: 'MODERATE_MCP_TRUST_SCORE',
        deduction: 5,
        description: `MCP servers used by this vendor average a trust score of ${mcp.avgTrustScore}/100. Monitor for changes.`,
        severity: 'MEDIUM',
      });
    }
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  // Determine risk level based on score
  const riskLevel = getRiskLevelFromScore(score);

  return {
    score,
    riskLevel,
    riskFactors,
  };
}

/**
 * Convert numeric score to risk level
 */
export function getRiskLevelFromScore(score: number): VendorRisk {
  if (score >= 80) return VendorRisk.LOW;
  if (score >= 60) return VendorRisk.MEDIUM;
  if (score >= 40) return VendorRisk.HIGH;
  return VendorRisk.CRITICAL;
}

/**
 * Get risk level color for UI display
 */
export function getRiskLevelColor(riskLevel: VendorRisk): string {
  switch (riskLevel) {
    case VendorRisk.LOW:
      return 'green';
    case VendorRisk.MEDIUM:
      return 'yellow';
    case VendorRisk.HIGH:
      return 'orange';
    case VendorRisk.CRITICAL:
      return 'red';
    default:
      return 'gray';
  }
}

/**
 * Get human-readable description for risk level
 */
export function getRiskLevelDescription(riskLevel: VendorRisk): string {
  switch (riskLevel) {
    case VendorRisk.LOW:
      return 'Low risk - vendor meets most compliance requirements';
    case VendorRisk.MEDIUM:
      return 'Medium risk - some compliance gaps need attention';
    case VendorRisk.HIGH:
      return 'High risk - significant compliance concerns require immediate action';
    case VendorRisk.CRITICAL:
      return 'Critical risk - vendor may not be suitable for regulated AI systems';
    default:
      return 'Unknown risk level';
  }
}
