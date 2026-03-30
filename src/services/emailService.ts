'use server';

import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  htmlBody: string;
}

/**
 * Sends an email using Nodemailer.
 * Configured for GoDaddy/SecureServer SMTP (smtpout.secureserver.net) on port 465 with SSL.
 * 
 * @param {EmailOptions} options - The email options including recipient, subject, and HTML content.
 * @returns {Promise<void>}
 */
export async function sendEmail({ to, subject, htmlBody }: EmailOptions): Promise<void> {
    const host = process.env.EMAIL_HOST || 'smtpout.secureserver.net';
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const port = Number(process.env.EMAIL_PORT || 465);
    const from = process.env.EMAIL_FROM || `"Vical Farmart" <info@vicalfarmart.com>`;

    // If credentials are not configured, log to console to prevent breaking the flow during development
    if (!user || !pass) {
        console.warn('⚠️ SMTP CREDENTIALS MISSING: EMAIL_USER and EMAIL_PASS are not set in .env.local.');
        console.log('--- Email Simulation (No SMTP config) ---');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log('-----------------------------------------');
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: true, // True for port 465 (SSL)
            auth: {
                user,
                pass,
            },
            // Recommended for GoDaddy servers to avoid common certificate chain issues
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from,
            to,
            subject,
            html: htmlBody,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
    } catch (error: any) {
        console.error('❌ Email delivery failed:', error);
        
        let errorMessage = 'An error occurred while sending the email.';
        if (error.code === 'EAUTH') {
            errorMessage = 'Authentication failed. Please check your SMTP username and password.';
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            errorMessage = 'Could not connect to the SMTP server. Please check the host and port.';
        }

        throw new Error(`${errorMessage} (${error.message || 'Unknown error'})`);
    }
}
