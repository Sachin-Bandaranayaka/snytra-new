import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        // Fetch orders with item counts
        const ordersQuery = await executeQuery<any[]>(`
      SELECT o.id, o.customer_name, o.customer_email, o.status, o.total_amount, 
             COALESCE(o.payment_status, 'pending') as payment_status, o.created_at,
             COUNT(oi.id) as items_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);

        return NextResponse.json({
            orders: ordersQuery,
            success: true
        });
    } catch (error: any) {
        console.error('Error fetching orders data:', error);
        return NextResponse.json(
            { error: error.message, success: false },
            { status: 500 }
        );
    }
} 