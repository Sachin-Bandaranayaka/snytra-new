import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { initSocketServer, notifyOrderStatusChange } from '@/lib/socket-server';

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const orderId = params.id;

    if (!orderId) {
        return NextResponse.json(
            { success: false, error: 'Order ID is required' },
            { status: 400 }
        );
    }

    try {
        const body = await request.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json(
                { success: false, error: 'Status is required' },
                { status: 400 }
            );
        }

        // Validate status
        const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { success: false, error: 'Invalid status value' },
                { status: 400 }
            );
        }

        // Update order status in the database
        const result = await pool.query(
            'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [status, orderId]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { success: false, error: 'Order not found' },
                { status: 404 }
            );
        }

        const updatedOrder = result.rows[0];

        // Initialize Socket.io server and emit status change event
        try {
            // Cast request and response for Socket.io
            const io = initSocketServer(request as any, {
                socket: {
                    server: (request as any).nextUrl.server
                }
            } as any);

            if (io) {
                // Emit status change event to all relevant clients
                notifyOrderStatusChange(io, parseInt(orderId), status);
            }
        } catch (socketError) {
            console.error('Error emitting socket event:', socketError);
            // Don't fail the API response if socket emission fails
        }

        return NextResponse.json({
            success: true,
            order: {
                id: updatedOrder.id,
                status: updatedOrder.status,
                updatedAt: updatedOrder.updated_at
            }
        });
    } catch (error: any) {
        console.error('Error updating order status:', error);

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update order status' },
            { status: 500 }
        );
    }
} 