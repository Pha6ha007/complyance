import { NextRequest, NextResponse } from 'next/server';
import { getBadgeInfo } from '@/server/services/badge/generator';

// Cache for 1 hour
const CACHE_MAX_AGE = 60 * 60; // 1 hour in seconds

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    const badgeInfo = await getBadgeInfo(orgId);

    if (!badgeInfo) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        orgName: badgeInfo.orgName,
        badgeLevel: badgeInfo.badgeLevel,
        verifiedAt: badgeInfo.verifiedAt?.toISOString() ?? null,
        isActive: badgeInfo.isActive,
      },
      {
        headers: {
          'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, s-maxage=${CACHE_MAX_AGE}`,
        },
      }
    );
  } catch (error) {
    console.error('Badge API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
