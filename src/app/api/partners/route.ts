import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const partnerSchema = z.object({
  companyName: z.string().min(1).max(200),
  website: z.string().url(),
  contactName: z.string().min(1).max(200),
  email: z.string().email(),
  type: z.enum(['law_firm', 'consultancy', 'auditor', 'other']),
  message: z.string().min(10).max(5000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = partnerSchema.parse(body);

    // TODO: Send email via Resend to partnerships@complyance.io
    // For now, just log it
    console.log('Partnership application:', data);

    // Example Resend integration (uncomment when Resend is configured):
    /*
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const typeMap = {
      law_firm: 'Law Firm',
      consultancy: 'Consultancy',
      auditor: 'Auditor/Certification Body',
      other: 'Other',
    };

    await resend.emails.send({
      from: 'Partnership Applications <noreply@complyance.io>',
      to: 'partnerships@complyance.io',
      subject: `New Partnership Application: ${data.companyName}`,
      replyTo: data.email,
      html: `
        <h2>New Partnership Application</h2>
        <p><strong>Company:</strong> ${data.companyName}</p>
        <p><strong>Website:</strong> <a href="${data.website}">${data.website}</a></p>
        <p><strong>Contact:</strong> ${data.contactName} (${data.email})</p>
        <p><strong>Type:</strong> ${typeMap[data.type]}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message.replace(/\n/g, '<br>')}</p>
      `,
    });

    // Send confirmation email to applicant
    await resend.emails.send({
      from: 'Complyance Partnerships <noreply@complyance.io>',
      to: data.email,
      subject: 'Thank you for your partnership application',
      html: `
        <h2>Thank you for your interest in partnering with Complyance</h2>
        <p>Hi ${data.contactName},</p>
        <p>We've received your partnership application and will review it carefully.</p>
        <p>Our team will get back to you within 3-5 business days to discuss next steps.</p>
        <br>
        <p>Best regards,<br>Complyance Partnerships Team</p>
      `,
    });
    */

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Partnership application error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid form data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}
