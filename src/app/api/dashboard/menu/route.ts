import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        // Fetch categories
        const categoriesQuery = await executeQuery<any[]>(`
      SELECT id, name, is_active 
      FROM categories 
      ORDER BY name ASC
    `);

        // Fetch menu items
        const menuItemsQuery = await executeQuery<any[]>(`
      SELECT id, name, description, price, category_id, image_url, is_available
      FROM menu_items
      ORDER BY name ASC
    `);

        return NextResponse.json({
            categories: categoriesQuery,
            menuItems: menuItemsQuery,
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