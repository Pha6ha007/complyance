import type {
  ClassificationInput,
  PreFilterResult,
} from '@/server/ai/schemas/classification-result';

/**
 * High-risk domains that are likely to match Annex III categories
 * These are hints, not definitive classifications
 */
const HIGH_RISK_DOMAINS = [
  'BIOMETRICS',
  'CRITICAL_INFRASTRUCTURE',
  'EDUCATION',
  'EMPLOYMENT',
  'ESSENTIAL_SERVICES',
  'LAW_ENFORCEMENT',
  'MIGRATION',
  'JUSTICE',
  'SOCIAL_SCORING',
] as const;

/**
 * Domains that typically indicate limited risk (transparency only)
 */
const LIMITED_RISK_INDICATORS = [
  'CHATBOT',
  'CONTENT_GENERATION',
  'TRANSLATION',
  'RECOMMENDATION_NON_ESSENTIAL',
] as const;

/**
 * Rule-based pre-filter to catch obvious cases before LLM call
 * Returns definitive classification if rules apply, otherwise undefined
 */
export function preFilterClassification(
  input: ClassificationInput
): PreFilterResult {
  // RULE 1: Profiling ALWAYS triggers high-risk (Article 6.3)
  if (input.profilesUsers === true) {
    return {
      isDefinitive: true,
      riskLevel: 'HIGH',
      reason:
        'Article 6(3): Profiling of natural persons always triggers high-risk classification, no exceptions apply',
    };
  }

  // RULE 2: Social scoring by government/public authorities = UNACCEPTABLE (Article 5)
  if (
    input.domain === 'SOCIAL_SCORING' &&
    input.endUsers.includes('GOVERNMENT')
  ) {
    return {
      isDefinitive: true,
      riskLevel: 'UNACCEPTABLE',
      reason:
        'Article 5: Social scoring by public authorities or on their behalf is a prohibited practice',
    };
  }

  // RULE 3: If markets don't include EU, skip EU AI Act classification
  // (but still classify for other regulations like Colorado, NIST)
  const skipEUClassification = !input.markets.includes('EU');

  // RULE 4: Likely minimal risk (fast path)
  // No decisions, no personal data, no profiling, not in high-risk domain
  if (
    !input.makesDecisions &&
    !input.processesPersonalData &&
    !input.profilesUsers &&
    !HIGH_RISK_DOMAINS.includes(input.domain as any)
  ) {
    return {
      isDefinitive: true,
      riskLevel: 'MINIMAL',
      reason:
        'System does not make decisions, process personal data, or profile users, and is not in a high-risk domain',
      skipEUClassification,
    };
  }

  // RULE 5: Chatbot indicator → likely LIMITED (but let LLM confirm)
  // Not definitive because chatbots CAN be high-risk if they make consequential decisions
  if (LIMITED_RISK_INDICATORS.includes(input.domain as any)) {
    return {
      isDefinitive: false,
      skipEUClassification,
    };
  }

  // RULE 6: High-risk domain indicator → send to LLM with context
  // Not definitive because exceptions may apply
  if (HIGH_RISK_DOMAINS.includes(input.domain as any)) {
    return {
      isDefinitive: false,
      skipEUClassification,
    };
  }

  // Default: inconclusive, send to LLM
  return {
    isDefinitive: false,
    skipEUClassification,
  };
}

/**
 * Check if system matches specific Annex III categories
 * Used as supplementary validation logic
 */
export function matchesAnnexIIICategory(input: ClassificationInput): {
  matches: boolean;
  category?: string;
  subcategory?: string;
} {
  // Biometrics (Annex III §1)
  if (input.domain === 'BIOMETRICS') {
    if (
      input.description.toLowerCase().includes('emotion') ||
      input.description.toLowerCase().includes('sentiment')
    ) {
      return {
        matches: true,
        category: '§1',
        subcategory: 'Emotion recognition',
      };
    }
    if (
      input.description.toLowerCase().includes('identification') ||
      input.description.toLowerCase().includes('verification')
    ) {
      return {
        matches: true,
        category: '§1',
        subcategory: 'Remote biometric identification',
      };
    }
    return { matches: true, category: '§1', subcategory: 'Biometrics' };
  }

  // Employment & Worker Management (Annex III §4)
  if (input.domain === 'EMPLOYMENT') {
    const desc = input.description.toLowerCase();
    if (
      desc.includes('recruit') ||
      desc.includes('cv') ||
      desc.includes('resume') ||
      desc.includes('hiring') ||
      desc.includes('candidate')
    ) {
      return {
        matches: true,
        category: '§4',
        subcategory: 'Recruitment and CV screening',
      };
    }
    if (
      desc.includes('performance') ||
      desc.includes('evaluation') ||
      desc.includes('promotion') ||
      desc.includes('termination')
    ) {
      return {
        matches: true,
        category: '§4',
        subcategory: 'Performance evaluation and worker management',
      };
    }
    return {
      matches: true,
      category: '§4',
      subcategory: 'Employment and worker management',
    };
  }

  // Education (Annex III §3)
  if (input.domain === 'EDUCATION') {
    const desc = input.description.toLowerCase();
    if (desc.includes('admission') || desc.includes('access')) {
      return {
        matches: true,
        category: '§3',
        subcategory: 'Determining access or admission to educational institutions',
      };
    }
    if (
      desc.includes('grading') ||
      desc.includes('assessment') ||
      desc.includes('evaluation')
    ) {
      return {
        matches: true,
        category: '§3',
        subcategory: 'Evaluating learning outcomes',
      };
    }
    return { matches: true, category: '§3', subcategory: 'Education' };
  }

  // Essential Services (Annex III §5)
  if (input.domain === 'ESSENTIAL_SERVICES') {
    const desc = input.description.toLowerCase();
    if (desc.includes('credit') || desc.includes('loan')) {
      return {
        matches: true,
        category: '§5',
        subcategory: 'Credit scoring and creditworthiness assessment',
      };
    }
    if (desc.includes('insurance')) {
      return {
        matches: true,
        category: '§5',
        subcategory: 'Life and health insurance risk assessment',
      };
    }
    return { matches: true, category: '§5', subcategory: 'Essential services' };
  }

  // Critical Infrastructure (Annex III §2)
  if (input.domain === 'CRITICAL_INFRASTRUCTURE') {
    return {
      matches: true,
      category: '§2',
      subcategory: 'Safety components in critical infrastructure',
    };
  }

  // Law Enforcement (Annex III §6)
  if (input.domain === 'LAW_ENFORCEMENT') {
    return {
      matches: true,
      category: '§6',
      subcategory: 'Law enforcement',
    };
  }

  // Migration, Asylum, Border Control (Annex III §7)
  if (input.domain === 'MIGRATION') {
    return {
      matches: true,
      category: '§7',
      subcategory: 'Migration, asylum, and border control',
    };
  }

  // Justice & Democratic Processes (Annex III §8)
  if (input.domain === 'JUSTICE') {
    return {
      matches: true,
      category: '§8',
      subcategory: 'Administration of justice and democratic processes',
    };
  }

  return { matches: false };
}
