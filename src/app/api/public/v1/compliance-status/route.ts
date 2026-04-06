import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/client';

/**
 * GET /api/public/v1/compliance-status?systemId={id}
 *
 * Returns the current compliance status for a single AI system.
 * Used by TraceHawk (and any other external integration) to display
 * compliance context alongside runtime traces.
 *
 * Auth: Bearer cmp_{api_key} from Organization.apiKey.
 *       The system must belong to the API key's organization.
 *
 * Response: 200 with status payload, or 401/400/404 on error.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const apiKey = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : null;

  if (!apiKey) {
    return jsonError('Missing API key', 401);
  }

  const org = await prisma.organization.findFirst({
    where: { apiKey },
    select: { id: true, badgeLevel: true, badgeLastVerifiedAt: true },
  });

  if (!org) {
    return jsonError('Invalid API key', 401);
  }

  const { searchParams } = new URL(req.url);
  const systemId = searchParams.get('systemId');

  if (!systemId) {
    return jsonError('systemId query parameter is required', 400);
  }

  const system = await prisma.aISystem.findFirst({
    where: { id: systemId, organizationId: org.id },
    select: {
      id: true,
      name: true,
      riskLevel: true,
      complianceScore: true,
      annexIIICategory: true,
      annexIIISubcategory: true,
      classifiedAt: true,
      tracehawkAgentId: true,
      processesPersonalData: true,
    },
  });

  if (!system) {
    return jsonError('System not found', 404);
  }

  const gapCounts = await prisma.complianceGap.groupBy({
    by: ['status'],
    where: { systemId: system.id },
    _count: { _all: true },
  });

  const findCount = (status: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED') =>
    gapCounts.find((g) => g.status === status)?._count._all ?? 0;

  const completed = findCount('COMPLETED');
  const inProgress = findCount('IN_PROGRESS');
  const notStarted = findCount('NOT_STARTED');

  return NextResponse.json(
    {
      systemId: system.id,
      name: system.name,
      riskLevel: system.riskLevel,
      complianceScore: system.complianceScore,
      annexIIICategory: system.annexIIICategory,
      annexIIISubcategory: system.annexIIISubcategory,
      classifiedAt: system.classifiedAt,
      tracehawkAgentId: system.tracehawkAgentId,
      processesPersonalData: system.processesPersonalData,
      gaps: {
        total: completed + inProgress + notStarted,
        completed,
        inProgress,
        notStarted,
      },
      badge: {
        level: org.badgeLevel ?? 'NONE',
        verifiedAt: org.badgeLastVerifiedAt,
      },
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: { 'Cache-Control': 'no-store' } }
  );
}
