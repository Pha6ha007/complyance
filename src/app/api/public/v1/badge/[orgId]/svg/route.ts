import { NextRequest, NextResponse } from 'next/server';
import { BadgeLevel } from '@prisma/client';
import { getBadgeInfo, generateBadgeSVG } from '@/server/services/badge/generator';

// Cache for 1 hour
const CACHE_MAX_AGE = 60 * 60; // 1 hour in seconds

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;

    if (!orgId) {
      return new NextResponse('Organization ID is required', { status: 400 });
    }

    const badgeInfo = await getBadgeInfo(orgId);

    if (!badgeInfo) {
      // Return a placeholder badge for not found
      const notFoundSvg = generateBadgeSVG(
        'Unknown',
        BadgeLevel.NONE,
        orgId,
        null
      );
      return new NextResponse(notFoundSvg, {
        status: 404,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=60', // Short cache for not found
        },
      });
    }

    const svg = generateBadgeSVG(
      badgeInfo.orgName,
      badgeInfo.isActive ? badgeInfo.badgeLevel : BadgeLevel.NONE,
      orgId,
      badgeInfo.verifiedAt
    );

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, s-maxage=${CACHE_MAX_AGE}`,
      },
    });
  } catch (error) {
    console.error('Badge SVG API error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
