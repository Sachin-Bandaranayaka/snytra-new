import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Helper function for WhatsApp integration
async function sendWhatsAppNotification(phoneNumber: string, templateName: string, variables: Record<string, string>) {
    // This is a placeholder for actual WhatsApp API integration
    // In a real implementation, you would use the WhatsApp Business API or a service like Twilio
    console.log(`Would send WhatsApp message to ${phoneNumber} using template: ${templateName}`);
    console.log('Variables:', variables);

    // Instead of actually sending, just log the attempt
    // Return a mock successful response
    return {
        success: true,
        messageId: `mock_${Date.now()}`
    };
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Check authentication for staff/admin
        const session = await getServerSession(authOptions);
        const isDevelopment = process.env.NODE_ENV === 'development';

        // In production, always require authentication
        // In development, allow bypass for testing
        if (!isDevelopment && (!session || !session.user)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const waitlistId = params.id;

        if (!waitlistId) {
            return NextResponse.json(
                { error: 'Waitlist ID is required' },
                { status: 400 }
            );
        }

        // First, get the waitlist entry to check if it exists
        const entryResult = await executeQuery<any[]>(
            'SELECT * FROM waitlist WHERE id = $1 AND status = $2',
            [waitlistId, 'waiting']
        );

        if (entryResult.length === 0) {
            return NextResponse.json(
                { error: 'Waitlist entry not found or not in waiting status' },
                { status: 404 }
            );
        }

        const waitlistEntry = entryResult[0];

        // Get the waitlist position
        const positionResult = await executeQuery<any[]>(
            `SELECT COUNT(*) as position 
             FROM waitlist
             WHERE date = $1 
             AND time = $2
             AND status = 'waiting'
             AND id < $3`,
            [waitlistEntry.date, waitlistEntry.time, waitlistId]
        );

        const position = parseInt(positionResult[0].position) + 1;

        // Get the message template
        const templateResult = await executeQuery<any[]>(
            'SELECT * FROM message_templates WHERE name = $1 AND channel = $2',
            ['waitlist_notification', 'whatsapp']
        );

        // Update the waitlist entry to mark as notified
        const result = await executeQuery<any[]>(
            'UPDATE waitlist SET notified = true WHERE id = $1 RETURNING *',
            [waitlistId]
        );

        // Log notification for audit purposes
        await pool.query(
            `INSERT INTO notification_logs 
            (type, recipient_id, recipient_type, sent_by, status, message) 
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                'waitlist_notification',
                waitlistId,
                'waitlist',
                session?.user?.id || 'system',
                'prepared',
                `Table ready notification for waitlist entry #${waitlistId}`
            ]
        ).catch(err => {
            // Don't fail the request if notification logging fails
            console.error('Failed to log notification:', err);
        });

        // Prepare for WhatsApp notification
        let whatsappResult = null;
        if (templateResult.length > 0) {
            const template = templateResult[0];
            // Format the phone number (remove dashes, spaces, etc.)
            const formattedPhone = waitlistEntry.phone_number.replace(/\D/g, '');

            // Only proceed if we have a valid phone number
            if (formattedPhone.length >= 10) {
                try {
                    whatsappResult = await sendWhatsAppNotification(
                        formattedPhone,
                        'waitlist_notification',
                        {
                            name: waitlistEntry.name,
                            position: position.toString()
                        }
                    );

                    // Update the notification log with the result
                    if (whatsappResult.success) {
                        await pool.query(
                            `UPDATE notification_logs 
                             SET status = $1, metadata = $2
                             WHERE recipient_id = $3 AND type = $4 
                             ORDER BY created_at DESC LIMIT 1`,
                            [
                                'sent',
                                JSON.stringify({ messageId: whatsappResult.messageId }),
                                waitlistId,
                                'waitlist_notification'
                            ]
                        );
                    }
                } catch (error) {
                    console.error('Error sending WhatsApp notification:', error);
                    // Don't fail the whole request if WhatsApp sending fails
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Customer has been notified',
            waitlist: result[0],
            notification: {
                method: 'whatsapp',
                status: whatsappResult?.success ? 'sent' : 'prepared',
                details: whatsappResult
            }
        });
    } catch (error) {
        console.error('Error notifying customer:', error);
        return NextResponse.json(
            { error: 'Failed to notify customer' },
            { status: 500 }
        );
    }
} 