
'use server';
/**
 * @fileOverview AI flows for generating and sending transactional emails.
 */

import { ai } from '@/ai/genkit';
import { sendEmail } from '@/services/emailService';
import { z } from 'zod';

// == Schemas & Types ==

const EmailOutputSchema = z.object({
  subject: z.string(),
  body: z.string().describe('The HTML body of the email.'),
});

const ShippingAddressSchema = z.object({
    address: z.string(),
    city: z.string(),
    zipCode: z.string(),
});

const ItemSchema = z.object({
    productName: z.string(),
    quantity: z.number(),
    price: z.number(),
});


// == 1. Welcome Email Flow ==

const WelcomeEmailInputSchema = z.object({
  name: z.string().describe('The name of the new user.'),
  email: z.string().email().describe('The email address of the new user.'),
});
type WelcomeEmailInput = z.infer<typeof WelcomeEmailInputSchema>;


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

const sendWelcomeEmailFlow = ai.defineFlow(
  {
    name: 'sendWelcomeEmailFlow',
    inputSchema: WelcomeEmailInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    console.log(`Generating welcome email for ${input.email}`);
    const { output } = await welcomePrompt(input);
    if (!output) {
      console.error('Failed to generate welcome email content.');
      throw new Error('Email content generation failed.');
    }
    
    console.log(`Sending welcome email to ${input.email}`);
    await sendEmail({
      to: input.email,
      subject: output.subject,
      htmlBody: output.body,
    });
    console.log('Welcome email sent successfully.');
  }
);

