'use server';
/**
 * @fileOverview Standard TypeScript functions for generating and sending transactional emails.
 * This file replaces the previous Genkit AI flows with predictable HTML templates.
 */

import { sendEmail } from '@/services/emailService';

// == Helper: Currency Symbol ==
const getCurrencySymbol = (currencyCode?: string) => {
  if (currencyCode === "GHS") return "₵";
  if (currencyCode === "USD") return "$";
  return "$"; 
};

// == 1. Welcome Email ==

interface WelcomeEmailInput {
  name: string;
  email: string;
}

export async function sendWelcomeEmail(input: WelcomeEmailInput): Promise<void> {
  const subject = "Welcome to Vical Farmart!";
  const htmlBody = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #8FBC8F;">Welcome to Vical Farmart, ${input.name}!</h2>
      <p>We are thrilled to have you join our community of farmers and food enthusiasts.</p>
      <p>Vical Farmart is your direct link to high-quality agricultural produce and artisanal goods. Start exploring our marketplace today to find the freshest items from local sellers.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://vicalfarmart.com/market" style="background-color: #8FBC8F; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Explore the Market</a>
      </div>
      <p>If you have any questions, feel free to reply to this email.</p>
      <p>Happy shopping!<br><strong>The Vical Farmart Team</strong></p>
    </div>
  `;

  await sendEmail({
    to: input.email,
    subject,
    htmlBody,
  });
}


// == 2. New Order Notification (Admin/Seller) ==

interface NewOrderEmailInput {
  recipientEmail: string;
  recipientName: string;
  recipientRole: 'admin' | 'seller';
  orderId: string;
  customerName: string;
  totalAmount: number;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
}

export async function sendNewOrderEmail(input: NewOrderEmailInput): Promise<void> {
  const isSeller = input.recipientRole === 'seller';
  const subject = isSeller 
    ? `You have a new order! (#${input.orderId.substring(0, 6)})`
    : `New Order Placed on Vical Farmart (#${input.orderId.substring(0, 6)})`;

  const itemsHtml = input.items.map(item => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 10px 0;">${item.productName}</td>
      <td style="padding: 10px 0; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px 0; text-align: right;">₵${item.price.toFixed(2)}</td>
    </tr>
  `).join('');

  const htmlBody = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #8FBC8F;">Hello ${input.recipientName},</h2>
      <p>${isSeller ? "Great news! A customer has purchased your products." : "A new order has been successfully placed on the platform."}</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Order ID:</strong> #${input.orderId}</p>
        <p style="margin: 5px 0 0 0;"><strong>Customer:</strong> ${input.customerName}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 2px solid #eee;">
            <th style="text-align: left; padding-bottom: 10px;">Product</th>
            <th style="text-align: center; padding-bottom: 10px;">Qty</th>
            <th style="text-align: right; padding-bottom: 10px;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <p style="text-align: right; font-size: 1.2em; font-weight: bold; margin-top: 20px;">
        Total: ₵${input.totalAmount.toFixed(2)}
      </p>

      ${isSeller 
        ? `<p style="color: #A0522D; font-weight: bold;">Please prepare these items for pickup/shipment.</p>`
        : `<p><a href="https://vicalfarmart.com/admin/dashboard/orders">View order in Admin Dashboard</a></p>`
      }
      
      <p>Regards,<br>Vical Farmart System</p>
    </div>
  `;

  await sendEmail({
    to: input.recipientEmail,
    subject,
    htmlBody,
  });
}


// == 3. Order Status Update ==

interface OrderStatusUpdateInput {
  recipientEmail: string;
  recipientRole: 'customer' | 'seller';
  customerName: string;
  orderId: string;
  newStatus: string;
  items: Array<{
    productName: string;
    quantity: number;
  }>;
  courierName?: string;
}

export async function sendOrderStatusUpdateEmail(input: OrderStatusUpdateInput): Promise<void> {
  const isCustomer = input.recipientRole === 'customer';
  const subject = isCustomer
    ? `Update on your Vical Farmart Order #${input.orderId.substring(0, 6)}`
    : `Order #${input.orderId.substring(0, 6)} status updated to ${input.newStatus}`;

  let statusMessage = "";
  if (isCustomer) {
    switch (input.newStatus) {
      case 'Processing': statusMessage = "We're getting your order ready!"; break;
      case 'Shipped': statusMessage = `Your order is on its way!${input.courierName ? ` It is being delivered by ${input.courierName}.` : ""}`; break;
      case 'Delivered': statusMessage = "Your order has been delivered. We hope you enjoy your purchase!"; break;
      case 'Cancelled': statusMessage = "Your order has been cancelled."; break;
      default: statusMessage = `The status of your order has been updated to: ${input.newStatus}.`;
    }
  } else {
    statusMessage = `The order status has been updated to ${input.newStatus}. The customer has been notified.`;
  }

  const htmlBody = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #8FBC8F;">Order Update</h2>
      <p>Hi ${isCustomer ? input.customerName : "Seller"},</p>
      <p style="font-size: 1.1em; font-weight: bold; color: #333;">${statusMessage}</p>
      
      <p><strong>Order ID:</strong> #${input.orderId}</p>
      
      <div style="margin-top: 20px; border-top: 1px solid #eee; pt: 10px;">
        <p style="margin-bottom: 5px;"><strong>Items included:</strong></p>
        <ul style="padding-left: 20px;">
          ${input.items.map(i => `<li>${i.quantity}x ${i.productName}</li>`).join('')}
        </ul>
      </div>

      <p style="margin-top: 30px;">Thank you for choosing Vical Farmart.</p>
    </div>
  `;

  await sendEmail({
    to: input.recipientEmail,
    subject,
    htmlBody,
  });
}


// == 4. Order Confirmation/Receipt ==

interface OrderConfirmationEmailInput {
  customerEmail: string;
  customerName: string;
  orderId: string;
  totalAmount: number;
  paymentMethod: string;
  transactionId?: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    address: string;
    city: string;
    zipCode: string;
  };
}

export async function sendOrderConfirmationEmail(input: OrderConfirmationEmailInput): Promise<void> {
  const subject = `Your Vical Farmart Order Confirmation (#${input.orderId.substring(0, 6)})`;

  const itemsHtml = input.items.map(item => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 10px 0;">${item.productName} (x${item.quantity})</td>
      <td style="padding: 10px 0; text-align: right;">₵${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const htmlBody = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #8FBC8F; margin: 0;">Order Receipt</h1>
        <p style="color: #666;">Thank you for your purchase!</p>
      </div>

      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <p style="margin: 0;"><strong>Order Number:</strong> #${input.orderId}</p>
        <p style="margin: 5px 0 0 0;"><strong>Payment Method:</strong> ${input.paymentMethod}</p>
        ${input.transactionId ? `<p style="margin: 5px 0 0 0;"><strong>Transaction ID:</strong> ${input.transactionId}</p>` : ''}
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="border-bottom: 2px solid #eee;">
            <th style="text-align: left; padding-bottom: 10px;">Item</th>
            <th style="text-align: right; padding-bottom: 10px;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td style="padding-top: 15px; font-weight: bold;">Grand Total</td>
            <td style="padding-top: 15px; text-align: right; font-weight: bold; font-size: 1.2em; color: #8FBC8F;">₵${input.totalAmount.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <div style="border-top: 1px solid #eee; padding-top: 15px;">
        <h3 style="color: #A0522D; margin-bottom: 10px;">Shipping To:</h3>
        <p style="margin: 0;">${input.customerName}</p>
        <p style="margin: 0;">${input.shippingAddress.address}</p>
        <p style="margin: 0;">${input.shippingAddress.city}, ${input.shippingAddress.zipCode}</p>
      </div>

      <p style="margin-top: 30px; font-size: 0.9em; color: #666; text-align: center;">
        You will receive another notification once your order has been shipped.
      </p>
    </div>
  `;

  await sendEmail({
    to: input.customerEmail,
    subject,
    htmlBody,
  });
}


// == 5. Contact Form Submission ==

interface ContactFormEmailInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendContactFormEmail(input: ContactFormEmailInput): Promise<void> {
  const adminEmail = 'info@vicalfarmart.com';
  const emailSubject = `New Contact Form Submission: ${input.subject}`;

  const htmlBody = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #A0522D;">New Message Received</h2>
      <p>You have a new submission from the Vical Farmart contact form.</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;"><strong>From:</strong> ${input.name} (${input.email})</p>
        <p style="margin: 10px 0 0 0;"><strong>Subject:</strong> ${input.subject}</p>
      </div>

      <div style="border: 1px solid #eee; padding: 15px; border-radius: 5px; background-color: #fff;">
        <p style="margin-top: 0; font-weight: bold;">Message:</p>
        <div style="white-space: pre-wrap; font-size: 14px; color: #333;">${input.message}</div>
      </div>
      
      <p style="margin-top: 20px; font-size: 0.8em; color: #999;">This message was sent automatically from the Vical Farmart website.</p>
    </div>
  `;

  await sendEmail({
    to: adminEmail,
    subject: emailSubject,
    htmlBody,
  });
}
