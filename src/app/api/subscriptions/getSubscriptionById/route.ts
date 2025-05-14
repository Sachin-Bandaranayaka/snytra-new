import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const subscriptionId = request.nextUrl.searchParams.get('subscriptionId');
        const userId = request.nextUrl.searchParams.get('userId');

        if (!subscriptionId) {
            return NextResponse.json(
                { error: 'Subscription ID is required' },
                { status: 400 }
            );
        }

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Get subscription details
        const result = await pool.query(
            `SELECT s.*, p.name as plan_name, p.price, p.billing_interval, p.description
       FROM subscriptions s
       JOIN subscription_plans p ON s.plan_id = p.id
       WHERE s.id = $1 AND s.user_id = $2`,
            [subscriptionId, userId]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Subscription not found or does not belong to this user' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            subscription: result.rows[0]
        });

    } catch (error) {
        console.error('Error retrieving subscription details:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve subscription details' },
            { status: 500 }
        );
    }
} 