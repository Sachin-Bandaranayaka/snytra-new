import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { initSocketServer, sendStaffMessage } from '@/lib/socket-server';

export async function GET(request: Request) {
    try {
        // Get query parameters
        const url = new URL(request.url);
        const senderId = url.searchParams.get('sender_id');
        const recipientId = url.searchParams.get('recipient_id');
        const isRead = url.searchParams.get('is_read');
        const limit = parseInt(url.searchParams.get('limit') || '50');

        // Build query
        let query = `
      SELECT sm.*, 
             sender.first_name as sender_first_name, 
             sender.last_name as sender_last_name,
             recipient.first_name as recipient_first_name, 
             recipient.last_name as recipient_last_name
      FROM staff_messages sm
      LEFT JOIN staff sender ON sm.sender_id = sender.id
      LEFT JOIN staff recipient ON sm.recipient_id = recipient.id
      WHERE 1=1
    `;

        const params = [];
        let paramIndex = 1;

        if (senderId) {
            query += ` AND sm.sender_id = $${paramIndex++}`;
            params.push(senderId);
        }

        if (recipientId) {
            query += ` AND sm.recipient_id = $${paramIndex++}`;
            params.push(recipientId);
        }

        if (isRead !== null && isRead !== undefined) {
            query += ` AND sm.is_read = $${paramIndex++}`;
            params.push(isRead === 'true');
        }

        // Get conversations between two staff members
        if (senderId && recipientId) {
            query = `
        SELECT sm.*, 
               sender.first_name as sender_first_name, 
               sender.last_name as sender_last_name,
               recipient.first_name as recipient_first_name, 
               recipient.last_name as recipient_last_name
        FROM staff_messages sm
        LEFT JOIN staff sender ON sm.sender_id = sender.id
        LEFT JOIN staff recipient ON sm.recipient_id = recipient.id
        WHERE (sm.sender_id = $1 AND sm.recipient_id = $2)
           OR (sm.sender_id = $2 AND sm.recipient_id = $1)
      `;
            params = [senderId, recipientId];
        }

        query += ` ORDER BY sm.created_at DESC LIMIT $${paramIndex++}`;
        params.push(limit);

        const result = await pool.query(query, params);

        return NextResponse.json({
            success: true,
            messages: result.rows
        });
    } catch (error: any) {
        console.error('Error fetching messages:', error);

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sender_id, recipient_id, message } = body;

        // Validate required fields
        if (!sender_id || !recipient_id || !message) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing required fields: sender_id, recipient_id, and message are required'
                },
                { status: 400 }
            );
        }

        // Check if sender exists
        const senderCheck = await pool.query(
            'SELECT id FROM staff WHERE id = $1',
            [sender_id]
        );

        if (senderCheck.rowCount === 0) {
            return NextResponse.json(
                { success: false, error: 'Sender not found' },
                { status: 400 }
            );
        }

        // Check if recipient exists
        const recipientCheck = await pool.query(
            'SELECT id FROM staff WHERE id = $1',
            [recipient_id]
        );

        if (recipientCheck.rowCount === 0) {
            return NextResponse.json(
                { success: false, error: 'Recipient not found' },
                { status: 400 }
            );
        }

        // Create new message
        const result = await pool.query(
            `INSERT INTO staff_messages 
        (sender_id, recipient_id, message, is_read)
       VALUES ($1, $2, $3, false)
       RETURNING *`,
            [sender_id, recipient_id, message]
        );

        const newMessage = result.rows[0];

        // Send real-time notification
        try {
            // Cast request for Socket.io
            const io = initSocketServer(request as any, {
                socket: {
                    server: (request as any).nextUrl.server
                }
            } as any);

            if (io) {
                // Get staff names for the notification
                const staffInfo = await pool.query(
                    `SELECT id, first_name, last_name FROM staff WHERE id IN ($1, $2)`,
                    [sender_id, recipient_id]
                );

                const staffMap = staffInfo.rows.reduce((map: any, staff: any) => {
                    map[staff.id] = `${staff.first_name} ${staff.last_name}`;
                    return map;
                }, {});

                // Emit message event
                sendStaffMessage(
                    io,
                    staffMap[sender_id] || `Staff #${sender_id}`,
                    `staff-${recipient_id}`,
                    message
                );
            }
        } catch (socketError) {
            console.error('Error emitting socket event:', socketError);
            // Don't fail the API response if socket emission fails
        }

        return NextResponse.json({
            success: true,
            message: newMessage
        });
    } catch (error: any) {
        console.error('Error creating message:', error);

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create message' },
            { status: 500 }
        );
    }
} 