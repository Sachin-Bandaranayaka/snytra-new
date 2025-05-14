/**
 * Notification Service
 * 
 * This service provides a unified interface for sending notifications through various channels:
 * - Email (via Resend or Nodemailer)
 * - WhatsApp messages
 * - SMS (to be implemented)
 * - In-app notifications (to be implemented)
 * 
 * The service is designed to be extensible and configurable, allowing for easy addition
 * of new notification channels and templates.
 */

import { sendEmail as sendResendEmail } from './email';
import { sendEmail as sendNodemailerEmail, sendOrderConfirmation, sendReservationConfirmation } from './nodemailer';
import { whatsappService } from './whatsapp-service';

// Types of notification channels
export enum NotificationChannel {
    EMAIL = 'email',
    WHATSAPP = 'whatsapp',
    SMS = 'sms',
    IN_APP = 'in_app'
}

// Types of notifications
export enum NotificationType {
    ORDER_CONFIRMATION = 'order_confirmation',
    RESERVATION_CONFIRMATION = 'reservation_confirmation',
    PAYMENT_CONFIRMATION = 'payment_confirmation',
    ORDER_STATUS_UPDATE = 'order_status_update',
    TABLE_READY = 'table_ready',
    REGISTRATION = 'registration',
    PASSWORD_RESET = 'password_reset',
    GENERAL = 'general'
}

// Base notification options interface
export interface NotificationOptions {
    channel: NotificationChannel;
    type: NotificationType;
    recipient: string; // Email address or phone number depending on channel
    subject?: string;
    content?: string;
    data?: Record<string, any>; // Additional data for templated notifications
    templateId?: string; // For template-based notifications
    cc?: string | string[];
    bcc?: string | string[];
    attachments?: any[];
}

// Response interface for notification operations
export interface NotificationResponse {
    success: boolean;
    channel: NotificationChannel;
    messageId?: string;
    error?: string;
}

/**
 * Main Notification Service class
 */
export class NotificationService {
    // Configuration
    private emailProvider: 'resend' | 'nodemailer';
    private enableSMS: boolean;
    private enableWhatsApp: boolean;
    private enableInApp: boolean;

    constructor(config: {
        emailProvider?: 'resend' | 'nodemailer';
        enableSMS?: boolean;
        enableWhatsApp?: boolean;
        enableInApp?: boolean;
    } = {}) {
        // Set defaults or use provided config
        this.emailProvider = config.emailProvider || 'resend';
        this.enableSMS = config.enableSMS || false;
        this.enableWhatsApp = config.enableWhatsApp || true;
        this.enableInApp = config.enableInApp || false;
    }

