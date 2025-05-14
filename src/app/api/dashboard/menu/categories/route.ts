import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        // Check all the columns we need
        const columnsResult = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'categories' AND column_name IN (
                'description', 'image_url', 'display_order', 'is_active'
            )
        `);

        // Create a set of available columns for easy checking
        const availableColumns = new Set(columnsResult.rows.map(row => row.column_name));

        // Add any missing columns
        const requiredColumns = [
            { name: 'description', type: 'TEXT' },
            { name: 'image_url', type: 'VARCHAR(255)' },
            { name: 'display_order', type: 'INTEGER DEFAULT 0' },
            { name: 'is_active', type: 'BOOLEAN DEFAULT TRUE' }
        ];

        for (const column of requiredColumns) {
            if (!availableColumns.has(column.name)) {
                try {
                    await pool.query(`
                        ALTER TABLE categories
                        ADD COLUMN ${column.name} ${column.type}
                    `);
                    console.log(`Added missing ${column.name} column to categories table`);
                } catch (alterError) {
                    console.error(`Error adding ${column.name} column:`, alterError);
                }
            }
        }

        // Now fetch categories with all columns (they should exist now)
        const categoriesResult = await pool.query(`
            SELECT id, name, description, image_url, display_order, is_active 
            FROM categories 
            ORDER BY name ASC
        `);

        // Check if categories exist
        if (categoriesResult.rows.length === 0) {
            console.log('No categories found, creating default categories');

            // Create default categories
            const defaultCategories = [
                { name: 'Appetizers', description: 'Start your meal with our delicious appetizers', is_active: true },
                { name: 'Main Course', description: 'Our signature main dishes', is_active: true },
                { name: 'Desserts', description: 'Sweet treats to end your meal', is_active: true },
                { name: 'Beverages', description: 'Refreshing drinks and beverages', is_active: true },
                { name: 'Specials', description: 'Our chef\'s special creations', is_active: true }
            ];

            // Get restaurant ID (assuming there's at least one after the fix in restaurant/route.ts)
            const restaurantResult = await pool.query('SELECT id FROM restaurants LIMIT 1');
            const restaurantId = restaurantResult.rows[0]?.id;

            if (!restaurantId) {
                throw new Error('No restaurant found to associate categories with');
            }

            // Insert default categories
            const insertPromises = defaultCategories.map(async (category, index) => {
                return pool.query(`
                    INSERT INTO categories (
                        restaurant_id, name, description, image_url, display_order, is_active
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6
                    ) RETURNING id, name, description, image_url, display_order, is_active
                `, [restaurantId, category.name, category.description, '', index, category.is_active]);
            });

            const insertResults = await Promise.all(insertPromises);
            const newCategories = insertResults.map(result => result.rows[0]);

            return NextResponse.json({
                categories: newCategories,
                success: true,
                message: 'Default categories created'
            });
        }

        return NextResponse.json({
            categories: categoriesResult.rows,
            success: true
        });
    } catch (error: any) {
        console.error('Error fetching or creating categories:', error);
        return NextResponse.json(
            { error: error.message, success: false },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const { name, description = '', image_url = '', is_active = true } = await req.json();

        // Validate input
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return NextResponse.json(
                { error: 'Category name is required', success: false },
                { status: 400 }
            );
        }

        // Check if category with this name already exists
        const existingCategory = await pool.query(
            'SELECT id FROM categories WHERE LOWER(name) = LOWER($1)',
            [name.trim()]
        );

        if (existingCategory.rows.length > 0) {
            return NextResponse.json(
                { error: 'A category with this name already exists', success: false },
                { status: 400 }
            );
        }

        // Check all columns to make sure they exist
        const columnsResult = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'categories' AND column_name IN (
                'description', 'image_url', 'display_order', 'is_active'
            )
        `);

        const availableColumns = new Set(columnsResult.rows.map(row => row.column_name));

        // Add any missing columns before inserting
        const requiredColumns = [
            { name: 'description', type: 'TEXT' },
            { name: 'image_url', type: 'VARCHAR(255)' },
            { name: 'display_order', type: 'INTEGER DEFAULT 0' },
            { name: 'is_active', type: 'BOOLEAN DEFAULT TRUE' }
        ];

        for (const column of requiredColumns) {
            if (!availableColumns.has(column.name)) {
                try {
                    await pool.query(`
                        ALTER TABLE categories
                        ADD COLUMN ${column.name} ${column.type}
                    `);
                    console.log(`Added missing ${column.name} column to categories table`);
                } catch (alterError) {
                    console.error(`Error adding ${column.name} column:`, alterError);
                }
            }
        }

        // Insert new category with all columns
        const result = await pool.query(
            'INSERT INTO categories (name, description, image_url, is_active) VALUES ($1, $2, $3, $4) RETURNING id, name, description, image_url, is_active',
            [name.trim(), description, image_url, is_active]
        );

        return NextResponse.json({
            category: result.rows[0],
            success: true
        });
    } catch (error: any) {
        console.error('Error creating category:', error);
        return NextResponse.json(
            { error: error.message, success: false },
            { status: 500 }
        );
    }
} 