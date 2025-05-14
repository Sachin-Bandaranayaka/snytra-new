import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const orderId = params.id;

    if (!orderId) {
        return NextResponse.json(
            { success: false, error: 'Order ID is required' },
            { status: 400 }
        );
    }

    try {
        // Get order status from database
        const result = await pool.query(
            `SELECT id, status, 
              EXTRACT(EPOCH FROM (NOW() - created_at))/60 AS elapsed_minutes,
              preparation_time_minutes AS estimated_time
       FROM orders 
       WHERE id = $1`,
            [orderId]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Order not found' },
                { status: 404 }
            );
        }

        const order = result.rows[0];

        // Calculate estimated time based on order status and elapsed time
        let estimatedTime = order.estimated_time || 15; // Default 15 minutes if not set

        if (order.status === 'preparing') {
            // Adjust estimate based on elapsed time
            const elapsedMinutes = Math.round(order.elapsed_minutes || 0);
            estimatedTime = Math.max(estimatedTime - elapsedMinutes, 1);
        }

        return NextResponse.json({
            success: true,
            orderId: parseInt(orderId),
            status: order.status,
            estimatedTime: Math.round(estimatedTime)
        });
    } catch (error: any) {
        console.error('Error fetching order status:', error);

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch order status' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const orderId = params.id;

    if (!orderId) {
        return NextResponse.json(
            { success: false, error: 'Order ID is required' },
            { status: 400 }
        );
    }

    try {
        const requestData = await request.json();
        const { status } = requestData;

        if (!status) {
            return NextResponse.json(
                { success: false, error: 'Status is required' },
                { status: 400 }
            );
        }

        // Validate status value
        const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { success: false, error: 'Invalid status value' },
                { status: 400 }
            );
        }

        // Update order status in database
        const result = await pool.query(
            `UPDATE orders 
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING id, status, created_at, updated_at`,
            [status, orderId]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { success: false, error: 'Order not found' },
                { status: 404 }
            );
        }

        const updatedOrder = result.rows[0];

        return NextResponse.json({
            success: true,
            order: {
                id: updatedOrder.id,
                status: updatedOrder.status,
                updated_at: updatedOrder.updated_at
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