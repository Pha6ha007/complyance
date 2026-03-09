import type { ClassificationResult } from '@/server/ai/schemas/classification-result';
import type { Priority } from '@prisma/client';

/**
 * Compliance gap definition (before DB save)
 */
export type ComplianceGapInput = {
  article: string;
  requirement: string;
  priority: Priority;
  notes?: string;
};

/**
 * Generate compliance gaps based on classification result
 * These are the requirements the system must fulfill
 */
export function generateComplianceGaps(
  classification: ClassificationResult
): ComplianceGapInput[] {
  const gaps: ComplianceGapInput[] = [];

  switch (classification.riskLevel) {
    case 'UNACCEPTABLE':
      // Prohibited system - no compliance path, deployment is not allowed
      gaps.push({
        article: 'Article 5',
        requirement:
          'PROHIBITED SYSTEM: This AI system cannot be deployed in the EU. Article 5 prohibits this use case.',
        priority: 'CRITICAL',
        notes:
          'Deployment of this system in the EU is prohibited. Consider alternative approaches or restrict deployment to non-EU markets.',
      });
      break;

    case 'HIGH':
      // High-risk systems must comply with full EU AI Act requirements
      gaps.push(
        {
          article: 'Article 9',
          requirement:
            'Establish and maintain a Risk Management System throughout the AI system lifecycle',
          priority: 'CRITICAL',
          notes:
            'Must include: risk identification, estimation and evaluation of risks, risk mitigation measures, testing, and post-market monitoring integration.',
        },
        {
          article: 'Article 10',
          requirement:
            'Implement Data Governance and Data Management practices',
          priority: 'CRITICAL',
          notes:
            'Training, validation, and testing datasets must be relevant, representative, free of errors, and complete. Must have measures to detect bias.',
        },
        {
          article: 'Article 11',
          requirement:
            'Prepare Technical Documentation in accordance with Annex IV',
          priority: 'CRITICAL',
          notes:
            'Must include: general description, detailed description of system elements, monitoring/logging, validation/testing procedures, and cybersecurity measures.',
        },
        {
          article: 'Article 12',
          requirement:
            'Implement automatic recording of events (logs) throughout the system lifecycle',
          priority: 'HIGH',
          notes:
            'Logging capabilities must enable traceability of system functioning, detect potential risks, and facilitate post-market monitoring.',
        },
        {
          article: 'Article 13',
          requirement:
            'Ensure transparency and provide information to deployers',
          priority: 'HIGH',
          notes:
            'Instructions for use must include: intended purpose, level of accuracy/robustness, known limitations, human oversight measures, expected lifetime.',
        },
        {
          article: 'Article 14',
          requirement:
            'Design the system to enable effective human oversight',
          priority: 'HIGH',
          notes:
            'Must enable individuals to: understand system capabilities, be aware of automation bias, interpret outputs, and decide when not to use or override the system.',
        },
        {
          article: 'Article 15',
          requirement:
            'Ensure appropriate levels of accuracy, robustness, and cybersecurity',
          priority: 'HIGH',
          notes:
            'System must be resilient against errors, faults, inconsistencies, and attempts to manipulate datasets or system behavior.',
        },
        {
          article: 'Article 16',
          requirement: 'Implement Quality Management System',
          priority: 'MEDIUM',
          notes:
            'Systematic approach to ensure compliance with EU AI Act. Can be integrated with existing ISO 9001 or similar systems.',
        },
        {
          article: 'Article 47',
          requirement: 'Draw up EU Declaration of Conformity',
          priority: 'CRITICAL',
          notes:
            'Formal declaration that the AI system complies with all EU AI Act requirements. Required before placing on EU market.',
        },
        {
          article: 'Article 49',
          requirement: 'Register system in EU Database for High-Risk AI',
          priority: 'CRITICAL',
          notes:
            'Providers must register high-risk AI systems in the EU database before placing on the market. Database managed by European Commission.',
        },
        {
          article: 'Article 61',
          requirement:
            'Implement Post-Market Monitoring System and report serious incidents',
          priority: 'MEDIUM',
          notes:
            'Active and systematic collection and review of data on performance throughout system lifetime. Report serious incidents within 15 days.',
        }
      );

      // Add specific gaps based on Annex III category
      if (classification.annexIIICategory) {
        switch (classification.annexIIICategory) {
          case '§1': // Biometrics
            gaps.push({
              article: 'Annex III §1',
              requirement:
                'Comply with biometric data processing requirements under GDPR Article 9',
              priority: 'CRITICAL',
              notes:
                'Biometric data is special category data under GDPR. Must have explicit legal basis and additional safeguards.',
            });
            break;

          case '§4': // Employment
            gaps.push({
              article: 'Annex III §4',
              requirement:
                'Ensure transparency to candidates and workers about AI-assisted decision-making',
              priority: 'HIGH',
              notes:
                'Workers/candidates must be informed about use of AI in employment decisions. Consider also NYC Local Law 144 if operating in NYC.',
            });
            break;

          case '§5': // Essential Services
            if (
              classification.annexIIISubcategory?.toLowerCase().includes('credit')
            ) {
              gaps.push({
                article: 'Annex III §5',
                requirement:
                  'Comply with consumer credit regulations and provide explanations for credit decisions',
                priority: 'CRITICAL',
                notes:
                  'Must comply with Consumer Credit Directive. Ensure GDPR Article 22 right to explanation is implemented.',
              });
            }
            break;
        }
      }
      break;

    case 'LIMITED':
      // Limited risk - transparency obligations only (Article 50)
      for (const obligation of classification.transparencyObligations) {
        gaps.push({
          article: 'Article 50',
          requirement: obligation,
          priority: 'MEDIUM',
          notes:
            'Transparency obligation under Article 50. Failure to comply can result in fines up to €15M or 3% of global turnover.',
        });
      }

      // If no specific obligations were listed, add generic one
      if (classification.transparencyObligations.length === 0) {
        gaps.push({
          article: 'Article 50',
          requirement:
            'Inform users that they are interacting with an AI system (unless obvious from context)',
          priority: 'MEDIUM',
          notes:
            'Users must be clearly informed they are interacting with AI. Design interface to make this clear.',
        });
      }
      break;

    case 'MINIMAL':
      // Minimal risk - no specific EU AI Act obligations
      // But we add a best practice gap
      gaps.push({
        article: 'Best Practice',
        requirement:
          'Consider voluntary Code of Conduct and AI transparency measures',
        priority: 'LOW',
        notes:
          'While not legally required, adopting transparency best practices can build user trust and prepare for potential future regulations.',
      });
      break;
  }

  // Add GDPR-specific gaps if processing personal data
  // (This is mentioned in CLAUDE.md for future GDPR-AI module, adding basic version here)
  if (
    classification.riskLevel === 'HIGH' &&
    classification.reasoning.toLowerCase().includes('personal data')
  ) {
    gaps.push({
      article: 'GDPR Article 35',
      requirement:
        'Conduct Data Protection Impact Assessment (DPIA) for high-risk AI processing',
      priority: 'CRITICAL',
      notes:
        'GDPR requires DPIA for high-risk automated decision-making. This is separate from but complementary to EU AI Act requirements.',
    });
  }

  return gaps;
}

