import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { notificationService } from '@/lib/notification-service';

export async function POST(request: NextRequest) {
    try {
        const { waitlistId } = await request.json();

        if (!waitlistId) {
            return NextResponse.json({ error: 'Waitlist ID is required' }, { status: 400 });
        }

        // Get the waitlist entry details
        const waitlistResult = await pool.query(
            `SELECT 
        w.id,
        w.name AS customer_name,
        w.email AS customer_email,
        w.phone AS customer_phone,
        w.party_size,
        w.wait_time_estimate,
        w.position,
        w.status,
        t.id AS table_id,
        t.name AS table_name,
        t.capacity
      FROM 
        waitlist w
      LEFT JOIN 
        table_assignments ta ON w.id = ta.waitlist_id
      LEFT JOIN 
        tables t ON ta.table_id = t.id
      WHERE 
        w.id = $1`,
            [waitlistId]
        );

        if (waitlistResult.rowCount === 0) {
            return NextResponse.json({ error: 'Waitlist entry not found' }, { status: 404 });
        }

        const waitlistEntry = waitlistResult.rows[0];

        // Check if a table is assigned
        if (!waitlistEntry.table_id) {
            return NextResponse.json(
                { error: 'No table has been assigned to this waitlist entry yet' },
                { status: 400 }
            );
        }

        // Send the notification
        const notificationResult = await notificationService.sendTableReady({
            customerName: waitlistEntry.customer_name,
            customerEmail: waitlistEntry.customer_email,
            customerPhone: waitlistEntry.customer_phone,
            waitlistPosition: waitlistEntry.position,
            tableNumber: waitlistEntry.table_name || waitlistEntry.table_id.toString()
        });

        // Update the waitlist entry with notification status
        const emailResult = notificationResult.find(r => r.channel === 'email');
        const whatsappResult = notificationResult.find(r => r.channel === 'whatsapp');

        // Update notification statuses in database
        await pool.query(
            `UPDATE waitlist 
       SET 
        notification_sent = true,
        notification_sent_at = NOW(),
        email_notification_success = $1,
        sms_notification_success = $2
       WHERE id = $3`,
            [
                emailResult?.success || false,
                whatsappResult?.success || false,
                waitlistId
            ]
        );

        // Update the waitlist status to 'notified'
        await pool.query(
            `UPDATE waitlist SET status = 'notified' WHERE id = $1 AND status = 'waiting'`,
            [waitlistId]
        );

        // Calculate success status for response
        const anySuccessful = notificationResult.some(r => r.success);
        const allSuccessful = notificationResult.every(r => r.success);
        const successCount = notificationResult.filter(r => r.success).length;

        if (allSuccessful) {
            return NextResponse.json({
                success: true,
                message: 'Table ready notifications sent successfully',
                results: notificationResult
            });
        } else if (anySuccessful) {
            return NextResponse.json({
                success: true,
                message: `${successCount} of ${notificationResult.length} notifications sent successfully`,
                results: notificationResult
            });
        } else {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to send any table ready notifications',
                    results: notificationResult
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error sending table ready notification:', error);
        return NextResponse.json(
            { error: 'Failed to send table ready notification' },
            { status: 500 }
        );
    }
} 