    /**
     * Send a notification through the specified channel
     */
    async send(options: NotificationOptions): Promise<NotificationResponse> {
        try {
            switch (options.channel) {
                case NotificationChannel.EMAIL:
                    return await this.sendEmail(options);
                case NotificationChannel.WHATSAPP:
                    return await this.sendWhatsApp(options);
                case NotificationChannel.SMS:
                    return await this.sendSMS(options);
                case NotificationChannel.IN_APP:
                    return await this.sendInApp(options);
                default:
                    throw new Error(`Unsupported notification channel: ${options.channel}`);
            }
        } catch (error) {
            console.error(`Failed to send ${options.channel} notification:`, error);
            return {
                success: false,
                channel: options.channel,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    /**
     * Send a notification through multiple channels
     */
    async sendMultiChannel(optionsArray: NotificationOptions[]): Promise<NotificationResponse[]> {
        const promises = optionsArray.map(options => this.send(options));
        return Promise.all(promises);
    }

    /**
     * Send an email notification
     */
    private async sendEmail(options: NotificationOptions): Promise<NotificationResponse> {
        // Special case handling for specific notification types
        if (options.type === NotificationType.ORDER_CONFIRMATION && options.data) {
            const result = await sendOrderConfirmation(options.data);
            return {
                success: result.success,
                channel: NotificationChannel.EMAIL,
                messageId: result.data?.id,
                error: result.error
            };
        }

        if (options.type === NotificationType.RESERVATION_CONFIRMATION && options.data) {
            const result = await sendReservationConfirmation(options.data);
            return {
                success: result.success,
                channel: NotificationChannel.EMAIL,
                messageId: result.data?.id,
                error: result.error
            };
        }

        // For general emails
        if (!options.subject || (!options.content && !options.templateId)) {
            throw new Error('Email notifications require subject and either content or templateId');
        }

        const emailOptions = {
            to: options.recipient,
            subject: options.subject,
            html: options.content,
            cc: options.cc,
            bcc: options.bcc,
            attachments: options.attachments
        };

        // Use the configured email provider
        const sendResult = this.emailProvider === 'resend'
            ? await sendResendEmail(emailOptions)
            : await sendNodemailerEmail(emailOptions);

        return {
            success: sendResult.success,
            channel: NotificationChannel.EMAIL,
            messageId: sendResult.data?.id,
            error: sendResult.error
        };
    }

    /**
     * Send a WhatsApp notification
     */
    private async sendWhatsApp(options: NotificationOptions): Promise<NotificationResponse> {
        if (!this.enableWhatsApp) {
            return {
                success: false,
                channel: NotificationChannel.WHATSAPP,
                error: 'WhatsApp notifications are disabled'
            };
        }

        if (!options.templateId || !options.data) {
            throw new Error('WhatsApp notifications require templateId and data');
        }

        const result = await whatsappService.sendTemplateMessage(
            options.recipient,
            options.templateId,
            options.data
        );

        return {
            success: result.success,
            channel: NotificationChannel.WHATSAPP,
            messageId: result.messageId,
            error: result.error
        };
    }

    /**
     * Send an SMS notification (to be implemented)
     */
    private async sendSMS(options: NotificationOptions): Promise<NotificationResponse> {
        if (!this.enableSMS) {
            return {
                success: false,
                channel: NotificationChannel.SMS,
                error: 'SMS notifications are disabled'
            };
        }

        // Placeholder for SMS implementation
        console.log('SMS notification not implemented yet');

        return {
            success: false,
            channel: NotificationChannel.SMS,
            error: 'SMS notifications not implemented yet'
        };
    }

    /**
     * Send an in-app notification (to be implemented)
     */
    private async sendInApp(options: NotificationOptions): Promise<NotificationResponse> {
        if (!this.enableInApp) {
            return {
                success: false,
                channel: NotificationChannel.IN_APP,
                error: 'In-app notifications are disabled'
            };
        }

        // Placeholder for in-app notification implementation
        console.log('In-app notification not implemented yet');

        return {
            success: false,
            channel: NotificationChannel.IN_APP,
            error: 'In-app notifications not implemented yet'
        };
    }

    /**
     * Send an order confirmation notification
     */
    async sendOrderConfirmation(orderData: {
        orderNumber: string;
        customerEmail: string;
        customerPhone?: string;
        customerName: string;
        items: { name: string; quantity: number; price: number }[];
        total: number;
        orderDate: Date;
    }): Promise<NotificationResponse[]> {
        const channels: NotificationOptions[] = [];

        // Add email notification
        channels.push({
            channel: NotificationChannel.EMAIL,
            type: NotificationType.ORDER_CONFIRMATION,
            recipient: orderData.customerEmail,
            data: orderData
        });

        // Add WhatsApp notification if phone is provided and WhatsApp is enabled
        if (this.enableWhatsApp && orderData.customerPhone) {
            channels.push({
                channel: NotificationChannel.WHATSAPP,
                type: NotificationType.ORDER_CONFIRMATION,
                recipient: orderData.customerPhone,
                templateId: 'order_confirmation',
                data: {
                    name: orderData.customerName,
                    orderNumber: orderData.orderNumber,
                    total: orderData.total.toFixed(2)
                }
            });
        }

        return this.sendMultiChannel(channels);
    }

    /**
     * Send a table ready notification
     */
    async sendTableReady(details: {
        customerName: string;
        customerEmail?: string;
        customerPhone?: string;
        waitlistPosition: number;
        tableNumber: string;
    }): Promise<NotificationResponse[]> {
        const channels: NotificationOptions[] = [];

        // Add WhatsApp notification if phone is provided
        if (this.enableWhatsApp && details.customerPhone) {
            channels.push({
                channel: NotificationChannel.WHATSAPP,
                type: NotificationType.TABLE_READY,
                recipient: details.customerPhone,
                templateId: 'waitlist_notification',
                data: {
                    name: details.customerName,
                    position: details.waitlistPosition.toString(),
                    tableNumber: details.tableNumber
                }
            });
        }

        // Add email notification if email is provided
        if (details.customerEmail) {
            channels.push({
                channel: NotificationChannel.EMAIL,
                type: NotificationType.TABLE_READY,
                recipient: details.customerEmail,
                subject: 'Your Table is Ready!',
                content: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #3b82f6;">Your Table is Ready!</h1>
            <p>Hello ${details.customerName},</p>
            <p>Great news! Your table (#${details.tableNumber}) is now ready.</p>
            <p>Please check in with our host within the next 10 minutes.</p>
            <p>Thank you for dining with us!</p>
          </div>
        `
            });
        }

        return this.sendMultiChannel(channels);
    }
}

// Export a default instance with standard configuration
export const notificationService = new NotificationService({
    emailProvider: 'resend',
    enableWhatsApp: true,
    enableSMS: false,
    enableInApp: false
});

// Export the service class for custom instantiation
export default NotificationService; 