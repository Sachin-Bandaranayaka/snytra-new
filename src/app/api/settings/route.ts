import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/db/postgres';
import { isUserAdmin } from '@/lib/authUtils';

// GET - Retrieve settings
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const key = searchParams.get('key');

        let query;
        if (key) {
            // Get specific setting
            query = sql`
                SELECT key, value FROM settings 
                WHERE key = ${key}
            `;
        } else {
            // Get all settings
            query = sql`
                SELECT key, value FROM settings
            `;
        }

        const rows = await query;

        // If looking for a specific key, return just the value
        if (key && rows.length > 0) {
            return NextResponse.json(rows[0].value);
        }

        // Otherwise transform to a key-value object
        const settings = rows.reduce((acc, row) => {
            acc[row.key] = row.value;
            return acc;
        }, {});

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

// PATCH - Update settings
export async function PATCH(req: NextRequest) {
    try {
        // Check if the user is an admin
        const isAdmin = await isUserAdmin();
        if (!isAdmin) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { key, value } = await req.json();

        if (!key || !value) {
            return NextResponse.json(
                { error: 'Missing key or value' },
                { status: 400 }
            );
        }

        // Update setting
        const result = await sql`
            INSERT INTO settings (key, value)
            VALUES (${key}, ${value})
            ON CONFLICT (key) 
            DO UPDATE SET value = ${value}, updated_at = CURRENT_TIMESTAMP
            RETURNING key, value
        `;

        if (result.length === 0) {
            return NextResponse.json(
                { error: 'Failed to update setting' },
                { status: 500 }
            );
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        );
    }
} 