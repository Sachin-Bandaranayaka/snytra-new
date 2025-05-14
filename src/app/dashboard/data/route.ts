import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Fetch restaurants
    const restaurantsQuery = await pool.query(`
      SELECT id, name, description, address 
      FROM restaurants 
      ORDER BY name ASC
    `);

    // Fetch recent orders
    const ordersQuery = await pool.query(`
      SELECT id, customer_name, status, total_amount, created_at 
      FROM orders 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    // Fetch summary stats
    const totalOrdersQuery = await pool.query(`
      SELECT COUNT(*) as count FROM orders
    `);

    const totalRevenueQuery = await pool.query(`
      SELECT SUM(total_amount) as sum FROM orders WHERE status != 'cancelled'
    `);

    const totalCustomersQuery = await pool.query(`
      SELECT COUNT(DISTINCT customer_email) as count FROM orders WHERE customer_email IS NOT NULL
    `);

    // Get pending orders count
    const pendingOrdersQuery = await pool.query(`
      SELECT COUNT(*) as count FROM orders WHERE status = 'pending'
    `);

    // Get orders from this week
    const ordersThisWeekQuery = await pool.query(`
      SELECT COUNT(*) as count 
      FROM orders 
      WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)
    `);

    // Get orders from previous week
    const previousWeekOrdersQuery = await pool.query(`
      SELECT COUNT(*) as count 
      FROM orders 
      WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week')
      AND created_at < DATE_TRUNC('week', CURRENT_DATE)
    `);

    // Get revenue from this week
    const revenueThisWeekQuery = await pool.query(`
      SELECT COALESCE(SUM(total_amount), 0) as sum 
      FROM orders 
      WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)
      AND status != 'cancelled'
    `);

    // Get revenue from previous week
    const previousWeekRevenueQuery = await pool.query(`
      SELECT COALESCE(SUM(total_amount), 0) as sum 
      FROM orders 
      WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week')
      AND created_at < DATE_TRUNC('week', CURRENT_DATE)
      AND status != 'cancelled'
    `);

    return NextResponse.json({
      restaurants: restaurantsQuery.rows,
      recentOrders: ordersQuery.rows,
      stats: {
        totalOrders: Number(totalOrdersQuery.rows[0]?.count) || 0,
        totalRevenue: Number(totalRevenueQuery.rows[0]?.sum) || 0,
        totalCustomers: Number(totalCustomersQuery.rows[0]?.count) || 0,
        pendingOrders: Number(pendingOrdersQuery.rows[0]?.count) || 0,
        ordersThisWeek: Number(ordersThisWeekQuery.rows[0]?.count) || 0,
        previousWeekOrders: Number(previousWeekOrdersQuery.rows[0]?.count) || 0,
        revenueThisWeek: Number(revenueThisWeekQuery.rows[0]?.sum) || 0,
        previousWeekRevenue: Number(previousWeekRevenueQuery.rows[0]?.sum) || 0
      },
      success: true
    });
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: error.message, success: false },
      { status: 500 }
    );
  }
} 