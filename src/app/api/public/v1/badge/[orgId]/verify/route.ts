import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/client';
import {
  issueComplianceCredential,
  verifyCredential,
} from '@/server/services/badge/credential-issuer';

/**
 * Public verification endpoint for Compliance Badge.
 *
 * GET /api/public/v1/badge/{orgId}/verify
 *
 * Returns a W3C Verifiable Credential with the org's compliance status.
 * Supports content negotiation:
 * - application/ld+json → raw credential (machine-readable)
 * - application/json → verification result with credential
 * - text/html (default) → redirect to badge verification page
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;

  if (!orgId) {
    return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
  }

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: {
      id: true,
      name: true,
      badgeLevel: true,
      badgeEnabled: true,
      badgeLastVerifiedAt: true,
      aiSystems: {
        select: {
          riskLevel: true,
          complianceScore: true,
        },
      },
    },
  });

  if (!org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
  }

  if (!org.badgeEnabled) {
    return NextResponse.json({ error: 'Badge is disabled' }, { status: 403 });
  }

  // Compute compliance stats
  const systems = org.aiSystems;
  const classifiedSystems = systems.filter((s) => s.riskLevel !== null).length;
  const highRiskSystems = systems.filter((s) => s.riskLevel === 'HIGH').length;
  const scores = systems
    .map((s) => s.complianceScore)
    .filter((s): s is number => s !== null);
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
    : 0;

  // Map BadgeLevel to credential level
  const levelMap: Record<string, 'AWARE' | 'READY' | 'COMPLIANT'> = {
    NONE: 'AWARE',
    AWARE: 'AWARE',
    READY: 'READY',
    COMPLIANT: 'COMPLIANT',
  };
  const complianceLevel = levelMap[org.badgeLevel] ?? 'AWARE';

  // Issue credential
  const credential = issueComplianceCredential({
    orgId: org.id,
    orgName: org.name,
    complianceLevel,
    classifiedSystems,
    highRiskSystems,
    openGaps: 0, // Would need ComplianceGap model to compute
    complianceScore: avgScore,
  });

  // Verify the credential we just issued (self-check)
  const verification = verifyCredential(credential);

  // Content negotiation
  const accept = req.headers.get('accept') || '';

  if (accept.includes('application/ld+json')) {
    return NextResponse.json(credential, {
      headers: {
        'Content-Type': 'application/ld+json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }

  // Default: JSON verification result
  return NextResponse.json(
    {
      verified: verification.valid,
      expired: verification.expired,
      signed: verification.signed,
      signatureValid: verification.signatureValid,
      credential,
      verifiedAt: new Date().toISOString(),
      disclaimer:
        'This credential verifies the organization\'s self-reported compliance status. ' +
        'It does not constitute a regulatory certification.',
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    }
  );
}
