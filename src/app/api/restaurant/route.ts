import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        // Fetch the first restaurant (assuming there's only one for now)
        // In a multi-restaurant system, we could use a query param to specify which restaurant
        const restaurantQuery = await executeQuery<any[]>(`
      SELECT id, name, description, address, 
             COALESCE(phone, '') as phone, 
             COALESCE(email, '') as email, 
             COALESCE(website, '') as website,
             logo_url,
             COALESCE(primary_color, '#3b82f6') as primary_color,
             COALESCE(secondary_color, '#60a5fa') as secondary_color
      FROM restaurants
      LIMIT 1
    `);

        if (restaurantQuery.length === 0) {
            // Instead of returning a 404 error, create a default restaurant
            console.log('No restaurant found, creating a default one');

            // Create a default restaurant
            const insertResult = await executeQuery<any[]>(`
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
                    'Snytra Restaurant', 
                    'A modern dining experience', 
                    '123 Main Street, City', 
                    '555-123-4567', 
                    'contact@snytrarestaurant.com', 
                    'https://snytrarestaurant.com', 
                    '/logo.png', 
                    '#3b82f6', 
                    '#60a5fa'
                ) RETURNING 
                    id, 
                    name, 
                    description, 
                    address, 
                    phone, 
                    email, 
                    website, 
                    logo_url, 
                    primary_color, 
                    secondary_color
            `);

            return NextResponse.json({
                restaurant: insertResult[0],
                success: true,
                message: 'Default restaurant created'
            });
        }

        return NextResponse.json({
            restaurant: restaurantQuery[0],
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