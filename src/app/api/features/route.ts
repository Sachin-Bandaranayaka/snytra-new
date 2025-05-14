import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

/**
 * Get all available features
 */
export async function GET(request: NextRequest) {
    try {
        // Get all features
        const result = await pool.query(
            `SELECT * FROM features ORDER BY name ASC`
        );

        // If no features exist, create default ones
        if (result.rows.length === 0) {
            const defaultFeatures = [
                { key: 'menu_management', name: 'Menu Management', description: 'Create and manage menus for your restaurant' },
                { key: 'online_ordering', name: 'Online Ordering', description: 'Accept orders online from customers' },
                { key: 'reservation_system', name: 'Reservation System', description: 'Allow customers to make reservations' },
                { key: 'inventory_management', name: 'Inventory Management', description: 'Track inventory and get alerts for low stock' },
                { key: 'table_management', name: 'Table Management', description: 'Manage tables and seating arrangements' },
                { key: 'basic_analytics', name: 'Basic Analytics', description: 'View basic reports about your restaurant' },
                { key: 'advanced_analytics', name: 'Advanced Analytics', description: 'Access detailed reports and insights' },
                { key: 'email_support', name: 'Email Support', description: 'Get support via email' },
                { key: 'priority_support', name: 'Priority Support', description: 'Get priority support with faster response times' },
                { key: 'multi_location', name: 'Multi-location Support', description: 'Manage multiple restaurant locations' },
                { key: 'custom_reporting', name: 'Custom Reporting', description: 'Build custom reports for your business' },
                { key: 'api_access', name: 'API Access', description: 'Access our API for custom integrations' },
                { key: 'white_label', name: 'White Label', description: 'Remove our branding and use your own' },
                { key: 'dedicated_account_manager', name: 'Dedicated Account Manager', description: 'Get a dedicated account manager' }
            ];

            // Insert default features
            for (const feature of defaultFeatures) {
                await pool.query(
                    `INSERT INTO features (key, name, description, created_at, updated_at) 
                     VALUES ($1, $2, $3, NOW(), NOW())
                     ON CONFLICT (key) DO NOTHING`,
                    [feature.key, feature.name, feature.description]
                );
            }

            // Get all features again
            const updatedResult = await pool.query(
                `SELECT * FROM features ORDER BY name ASC`
            );

            return NextResponse.json({
                success: true,
                features: updatedResult.rows,
                message: 'Default features created'
            });
        }

        return NextResponse.json({
            success: true,
            features: result.rows
        });
    } catch (error) {
        console.error('Error fetching features:', error);
        return NextResponse.json(
            { error: 'Failed to fetch features', success: false },
            { status: 500 }
        );
    }
}

/**
 * Create a new feature
 */
export async function POST(request: NextRequest) {
    try {
        const { key, name, description } = await request.json();

        // Validate input
        if (!key || !name) {
            return NextResponse.json(
                { error: 'Feature key and name are required', success: false },
                { status: 400 }
            );
        }

        // Check if feature already exists
        const existingResult = await pool.query(
            `SELECT * FROM features WHERE key = $1`,
            [key]
        );

        if (existingResult.rows.length > 0) {
            return NextResponse.json(
                { error: 'Feature with this key already exists', success: false },
                { status: 409 }
            );
        }

        // Create new feature
        const result = await pool.query(
            `INSERT INTO features (key, name, description, created_at, updated_at)
             VALUES ($1, $2, $3, NOW(), NOW())
             RETURNING *`,
            [key, name, description || null]
        );

        return NextResponse.json({
            success: true,
            feature: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating feature:', error);
        return NextResponse.json(
            { error: 'Failed to create feature', success: false },
            { status: 500 }
        );
    }
} 