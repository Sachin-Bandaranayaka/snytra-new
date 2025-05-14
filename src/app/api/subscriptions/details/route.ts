import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing required field: userId' },
                { status: 400 }
            );
        }

        // Get the user's subscription details
        const result = await pool.query(
            `SELECT 
        s.id,
        s.user_id,
        s.plan_id,
        s.status,
        s.start_date,
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
        s.created_at DESC
      LIMIT 1`,
            [userId]
        );

        // If no subscription is found
        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'No subscription found for this user' },
                { status: 404 }
            );
        }

        const subscription = result.rows[0];

        // Format the response
        return NextResponse.json({
            success: true,
            subscription: {
                id: subscription.id,
                userId: subscription.user_id,
                planId: subscription.plan_id,
                planName: subscription.plan_name,
                price: subscription.price,
                billingInterval: subscription.billing_interval,
                features: subscription.features,
                status: subscription.status,
                startDate: subscription.start_date,
                endDate: subscription.end_date,
                createdAt: subscription.created_at,
                updatedAt: subscription.updated_at
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