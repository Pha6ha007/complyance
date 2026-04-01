import { BadgeLevel, Plan, GapStatus } from '@prisma/client';
import { prisma } from '@/server/db/client';

// Badge level requirements
// NONE: No badge
// AWARE: Free plan, has at least 1 classified system
// READY: Starter plan, compliance score > 0, has gaps in progress
// COMPLIANT: Professional+, compliance score >= 80%

interface OrganizationWithSystems {
  id: string;
  name: string;
  plan: Plan;
  badgeEnabled: boolean;
  badgeLastVerifiedAt: Date | null;
  aiSystems: Array<{
    id: string;
    riskLevel: string | null;
    complianceScore: number | null;
    classifiedAt: Date | null;
    gaps: Array<{
      status: GapStatus;
    }>;
  }>;
}

interface BadgeDeterminationResult {
  level: BadgeLevel;
  isEligible: boolean;
  reason: string;
  nextLevel: BadgeLevel | null;
  nextLevelRequirements: string[];
}

/**
 * Determine the badge level for an organization based on plan and compliance status
 */
export function determineBadgeLevel(org: OrganizationWithSystems): BadgeDeterminationResult {
  // Check if badge is enabled
  if (!org.badgeEnabled) {
    return {
      level: BadgeLevel.NONE,
      isEligible: false,
      reason: 'Badge is disabled for this organization',
      nextLevel: BadgeLevel.AWARE,
      nextLevelRequirements: ['Enable badge in settings'],
    };
  }

  // Count classified systems
  const classifiedSystems = org.aiSystems.filter(
    (system) => system.riskLevel !== null && system.classifiedAt !== null
  );

  // Calculate average compliance score
  const systemsWithScore = org.aiSystems.filter((s) => s.complianceScore !== null);
  const avgComplianceScore =
    systemsWithScore.length > 0
      ? systemsWithScore.reduce((sum, s) => sum + (s.complianceScore || 0), 0) /
        systemsWithScore.length
      : 0;

  // Check for gaps in progress
  const hasGapsInProgress = org.aiSystems.some((system) =>
    system.gaps.some((gap) => gap.status === GapStatus.IN_PROGRESS)
  );

  // Determine badge level based on plan and requirements
  const isPaidPlan = org.plan !== Plan.FREE;
  const professionalPlans: Plan[] = [Plan.PROFESSIONAL, Plan.SCALE, Plan.ENTERPRISE];
  const isProfessionalOrAbove = professionalPlans.includes(org.plan);

  // COMPLIANT: Professional+, compliance score >= 80%
  if (isProfessionalOrAbove && avgComplianceScore >= 80) {
    return {
      level: BadgeLevel.COMPLIANT,
      isEligible: true,
      reason: 'Organization meets all compliance requirements',
      nextLevel: null,
      nextLevelRequirements: [],
    };
  }

  // READY: Starter plan, compliance score > 0, has gaps in progress
  if (
    isPaidPlan &&
    classifiedSystems.length > 0 &&
    avgComplianceScore > 0 &&
    hasGapsInProgress
  ) {
    const nextLevelReqs: string[] = [];
    if (!isProfessionalOrAbove) {
      nextLevelReqs.push('Upgrade to Professional plan');
    }
    if (avgComplianceScore < 80) {
      nextLevelReqs.push(`Increase compliance score to 80% (currently ${Math.round(avgComplianceScore)}%)`);
    }

    return {
      level: BadgeLevel.READY,
      isEligible: true,
      reason: 'Organization is actively working on compliance',
      nextLevel: BadgeLevel.COMPLIANT,
      nextLevelRequirements: nextLevelReqs,
    };
  }

  // AWARE: Has at least 1 classified system
  if (classifiedSystems.length > 0) {
    const nextLevelReqs: string[] = [];
    if (!isPaidPlan) {
      nextLevelReqs.push('Upgrade to Starter plan or above');
    }
    if (avgComplianceScore === 0) {
      nextLevelReqs.push('Start working on compliance gaps');
    }
    if (!hasGapsInProgress) {
      nextLevelReqs.push('Mark at least one gap as "In Progress"');
    }

    return {
      level: BadgeLevel.AWARE,
      isEligible: true,
      reason: 'Organization has classified AI systems',
      nextLevel: BadgeLevel.READY,
      nextLevelRequirements: nextLevelReqs,
    };
  }

  // NONE: No classified systems
  return {
    level: BadgeLevel.NONE,
    isEligible: false,
    reason: 'No classified AI systems',
    nextLevel: BadgeLevel.AWARE,
    nextLevelRequirements: ['Classify at least one AI system'],
  };
}

/**
 * Badge color schemes
 */
const BADGE_COLORS = {
  [BadgeLevel.NONE]: {
    primary: '#9CA3AF', // gray-400
    secondary: '#F3F4F6', // gray-100
    text: '#4B5563', // gray-600
  },
  [BadgeLevel.AWARE]: {
    primary: '#3B82F6', // blue-500
    secondary: '#DBEAFE', // blue-100
    text: '#1E40AF', // blue-800
  },
  [BadgeLevel.READY]: {
    primary: '#F59E0B', // amber-500
    secondary: '#FEF3C7', // amber-100
    text: '#92400E', // amber-800
  },
  [BadgeLevel.COMPLIANT]: {
    primary: '#10B981', // emerald-500
    secondary: '#D1FAE5', // emerald-100
    text: '#065F46', // emerald-800
  },
};

