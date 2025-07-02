'use server';

/**
 * @fileOverview A mock email sending service for development.
 *
 * In a production environment, this file should be replaced with a real email
 * service implementation (e.g., using SendGrid, Resend, or Nodemailer).
 */

interface EmailOptions {
  to: string;
  subject: string;
  htmlBody: string;
}

/**
 * Sends an email. In this mock implementation, it logs the email details
 * to the server console instead of sending a real email.
 * @param {EmailOptions} options - The email options.
 * @returns {Promise<void>}
 */
export async function sendEmail({ to, subject, htmlBody }: EmailOptions): Promise<void> {
  console.log('--- MOCK EMAIL SENT ---');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log('Body:');
  console.log(htmlBody);
  console.log('-----------------------');
  // In a real implementation, you would integrate with your email provider here.
  // For example, using Resend:
  //
  // import { Resend } from 'resend';
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: 'Vical Farmart <noreply@yourdomain.com>',
  //   to,
  //   subject,
  //   html: htmlBody,
  // });

  return Promise.resolve();
}
