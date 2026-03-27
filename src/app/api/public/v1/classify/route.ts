import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { preFilterClassification, matchesAnnexIIICategory } from '@/server/services/classification/rules';
import type { ClassificationInput } from '@/server/ai/schemas/classification-result';
import { classifyLimiter, getClientIp } from '@/lib/rate-limit';

// Input validation schema
const classifyRequestSchema = z.object({
  description: z.string().min(10).max(5000),
  aiType: z.enum(['ML_MODEL', 'LLM', 'RULE_BASED', 'HYBRID']),
  domain: z.string().min(1).max(100),
  makesDecisions: z.boolean(),
  processesPersonalData: z.boolean(),
  profilesUsers: z.boolean(),
  endUsers: z.array(z.string()).min(1).max(10),
  markets: z.array(z.string()).min(1).max(10),
});

// Obligations per risk level
const HIGH_RISK_OBLIGATIONS = [
  'Article 9: Establish a risk management system',
  'Article 10: Ensure data governance and quality',
  'Article 11: Maintain technical documentation',
  'Article 12: Implement record-keeping systems',
  'Article 13: Ensure transparency for users',
  'Article 14: Enable human oversight measures',
  'Article 15: Ensure accuracy, robustness, and cybersecurity',
];

const LIMITED_RISK_OBLIGATIONS = [
  'Article 50: Transparency obligations - Users must be informed they are interacting with an AI system',
];

// Domain to Annex III category mapping
const DOMAIN_TO_ANNEX_CATEGORY: Record<string, { category: string; name: string }> = {
  HR: { category: '§4', name: 'Employment and Worker Management' },
  EDUCATION: { category: '§3', name: 'Education and Vocational Training' },
  FINANCE: { category: '§5', name: 'Access to Essential Services' },
  HEALTHCARE: { category: '§5', name: 'Access to Essential Services' },
  SECURITY: { category: '§1', name: 'Biometrics' },
};

