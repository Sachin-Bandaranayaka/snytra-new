import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const sessionId = url.searchParams.get('sessionId');

    if (!userId || !sessionId) {
        return NextResponse.json(
            { error: 'Missing required parameters' },
            { status: 400 }
        );
    }

    try {
        // Check the subscription status in the database
        const eventRows = await executeQuery<any[]>(
            `SELECT status, stripe_subscription_id
             FROM subscription_events
             WHERE user_id = $1 AND session_id = $2
             ORDER BY created_at DESC
             LIMIT 1`,
            [userId, sessionId]
        );

        // If we have event data and it's completed, get user subscription info
        let userData = null;
        let status = 'pending';

        if (eventRows.length > 0) {
            status = eventRows[0].status;

            // If status is completed, get the user's subscription details
            if (status === 'completed') {
                const userRows = await executeQuery<any[]>(
                    `SELECT subscription_plan, subscription_status
                     FROM users
                     WHERE id = $1`,
                    [userId]
                );

                if (userRows.length > 0) {
                    userData = userRows[0];
                    status = 'active'; // Explicitly mark as active if completed
                }
            }
        } else {
            // If we don't find event by session ID, check if the user has an active subscription
            const userRows = await executeQuery<any[]>(
                `SELECT subscription_plan, subscription_status
                 FROM users
                 WHERE id = $1 AND subscription_status = 'active'`,
                [userId]
            );

            if (userRows.length > 0) {
                userData = userRows[0];
                status = 'active';
            }
        }

        return NextResponse.json({
            status,
            user: userData
        });
    } catch (error: any) {
        console.error('Error checking subscription status:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to check subscription status' },
            { status: 500 }
        );
    }
} 