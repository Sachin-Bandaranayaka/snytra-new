import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET() {
    try {
        // Get orders with their items
        const result = await executeQuery<any[]>(`
      SELECT o.id, o.customer_name, o.status, o.total_amount, 
             o.created_at, o.updated_at, o.special_instructions,
             o.preparation_time_minutes, o.priority,
             t.table_number
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      WHERE o.status IN ('pending', 'preparing', 'ready', 'completed')
      AND o.created_at > NOW() - INTERVAL '24 hours'
      ORDER BY 
        CASE 
          WHEN o.status = 'pending' THEN 1
          WHEN o.status = 'preparing' THEN 2
          WHEN o.status = 'ready' THEN 3
          ELSE 4
        END,
        CASE
          WHEN o.priority = 'high' THEN 1
          WHEN o.priority = 'normal' THEN 2
          WHEN o.priority = 'low' THEN 3
          ELSE 2
        END,
        o.created_at DESC
    `);

        const orders = result;

        // Get order items for all orders
        const itemsResult = await executeQuery<any[]>(`
      SELECT oi.id, oi.order_id, oi.menu_item_name, oi.quantity, oi.notes
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at > NOW() - INTERVAL '24 hours'
      ORDER BY oi.id
    `);

        // Group items by order_id
        const itemsByOrderId = itemsResult.reduce((acc, item) => {
            if (!acc[item.order_id]) {
                acc[item.order_id] = [];
            }
            acc[item.order_id].push({
                id: item.id,
                name: item.menu_item_name,
                quantity: item.quantity,
                notes: item.notes
            });
            return acc;
        }, {});

        // Attach items to orders and format for frontend
        const formattedOrders = orders.map(order => ({
            id: order.id,
            customerName: order.customer_name,
            tableNumber: order.table_number,
            status: order.status,
            priority: order.priority || 'normal',
            totalAmount: parseFloat(order.total_amount),
            createdAt: order.created_at,
            updatedAt: order.updated_at,
            specialInstructions: order.special_instructions,
            preparationTimeMinutes: order.preparation_time_minutes,
            items: itemsByOrderId[order.id] || []
        }));

        return NextResponse.json({
            success: true,
            orders: formattedOrders
        });
    } catch (error: any) {
        console.error('Error fetching kitchen orders:', error);

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch kitchen orders' },
            { status: 500 }
        );
    }
} 