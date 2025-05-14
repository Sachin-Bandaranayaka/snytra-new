interface WhatsAppMessage {
    to: string;
    templateName: string;
    templateData: Record<string, string>;
}

interface WhatsAppResponse {
    success: boolean;
    messageId?: string;
    error?: string;
}

/**
 * Service for sending WhatsApp messages
 * This implementation uses a mock for development
 * In production, replace with actual WhatsApp Business API integration
 */
export class WhatsAppService {
    private apiKey: string;
    private accountSid: string;
    private fromNumber: string;
    private isDevelopment: boolean;

    constructor() {
        // Load configuration from environment variables
        this.apiKey = process.env.TWILIO_API_KEY || '';
        this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
        this.fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || '';
        this.isDevelopment = process.env.NODE_ENV === 'development';
    }

    /**
     * Send a WhatsApp message using a template
     * @param to - Recipient phone number in international format (e.g., +12345678900)
     * @param templateName - Name of the template to use
     * @param templateData - Object containing key-value pairs for template variables
     */
    async sendTemplateMessage(
        to: string,
        templateName: string,
        templateData: Record<string, string>
    ): Promise<WhatsAppResponse> {
        // Log the message attempt
        console.log(`Sending WhatsApp message to ${to} using template: ${templateName}`);
        console.log('Template data:', templateData);

        // In development, just mock the response
        if (this.isDevelopment) {
            return this.mockSendMessage({ to, templateName, templateData });
        }

        // In production, use Twilio WhatsApp API
        try {
            return await this.sendViaTwilio(to, templateName, templateData);
        } catch (error) {
            console.error('Error sending WhatsApp message:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error sending WhatsApp message'
            };
        }
    }

    /**
     * Mock implementation for development
     */
    private mockSendMessage(message: WhatsAppMessage): WhatsAppResponse {
        // Simulate success most of the time, but occasionally fail to test error handling
        const isSuccess = Math.random() > 0.1;

        if (isSuccess) {
            return {
                success: true,
                messageId: `mock_${Date.now()}`
            };
        } else {
            return {
                success: false,
                error: 'Mock delivery failure'
            };
        }
    }

    /**
     * Send message via Twilio API (for production use)
     */
    private async sendViaTwilio(
        to: string,
        templateName: string,
        templateData: Record<string, string>
    ): Promise<WhatsAppResponse> {
        // Ensure we have required configuration
        if (!this.apiKey || !this.accountSid || !this.fromNumber) {
            throw new Error('Missing Twilio configuration');
        }

        // Format the destination number for WhatsApp
        const formattedTo = to.startsWith('+') ? `whatsapp:${to}` : `whatsapp:+${to}`;
        const formattedFrom = `whatsapp:${this.fromNumber}`;

        // Prepare the message body based on the template and data
        // This is a simplified example - in production, you would fetch templates from a database
        // or use Twilio's template features
        let messageBody = '';
        if (templateName === 'waitlist_notification') {
            messageBody = `Hello ${templateData.name || 'there'}! Your table is now ready at our restaurant. Please check in with the host within the next 10 minutes. Your position on the waitlist was #${templateData.position || '1'}.`;
        } else {
            messageBody = 'Your table is ready. Please check in with the host.';
        }

        // In a real implementation, you'd make an API call to Twilio here
        // For example:
        /*
        const client = require('twilio')(this.accountSid, this.apiKey);
        const message = await client.messages.create({
          body: messageBody,
          from: formattedFrom,
          to: formattedTo
        });
        
        return {
          success: true,
          messageId: message.sid
        };
        */

        // For now, just return a successful mock response
        return {
            success: true,
            messageId: `twilio_mock_${Date.now()}`
        };
    }
}

// Export singleton instance
export const whatsappService = new WhatsAppService(); 