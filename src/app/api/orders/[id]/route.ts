import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

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
        // Get order details
        const orderResult = await executeQuery<any[]>(
            `SELECT o.id, o.customer_name, o.customer_email, o.customer_phone,
              o.status, o.total_amount, o.payment_status, o.payment_method,
              o.created_at, o.updated_at, o.preparation_time_minutes
       FROM orders o
       WHERE o.id = $1`,
            [orderId]
        );

        if (orderResult.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Order not found' },
                { status: 404 }
            );
        }

        const order = orderResult[0];

        // Get order items
        const itemsResult = await executeQuery<any[]>(
            `SELECT oi.id, oi.menu_item_name as name, oi.quantity, oi.price, oi.notes
       FROM order_items oi
       WHERE oi.order_id = $1`,
            [orderId]
        );

        // Add items to the order object
        order.items = itemsResult;

        return NextResponse.json({
            success: true,
            order
        });
    } catch (error: any) {
        console.error('Error fetching order details:', error);

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch order details' },
            { status: 500 }
        );
    }
} 