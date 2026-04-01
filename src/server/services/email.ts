import { Resend } from 'resend';

let resend: Resend | null = null;

function getResendClient() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  from = 'Complyance <notifications@complyance.app>',
}: SendEmailParams) {
  const client = getResendClient();

  if (!client) {
    console.warn('RESEND_API_KEY not configured, skipping email send');
    return;
  }

  try {
    const data = await client.emails.send({
      from,
      to,
      subject,
      html,
    });

    return data;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}
