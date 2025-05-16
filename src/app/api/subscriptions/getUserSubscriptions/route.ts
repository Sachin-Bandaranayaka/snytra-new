import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Get all subscriptions for the user
        const result = await executeQuery<any[]>(
            `SELECT s.*, p.name as plan_name, p.price, p.billing_interval
       FROM subscriptions s
       JOIN subscription_plans p ON s.plan_id = p.id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC`,
            [userId]
        );

        return NextResponse.json({
            subscriptions: result
        });

    } catch (error) {
        console.error('Error retrieving user subscriptions:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve subscriptions' },
            { status: 500 }
        );
    }
} 