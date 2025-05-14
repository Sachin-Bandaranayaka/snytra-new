import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    // Query the database for popular menu items
    // Criteria for popularity could be:
    // 1. Items that have been ordered the most
    // 2. Items with highest ratings
    // 3. Items marked as "featured" by the restaurant
    // For this implementation, we'll use a combination of these

    const popularItems = await pool.query(`
      SELECT 
        mi.id,
        mi.name,
        mi.description,
        mi.price,
        mi.image_url,
        mi.category_id,
        mi.is_available,
        c.name as category_name,
        COALESCE(COUNT(oi.id), 0) as order_count
      FROM 
        menu_items mi
      LEFT JOIN 
        categories c ON mi.category_id = c.id
      LEFT JOIN 
        order_items oi ON mi.id = oi.menu_item_id
      WHERE 
        mi.is_available = true
      GROUP BY 
        mi.id, mi.name, mi.description, mi.price, mi.image_url, mi.category_id, mi.is_available, c.name
      ORDER BY 
        order_count DESC
      LIMIT 8
    `);

    return NextResponse.json({
      success: true,
      items: popularItems.rows.map(item => ({
        ...item,
        // Ensure price is a number
        price: parseFloat(item.price),
        // Convert review count to number
        review_count: parseInt(item.order_count)
      }))
    });
  } catch (error) {
    console.error('Error fetching popular menu items:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch popular menu items',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 