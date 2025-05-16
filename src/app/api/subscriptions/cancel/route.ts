import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16'
});

export async function POST(request: NextRequest) {
    try {
        const { userId, subscriptionId } = await request.json();

        if (!userId || !subscriptionId) {
            return NextResponse.json(
                { error: 'User ID and Subscription ID are required' },
                { status: 400 }
            );
        }

        // Start by canceling subscription in Stripe
        try {
            // Cancel at period end to avoid premature cancellation
            await stripe.subscriptions.update(subscriptionId, {
                cancel_at_period_end: true,
            });
        } catch (stripeError: any) {
            console.error('Error canceling subscription in Stripe:', stripeError);
            return NextResponse.json(
                { error: `Failed to cancel subscription: ${stripeError.message}` },
                { status: 500 }
            );
        }

        // Update database records
        const client = await pool.connect();
        try {
            // Begin transaction
            await client.query('BEGIN');

            // Get subscription current period end from database or Stripe
            const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
            const currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);

            // Update subscriptions table
            await client.query(
                `UPDATE subscriptions 
                 SET status = 'canceled', 
                     cancel_at_period_end = true,
                     updated_at = NOW()
                 WHERE user_id = $1 AND stripe_subscription_id = $2`,
                [userId, subscriptionId]
            );

            // Update users table
            await client.query(
                `UPDATE users 
                 SET subscription_status = 'canceled',
                     updated_at = NOW()
                 WHERE id = $1`,
                [userId]
            );

            // Log the cancellation event
            await client.query(
                `INSERT INTO subscription_events (
                    user_id, 
                    event_type, 
                    stripe_subscription_id, 
                    status,
                    created_at
                ) VALUES ($1, $2, $3, $4, NOW())`,
                [userId, 'subscription_canceled', subscriptionId, 'completed']
            );

            // Commit transaction
            await client.query('COMMIT');
        } catch (dbError) {
            // Rollback transaction on error
            await client.query('ROLLBACK');
            console.error('Error updating subscription in database:', dbError);
            return NextResponse.json(
                { error: 'Failed to update subscription records' },
                { status: 500 }
            );
        } finally {
            client.release();
        }

        return NextResponse.json({
            success: true,
            message: 'Subscription successfully canceled at the end of the billing period'
        });
    } catch (error: any) {
        console.error('Error canceling subscription:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to cancel subscription' },
            { status: 500 }
        );
    }
} 