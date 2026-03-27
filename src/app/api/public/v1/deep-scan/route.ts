import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { classifyLimiter, getClientIp } from '@/lib/rate-limit';

// ---------- Input schema ----------

const deepScanSchema = z.object({
  description: z.string().min(10).max(2000),
  domain: z.string().min(1),
  riskLevel: z.enum(['UNACCEPTABLE', 'HIGH', 'LIMITED', 'MINIMAL']),
});

// ---------- Risk detection keywords ----------

const PROFILING_KEYWORDS = [
  'profile', 'track', 'behavior', 'personaliz', 'segment', 'target',
  'monitor', 'surveillance', 'pattern', 'preference', 'habit',
];

const DECISION_KEYWORDS = [
  'decide', 'decision', 'automat', 'approve', 'reject', 'score',
  'rank', 'select', 'filter', 'eligib', 'assess', 'evaluat',
];

const PII_KEYWORDS = [
  'personal data', 'gdpr', 'email', 'name', 'address', 'biometric',
  'health', 'medical', 'salary', 'financial', 'identity', 'age',
  'gender', 'race', 'ethnic', 'religion', 'disability', 'genetic',
];

const TRANSPARENCY_KEYWORDS = [
  'chatbot', 'conversational', 'generate', 'deepfake', 'synthetic',
  'image generation', 'text generation', 'voice', 'avatar',
];

interface DetectedRisk {
  category: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  article: string;
}

