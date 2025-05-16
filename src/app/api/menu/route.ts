import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { convertNumericStrings, processMenuItem } from '@/utils/dataConverter';

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const categoryId = searchParams.get('category');

        // Base query to fetch all active menu items
        let query = `
            SELECT m.id, m.name, m.description, m.price, m.image_url, 
                   m.is_available, m.category_id, c.name as category_name
            FROM menu_items m
            JOIN categories c ON m.category_id = c.id
            WHERE m.is_available = true AND c.is_active = true
        `;

        // Add category filter if specified
        const queryParams = [];
        if (categoryId) {
            query += ` AND m.category_id = $1`;
            queryParams.push(categoryId);
        }

        // Add sorting
        query += ` ORDER BY c.name, m.name`;

        // Execute the query
        const result = await executeQuery<any[]>(query, queryParams);

        // Convert string numeric values to actual numbers
        const menuItems = convertNumericStrings(result);

        // If no menu items found, create default ones
        if (menuItems.length === 0) {
            console.log('No menu items found, creating default items');

            // Get restaurant ID
            const restaurantResult = await executeQuery<any[]>('SELECT id FROM restaurants LIMIT 1');
            const restaurantId = restaurantResult[0]?.id;

            if (!restaurantId) {
                throw new Error('No restaurant found to associate menu items with');
            }

            // Get categories or create them if they don't exist
            let categories = await pool.query('SELECT id, name FROM categories WHERE is_active = true');

            if (categories.length === 0) {
                // Call the categories API to create default categories
                const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/dashboard/menu/categories`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });

                const data = await response.json();
                categories = { rows: data.categories };
            }

            // Map of category names to IDs
            const categoryMap = {};
            categories.forEach(cat => {
                categoryMap[cat.name.toLowerCase()] = cat.id;
            });

            // Default menu items for each category
            const defaultItems = [
                {
                    name: 'Garlic Bread',
                    description: 'Toasted bread with garlic butter and herbs',
                    price: 6.99,
                    category: 'appetizers',
                    image_url: '/images/placeholder-food-1.jpg',
                    is_vegetarian: true
                },
                {
                    name: 'Mozzarella Sticks',
                    description: 'Breaded mozzarella sticks with marinara sauce',
                    price: 8.99,
                    category: 'appetizers',
                    image_url: '/images/placeholder-food-2.jpg',
                    is_vegetarian: true
                },
                {
                    name: 'Grilled Salmon',
                    description: 'Fresh grilled salmon with lemon butter sauce',
                    price: 18.99,
                    category: 'main course',
                    image_url: '/images/placeholder-food-3.jpg'
                },
                {
                    name: 'Ribeye Steak',
                    description: '12oz ribeye steak with roasted vegetables',
                    price: 24.99,
                    category: 'main course',
                    image_url: '/images/placeholder-food-4.jpg'
                },
                {
                    name: 'Chocolate Cake',
                    description: 'Rich chocolate cake with vanilla ice cream',
                    price: 7.99,
                    category: 'desserts',
                    image_url: '/images/placeholder-food-5.jpg',
                    is_vegetarian: true
                },
                {
                    name: 'Fresh Fruit Salad',
                    description: 'Assortment of seasonal fruits',
                    price: 5.99,
                    category: 'desserts',
                    image_url: '/images/placeholder-food-6.jpg',
                    is_vegetarian: true,
                    is_vegan: true,
                    is_gluten_free: true
                },
                {
                    name: 'Soda',
                    description: 'Choice of soft drinks',
                    price: 2.99,
                    category: 'beverages',
                    image_url: '/images/placeholder-food-7.jpg',
                    is_vegetarian: true,
                    is_vegan: true,
                    is_gluten_free: true
                },
                {
                    name: 'Coffee',
                    description: 'Freshly brewed coffee',
                    price: 3.99,
                    category: 'beverages',
                    image_url: '/images/placeholder-food-8.jpg',
                    is_vegetarian: true,
                    is_vegan: true,
                    is_gluten_free: true
                },
                {
                    name: 'Chef\'s Special Pasta',
                    description: 'Homemade pasta with chef\'s special sauce',
                    price: 16.99,
                    category: 'specials',
                    image_url: '/images/placeholder-food-9.jpg'
                }
            ];

            // Insert default menu items
            const newMenuItems = [];

            for (const item of defaultItems) {
                const categoryId = categoryMap[item.category];

                if (categoryId) {
                    const insertResult = await executeQuery<any[]>(`
                        INSERT INTO menu_items (
                            restaurant_id, 
                            category_id, 
                            name, 
                            description, 
                            price, 
                            image_url, 
                            is_vegetarian, 
                            is_vegan, 
                            is_gluten_free, 
                            is_available
                        ) VALUES (
                            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
                        ) RETURNING 
                            id, name, description, price, image_url, is_available, category_id
                    `, [
                        restaurantId,
                        categoryId,
                        item.name,
                        item.description,
                        item.price,
                        item.image_url,
                        item.is_vegetarian || false,
                        item.is_vegan || false,
                        item.is_gluten_free || false,
                        true
                    ]);

                    // Add category name to the returned menu item
                    const categoryName = categories.find(cat => cat.id === categoryId)?.name;
                    newMenuItems.push({
                        ...insertResult[0],
                        category_name: categoryName
                    });
                }
            }

            // Fetch all active categories for navigation
            const categoriesResult = await executeQuery<any[]>(`
                SELECT id, name 
                FROM categories 
                WHERE is_active = true
                ORDER BY name
            `);

            return NextResponse.json({
                menuItems: convertNumericStrings(newMenuItems),
                categories: categoriesResult,
                success: true,
                message: 'Default menu items created'
            });
        }

        // Fetch all active categories for navigation
        const categoriesResult = await executeQuery<any[]>(`
            SELECT id, name 
            FROM categories 
            WHERE is_active = true
            ORDER BY name
        `);

        return NextResponse.json({
            menuItems,
            categories: categoriesResult,
            success: true
        });
    } catch (error: any) {
        console.error('Error fetching menu:', error);
        return NextResponse.json(
            { error: error.message, success: false },
            { status: 500 }
        );
    }
} 