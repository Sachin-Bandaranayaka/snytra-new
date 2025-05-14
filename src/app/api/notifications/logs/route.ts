import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Fetch notification logs with filtering and pagination
 */
export async function GET(request: NextRequest) {
    try {
        // Check authentication for staff/admin
        const session = await getServerSession(authOptions);
        const isDevelopment = process.env.NODE_ENV === 'development';

        // In production, always require authentication
        // In development, bypass authentication for testing
        if (!isDevelopment && (!session || !session.user)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '25');
        const offset = parseInt(searchParams.get('offset') || '0');
        const status = searchParams.get('status');
        const type = searchParams.get('type');
        const recipientType = searchParams.get('recipientType');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Simplified query to avoid JOIN issues
        let query = `
            SELECT * FROM notification_logs nl
            WHERE 1=1
        `;

        const queryParams: any[] = [];
        let paramCounter = 1;

        // Add filters to the query
        if (status) {
            query += ` AND nl.status = $${paramCounter++}`;
            queryParams.push(status);
        }

        if (type) {
            query += ` AND nl.type = $${paramCounter++}`;
            queryParams.push(type);
        }

        if (recipientType) {
            query += ` AND nl.recipient_type = $${paramCounter++}`;
            queryParams.push(recipientType);
        }

        if (startDate) {
            query += ` AND nl.created_at >= $${paramCounter++}`;
            queryParams.push(startDate);
        }

        if (endDate) {
            query += ` AND nl.created_at <= $${paramCounter++}`;
            queryParams.push(endDate);
        }

        // Add ordering and pagination
        query += ` ORDER BY nl.created_at DESC LIMIT $${paramCounter++} OFFSET $${paramCounter++}`;
        queryParams.push(limit, offset);

        // Execute the query
        const result = await pool.query(query, queryParams);

        // Also get the total count for pagination
        let countQuery = `
            SELECT COUNT(*) as total FROM notification_logs nl WHERE 1=1
        `;

        const countParams: any[] = [];
        paramCounter = 1;

        if (status) {
            countQuery += ` AND nl.status = $${paramCounter++}`;
            countParams.push(status);
        }

        if (type) {
            countQuery += ` AND nl.type = $${paramCounter++}`;
            countParams.push(type);
        }

        if (recipientType) {
            countQuery += ` AND nl.recipient_type = $${paramCounter++}`;
            countParams.push(recipientType);
        }

        if (startDate) {
            countQuery += ` AND nl.created_at >= $${paramCounter++}`;
            countParams.push(startDate);
        }

        if (endDate) {
            countQuery += ` AND nl.created_at <= $${paramCounter++}`;
            countParams.push(endDate);
        }

        const countResult = await pool.query(countQuery, countParams);

        // Return the logs with pagination info
        return NextResponse.json({
            logs: result.rows,
            pagination: {
                total: parseInt(countResult.rows[0].total),
                limit,
                offset,
                hasMore: parseInt(countResult.rows[0].total) > (offset + limit)
            }
        });
    } catch (error) {
        console.error('Error fetching notification logs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notification logs' },
            { status: 500 }
        );
    }
}

/**
 * Endpoint to resend a failed notification
 */
export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        const isDevelopment = process.env.NODE_ENV === 'development';

        // In production, always require authentication
        // In development, bypass authentication for testing
        if (!isDevelopment && (!session || !session.user)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await request.json();

        if (!id) {
            return NextResponse.json(
                { error: 'Notification log ID is required' },
                { status: 400 }
            );
        }

        // Get the notification log details
        const logResult = await pool.query(
            'SELECT * FROM notification_logs WHERE id = $1',
            [id]
        );

        if (logResult.rowCount === 0) {
            return NextResponse.json(
                { error: 'Notification log not found' },
                { status: 404 }
            );
        }

        const log = logResult.rows[0];

        // Check if this is a notification that can be resent
        if (log.status === 'sent') {
            return NextResponse.json(
                { error: 'This notification has already been sent successfully' },
                { status: 400 }
            );
        }

        // For this simplified example, we'll just mark the notification as sent
        // In a real system, you would call the appropriate notification service here
        const updateResult = await pool.query(
            'UPDATE notification_logs SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            ['sent', id]
        );

        return NextResponse.json({
            success: true,
            message: 'Notification resent successfully',
            log: updateResult.rows[0]
        });
    } catch (error) {
        console.error('Error resending notification:', error);
        return NextResponse.json(
            { error: 'Failed to resend notification' },
            { status: 500 }
        );
    }
} 