const BADGE_LABELS = {
  [BadgeLevel.NONE]: 'Not Verified',
  [BadgeLevel.AWARE]: 'AI Act Aware',
  [BadgeLevel.READY]: 'AI Act Ready',
  [BadgeLevel.COMPLIANT]: 'AI Act Compliant',
};

/**
 * Generate SVG badge for an organization
 */
export function generateBadgeSVG(
  orgName: string,
  level: BadgeLevel,
  orgId: string,
  verifiedAt?: Date | null
): string {
  const colors = BADGE_COLORS[level];
  const label = BADGE_LABELS[level];
  const verifyUrl = `https://complyance.app/verify/${orgId}`;
  const dateStr = verifiedAt
    ? verifiedAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '';

  // SVG badge design
  return `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="60" viewBox="0 0 180 60">
  <defs>
    <linearGradient id="bg-${orgId}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.secondary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FFFFFF;stop-opacity:1" />
    </linearGradient>
  </defs>
  <a href="${verifyUrl}" target="_blank">
    <rect width="180" height="60" rx="8" fill="url(#bg-${orgId})" stroke="${colors.primary}" stroke-width="1.5"/>
    <rect x="8" y="8" width="8" height="44" rx="4" fill="${colors.primary}"/>
    ${level === BadgeLevel.COMPLIANT ? `
    <circle cx="12" cy="20" r="3" fill="white"/>
    <path d="M10 30 L12 32 L14 28" stroke="white" stroke-width="1.5" fill="none"/>
    ` : level === BadgeLevel.READY ? `
    <circle cx="12" cy="24" r="3" fill="white"/>
    <rect x="10" y="32" width="4" height="8" rx="1" fill="white"/>
    ` : `
    <circle cx="12" cy="20" r="2" fill="white"/>
    <circle cx="12" cy="28" r="2" fill="white"/>
    <circle cx="12" cy="36" r="2" fill="white"/>
    `}
    <text x="24" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="600" fill="${colors.text}">${label}</text>
    <text x="24" y="36" font-family="system-ui, -apple-system, sans-serif" font-size="9" fill="#6B7280">Verified by Complyance</text>
    ${dateStr ? `<text x="24" y="48" font-family="system-ui, -apple-system, sans-serif" font-size="8" fill="#9CA3AF">${dateStr}</text>` : ''}
  </a>
</svg>`;
}

/**
 * Generate HTML embed code for the badge
 */
export function generateBadgeHTML(orgId: string, level: BadgeLevel): string {
  const verifyUrl = `https://complyance.app/verify/${orgId}`;
  const badgeUrl = `https://complyance.app/api/public/v1/badge/${orgId}/svg`;

  return `<!-- Complyance Compliance Badge -->
<a href="${verifyUrl}" target="_blank" rel="noopener noreferrer" title="Verified by Complyance">
  <img src="${badgeUrl}" alt="${BADGE_LABELS[level]}" width="180" height="60" />
</a>`;
}

/**
 * Generate Markdown embed code for the badge
 */
export function generateBadgeMarkdown(orgId: string, level: BadgeLevel): string {
  const verifyUrl = `https://complyance.app/verify/${orgId}`;
  const badgeUrl = `https://complyance.app/api/public/v1/badge/${orgId}/svg`;

  return `[![${BADGE_LABELS[level]}](${badgeUrl})](${verifyUrl})`;
}

/**
 * Update organization badge level in database
 */
export async function updateOrganizationBadge(orgId: string): Promise<BadgeLevel> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      aiSystems: {
        include: {
          gaps: {
            select: { status: true },
          },
        },
      },
    },
  });

  if (!org) {
    throw new Error('Organization not found');
  }

  const result = determineBadgeLevel(org);

  await prisma.organization.update({
    where: { id: orgId },
    data: {
      badgeLevel: result.level,
      badgeLastVerifiedAt: result.isEligible ? new Date() : null,
    },
  });

  return result.level;
}

/**
 * Get badge info for public verification
 */
export async function getBadgeInfo(orgId: string): Promise<{
  orgName: string;
  badgeLevel: BadgeLevel;
  verifiedAt: Date | null;
  isActive: boolean;
} | null> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      name: true,
      badgeLevel: true,
      badgeEnabled: true,
      badgeLastVerifiedAt: true,
      plan: true,
    },
  });

  if (!org) {
    return null;
  }

  // Badge is active if enabled and not NONE
  const isActive = org.badgeEnabled && org.badgeLevel !== BadgeLevel.NONE;

  return {
    orgName: org.name,
    badgeLevel: org.badgeLevel,
    verifiedAt: org.badgeLastVerifiedAt,
    isActive,
  };
}

export { BADGE_LABELS, BADGE_COLORS };
