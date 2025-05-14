import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    // Fetch restaurants from database
    const restaurants = await db.sql`
      SELECT id, name, description, address 
      FROM restaurants 
      LIMIT 10
    `;

    // Fetch recent orders - use customer_name from orders table directly
    const recentOrders = await db.sql`
      SELECT id, customer_name, status, total_amount, created_at, 
             CONCAT('Table ', id % 20) as table
      FROM orders
      ORDER BY created_at DESC
      LIMIT 10
    `;

    // Get order items for each recent order using menu_item_name directly from order_items
    const ordersWithItems = await Promise.all(
      recentOrders.map(async (order) => {
        const items = await db.sql`
          SELECT menu_item_name as name, quantity, price
          FROM order_items
          WHERE order_id = ${order.id}
        `;
        return { ...order, items };
      })
    );

    // Fetch menu items
    const menuItems = await db.sql`
      SELECT id, name, description, price, 
             (SELECT name FROM categories WHERE id = menu_items.category_id) as category, 
             image_url, false as is_best_seller
      FROM menu_items
      LIMIT 8
    `;

    // Calculate dashboard stats
    const totalOrdersResult = await db.sql`SELECT COUNT(*) as count FROM orders`;
    const totalOrders = parseInt(totalOrdersResult[0]?.count || '0');

    const totalRevenueResult = await db.sql`SELECT SUM(total_amount) as total FROM orders WHERE status = 'completed'`;
    const totalRevenue = parseFloat(totalRevenueResult[0]?.total || '0');

    // Count distinct customers by email
    const totalCustomersResult = await db.sql`SELECT COUNT(DISTINCT customer_email) as count FROM orders WHERE customer_email IS NOT NULL`;
    const totalCustomers = parseInt(totalCustomersResult[0]?.count || '0');

    const pendingOrdersResult = await db.sql`SELECT COUNT(*) as count FROM orders WHERE status = 'pending'`;
    const pendingOrders = parseInt(pendingOrdersResult[0]?.count || '0');

    const completedOrdersResult = await db.sql`SELECT COUNT(*) as count FROM orders WHERE status = 'completed'`;
    const completedOrders = parseInt(completedOrdersResult[0]?.count || '0');

    const cancelledOrdersResult = await db.sql`SELECT COUNT(*) as count FROM orders WHERE status = 'cancelled'`;
    const cancelledOrders = parseInt(cancelledOrdersResult[0]?.count || '0');

    const inProgressOrdersResult = await db.sql`SELECT COUNT(*) as count FROM orders WHERE status = 'in-progress'`;
    const inProgressOrders = parseInt(inProgressOrdersResult[0]?.count || '0');

    // Get current date and calculate date for 7 days ago
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const fourteenDaysAgo = new Date(sevenDaysAgo);
    fourteenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Format dates for SQL query
    const nowStr = now.toISOString();
    const sevenDaysAgoStr = sevenDaysAgo.toISOString();
    const fourteenDaysAgoStr = fourteenDaysAgo.toISOString();

    // Orders this week vs previous week
    const ordersThisWeekResult = await db.sql`
      SELECT COUNT(*) as count 
      FROM orders 
      WHERE created_at BETWEEN ${sevenDaysAgoStr} AND ${nowStr}
    `;
    const ordersThisWeek = parseInt(ordersThisWeekResult[0]?.count || '0');

    const previousWeekOrdersResult = await db.sql`
      SELECT COUNT(*) as count 
      FROM orders 
      WHERE created_at BETWEEN ${fourteenDaysAgoStr} AND ${sevenDaysAgoStr}
    `;
    const previousWeekOrders = parseInt(previousWeekOrdersResult[0]?.count || '0');

    // Revenue this week vs previous week
    const revenueThisWeekResult = await db.sql`
      SELECT SUM(total_amount) as total 
      FROM orders 
      WHERE status = 'completed' AND created_at BETWEEN ${sevenDaysAgoStr} AND ${nowStr}
    `;
    const revenueThisWeek = parseFloat(revenueThisWeekResult[0]?.total || '0');

    const previousWeekRevenueResult = await db.sql`
      SELECT SUM(total_amount) as total 
      FROM orders 
      WHERE status = 'completed' AND created_at BETWEEN ${fourteenDaysAgoStr} AND ${sevenDaysAgoStr}
    `;
    const previousWeekRevenue = parseFloat(previousWeekRevenueResult[0]?.total || '0');

    // Average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate sales for the last 6 months
    const months = [];
    const currentDate = new Date();

    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(currentDate.getMonth() - i);

      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const startOfMonth = new Date(year, date.getMonth(), 1);
      const endOfMonth = new Date(year, date.getMonth() + 1, 0, 23, 59, 59, 999);

      months.push({
        month,
        startDate: startOfMonth.toISOString(),
        endDate: endOfMonth.toISOString()
      });
    }

    // Query database for sales in each month
    const lastSixMonthsSales = await Promise.all(
      months.map(async ({ month, startDate, endDate }) => {
        const result = await db.sql`
          SELECT COALESCE(SUM(total_amount), 0) as sales
          FROM orders
          WHERE status = 'completed' 
          AND created_at BETWEEN ${startDate} AND ${endDate}
        `;
        return {
          month,
          sales: parseFloat(result[0]?.sales || '0')
        };
      })
    );

    // Return all dashboard data
    return NextResponse.json({
      success: true,
      restaurants,
      recentOrders: ordersWithItems,
      menuItems,
      stats: {
        totalOrders,
        totalRevenue,
        totalCustomers,
        pendingOrders,
        ordersThisWeek,
        previousWeekOrders,
        revenueThisWeek,
        previousWeekRevenue,
        averageOrderValue,
        completedOrders,
        cancelledOrders,
        inProgressOrders,
        lastSixMonthsSales
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
} 