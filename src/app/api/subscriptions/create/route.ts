import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { userId, planId } = await request.json();

        // Validate required fields
        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        if (!planId) {
            return NextResponse.json(
                { error: 'Plan ID is required' },
                { status: 400 }
            );
        }

        // Check if user exists
        const userResult = await executeQuery<any[]>(
            'SELECT * FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if the plan exists - use string mapping for price_ codes
        let planResult;
        let actualPlanId;

        // If planId is a string like "price_premium", extract the plan name and find by name
        if (typeof planId === 'string' && planId.startsWith('price_')) {
            const planName = planId.replace('price_', '');
            // Capitalize first letter of plan name
            const formattedPlanName = planName.charAt(0).toUpperCase() + planName.slice(1);

            planResult = await pool.query(
                'SELECT * FROM subscription_plans WHERE name = $1',
                [formattedPlanName]
            );

            if (planResult.length > 0) {
                actualPlanId = planResult[0].id;
            }
        } else {
            // If it's already a numeric ID, use it directly
            planResult = await pool.query(
                'SELECT * FROM subscription_plans WHERE id = $1',
                [planId]
            );

            if (planResult.length > 0) {
                actualPlanId = planId;
            }
        }

        if (!actualPlanId || planResult.length === 0) {
            return NextResponse.json(
                { error: 'Subscription plan not found' },
                { status: 404 }
            );
        }

        // Check if the user already has an active subscription for this plan
        const existingSubscriptionResult = await executeQuery<any[]>(
            'SELECT * FROM subscriptions WHERE user_id = $1 AND plan_id = $2 AND status = $3',
            [userId, actualPlanId, 'active']
        );

        if (existingSubscriptionResult.length > 0) {
            return NextResponse.json(
                { error: 'User already has an active subscription for this plan' },
                { status: 400 }
            );
        }

        // Create a new subscription record
        const insertResult = await executeQuery<any[]>(
            `INSERT INTO subscriptions 
             (user_id, plan_id, status, start_date, next_billing_date)
             VALUES ($1, $2, $3, NOW(), NOW() + interval '1 month')
             RETURNING id`,
            [userId, actualPlanId, 'active']
        );

        const subscriptionId = insertResult[0].id;

        return NextResponse.json({
            message: 'Subscription created successfully',
            subscriptionId
        });

    } catch (error) {
        console.error('Error creating subscription:', error);
        return NextResponse.json(
            { error: 'Failed to create subscription' },
            { status: 500 }
        );
    }
} 