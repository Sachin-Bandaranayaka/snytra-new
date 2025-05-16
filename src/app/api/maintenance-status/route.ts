import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/db/postgres';
import { isUserAdmin } from '@/lib/authUtils';
import { cookies } from 'next/headers';

// GET - Check maintenance mode status
export async function GET() {
    try {
        // Get maintenance mode setting from database
        const result = await sql`
            SELECT value->>'maintenanceMode' as maintenance_mode 
            FROM settings 
            WHERE key = 'advanced'
        `;

        const isMaintenanceMode = result[0]?.maintenance_mode === 'true';

        // Set cookie for middleware to use
        const cookieStore = await cookies();
        await cookieStore.set('maintenance_mode', isMaintenanceMode.toString(), {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 // 1 day
        });

        return NextResponse.json({ maintenanceMode: isMaintenanceMode });
    } catch (error) {
        console.error('Error checking maintenance mode:', error);
        return NextResponse.json(
            { error: 'Failed to check maintenance mode' },
            { status: 500 }
        );
    }
}

// POST - Update maintenance mode status (admin only)
export async function POST(req: NextRequest) {
    try {
        // Check if the user is an admin
        const isAdmin = await isUserAdmin();
        if (!isAdmin) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { maintenanceMode } = await req.json();
        if (typeof maintenanceMode !== 'boolean') {
            return NextResponse.json(
                { error: 'maintenanceMode must be a boolean' },
                { status: 400 }
            );
        }

        // Get current advanced settings
        const currentSettings = await sql`
            SELECT value FROM settings WHERE key = 'advanced'
        `;

        let advancedSettings = {};
        if (currentSettings.length > 0) {
            advancedSettings = currentSettings[0].value;
        }

        // Update advanced settings
        const updatedSettings = {
            ...advancedSettings,
            maintenanceMode
        };

        // Update the settings in database
        await sql`
            INSERT INTO settings (key, value)
            VALUES ('advanced', ${JSON.stringify(updatedSettings)})
            ON CONFLICT (key) 
            DO UPDATE SET value = ${JSON.stringify(updatedSettings)}, updated_at = CURRENT_TIMESTAMP
        `;

        // Set cookie for middleware to use
        const cookieStore = await cookies();
        await cookieStore.set('maintenance_mode', maintenanceMode.toString(), {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 // 1 day
        });

        return NextResponse.json({ success: true, maintenanceMode });
    } catch (error) {
        console.error('Error updating maintenance mode:', error);
        return NextResponse.json(
            { error: 'Failed to update maintenance mode' },
            { status: 500 }
        );
    }
} 