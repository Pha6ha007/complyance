import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmail } from '@/server/services/email';
import { formLimiter, getClientIp } from '@/lib/rate-limit';
import { escapeHtml, escapeHtmlWithBreaks } from '@/lib/sanitize';

const partnerSchema = z.object({
  companyName: z.string().min(1).max(200),
  website: z.string().url(),
  contactName: z.string().min(1).max(200),
  email: z.string().email(),
  type: z.enum(['law_firm', 'consultancy', 'auditor', 'other']),
  message: z.string().min(10).max(5000),
});

const typeMap: Record<string, string> = {
  law_firm: 'Law Firm',
  consultancy: 'Consultancy',
  auditor: 'Auditor/Certification Body',
  other: 'Other',
};

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 submissions per hour per IP
    const ip = getClientIp(req);
    const rl = formLimiter.check(ip);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429, headers: formLimiter.headers(rl) }
      );
    }

    const body = await req.json();
    const data = partnerSchema.parse(body);

    // Send internal notification
    await sendEmail({
      from: 'Partnership Applications <noreply@complyance.app>',
      to: 'partnerships@complyance.app',
      subject: `New Partnership Application: ${data.companyName}`,
      html: `
        <h2>New Partnership Application</h2>
        <p><strong>Company:</strong> ${escapeHtml(data.companyName)}</p>
        <p><strong>Website:</strong> <a href="${escapeHtml(data.website)}">${escapeHtml(data.website)}</a></p>
        <p><strong>Contact:</strong> ${escapeHtml(data.contactName)} (${escapeHtml(data.email)})</p>
        <p><strong>Type:</strong> ${escapeHtml(typeMap[data.type])}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtmlWithBreaks(data.message)}</p>
      `,
    });

    // Send confirmation to applicant
    await sendEmail({
      from: 'Complyance Partnerships <noreply@complyance.app>',
      to: data.email,
      subject: 'Thank you for your partnership application',
      html: `
        <h2>Thank you for your interest in partnering with Complyance</h2>
        <p>Hi ${escapeHtml(data.contactName)},</p>
        <p>We've received your partnership application and will review it carefully.</p>
        <p>Our team will get back to you within 3-5 business days to discuss next steps.</p>
        <br>
        <p>Best regards,<br>Complyance Partnerships Team</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Partnership application error:', error);
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}
