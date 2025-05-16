import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const messageId = params.id;

    if (!messageId) {
        return NextResponse.json(
            { success: false, error: 'Message ID is required' },
            { status: 400 }
        );
    }

    try {
        // Check if message exists
        const messageCheck = await executeQuery<any[]>(
            'SELECT id FROM staff_messages WHERE id = $1',
            [messageId]
        );

        if (messageCheck.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Message not found' },
                { status: 404 }
            );
        }

        // Mark message as read
        const result = await executeQuery<any[]>(
            'UPDATE staff_messages SET is_read = true WHERE id = $1 RETURNING *',
            [messageId]
        );

        return NextResponse.json({
            success: true,
            message: result[0]
        });
    } catch (error: any) {
        console.error('Error marking message as read:', error);

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to mark message as read' },
            { status: 500 }
        );
    }
}

// Mark all messages as read for a recipient
export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const recipientId = params.id;

        if (!recipientId) {
            return NextResponse.json(
                { success: false, error: 'Recipient ID is required' },
                { status: 400 }
            );
        }

        // Check if recipient exists
        const recipientCheck = await executeQuery<any[]>(
            'SELECT id FROM staff WHERE id = $1',
            [recipientId]
        );

        if (recipientCheck.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Recipient not found' },
                { status: 404 }
            );
        }

        // Get the sender ID from the request body
        const body = await request.json();
        const { sender_id } = body;

        let query = 'UPDATE staff_messages SET is_read = true WHERE recipient_id = $1 AND is_read = false';
        let params = [recipientId];

        // If sender ID is provided, only mark messages from that sender
        if (sender_id) {
            query += ' AND sender_id = $2';
            params.push(sender_id);
        }

        query += ' RETURNING id';

        // Mark messages as read
        const result = await executeQuery<any[]>(query, params);

        return NextResponse.json({
            success: true,
            count: result.length,
            message: `Marked ${result.length} messages as read`
        });
    } catch (error: any) {
        console.error('Error marking messages as read:', error);

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to mark messages as read' },
            { status: 500 }
        );
    }
} 