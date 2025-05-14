import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing required parameter: userId' },
                { status: 400 }
            );
        }

        // Get all subscriptions for the user with plan details
        const result = await pool.query(
            `SELECT 
                s.id, 
                s.user_id,
                s.plan_id,
                s.status,
                s.start_date,
                s.next_billing_date,
                s.end_date,
                s.created_at,
                s.updated_at,
                s.stripe_subscription_id,
                p.name as plan_name,
                p.price,
                p.billing_interval,
                p.features
            FROM 
                subscriptions s
            JOIN 
                subscription_plans p ON s.plan_id = p.id
            WHERE 
                s.user_id = $1
            ORDER BY 
                s.created_at DESC`,
            [userId]
        );

        return NextResponse.json({
            subscriptions: result.rows
        });
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch subscriptions' },
            { status: 500 }
        );
    }
} 