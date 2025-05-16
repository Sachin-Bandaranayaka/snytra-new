import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16'
});

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        // Extract userId from params first
        const { userId } = await params;

        // 1. First, get the user's subscription details from our database
        const subscriptionRows = await executeQuery<any[]>(
            `SELECT 
                s.id, s.user_id, s.plan_id, s.status, s.stripe_subscription_id,
                s.start_date, s.end_date, s.created_at, s.updated_at,
                p.name as plan_name, p.price as amount, p.billing_interval as interval
            FROM subscriptions s
            LEFT JOIN subscription_plans p ON s.plan_id = p.id
            WHERE s.user_id = $1 AND s.status = 'active'
            ORDER BY s.created_at DESC LIMIT 1`,
            [userId]
        );

        // If no subscription found in our database
        if (subscriptionRows.length === 0) {
            return NextResponse.json({ subscription: null });
        }

        const subscription = subscriptionRows[0];

        // 2. If we have a Stripe subscription ID, get additional details from Stripe
        if (subscription.stripe_subscription_id) {
            try {
                const stripeSubscription = await stripe.subscriptions.retrieve(
                    subscription.stripe_subscription_id
                );

                // Merge Stripe data with our database data
                return NextResponse.json({
                    subscription: {
                        ...subscription,
                        stripe_details: {
                            status: stripeSubscription.status,
                            current_period_start: stripeSubscription.current_period_start,
                            current_period_end: stripeSubscription.current_period_end,
                            cancel_at_period_end: stripeSubscription.cancel_at_period_end,
                            cancel_at: stripeSubscription.cancel_at,
                            canceled_at: stripeSubscription.canceled_at,
                            trial_start: stripeSubscription.trial_start,
                            trial_end: stripeSubscription.trial_end
                        }
                    }
                });
            } catch (stripeError) {
                console.error('Error fetching from Stripe:', stripeError);
                // If Stripe fetch fails, just return our database data
                return NextResponse.json({ subscription });
            }
        }

        // Return subscription data from our database if no Stripe ID
        return NextResponse.json({ subscription });
    } catch (error) {
        console.error('Error fetching subscription details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch subscription details' },
            { status: 500 }
        );
    }
} 