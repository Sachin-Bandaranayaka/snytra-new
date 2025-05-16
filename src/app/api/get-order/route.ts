import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('session_id');
    const orderId = url.searchParams.get('order_id');

    if (!sessionId && !orderId) {
        return NextResponse.json(
            { error: 'Session ID or Order ID is required' },
            { status: 400 }
        );
    }

    try {
        let query, result;

        if (sessionId) {
            // First try to fetch from orders table
            result = await pool.query(
                `SELECT * FROM orders WHERE session_id = $1 LIMIT 1`,
                [sessionId]
            );

            // If not found in orders table, try the vercel postgres orders
            if (result.length === 0) {
                try {
                    result = await pool.query(
                        `SELECT * FROM orders WHERE session_id = $1 LIMIT 1`,
                        [sessionId]
                    );
                } catch (err) {
                    console.error('Error querying vercel postgres orders:', err);
                }
            }
        } else if (orderId) {
            // Try to fetch by order ID
            result = await pool.query(
                `SELECT * FROM orders WHERE id = $1 LIMIT 1`,
                [orderId]
            );
        }

        if (!result || result.length === 0) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        const order = result[0];

        // Parse the items if they're stored as JSON string
        if (order.items && typeof order.items === 'string') {
            try {
                order.items = JSON.parse(order.items);
            } catch (err) {
                console.error('Error parsing items JSON:', err);
            }
        } else if (!order.items) {
            // Try to fetch order items from order_items table
            const itemsResult = await executeQuery<any[]>(
                `SELECT * FROM order_items WHERE order_id = $1`,
                [order.id]
            );
            order.items = itemsResult;
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json(
            { error: 'Failed to fetch order details' },
            { status: 500 }
        );
    }
} 