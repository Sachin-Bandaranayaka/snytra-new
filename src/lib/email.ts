import nodemailer from 'nodemailer';

// Configure email transport
let transporter: nodemailer.Transporter;

// In development, use a test account
if (process.env.NODE_ENV === 'development') {
  // For development, you can use one of these options:

  // Option 1: Use Ethereal (fake SMTP service for testing)
  async function createTestAccount() {
    // Generate ethereal test account
    const testAccount = await nodemailer.createTestAccount();

    console.log('Created test email account:', testAccount.user);
    console.log('Test email password:', testAccount.pass);

    // Create reusable transporter
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  createTestAccount().catch(console.error);

  // Option 2: Use your own SMTP settings (uncomment and use this instead if you have your own mail service)
  /*
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  */
} else {
  // In production, use configured email provider
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Send an email
 * @param options Email options
 * @returns Information about the sent email
 */
export async function sendEmail(options: EmailOptions) {
  try {
    // If transporter wasn't initialized yet (could happen in dev environment)
    if (!transporter) {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Snytra Restaurant" <noreply@snytra.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log('Email sent:', info.messageId);

    // If using Ethereal in development, log preview URL
    if (process.env.NODE_ENV === 'development') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Send a test email
 * @returns Promise with result
 */
export async function sendTestEmail() {
  return sendEmail({
    to: 'delivered@resend.dev',
    subject: 'RestaurantOS Test Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">RestaurantOS Test Email</h1>
        <p>This is a test email from the RestaurantOS system.</p>
        <p>If you're seeing this, the email service is working correctly!</p>
        <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 5px;">
          <p style="margin: 0;">Sent at: ${new Date().toISOString()}</p>
        </div>
      </div>
    `
  });
}

/**
 * Send an order confirmation email
 * @param orderDetails Order details
 * @returns Promise with result
 */
export async function sendOrderConfirmation(orderDetails: {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  orderDate: Date;
}) {
  const { orderNumber, customerEmail, customerName, items, total, orderDate } = orderDetails;

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${parseFloat(item.price).toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(item.quantity * parseFloat(item.price)).toFixed(2)}</td>
    </tr>
  `).join('');

  // Add the rest of the email template and functionality here
  // Return the email sending result
  return { success: false, error: 'Not implemented' };
}