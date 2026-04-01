import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/server/db/client';
import { sendEmail } from '@/server/services/email';
import { randomBytes } from 'crypto';
import { passwordResetLimiter, getClientIp } from '@/lib/rate-limit';

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    // Rate limit: 3 requests per 15 minutes per IP
    const ip = getClientIp(request);
    const rl = passwordResetLimiter.check(ip);
    if (!rl.allowed) {
      // Still return 200 to prevent email enumeration via timing
      return NextResponse.json({ success: true });
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Always return success to prevent email enumeration
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Delete any existing tokens for this email
      await prisma.verificationToken.deleteMany({
        where: { identifier: email },
      });

      // Create reset token (expires in 1 hour)
      const token = randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
        },
      });

      // Build reset URL
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'https://complyance.app';
      const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

      await sendEmail({
        to: email,
        subject: 'Reset your Complyance password',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #10b981; font-size: 24px; margin: 0;">Complyance</h1>
            </div>
            <h2 style="color: #1e293b; font-size: 20px; margin-bottom: 16px;">Reset your password</h2>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
              We received a request to reset the password for your Complyance account. Click the button below to choose a new password.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="display: inline-block; background-color: #10b981; color: white; font-weight: 600; font-size: 14px; padding: 12px 32px; border-radius: 8px; text-decoration: none;">
                Reset Password
              </a>
            </div>
            <p style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
              This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
            <p style="color: #94a3b8; font-size: 11px; text-align: center;">
              Complyance — AI Compliance Management Platform
            </p>
          </div>
        `,
      });
    }

    // Always return success (prevents email enumeration)
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
