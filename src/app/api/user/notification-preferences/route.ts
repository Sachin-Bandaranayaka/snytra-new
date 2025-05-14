import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Get the user's notification preferences
 */
export async function GET(request: NextRequest) {
    try {
        // Get the user from session
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // Check if the user has notification preferences
        const result = await pool.query(
            'SELECT preferences FROM user_notification_preferences WHERE user_id = $1',
            [userId]
        );

        if (result.rowCount === 0) {
            // Return default preferences if not found
            return NextResponse.json({
                preferences: {
                    email: true,
                    sms: false,
                    whatsapp: false,
                    notifications: {
                        order_updates: true,
                        reservation_updates: true,
                        waitlist_notifications: true,
                        promotional: false
                    }
                }
            });
        }

        return NextResponse.json({ preferences: result.rows[0].preferences });
    } catch (error) {
        console.error('Error fetching notification preferences:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notification preferences' },
            { status: 500 }
        );
    }
}

/**
 * Update the user's notification preferences
 */
export async function POST(request: NextRequest) {
    try {
        // Get the user from session
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // Get the preferences from request body
        const { preferences } = await request.json();

        if (!preferences) {
            return NextResponse.json(
                { error: 'Preferences are required' },
                { status: 400 }
            );
        }

        // Check if the user already has preferences
        const checkResult = await pool.query(
            'SELECT id FROM user_notification_preferences WHERE user_id = $1',
            [userId]
        );

        if (checkResult.rowCount === 0) {
            // Insert new preferences
            await pool.query(
                'INSERT INTO user_notification_preferences (user_id, preferences) VALUES ($1, $2)',
                [userId, JSON.stringify(preferences)]
            );
        } else {
            // Update existing preferences
            await pool.query(
                'UPDATE user_notification_preferences SET preferences = $1, updated_at = NOW() WHERE user_id = $2',
                [JSON.stringify(preferences), userId]
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Notification preferences updated successfully'
        });
    } catch (error) {
        console.error('Error updating notification preferences:', error);
        return NextResponse.json(
            { error: 'Failed to update notification preferences' },
            { status: 500 }
        );
    }
} 