/**
 * Calculate compliance score based on gap completion status
 * Formula from AI_ENGINE.md
 */
export function calculateComplianceScore(
  gaps: Array<{
    priority: Priority;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  }>
): number {
  if (gaps.length === 0) return 100;

  const weights: Record<Priority, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  const statusMultiplier: Record<
    'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED',
    number
  > = {
    COMPLETED: 1,
    IN_PROGRESS: 0.5,
    NOT_STARTED: 0,
  };

  let totalWeight = 0;
  let achievedWeight = 0;

  for (const gap of gaps) {
    const weight = weights[gap.priority];
    totalWeight += weight;
    achievedWeight += weight * statusMultiplier[gap.status];
  }

  return Math.round((achievedWeight / totalWeight) * 100);
}

/**
 * Get recommended timeline for gap completion based on priority and risk level
 */
export function getRecommendedTimeline(
  priority: Priority,
  riskLevel: 'UNACCEPTABLE' | 'HIGH' | 'LIMITED' | 'MINIMAL'
): string {
  if (riskLevel === 'UNACCEPTABLE') {
    return 'Immediate - deployment must be halted';
  }

  if (riskLevel === 'HIGH') {
    switch (priority) {
      case 'CRITICAL':
        return 'Before EU market deployment (required)';
      case 'HIGH':
        return 'Within 1-2 months of deployment';
      case 'MEDIUM':
        return 'Within 3-6 months of deployment';
      case 'LOW':
        return 'Within 12 months';
    }
  }

  if (riskLevel === 'LIMITED') {
    return 'Before public deployment (transparency required)';
  }

  return 'Optional - no regulatory deadline';
}
