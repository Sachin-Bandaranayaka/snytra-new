import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        // Verify authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get date range from query parameters
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate') || '';
        const endDate = searchParams.get('endDate') || '';

        if (!startDate || !endDate) {
            return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 });
        }

        // Connect to database
        const client = await pool.connect();

        try {
            // Get total revenue and order count
            const totalStatsQuery = `
        SELECT 
          COALESCE(SUM(total_amount), 0) as total_revenue,
          COUNT(*) as total_orders,
          CASE 
            WHEN COUNT(*) > 0 THEN COALESCE(SUM(total_amount), 0) / COUNT(*)
            ELSE 0
          END as avg_order_value
        FROM orders
        WHERE created_at BETWEEN $1 AND ($2 || ' 23:59:59')::timestamp;
      `;

            const totalStatsResult = await client.query(totalStatsQuery, [startDate, endDate]);

            // Get daily sales data
            const dailySalesQuery = `
        SELECT 
          DATE(created_at) as date,
          SUM(total_amount) as total,
          COUNT(*) as order_count
        FROM orders
        WHERE created_at BETWEEN $1 AND ($2 || ' 23:59:59')::timestamp
        GROUP BY DATE(created_at)
        ORDER BY date;
      `;

            const dailySalesResult = await client.query(dailySalesQuery, [startDate, endDate]);

            // Get popular menu items
            const popularItemsQuery = `
        SELECT 
          oi.menu_item_name as name,
          SUM(oi.quantity) as quantity,
          SUM(oi.subtotal) as revenue
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.created_at BETWEEN $1 AND ($2 || ' 23:59:59')::timestamp
        GROUP BY oi.menu_item_name
        ORDER BY quantity DESC
        LIMIT 10;
      `;

            const popularItemsResult = await client.query(popularItemsQuery, [startDate, endDate]);

            // Get order stats by status
            const orderStatusQuery = `
        SELECT 
          status,
          COUNT(*) as count
        FROM orders
        WHERE created_at BETWEEN $1 AND ($2 || ' 23:59:59')::timestamp
        GROUP BY status
        ORDER BY count DESC;
      `;

            const orderStatusResult = await client.query(orderStatusQuery, [startDate, endDate]);

            // Prepare and return the analytics data
            const analytics = {
                totalRevenue: parseFloat(totalStatsResult[0].total_revenue) || 0,
                totalOrders: parseInt(totalStatsResult[0].total_orders) || 0,
                averageOrderValue: parseFloat(totalStatsResult[0].avg_order_value) || 0,
                dailySales: dailySalesResult.map(row => ({
                    date: row.date.toISOString().split('T')[0],
                    total: parseFloat(row.total),
                    orderCount: parseInt(row.order_count)
                })),
                popularItems: popularItemsResult.map(row => ({
                    name: row.name,
                    quantity: parseInt(row.quantity),
                    revenue: parseFloat(row.revenue)
                })),
                orderStatsByStatus: orderStatusResult.map(row => ({
                    status: row.status,
                    count: parseInt(row.count)
                }))
            };

            return NextResponse.json(analytics);
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error fetching order analytics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch order analytics' },
            { status: 500 }
        );
    }
} 