export async function POST(request: NextRequest) {
  // Rate limit: 10 requests per hour per IP
  const ip = getClientIp(request);
  const rateLimit = classifyLimiter.check(ip);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded. Please try again later.',
        resetAt: new Date(rateLimit.resetAt).toISOString(),
      },
      {
        status: 429,
        headers: classifyLimiter.headers(rateLimit),
      }
    );
  }

  try {
    const body = await request.json();

    // Validate input
    const parseResult = classifyRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: parseResult.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const input = parseResult.data;

    // Build classification input
    const classificationInput: ClassificationInput = {
      name: 'Public Classification',
      description: input.description,
      aiType: input.aiType,
      domain: input.domain,
      makesDecisions: input.makesDecisions,
      processesPersonalData: input.processesPersonalData,
      profilesUsers: input.profilesUsers,
      endUsers: input.endUsers,
      markets: input.markets,
    };

    // Run rule-based classification (no LLM for free tier)
    const preFilterResult = preFilterClassification(classificationInput);
    const annexMatch = matchesAnnexIIICategory(classificationInput);

    // Determine risk level and reasoning
    let riskLevel: 'UNACCEPTABLE' | 'HIGH' | 'LIMITED' | 'MINIMAL';
    let reasoning: string;
    let annexIIICategory: string | null = null;
    let obligations: string[] = [];

    if (preFilterResult.isDefinitive && preFilterResult.riskLevel) {
      // Rule-based classification was definitive
      riskLevel = preFilterResult.riskLevel;
      reasoning = preFilterResult.reason || '';
    } else {
      // Apply heuristic classification
      riskLevel = determineRiskLevel(input, annexMatch);
      reasoning = generateReasoning(input, riskLevel, annexMatch);
    }

    // Set Annex III category for HIGH risk
    if (riskLevel === 'HIGH' || riskLevel === 'UNACCEPTABLE') {
      if (annexMatch.matches && annexMatch.category) {
        annexIIICategory = `Annex III ${annexMatch.category}: ${annexMatch.subcategory || 'General'}`;
      } else if (DOMAIN_TO_ANNEX_CATEGORY[input.domain]) {
        const mapping = DOMAIN_TO_ANNEX_CATEGORY[input.domain];
        annexIIICategory = `Annex III ${mapping.category}: ${mapping.name}`;
      }
    }

    // Set obligations based on risk level
    if (riskLevel === 'HIGH') {
      obligations = HIGH_RISK_OBLIGATIONS;
    } else if (riskLevel === 'LIMITED') {
      obligations = LIMITED_RISK_OBLIGATIONS;
    } else if (riskLevel === 'UNACCEPTABLE') {
      obligations = ['This AI system is prohibited under Article 5 of the EU AI Act.'];
    }

    // Return result
    return NextResponse.json(
      {
        riskLevel,
        reasoning,
        annexIIICategory,
        obligations,
      },
      {
        headers: classifyLimiter.headers(rateLimit),
      }
    );
  } catch (error) {
    console.error('Classification error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

function determineRiskLevel(
  input: z.infer<typeof classifyRequestSchema>,
  annexMatch: { matches: boolean; category?: string; subcategory?: string }
): 'UNACCEPTABLE' | 'HIGH' | 'LIMITED' | 'MINIMAL' {
  // RULE: Profiling always triggers HIGH risk (Article 6.3)
  if (input.profilesUsers) {
    return 'HIGH';
  }

  // RULE: Social scoring + government = UNACCEPTABLE
  if (input.domain === 'SOCIAL_SCORING' && input.endUsers.includes('GOVERNMENT')) {
    return 'UNACCEPTABLE';
  }

  // RULE: High-risk domains with decision-making
  const highRiskDomains = ['HR', 'EDUCATION', 'HEALTHCARE', 'FINANCE', 'SECURITY'];
  if (highRiskDomains.includes(input.domain) && input.makesDecisions) {
    return 'HIGH';
  }

  // RULE: Annex III category match
  if (annexMatch.matches) {
    return 'HIGH';
  }

  // RULE: Makes decisions about people with personal data
  if (input.makesDecisions && input.processesPersonalData) {
    // Could be HIGH depending on impact, but we'll conservatively say LIMITED
    // Full LLM classification would determine this more accurately
    return 'LIMITED';
  }

  // RULE: Chatbots and recommendation systems = LIMITED (transparency only)
  if (['CHATBOT', 'RECOMMENDATIONS'].includes(input.domain)) {
    return 'LIMITED';
  }

  // RULE: No decisions, no personal data = MINIMAL
  if (!input.makesDecisions && !input.processesPersonalData && !input.profilesUsers) {
    return 'MINIMAL';
  }

  // Default to LIMITED for safety
  return 'LIMITED';
}

function generateReasoning(
  input: z.infer<typeof classifyRequestSchema>,
  riskLevel: 'UNACCEPTABLE' | 'HIGH' | 'LIMITED' | 'MINIMAL',
  annexMatch: { matches: boolean; category?: string; subcategory?: string }
): string {
  const parts: string[] = [];

  // EU market check
  if (!input.markets.includes('EU')) {
    parts.push('Your system does not target the EU market, but this classification follows EU AI Act criteria for reference.');
  }

  switch (riskLevel) {
    case 'UNACCEPTABLE':
      parts.push('This AI system falls under prohibited practices (Article 5) and cannot be deployed in the EU.');
      break;

    case 'HIGH':
      if (input.profilesUsers) {
        parts.push('Your system profiles natural persons, which triggers high-risk classification under Article 6(3) of the EU AI Act. No exceptions apply to profiling.');
      }
      if (annexMatch.matches && annexMatch.category) {
        parts.push(`The system matches Annex III category ${annexMatch.category} (${annexMatch.subcategory || 'General'}).`);
      }
      if (['HR', 'EDUCATION'].includes(input.domain)) {
        parts.push(`AI systems in the ${input.domain.toLowerCase()} domain that make decisions affecting people are classified as high-risk under Annex III.`);
      }
      parts.push('As a high-risk AI system, you must comply with Articles 9-15 before August 2, 2026.');
      break;

    case 'LIMITED':
      parts.push('Your system requires transparency obligations under Article 50.');
      if (input.domain === 'CHATBOT') {
        parts.push('Users must be clearly informed they are interacting with an AI system.');
      }
      if (input.makesDecisions && input.processesPersonalData) {
        parts.push('Consider whether decisions significantly impact individuals, which may elevate risk level. A full assessment is recommended.');
      }
      break;

    case 'MINIMAL':
      parts.push('Your system does not appear to fall under high-risk categories and has no specific compliance obligations under the EU AI Act.');
      parts.push('However, voluntary codes of conduct and best practices are encouraged.');
      break;
  }

  return parts.join(' ');
}
