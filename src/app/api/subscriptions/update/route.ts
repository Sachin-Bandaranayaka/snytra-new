import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { executeQuery } from '@/lib/db';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
    try {
        const { subscriptionId, userId, newPlanId } = await request.json();

        // Validate required fields
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

        if (!newPlanId) {
            return NextResponse.json(
                { error: 'New plan ID is required' },
                { status: 400 }
            );
        }

        // Check if subscription exists and belongs to the user
        const checkResult = await executeQuery<any[]>(
            'SELECT * FROM subscriptions WHERE id = $1 AND user_id = $2',
            [subscriptionId, userId]
        );

        if (checkResult.length === 0) {
            return NextResponse.json(
                { error: 'Subscription not found or does not belong to this user' },
                { status: 404 }
            );
        }

        const subscription = checkResult[0];

        // Check if the subscription is active
        if (subscription.status !== 'active') {
            return NextResponse.json(
                { error: 'Cannot update a subscription that is not active' },
                { status: 400 }
            );
        }

        // Get new plan details
        const planResult = await executeQuery<any[]>(
            'SELECT * FROM subscription_plans WHERE id = $1',
            [newPlanId]
        );

        if (planResult.length === 0) {
            return NextResponse.json(
                { error: 'New subscription plan not found' },
                { status: 404 }
            );
        }

        const newPlan = planResult[0];
        const stripePriceId = newPlan.stripe_price_id;

        // Get the user's current subscription
        const subscriptionResult = await executeQuery<any[]>(
            `SELECT * FROM subscriptions 
             WHERE user_id = $1 
             AND status = 'active' 
             ORDER BY created_at DESC 
             LIMIT 1`,
            [userId]
        );

        if (subscriptionResult.length === 0) {
            return NextResponse.json(
                { error: 'No active subscription found for this user' },
                { status: 404 }
            );
        }

        const stripeSubscriptionId = subscription.stripe_subscription_id;

        // Update the subscription in Stripe
        const updatedStripeSubscription = await stripe.subscriptions.update(
            stripeSubscriptionId,
            {
                items: [
                    {
                        id: subscription.stripe_subscription_item_id,
                        price: stripePriceId,
                    },
                ],
                proration_behavior: 'create_prorations',
            }
        );

        // Update subscription in the database
        await pool.query(
            `UPDATE subscriptions 
             SET 
               plan_id = $1, 
               updated_at = NOW(),
               status = $2
             WHERE id = $3`,
            [newPlanId, updatedStripeSubscription.status, subscription.id]
        );

        return NextResponse.json({
            message: 'Subscription updated successfully',
            subscriptionId
        });
    } catch (error) {
        console.error('Error updating subscription:', error);
        return NextResponse.json(
            { error: 'Failed to update subscription' },
            { status: 500 }
        );
    }
} 