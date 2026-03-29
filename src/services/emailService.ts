'use server';

import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  htmlBody: string;
}

// Create a Nodemailer transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: Number(process.env.EMAIL_PORT || 587) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends an email using Nodemailer.
 * @param {EmailOptions} options - The email options.
 * @returns {Promise<void>}
 */
export async function sendEmail({ to, subject, htmlBody }: EmailOptions): Promise<void> {
    // Throw error if configuration is missing so UI can handle it
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("Email service is not configured. Please check your .env.local file.");
        throw new Error('The email server is not configured. Please contact support.');
    }
    
    const mailOptions = {
        from: process.env.EMAIL_FROM || `"Vical Farmart" <noreply@vicalfarmart.com>`,
        to: to,
        subject: subject,
        html: htmlBody,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email. Please try again later.');
    }
}
