import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  subject: z.enum(['general', 'support', 'partnership', 'press', 'other']),
  message: z.string().min(10).max(5000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = contactSchema.parse(body);

    // TODO: Send email via Resend
    // For now, just log it
    console.log('Contact form submission:', data);

    // Example Resend integration (uncomment when Resend is configured):
    /*
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const subjectMap = {
      general: 'General Inquiry',
      support: 'Support Request',
      partnership: 'Partnership Inquiry',
      press: 'Press Inquiry',
      other: 'Other Inquiry',
    };

    await resend.emails.send({
      from: 'Contact Form <noreply@complyance.io>',
      to: 'support@complyance.io',
      subject: `[${subjectMap[data.subject]}] ${data.name}`,
      replyTo: data.email,
      html: `
        <h2>New contact form submission</h2>
        <p><strong>From:</strong> ${data.name} (${data.email})</p>
        <p><strong>Subject:</strong> ${subjectMap[data.subject]}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message.replace(/\n/g, '<br>')}</p>
      `,
    });

    // Send confirmation email to user
    await resend.emails.send({
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
    */

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
