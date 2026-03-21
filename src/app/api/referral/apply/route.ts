import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { applyReferralCode } from '@/server/services/referrals/code';

const applySchema = z.object({
  code: z.string().min(1),
  userId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = applySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const { code, userId } = validation.data;

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
