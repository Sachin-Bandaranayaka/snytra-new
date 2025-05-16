import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET() {
    try {
        // Fetch all menu items
        const result = await executeQuery<any[]>(
            'SELECT id, name, description, price, category_id, image_url, is_available FROM menu_items ORDER BY name ASC'
        );

        return NextResponse.json({
            menuItems: result,
            success: true
        });
    } catch (error: any) {
        console.error('Error fetching menu items:', error);
        return NextResponse.json(
            { error: error.message, success: false },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const { name, description, price, category_id, image_url, is_available } = await req.json();

        // Validate input
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return NextResponse.json(
                { error: 'Menu item name is required', success: false },
                { status: 400 }
            );
        }

        if (isNaN(price) || price <= 0) {
            return NextResponse.json(
                { error: 'Price must be a positive number', success: false },
                { status: 400 }
            );
        }

        if (!category_id || isNaN(category_id)) {
            return NextResponse.json(
                { error: 'Valid category is required', success: false },
                { status: 400 }
            );
        }

        // Insert new menu item
        const result = await executeQuery<any[]>(
            `INSERT INTO menu_items 
            (name, description, price, category_id, image_url, is_available) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING id, name, description, price, category_id, image_url, is_available`,
            [
                name.trim(),
                description || '',
                price,
                category_id,
                image_url || null,
                is_available !== undefined ? is_available : true
            ]
        );

        return NextResponse.json({
            menuItem: result[0],
            success: true
        });
    } catch (error: any) {
        console.error('Error creating menu item:', error);
        return NextResponse.json(
            { error: error.message, success: false },
            { status: 500 }
        );
    }
} 