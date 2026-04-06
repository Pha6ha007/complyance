import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmail } from '@/server/services/email';
import { formLimiter, getClientIp } from '@/lib/rate-limit';
import { escapeHtml, escapeHtmlWithBreaks } from '@/lib/sanitize';

const contactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  // `subject` is the inquiry category (legacy contact form). `type` is the
  // lead source (general contact vs managed-service lead vs partnership).
  // The two are independent — a managed-service form sends type='managed_service'
  // and leaves subject as the default.
  subject: z
    .enum(['general', 'support', 'partnership', 'press', 'other'])
    .default('general'),
  type: z
    .enum(['general', 'managed_service', 'partnership'])
    .default('general'),
  // Optional lead-qualification fields used by the managed-service landing page.
  company: z.string().max(200).optional(),
  aiSystemCount: z.enum(['1-5', '5-20', '20+']).optional(),
  message: z.string().min(10).max(5000),
});

const subjectMap: Record<string, string> = {
  general: 'General Inquiry',
  support: 'Support Request',
  partnership: 'Partnership Inquiry',
  press: 'Press Inquiry',
  other: 'Other Inquiry',
};

const typeMap: Record<string, string> = {
  general: 'General',
  managed_service: 'Managed Service Lead',
  partnership: 'Partnership',
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

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body — expected JSON' },
        { status: 400 }
      );
    }

    const data = contactSchema.parse(body);

    // Build email metadata. Managed-service leads get a distinctive subject
    // line so they're impossible to miss in the inbox.
    const isManagedLead = data.type === 'managed_service';
    const emailSubject = isManagedLead
      ? `[Managed Service Lead] ${data.name}${data.company ? ` — ${data.company}` : ''}`
      : `[${subjectMap[data.subject]}] ${data.name}`;

    const leadDetails = [
      data.company ? `<p><strong>Company:</strong> ${escapeHtml(data.company)}</p>` : '',
      data.aiSystemCount
        ? `<p><strong>AI Systems:</strong> ${escapeHtml(data.aiSystemCount)}</p>`
        : '',
    ]
      .filter(Boolean)
      .join('\n        ');

    // Send internal notification to your personal email
    await sendEmail({
      from: 'Contact Form <onboarding@resend.dev>',
      to: process.env.ADMIN_EMAIL ?? 'your@gmail.com', // ← добавь ADMIN_EMAIL в Railway Variables
      subject: emailSubject,
      html: `
        <h2>New ${escapeHtml(typeMap[data.type])} submission</h2>
        <p><strong>From:</strong> ${escapeHtml(data.name)} (${escapeHtml(data.email)})</p>
        <p><strong>Lead type:</strong> ${escapeHtml(typeMap[data.type])}</p>
        <p><strong>Inquiry category:</strong> ${escapeHtml(subjectMap[data.subject])}</p>
        ${leadDetails}
        <p><strong>Message:</strong></p>
        <p>${escapeHtmlWithBreaks(data.message)}</p>
      `,
    });

    // NOTE: confirmation to submitter is disabled until complyance.app domain is verified in Resend
    // Resend free tier only allows sending to the account's own email without a verified domain
    // Uncomment this block after domain verification:
    //
    // await sendEmail({
    //   from: 'Complyance <noreply@complyance.app>',
    //   to: data.email,
    //   subject: 'We received your message',
    //   html: `...`,
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      return NextResponse.json(
        { error: 'Invalid form data', details: fieldErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}