interface ComplianceGap {
  article: string;
  requirement: string;
  status: 'MISSING';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

// ---------- Analysis engine ----------

function detectRisks(description: string, domain: string): DetectedRisk[] {
  const descLower = description.toLowerCase();
  const risks: DetectedRisk[] = [];

  if (PROFILING_KEYWORDS.some((kw) => descLower.includes(kw))) {
    risks.push({
      category: 'PROFILING',
      severity: 'HIGH',
      description: 'System appears to profile or track user behavior — triggers high-risk classification under Article 6(3)',
      article: 'Article 6(3)',
    });
  }

  if (DECISION_KEYWORDS.some((kw) => descLower.includes(kw))) {
    risks.push({
      category: 'AUTOMATED_DECISIONS',
      severity: 'MEDIUM',
      description: 'System may make automated decisions affecting individuals',
      article: 'Annex III',
    });
  }

  if (PII_KEYWORDS.some((kw) => descLower.includes(kw))) {
    risks.push({
      category: 'PERSONAL_DATA',
      severity: 'MEDIUM',
      description: 'System processes personal data — requires data governance measures',
      article: 'Article 10',
    });
  }

  if (TRANSPARENCY_KEYWORDS.some((kw) => descLower.includes(kw))) {
    risks.push({
      category: 'TRANSPARENCY',
      severity: 'LOW',
      description: 'System may generate content or interact with users — requires transparency disclosure',
      article: 'Article 50',
    });
  }

  // Domain-specific risks
  const domainRisks: Record<string, DetectedRisk> = {
    HR: {
      category: 'EMPLOYMENT',
      severity: 'HIGH',
      description: 'AI in employment/HR is high-risk under Annex III §4 — covers recruitment, task allocation, and performance evaluation',
      article: 'Annex III §4',
    },
    EDUCATION: {
      category: 'EDUCATION',
      severity: 'HIGH',
      description: 'AI in education is high-risk under Annex III §3 — covers admissions, assessment, and proctoring',
      article: 'Annex III §3',
    },
    FINANCE: {
      category: 'ESSENTIAL_SERVICES',
      severity: 'HIGH',
      description: 'AI for credit scoring or financial assessment is high-risk under Annex III §5',
      article: 'Annex III §5',
    },
    HEALTHCARE: {
      category: 'ESSENTIAL_SERVICES',
      severity: 'HIGH',
      description: 'AI in healthcare access and triage is high-risk under Annex III §5',
      article: 'Annex III §5',
    },
    SECURITY: {
      category: 'BIOMETRICS',
      severity: 'HIGH',
      description: 'AI for biometric identification is high-risk under Annex III §1',
      article: 'Annex III §1',
    },
  };

  if (domainRisks[domain]) {
    risks.push(domainRisks[domain]);
  }

  return risks;
}

function generateGaps(riskLevel: string, domain: string, detectedRisks: DetectedRisk[]): ComplianceGap[] {
  if (riskLevel === 'UNACCEPTABLE') {
    return [{
      article: 'Article 5',
      requirement: 'This AI practice is prohibited under the EU AI Act',
      status: 'MISSING',
      priority: 'CRITICAL',
    }];
  }

  if (riskLevel === 'HIGH') {
    const gaps: ComplianceGap[] = [
      { article: 'Article 9', requirement: 'Risk Management System — continuous lifecycle process', status: 'MISSING', priority: 'CRITICAL' },
      { article: 'Article 10', requirement: 'Data Governance — training, validation, and testing datasets', status: 'MISSING', priority: 'CRITICAL' },
      { article: 'Article 11', requirement: 'Technical Documentation per Annex IV', status: 'MISSING', priority: 'HIGH' },
      { article: 'Article 12', requirement: 'Record-Keeping — automatic logging of events', status: 'MISSING', priority: 'HIGH' },
      { article: 'Article 13', requirement: 'Transparency — instructions for use for deployers', status: 'MISSING', priority: 'HIGH' },
      { article: 'Article 14', requirement: 'Human Oversight — ability to intervene and override', status: 'MISSING', priority: 'CRITICAL' },
      { article: 'Article 15', requirement: 'Accuracy, Robustness, and Cybersecurity', status: 'MISSING', priority: 'MEDIUM' },
      { article: 'Article 47', requirement: 'EU Declaration of Conformity', status: 'MISSING', priority: 'HIGH' },
    ];

    // Add domain-specific gaps
    if (domain === 'HR') {
      gaps.push({
        article: 'Article 26(5)',
        requirement: 'Inform workers and representatives about high-risk AI in workplace',
        status: 'MISSING',
        priority: 'HIGH',
      });
    }

    if (detectedRisks.some((r) => r.category === 'PERSONAL_DATA')) {
      gaps.push({
        article: 'Article 10(5)',
        requirement: 'Data minimization and purpose limitation for personal data processing',
        status: 'MISSING',
        priority: 'HIGH',
      });
    }

    return gaps;
  }

  if (riskLevel === 'LIMITED') {
    const gaps: ComplianceGap[] = [
      { article: 'Article 50(1)', requirement: 'AI Disclosure — inform users they are interacting with AI', status: 'MISSING', priority: 'HIGH' },
    ];

    if (detectedRisks.some((r) => r.category === 'TRANSPARENCY')) {
      gaps.push({
        article: 'Article 50(2)',
        requirement: 'Label AI-generated content (text, images, audio, video)',
        status: 'MISSING',
        priority: 'MEDIUM',
      });
    }

    if (detectedRisks.some((r) => r.category === 'PERSONAL_DATA')) {
      gaps.push({
        article: 'Article 10',
        requirement: 'Data governance measures for personal data processing',
        status: 'MISSING',
        priority: 'MEDIUM',
      });
    }

    return gaps;
  }

  // MINIMAL — no mandatory gaps
  return [];
}

// ---------- Handler ----------

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rateLimit = classifyLimiter.check(ip);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.', resetAt: new Date(rateLimit.resetAt).toISOString() },
      { status: 429, headers: classifyLimiter.headers(rateLimit) }
    );
  }

  try {
    const body = await request.json();
    const parseResult = deepScanSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parseResult.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })) },
        { status: 400 }
      );
    }

    const { description, domain, riskLevel } = parseResult.data;

    // Detect risks from description + domain
    const detectedRisks = detectRisks(description, domain);

    // Generate compliance gaps
    const complianceGaps = generateGaps(riskLevel, domain, detectedRisks);

    // Calculate compliance score (0 = nothing done, higher gap count = lower score)
    const complianceScore = complianceGaps.length === 0 ? 100 : 0;

    return NextResponse.json(
      {
        success: true,
        result: {
          riskLevel,
          detectedRisks,
          complianceGaps,
          complianceScore,
          confidence: 0.75,
          disclaimer: 'This analysis is for informational purposes only and does not constitute legal advice. Consult qualified legal professionals for compliance decisions.',
        },
        scannedAt: new Date().toISOString(),
      },
      {
        headers: classifyLimiter.headers(rateLimit),
      }
    );
  } catch (error) {
    console.error('Deep scan error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
