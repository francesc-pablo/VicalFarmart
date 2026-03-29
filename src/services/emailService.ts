'use server';

import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  htmlBody: string;
}

/**
 * Sends an email using Nodemailer.
 * If SMTP credentials are not found in environment variables, it logs the email to the 
 * server console instead of throwing an error, allowing for testing in environments 
 * without a configured mail server.
 * 
 * @param {EmailOptions} options - The email options including recipient, subject, and HTML content.
 * @returns {Promise<void>}
 */
export async function sendEmail({ to, subject, htmlBody }: EmailOptions): Promise<void> {
    const host = process.env.EMAIL_HOST;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const port = Number(process.env.EMAIL_PORT || 587);
    const from = process.env.EMAIL_FROM || `"Vical Farmart" <noreply@vicalfarmart.com>`;

    // Check if configuration is missing and provide a helpful fallback for development
    if (!host || !user || !pass) {
        console.warn('⚠️ EMAIL SERVICE NOT CONFIGURED: Environment variables (EMAIL_HOST, EMAIL_USER, EMAIL_PASS) are missing.');
        console.warn('Simulation Mode Active. Logging email details to console:');
        console.log('------------------------------------------------------------');
        console.log(`FROM:    ${from}`);
        console.log(`TO:      ${to}`);
        console.log(`SUBJECT: ${subject}`);
        console.log(`BODY:    [HTML content of ${htmlBody.length} characters]`);
        console.log('------------------------------------------------------------');
        return; // Exit successfully to allow the application flow to continue
    }

    try {
        // Initialize transporter inside the function to ensure env vars are available
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: {
                user,
                pass,
            },
        });

        const mailOptions = {
            from,
            to,
            subject,
            html: htmlBody,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
    } catch (error) {
        console.error('❌ Error sending email via SMTP:', error);
        // Provide a clearer error message back to the UI
        const technicalDetails = error instanceof Error ? error.message : 'Unknown SMTP error';
        throw new Error(`Email delivery failed: ${technicalDetails}. Please check your SMTP settings in .env.local.`);
    }
}
