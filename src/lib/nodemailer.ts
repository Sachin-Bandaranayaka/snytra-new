import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

// Load environment variables at the start
dotenv.config({ path: '.env.local' });

// Log email configuration (masking the password)
const emailUser = process.env.EMAIL_USER || 'your-email@gmail.com';
const emailPass = process.env.EMAIL_PASSWORD || 'your-app-password';
const emailFrom = process.env.EMAIL_FROM || 'Restaurant OS <your-email@gmail.com>';

console.log('Email Configuration:');
console.log('- User:', emailUser);
console.log('- Password:', emailPass ? '********' : 'Not set');
console.log('- From:', emailFrom);

// Handle spaces in App Password (if any)
const cleanPassword = emailPass ? emailPass.replace(/\s+/g, '') : emailPass;

// Create a nodemailer transporter with detailed debug
export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: cleanPassword, // Use the cleaned password without spaces
  },
  debug: true, // Enable debug output
  logger: true // Log information to the console
});

// Verify the SMTP connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('SMTP server is ready to send messages');
  }
});

interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: any[];
}

/**
 * Send an email using Nodemailer
 */
export async function sendEmail(options: EmailOptions) {
  const {
    to,
    subject,
    html,
    text,
    from = emailFrom,
    replyTo,
    cc,
    bcc,
    attachments
  } = options;

  try {
    const result = await transporter.sendMail({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      replyTo,
      cc: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
      bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
      attachments
    });

    console.log('Email sent successfully:', result.messageId);
    return { success: true, data: { id: result.messageId } };
  } catch (error: any) {
    console.error('Email service error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send a test email
 */
export async function sendTestEmail() {
  return sendEmail({
    to: emailUser, // Send to your own email for testing
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
      <td style="padding: 12px; border-bottom: 1px solid #E5E5E5;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #E5E5E5; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #E5E5E5; text-align: right;">$${parseFloat(item.price.toString()).toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #E5E5E5; text-align: right;">$${(item.quantity * parseFloat(item.price.toString())).toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F5F0E6; padding: 20px; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background-color: #D94E1F; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Subscription Successful!</h1>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #E5E5E5; border-top: none;">
          <p style="font-size: 18px; color: #333333; margin-top: 0;">Hello ${customerName},</p>
          <p style="color: #333333; margin-bottom: 30px;">Thank you for your subscription! Your order has been received and processed.</p>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #F5F0E6; border-radius: 5px; border: 1px solid rgba(217, 78, 31, 0.1);">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #333333;">Order Number:</td>
                <td style="padding: 8px; color: #333333;">${orderNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #333333;">Order Date:</td>
                <td style="padding: 8px; color: #333333;">${orderDate.toLocaleString()}</td>
              </tr>
            </table>
          </div>
          
          <h2 style="color: #D94E1F; font-size: 20px; margin: 30px 0 15px 0; border-bottom: 2px solid #F5F0E6; padding-bottom: 10px;">Order Summary</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background-color: #F5F0E6;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #E5E5E5; color: #D94E1F;">Item</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #E5E5E5; color: #D94E1F;">Qty</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #E5E5E5; color: #D94E1F;">Price</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #E5E5E5; color: #D94E1F;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 12px; text-align: right; border-top: 2px solid #E5E5E5; font-weight: bold; color: #333333;">Total:</td>
                <td style="padding: 12px; text-align: right; border-top: 2px solid #E5E5E5; font-weight: bold; color: #D94E1F;">$${parseFloat(total.toString()).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          
          <div style="margin-top: 30px; text-align: center;">
            <p style="color: #333333;">Thank you for choosing Snytra!</p>
            <p style="color: #333333; margin-bottom: 20px;">If you have any questions about your subscription, please contact us.</p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; background-color: #D94E1F; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
          </div>
        </div>
      </div>
      <div style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
        <p>© ${new Date().getFullYear()} Snytra. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `Order Confirmation #${orderNumber}`,
    html
  });
}

/**
 * Send a reservation confirmation email
 */
export async function sendReservationConfirmation(reservationDetails: {
  reservationId: string;
  customerEmail: string;
  customerName: string;
  date: Date;
  time: string;
  partySize: number;
  specialRequests?: string;
  qrCodeUrl?: string;
  restaurantName?: string;
  tableName?: string;
}) {
  const {
    reservationId,
    customerEmail,
    customerName,
    date,
    time,
    partySize,
    specialRequests,
    qrCodeUrl,
    restaurantName = 'Snytra',
    tableName
  } = reservationDetails;

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Convert 24-hour time format to 12-hour format
  let formattedTime = time;
  try {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    formattedTime = `${hour12}:${minutes} ${ampm}`;
  } catch (err) {
    // Fallback to original time if parsing fails
    console.error('Error formatting time:', err);
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F5F0E6; padding: 20px; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background-color: #D94E1F; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Reservation Confirmed!</h1>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #E5E5E5; border-top: none;">
          <p style="font-size: 18px; color: #333333; margin-top: 0;">Hello ${customerName},</p>
          <p style="color: #333333; margin-bottom: 30px;">Your table reservation has been confirmed. We look forward to serving you!</p>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #F5F0E6; border-radius: 5px; border: 1px solid rgba(217, 78, 31, 0.1);">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #333333;">Reservation ID:</td>
                <td style="padding: 8px; color: #333333;">${reservationId}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #333333;">Date:</td>
                <td style="padding: 8px; color: #333333;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #333333;">Time:</td>
                <td style="padding: 8px; color: #333333;">${formattedTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #333333;">Party Size:</td>
                <td style="padding: 8px; color: #333333;">${partySize} ${partySize === 1 ? 'person' : 'people'}</td>
              </tr>
              ${tableName ? `
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #333333;">Table:</td>
                <td style="padding: 8px; color: #333333;">${tableName}</td>
              </tr>` : ''}
              ${specialRequests ? `
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #333333;">Special Requests:</td>
                <td style="padding: 8px; color: #333333;">${specialRequests}</td>
              </tr>` : ''}
            </table>
          </div>
          
          ${qrCodeUrl ? `
          <div style="margin: 30px 0; text-align: center;">
            <h2 style="color: #D94E1F; font-size: 20px; margin-bottom: 15px;">Your Table QR Code</h2>
            <p style="color: #333333; margin-bottom: 15px;">Please show this QR code upon arrival:</p>
            <img src="${qrCodeUrl}" alt="Table QR Code" style="max-width: 200px; border: 1px solid #E5E5E5; border-radius: 5px; padding: 10px;" />
          </div>` : ''}
          
          <div style="margin-top: 30px; text-align: center;">
            <p style="color: #333333;">Thank you for choosing ${restaurantName}!</p>
            <p style="color: #333333; margin-bottom: 20px;">If you need to modify or cancel your reservation, please contact us at least 2 hours before your reservation time.</p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/menu/reservations" style="display: inline-block; background-color: #D94E1F; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold;">Manage Reservations</a>
          </div>
        </div>
      </div>
      <div style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
        <p>© ${new Date().getFullYear()} ${restaurantName}. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `Reservation Confirmation - ${restaurantName}`,
    html
  });
}

/**
 * Send a registration confirmation email
 */
export async function sendRegistrationConfirmation(userDetails: {
  email: string;
  name: string;
  verificationLink?: string;
}) {
  const { email, name, verificationLink } = userDetails;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const verificationUrl = verificationLink || `${baseUrl}/verify-account?token=YOUR_TOKEN_HERE`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F5F0E6; padding: 20px; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background-color: #D94E1F; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Snytra!</h1>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #E5E5E5; border-top: none;">
          <p style="font-size: 18px; color: #333333; margin-top: 0;">Hello ${name},</p>
          <p style="color: #333333; margin-bottom: 30px;">Thank you for registering with us. Your account has been created successfully.</p>
          
          ${verificationLink ? `
          <div style="margin: 25px 0; text-align: center;">
            <p style="color: #333333; margin-bottom: 15px;">Please verify your email address by clicking the button below:</p>
            <a href="${verificationUrl}" style="display: inline-block; background-color: #D94E1F; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold;">Verify Email</a>
            <p style="color: #666; font-size: 12px; margin-top: 15px;">Or copy and paste this link in your browser:<br/>${verificationUrl}</p>
          </div>
          ` : ''}
          
          <div style="margin: 30px 0; padding: 20px; background-color: #F5F0E6; border-radius: 5px; border: 1px solid rgba(217, 78, 31, 0.1);">
            <h3 style="color: #D94E1F; margin-top: 0; text-align: left;">You can now log in to your account and:</h3>
            <ul style="color: #333333; text-align: left; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Make reservations</li>
              <li style="margin-bottom: 8px;">Order food online</li>
              <li style="margin-bottom: 8px;">View your order history</li>
              <li>Update your profile and preferences</li>
            </ul>
          </div>
          
          <div style="margin-top: 30px; text-align: center;">
            <p style="color: #333333; margin-bottom: 20px;">Ready to get started?</p>
            <a href="${baseUrl}/dashboard" style="display: inline-block; background-color: #D94E1F; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
          </div>
        </div>
      </div>
      <div style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
        <p>© ${new Date().getFullYear()} Snytra. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to Snytra - Registration Confirmed',
    html
  });
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(resetDetails: {
  email: string;
  name: string;
  resetToken: string;
  expiryTime?: number; // In minutes
}) {
  const { email, name, resetToken, expiryTime = 60 } = resetDetails;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #F5F0E6; padding: 20px; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background-color: #D94E1F; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #E5E5E5; border-top: none;">
          <p style="font-size: 18px; color: #333333; margin-top: 0;">Hello ${name},</p>
          <p style="color: #333333;">We received a request to reset your password for your Snytra account.</p>
          <p style="color: #333333; margin-bottom: 30px;">If you didn't make this request, you can safely ignore this email.</p>
          
          <div style="margin: 25px 0; text-align: center;">
            <p style="color: #333333; margin-bottom: 15px;">Click the button below to reset your password:</p>
            <a href="${resetUrl}" style="display: inline-block; background-color: #D94E1F; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold;">Reset Password</a>
            <p style="color: #666; font-size: 12px; margin-top: 15px;">Or copy and paste this link in your browser:<br/>${resetUrl}</p>
          </div>
          
          <div style="margin: 30px 0; padding: 15px; background-color: #F5F0E6; border-radius: 5px; border: 1px solid rgba(217, 78, 31, 0.1);">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <tr>
                <td style="padding: 8px; font-weight: bold; color: #333333;">Link expires in:</td>
                <td style="padding: 8px; color: #333333;">${expiryTime} minutes</td>
              </tr>
            </table>
            <p style="color: #666; font-size: 14px; margin-top: 10px;">If the link has expired, you can request a new password reset from our website.</p>
          </div>
          
          <div style="margin-top: 30px; text-align: center;">
            <p style="color: #333333;">Thank you for choosing Snytra!</p>
            <p style="color: #333333; margin-bottom: 20px;">If you need any assistance, please contact our support team.</p>
            <a href="${baseUrl}/login" style="display: inline-block; background-color: #D94E1F; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold;">Back to Login</a>
          </div>
        </div>
      </div>
      <div style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
        <p>© ${new Date().getFullYear()} Snytra. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Snytra - Password Reset Request',
    html
  });
} 