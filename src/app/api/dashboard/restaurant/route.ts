import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// Helper to get more consistent results by always fetching/updating the same restaurant
async function getMainRestaurantId() {
    // Check if there are any restaurants
    const countResult = await pool.query('SELECT COUNT(*) FROM restaurants');
    const count = parseInt(countResult.rows[0].count);

    if (count === 0) {
        // No restaurants, create a default one
        console.log('No restaurants found, creating default one');
        const insertResult = await pool.query(`
            INSERT INTO restaurants (
                name, 
                description, 
                address, 
                phone, 
                email, 
                website, 
                logo_url, 
                primary_color, 
                secondary_color
            ) VALUES (
                'Your Restaurant', 
                'A brief description of your restaurant', 
                '123 Main Street, City', 
                '555-123-4567', 
                'contact@yourrestaurant.com', 
                'www.yourrestaurant.com', 
                NULL, 
                '#3b82f6', 
                '#60a5fa'
            ) RETURNING id
        `);
        return insertResult.rows[0].id;
    } else if (count > 1) {
        // Multiple restaurants found, use the one with the lowest ID for consistency
        const idResult = await pool.query('SELECT MIN(id) as id FROM restaurants');
        return idResult.rows[0].id;
    } else {
        // Only one restaurant, just get its ID
        const idResult = await pool.query('SELECT id FROM restaurants LIMIT 1');
        return idResult.rows[0].id;
    }
}

export async function GET(req: NextRequest) {
    try {
        // Get the ID of the main restaurant to ensure consistency
        const restaurantId = await getMainRestaurantId();

        // Now fetch that specific restaurant by ID
        const restaurantQuery = await pool.query(`
            SELECT id, name, description, address, 
                COALESCE(phone, '') as phone, 
                COALESCE(email, '') as email, 
                COALESCE(website, '') as website,
                logo_url,
                COALESCE(primary_color, '#3b82f6') as primary_color,
                COALESCE(secondary_color, '#60a5fa') as secondary_color
            FROM restaurants
            WHERE id = $1
        `, [restaurantId]);

        // This should never happen since we just created the restaurant if it didn't exist
        if (restaurantQuery.rows.length === 0) {
            return NextResponse.json(
                { error: 'Restaurant not found', success: false },
                { status: 404 }
            );
        }

        return NextResponse.json({
            restaurant: restaurantQuery.rows[0],
            success: true
        });
    } catch (error: any) {
        console.error('Error fetching restaurant data:', error);
        return NextResponse.json(
            { error: error.message, success: false },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const data = await req.json();
        const { id, name, description, address, phone, email, website, logo_url, primary_color, secondary_color } = data;

        // Validate required fields
        if (!name) {
            return NextResponse.json(
                { error: 'Restaurant name is required', success: false },
                { status: 400 }
            );
        }

        // Ensure we're updating the correct restaurant
        const restaurantId = id || await getMainRestaurantId();

        // Update restaurant
        const updateQuery = await pool.query(`
            UPDATE restaurants
            SET name = $1, 
                description = $2, 
                address = $3, 
                phone = $4, 
                email = $5, 
                website = $6, 
                logo_url = $7, 
                primary_color = $8, 
                secondary_color = $9,
                updated_at = NOW()
            WHERE id = $10
            RETURNING *
        `, [name, description, address, phone, email, website, logo_url, primary_color, secondary_color, restaurantId]);

        if (updateQuery.rows.length === 0) {
            return NextResponse.json(
                { error: 'Restaurant not found', success: false },
                { status: 404 }
            );
        }

        return NextResponse.json({
            restaurant: updateQuery.rows[0],
            success: true,
            message: 'Restaurant settings saved successfully!'
        });
    } catch (error: any) {
        console.error('Error updating restaurant data:', error);
        return NextResponse.json(
            { error: error.message, success: false },
            { status: 500 }
        );
    }
} 