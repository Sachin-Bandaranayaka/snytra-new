import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

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

        // Get the user's subscription with plan details
        const result = await executeQuery<any[]>(
            `SELECT 
        s.id as subscription_id, 
        s.user_id,
        s.plan_id,
        s.status,
        s.created_at,
        s.updated_at,
        s.stripe_subscription_id,
        p.name as plan_name,
        p.price as plan_price,
        p.billing_interval,
        p.features as plan_features
      FROM 
        subscriptions s
      JOIN 
        subscription_plans p ON s.plan_id = p.id
      WHERE 
        s.user_id = $1
      ORDER BY 
        s.created_at DESC
      LIMIT 1`,
            [userId]
        );

        if (result.length === 0) {
            return NextResponse.json(
                { error: 'No subscription found for this user' },
                { status: 404 }
            );
        }

        const subscription = result[0];

        return NextResponse.json({
            subscription: {
                id: subscription.subscription_id,
                userId: subscription.user_id,
                planId: subscription.plan_id,
                status: subscription.status,
                createdAt: subscription.created_at,
                updatedAt: subscription.updated_at,
                plan: {
                    name: subscription.plan_name,
                    price: subscription.plan_price,
                    billingInterval: subscription.billing_interval,
                    features: subscription.plan_features
                }
            }
        });
    } catch (error) {
        console.error('Error fetching subscription:', error);
        return NextResponse.json(
            { error: 'Failed to fetch subscription details' },
            { status: 500 }
        );
    }
} 