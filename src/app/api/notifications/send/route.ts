import { NextRequest, NextResponse } from 'next/server';
import { notificationService, NotificationChannel, NotificationType } from '@/lib/notification-service';

export async function POST(request: NextRequest) {
    try {
        const { channel, type, recipient, subject, content, data, templateId, cc, bcc } = await request.json();

        // Validate required fields
        if (!channel || !type || !recipient) {
            return NextResponse.json({
                error: 'Missing required fields: channel, type, and recipient are required'
            }, { status: 400 });
        }

        // Validate channel type
        if (!Object.values(NotificationChannel).includes(channel)) {
            return NextResponse.json({
                error: `Invalid notification channel: ${channel}. Must be one of: ${Object.values(NotificationChannel).join(', ')}`
            }, { status: 400 });
        }

        // Validate notification type
        if (!Object.values(NotificationType).includes(type)) {
            return NextResponse.json({
                error: `Invalid notification type: ${type}. Must be one of: ${Object.values(NotificationType).join(', ')}`
            }, { status: 400 });
        }

        // Special validation for email notifications
        if (channel === NotificationChannel.EMAIL && !subject) {
            return NextResponse.json({
                error: 'Email notifications require a subject'
            }, { status: 400 });
        }

        // Special validation for WhatsApp notifications
        if (channel === NotificationChannel.WHATSAPP && !templateId) {
            return NextResponse.json({
                error: 'WhatsApp notifications require a templateId'
            }, { status: 400 });
        }

        // Send the notification
        const result = await notificationService.send({
            channel,
            type,
            recipient,
            subject,
            content,
            data,
            templateId,
            cc,
            bcc
        });

        if (!result.success) {
            return NextResponse.json({
                error: result.error || 'Failed to send notification'
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            messageId: result.messageId,
            message: `Notification sent successfully via ${channel}`
        });
    } catch (error) {
        console.error('Error sending notification:', error);
        return NextResponse.json(
            { error: 'Failed to process notification request' },
            { status: 500 }
        );
    }
} 