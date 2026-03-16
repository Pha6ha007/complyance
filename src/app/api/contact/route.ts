import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmail } from '@/server/services/email';

const contactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  subject: z.enum(['general', 'support', 'partnership', 'press', 'other']),
  message: z.string().min(10).max(5000),
});

const subjectMap: Record<string, string> = {
  general: 'General Inquiry',
  support: 'Support Request',
  partnership: 'Partnership Inquiry',
  press: 'Press Inquiry',
  other: 'Other Inquiry',
};

export async function POST(req: NextRequest) {
  try {
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

    // Send internal notification
    await sendEmail({
      from: 'Contact Form <noreply@complyance.io>',
      to: 'support@complyance.io',
      subject: `[${subjectMap[data.subject]}] ${data.name}`,
      html: `
        <h2>New contact form submission</h2>
        <p><strong>From:</strong> ${data.name} (${data.email})</p>
        <p><strong>Subject:</strong> ${subjectMap[data.subject]}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message.replace(/\n/g, '<br>')}</p>
      `,
    });

    // Send confirmation to submitter
    await sendEmail({
      from: 'Complyance <noreply@complyance.io>',
      to: data.email,
      subject: 'We received your message',
      html: `
        <h2>Thank you for contacting Complyance</h2>
        <p>Hi ${data.name},</p>
        <p>We've received your message and will get back to you within 24-48 hours.</p>
        <p><strong>Your message:</strong></p>
        <p>${data.message.replace(/\n/g, '<br>')}</p>
        <br>
        <p>Best regards,<br>Complyance Team</p>
      `,
    });

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
