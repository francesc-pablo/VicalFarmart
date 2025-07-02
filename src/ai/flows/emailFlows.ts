
'use server';
/**
 * @fileOverview AI flows for generating and sending transactional emails.
 */

import { ai } from '@/ai/genkit';
import { sendEmail } from '@/services/emailService';
import { z } from 'zod';

// == 1. Welcome Email Flow ==

const WelcomeEmailInputSchema = z.object({
  name: z.string().describe('The name of the new user.'),
  email: z.string().email().describe('The email address of the new user.'),
});
type WelcomeEmailInput = z.infer<typeof WelcomeEmailInputSchema>;

const EmailOutputSchema = z.object({
  subject: z.string(),
  body: z.string().describe('The HTML body of the email.'),
});

const welcomePrompt = ai.definePrompt({
  name: 'welcomeEmailPrompt',
  input: { schema: WelcomeEmailInputSchema },
  output: { schema: EmailOutputSchema },
  prompt: `
    You are the voice of Vical Farmart, a friendly online marketplace for agricultural goods.
    Generate a warm and welcoming email for a new user who just registered.

    User's name: {{{name}}}

    The subject should be "Welcome to Vical Farmart!".
    The body should be brief, friendly, and thank them for joining.
    It should encourage them to start exploring the market.
    Use simple HTML for formatting (e.g., <p>, <strong>, <a>).
    Do not include CSS or a <style> block.
  `,
});

export async function sendWelcomeEmail(input: WelcomeEmailInput): Promise<void> {
  const { output } = await welcomePrompt(input);
  if (!output) {
    console.error('Failed to generate welcome email content.');
    return;
  }
  await sendEmail({
    to: input.email,
    subject: output.subject,
    htmlBody: output.body,
  });
}


// == 2. New Order Notification Flow ==

const NewOrderEmailInputSchema = z.object({
  recipientEmail: z.string().email(),
  recipientName: z.string(),
  recipientRole: z.enum(['admin', 'seller']),
  orderId: z.string(),
  customerName: z.string(),
  totalAmount: z.number(),
  items: z.array(z.object({
    productName: z.string(),
    quantity: z.number(),
    price: z.number(),
  })),
});
type NewOrderEmailInput = z.infer<typeof NewOrderEmailInputSchema>;

const newOrderPrompt = ai.definePrompt({
    name: 'newOrderEmailPrompt',
    input: { schema: NewOrderEmailInputSchema },
    output: { schema: EmailOutputSchema },
    prompt: `
      You are the notification system for Vical Farmart.
      Generate a new order notification email. The tone should be professional and informative.

      The recipient is {{recipientName}}, who is a(n) {{recipientRole}}.

      Order Details:
      - Order ID: {{{orderId}}}
      - Customer Name: {{{customerName}}}
      - Total Amount: \${{{totalAmount}}}

      Items:
      {{#each items}}
      - {{this.quantity}}x {{this.productName}} at \${{this.price}} each
      {{/each}}

      Generate a subject line appropriate for the recipient's role.
      For an admin, it should be "New Order Placed on Vical Farmart (#{{{orderId}}})".
      For a seller, it should be "You have a new order! (#{{{orderId}}})".

      Generate an HTML body that clearly presents all the order details.
      If the recipient is a seller, tell them to prepare the items for shipment.
      If the recipient is an admin, provide a link to the admin dashboard orders page: /admin/dashboard/orders
    `,
});

export async function sendNewOrderEmail(input: NewOrderEmailInput): Promise<void> {
    const { output } = await newOrderPrompt(input);
    if (!output) {
        console.error('Failed to generate new order email content.');
        return;
    }
    await sendEmail({
        to: input.recipientEmail,
        subject: output.subject,
        htmlBody: output.body,
    });
}


// == 3. Order Status Update Flow ==

const OrderStatusUpdateInputSchema = z.object({
    recipientEmail: z.string().email(),
    recipientRole: z.enum(['customer', 'seller']),
    customerName: z.string(),
    orderId: z.string(),
    newStatus: z.string(),
    items: z.array(z.object({
        productName: z.string(),
        quantity: z.number()
    })),
});
type OrderStatusUpdateInput = z.infer<typeof OrderStatusUpdateInputSchema>;

const orderStatusUpdatePrompt = ai.definePrompt({
    name: 'orderStatusUpdatePrompt',
    input: { schema: OrderStatusUpdateInputSchema },
    output: { schema: EmailOutputSchema },
    prompt: `
      You are the notification system for Vical Farmart.
      Generate an email notifying about an order status update.

      This email is for a {{recipientRole}}.
      Customer Name: {{{customerName}}}
      Order ID: {{{orderId}}}
      New Status: {{{newStatus}}}

      Generate an appropriate subject line.
      - If for a customer: "Update on your Vical Farmart Order #{{{orderId}}}"
      - If for a seller: "Order #{{{orderId}}} status has been updated to {{{newStatus}}}"

      Generate a friendly HTML body that informs the recipient about the change.
      List the items in the order for context.
      Items:
      {{#each items}}
      - {{this.quantity}}x {{this.productName}}
      {{/each}}
      
      Provide a brief, reassuring message based on the status and recipient.
      - If for a customer and 'Processing': "We're getting your order ready."
      - If for a customer and 'Shipped': "Your order is on its way!"
      - If for a customer and 'Delivered': "Your order has arrived. Enjoy!"
      - If for a customer and 'Cancelled': "Your order has been cancelled."
      - If for a seller, simply state the new status and that the customer has been notified.
    `,
});

export async function sendOrderStatusUpdateEmail(input: OrderStatusUpdateInput): Promise<void> {
    const { output } = await orderStatusUpdatePrompt(input);
    if (!output) {
        console.error('Failed to generate order status update email content.');
        return;
    }
    await sendEmail({
        to: input.recipientEmail,
        subject: output.subject,
        htmlBody: output.body,
    });
}