export async function sendWelcomeEmail(input: WelcomeEmailInput): Promise<void> {
  return sendWelcomeEmailFlow(input);
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

const sendNewOrderEmailFlow = ai.defineFlow(
    {
        name: 'sendNewOrderEmailFlow',
        inputSchema: NewOrderEmailInputSchema,
        outputSchema: z.void(),
    },
    async (input) => {
        console.log(`Generating new order email for ${input.recipientEmail}`);
        const { output } = await newOrderPrompt(input);
        if (!output) {
            console.error('Failed to generate new order email content for order ' + input.orderId);
            throw new Error('New order email content generation failed.');
        }
        await sendEmail({
            to: input.recipientEmail,
            subject: output.subject,
            htmlBody: output.body,
        });
        console.log(`New order email sent to ${input.recipientEmail}`);
    }
);

export async function sendNewOrderEmail(input: NewOrderEmailInput): Promise<void> {
    return sendNewOrderEmailFlow(input);
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

const sendOrderStatusUpdateEmailFlow = ai.defineFlow({
    name: 'sendOrderStatusUpdateEmailFlow',
    inputSchema: OrderStatusUpdateInputSchema,
    outputSchema: z.void(),
}, async (input) => {
    console.log(`Generating order status update email for ${input.recipientEmail}`);
    const { output } = await orderStatusUpdatePrompt(input);
    if (!output) {
        console.error('Failed to generate order status update email content for order ' + input.orderId);
        throw new Error('Order status update email content generation failed.');
    }
    await sendEmail({
        to: input.recipientEmail,
        subject: output.subject,
        htmlBody: output.body,
    });
    console.log(`Order status update email sent to ${input.recipientEmail}`);
});


export async function sendOrderStatusUpdateEmail(input: OrderStatusUpdateInput): Promise<void> {
    return sendOrderStatusUpdateEmailFlow(input);
}


// == 4. Order Confirmation/Receipt Email Flow ==

const OrderConfirmationEmailInputSchema = z.object({
  customerEmail: z.string().email(),
  customerName: z.string(),
  orderId: z.string(),
  totalAmount: z.number(),
  paymentMethod: z.string(),
  transactionId: z.string().optional(),
  items: z.array(ItemSchema),
  shippingAddress: ShippingAddressSchema,
});
type OrderConfirmationEmailInput = z.infer<typeof OrderConfirmationEmailInputSchema>;


const orderConfirmationPrompt = ai.definePrompt({
    name: 'orderConfirmationPrompt',
    input: { schema: OrderConfirmationEmailInputSchema },
    output: { schema: EmailOutputSchema },
    prompt: `
      You are the friendly automated receipt system for Vical Farmart.
      Generate a detailed order confirmation and receipt email. This confirms a SUCCESSFUL PAYMENT.

      Customer: {{{customerName}}}
      Order ID: #{{{orderId}}}

      The subject line must be "Your Vical Farmart Order Confirmation (#{{{orderId}}})".

      Generate a well-formatted HTML email body.
      - Start with a warm thank you message for the order.
      - Clearly list all items with quantity, price per item, and subtotal for the line item.
      - Show the grand total amount.
      - Display the payment method used. If a transaction ID is provided, show it.
      - Display the shipping address.
      - End with a friendly closing note, telling the customer they will be notified when the order ships.
      
      Order Details:
      - Grand Total: \${{{totalAmount}}}
      - Payment Method: {{{paymentMethod}}}
      {{#if transactionId}}- Transaction ID: {{{transactionId}}}{{/if}}

      Items Ordered:
      {{#each items}}
      - {{this.quantity}}x "{{this.productName}}" @ \${{this.price}} each = \${{multiply this.quantity this.price}}
      {{/each}}

      Shipping To:
      {{{shippingAddress.address}}}
      {{{shippingAddress.city}}}, {{{shippingAddress.zipCode}}}
    `,
    helpers: {
      multiply: (a: number, b: number) => (a * b).toFixed(2),
    }
});


const sendOrderConfirmationEmailFlow = ai.defineFlow({
    name: 'sendOrderConfirmationEmailFlow',
    inputSchema: OrderConfirmationEmailInputSchema,
    outputSchema: z.void(),
}, async (input) => {
    console.log(`Generating order confirmation email for ${input.customerEmail}`);
    const { output } = await orderConfirmationPrompt(input);
    if (!output) {
        console.error('Failed to generate order confirmation email content for order ' + input.orderId);
        throw new Error('Order confirmation email content generation failed.');
    }
    await sendEmail({
        to: input.customerEmail,
        subject: output.subject,
        htmlBody: output.body,
    });
    console.log(`Order confirmation email sent to ${input.customerEmail}`);
});

export async function sendOrderConfirmationEmail(input: OrderConfirmationEmailInput): Promise<void> {
    return sendOrderConfirmationEmailFlow(input);
}


// == 5. Pay on Delivery Invoice Email Flow ==

const PayOnDeliveryInvoiceEmailInputSchema = z.object({
  customerEmail: z.string().email(),
  customerName: z.string(),
  orderId: z.string(),
  totalAmount: z.number(),
  items: z.array(ItemSchema),
  shippingAddress: ShippingAddressSchema,
});
type PayOnDeliveryInvoiceEmailInput = z.infer<typeof PayOnDeliveryInvoiceEmailInputSchema>;


const payOnDeliveryInvoicePrompt = ai.definePrompt({
    name: 'payOnDeliveryInvoicePrompt',
    input: { schema: PayOnDeliveryInvoiceEmailInputSchema },
    output: { schema: EmailOutputSchema },
    prompt: `
      You are the order processing system for Vical Farmart.
      Generate an INVOICE for a "Pay on Delivery" order. This is NOT a receipt.

      Customer: {{{customerName}}}
      Order ID: #{{{orderId}}}

      The subject line must be "Your Vical Farmart Order Invoice (#{{{orderId}}})".

      Generate a well-formatted HTML email body.
      - Start with a thank you message for placing the order.
      - Clearly state this is an invoice for a Pay on Delivery order.
      - Explain that payment is due in cash upon delivery.
      - Clearly list all items with quantity, price per item, and subtotal.
      - Show the grand total amount to be paid.
      - Display the shipping address.
      - End with a friendly closing note, telling the customer they will be notified when the order ships.
      
      Order Details:
      - Grand Total: \${{{totalAmount}}} (To be paid on delivery)
      - Payment Method: Pay on Delivery

      Items in your Order:
      {{#each items}}
      - {{this.quantity}}x "{{this.productName}}" @ \${{this.price}} each = \${{multiply this.quantity this.price}}
      {{/each}}

      Shipping To:
      {{{shippingAddress.address}}}
      {{{shippingAddress.city}}}, {{{shippingAddress.zipCode}}}
    `,
    helpers: {
      multiply: (a: number, b: number) => (a * b).toFixed(2),
    }
});


const sendPayOnDeliveryInvoiceEmailFlow = ai.defineFlow({
    name: 'sendPayOnDeliveryInvoiceEmailFlow',
    inputSchema: PayOnDeliveryInvoiceEmailInputSchema,
    outputSchema: z.void(),
}, async (input) => {
    console.log(`Generating 'Pay on Delivery' invoice for ${input.customerEmail}`);
    const { output } = await payOnDeliveryInvoicePrompt(input);
    if (!output) {
        console.error('Failed to generate Pay on Delivery invoice for order ' + input.orderId);
        throw new Error('Pay on Delivery invoice generation failed.');
    }
    await sendEmail({
        to: input.customerEmail,
        subject: output.subject,
        htmlBody: output.body,
    });
    console.log(`'Pay on Delivery' invoice sent to ${input.customerEmail}`);
});

export async function sendPayOnDeliveryInvoiceEmail(input: PayOnDeliveryInvoiceEmailInput): Promise<void> {
    return sendPayOnDeliveryInvoiceEmailFlow(input);
}
