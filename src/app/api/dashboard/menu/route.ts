import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        // Fetch categories
        const categoriesQuery = await pool.query(`
      SELECT id, name, is_active 
      FROM categories 
      ORDER BY name ASC
    `);

        // Fetch menu items
        const menuItemsQuery = await pool.query(`
      SELECT id, name, description, price, category_id, image_url, is_available
      FROM menu_items
      ORDER BY name ASC
    `);

        return NextResponse.json({
            categories: categoriesQuery.rows,
            menuItems: menuItemsQuery.rows,
            success: true
        });
    } catch (error: any) {
        console.error('Error fetching menu data:', error);
        return NextResponse.json(
            { error: error.message, success: false },
            { status: 500 }
        );
    }
} 