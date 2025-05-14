import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing required parameter: userId' },
                { status: 400 }
            );
        }

        // Get the current subscription with plan details
        const result = await pool.query(
            `SELECT 
        s.id, 
        s.user_id,
        s.stripe_subscription_id,
        s.status,
        s.start_date,
        s.end_date,
        s.created_at,
        s.updated_at,
        sp.id as plan_id,
        sp.name as plan_name, 
        sp.price as plan_price,
        sp.billing_interval,
        sp.features
      FROM 
        subscriptions s
      LEFT JOIN 
        subscription_plans sp ON s.plan_id = sp.id
      WHERE 
        s.user_id = $1
      ORDER BY 
        s.created_at DESC
      LIMIT 1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'No subscription found for this user' },
                { status: 404 }
            );
        }

        const subscription = result.rows[0];

        // Format the response
        return NextResponse.json({
            subscription: {
                id: subscription.id,
                userId: subscription.user_id,
                stripeSubscriptionId: subscription.stripe_subscription_id,
                status: subscription.status,
                startDate: subscription.start_date,
                endDate: subscription.end_date,
                createdAt: subscription.created_at,
                updatedAt: subscription.updated_at,
                plan: {
                    id: subscription.plan_id,
                    name: subscription.plan_name,
                    price: subscription.plan_price,
                    billingInterval: subscription.billing_interval,
                    features: subscription.features
                }
            }
        });
    } catch (error) {
        console.error('Error fetching subscription details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch subscription details' },
            { status: 500 }
        );
    }
} 