import { NextRequest, NextResponse } from 'next/server';
import { notificationService, NotificationChannel, NotificationType, NotificationOptions } from '@/lib/notification-service';

export async function POST(request: NextRequest) {
    try {
        const { notifications } = await request.json();

        if (!Array.isArray(notifications) || notifications.length === 0) {
            return NextResponse.json({
                error: 'Notifications must be a non-empty array'
            }, { status: 400 });
        }

        // Validate each notification
        for (let i = 0; i < notifications.length; i++) {
            const notification = notifications[i];

            // Check required fields
            if (!notification.channel || !notification.type || !notification.recipient) {
                return NextResponse.json({
                    error: `Notification at index ${i} is missing required fields: channel, type, and recipient are required`
                }, { status: 400 });
            }

            // Validate channel type
            if (!Object.values(NotificationChannel).includes(notification.channel)) {
                return NextResponse.json({
                    error: `Invalid notification channel at index ${i}: ${notification.channel}`
                }, { status: 400 });
            }

            // Validate notification type
            if (!Object.values(NotificationType).includes(notification.type)) {
                return NextResponse.json({
                    error: `Invalid notification type at index ${i}: ${notification.type}`
                }, { status: 400 });
            }

            // Channel-specific validation
            if (notification.channel === NotificationChannel.EMAIL && !notification.subject) {
                return NextResponse.json({
                    error: `Email notification at index ${i} requires a subject`
                }, { status: 400 });
            }

            if (notification.channel === NotificationChannel.WHATSAPP && !notification.templateId) {
                return NextResponse.json({
                    error: `WhatsApp notification at index ${i} requires a templateId`
                }, { status: 400 });
            }
        }

        // Send all notifications
        const results = await notificationService.sendMultiChannel(notifications as NotificationOptions[]);

        // Check if all notifications were sent successfully
        const allSuccessful = results.every(result => result.success);

        // Count successful notifications by channel
        const successCounts = results.reduce((counts, result) => {
            if (result.success) {
                counts[result.channel] = (counts[result.channel] || 0) + 1;
            }
            return counts;
        }, {} as Record<string, number>);

        // Prepare summary message
        const channelSummary = Object.entries(successCounts)
            .map(([channel, count]) => `${channel}: ${count}`)
            .join(', ');

        if (allSuccessful) {
            return NextResponse.json({
                success: true,
                message: `All notifications sent successfully (${channelSummary})`,
                results
            });
        } else {
            // Some notifications failed
            const failedCount = results.filter(result => !result.success).length;

            return NextResponse.json({
                success: false,
                message: `${results.length - failedCount} of ${results.length} notifications sent successfully (${channelSummary})`,
                failedCount,
                results
            }, { status: 207 }); // 207 Multi-Status
        }
    } catch (error) {
        console.error('Error sending multi-channel notifications:', error);
        return NextResponse.json(
            { error: 'Failed to process multi-channel notification request' },
            { status: 500 }
        );
    }
} 