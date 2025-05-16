import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
    try {
        const { userId, newPlanId } = await request.json();

        if (!userId || !newPlanId) {
            return NextResponse.json(
                { error: 'Missing required fields: userId and newPlanId' },
                { status: 400 }
            );
        }

        // Get user and subscription details
        const userResult = await executeQuery<any[]>(
            `SELECT 
        users.stripe_customer_id,
        subscriptions.stripe_subscription_id,
        subscriptions.plan_id
      FROM 
        users
      LEFT JOIN 
        subscriptions ON users.id = subscriptions.user_id
      WHERE 
        users.id = $1 AND subscriptions.status = 'active'`,
            [userId]
        );

        if (userResult.length === 0) {
            return NextResponse.json(
                { error: 'User or active subscription not found' },
                { status: 404 }
            );
        }

        const {
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: stripeSubscriptionId,
            plan_id: currentPlanId
        } = userResult[0];

        // Check if trying to change to the same plan
        if (currentPlanId === newPlanId) {
            return NextResponse.json(
                { error: 'User is already on this plan' },
                { status: 400 }
            );
        }

        // Get pricing details for the new plan
        const planResult = await executeQuery<any[]>(
            `SELECT stripe_price_id FROM subscription_plans WHERE id = $1`,
            [newPlanId]
        );

        if (planResult.length === 0) {
            return NextResponse.json(
                { error: 'Subscription plan not found' },
                { status: 404 }
            );
        }

        const stripePriceId = planResult[0].stripe_price_id;

        // Update subscription in Stripe
        await stripe.subscriptions.update(stripeSubscriptionId, {
            items: [
                {
                    id: stripeSubscriptionId, // This is the subscription item ID
                    price: stripePriceId,
                },
            ],
            proration_behavior: 'create_prorations',
        });

        // Update subscription in database
        await pool.query(
            `UPDATE 
        subscriptions 
      SET 
        plan_id = $1,
        updated_at = NOW()
      WHERE 
        user_id = $2 AND stripe_subscription_id = $3`,
            [newPlanId, userId, stripeSubscriptionId]
        );

        return NextResponse.json({
            success: true,
            message: 'Subscription plan updated successfully'
        });
    } catch (error) {
        console.error('Error changing subscription:', error);
        return NextResponse.json(
            { error: 'Failed to change subscription' },
            { status: 500 }
        );
    }
} 