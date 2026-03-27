import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { applyReferralCode } from '@/server/services/referrals/code';
import { formLimiter, getClientIp } from '@/lib/rate-limit';
import { prisma } from '@/server/db/client';

const applySchema = z.object({
  code: z.string().min(1),
  userId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 attempts per hour per IP
    const ip = getClientIp(request);
    const rl = formLimiter.check(ip);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429, headers: formLimiter.headers(rl) }
      );
    }

    const body = await request.json();
    const validation = applySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const { code, userId } = validation.data;

    // Security: verify the user was created within the last 5 minutes
    // This prevents abuse of the unauthenticated endpoint with arbitrary userIds
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (user.createdAt < fiveMinutesAgo) {
      return NextResponse.json(
        { error: 'Referral code can only be applied during registration' },
        { status: 400 }
      );
    }

    const success = await applyReferralCode(userId, code);

    if (!success) {
      return NextResponse.json(
        { error: 'Invalid or expired referral code' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to apply referral code' },
      { status: 500 }
    );
  }
}
