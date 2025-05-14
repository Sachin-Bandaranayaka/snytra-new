import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { pool } from '@/lib/db';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16'
});

// Verify that this webhook is from Stripe
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
    try {
        // Get the request body as text
        const text = await request.text();

        // Get the signature from the headers
        const signature = request.headers.get('stripe-signature');

        if (!signature || !webhookSecret) {
            return NextResponse.json(
                { error: 'Missing signature or webhook secret' },
                { status: 400 }
            );
        }

        // Verify the event
        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(text, signature, webhookSecret);
        } catch (err: any) {
            console.error(`Webhook signature verification failed: ${err.message}`);
            return NextResponse.json(
                { error: `Webhook signature verification failed: ${err.message}` },
                { status: 400 }
            );
        }

        // Handle the event based on its type
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
                break;

            case 'invoice.paid':
                await handleInvoicePaid(event.data.object as Stripe.Invoice);
                break;

            case 'invoice.payment_failed':
                await handlePaymentFailed(event.data.object as Stripe.Invoice);
                break;

            case 'customer.subscription.created':
                await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
                break;

            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
                break;

            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * Handle checkout.session.completed event
 * This is called when a customer completes the checkout process
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    try {
        // Get the session ID
        const sessionId = session.id;

        // Find the subscription event in our database
        const eventResult = await pool.query(
            `SELECT * FROM subscription_events WHERE session_id = $1`,
            [sessionId]
        );

        if (eventResult.rows.length === 0) {
            // If the event doesn't exist, check metadata for the user and plan
            if (!session.metadata?.user_id || !session.metadata?.plan_id) {
                console.error('No subscription event found and no metadata in session', sessionId);
                return;
            }

            // Create a new subscription event
            await pool.query(
                `INSERT INTO subscription_events (
                    user_id, 
                    event_type, 
                    plan_id, 
                    amount, 
                    status, 
                    session_id
                ) VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    session.metadata.user_id,
                    'subscription_created',
                    session.metadata.plan_id,
                    session.amount_total ? session.amount_total / 100 : 0, // Convert from cents
                    'completed',
                    sessionId
                ]
            );
        } else {
            // Update the existing event
            await pool.query(
                `UPDATE subscription_events SET status = $1 WHERE session_id = $2`,
                ['completed', sessionId]
            );
        }

        // Get user and plan information
        const userId = session.metadata?.user_id || eventResult.rows[0]?.user_id;
        const planId = session.metadata?.plan_id || eventResult.rows[0]?.plan_id;

        if (!userId || !planId) {
            console.error('Missing user or plan ID in session or event');
            return;
        }

        // Create or update the subscription
        await pool.query(
            `INSERT INTO subscriptions (
                user_id, 
                plan_id, 
                status, 
                start_date,
                end_date,
                stripe_subscription_id,
                stripe_customer_id,
                created_at,
                updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
            ON CONFLICT (user_id) 
            DO UPDATE SET 
                plan_id = EXCLUDED.plan_id,
                status = EXCLUDED.status,
                start_date = EXCLUDED.start_date,
                end_date = EXCLUDED.end_date,
                stripe_subscription_id = EXCLUDED.stripe_subscription_id,
                stripe_customer_id = EXCLUDED.stripe_customer_id,
                updated_at = NOW()`,
            [
                userId,
                planId,
                'active',
                new Date(),
                null, // Will be updated when we get the subscription object
                session.subscription,
                session.customer,
            ]
        );

        // Update the user's subscription status
        await pool.query(
            `UPDATE users SET 
                subscription_status = $1, 
                subscription_plan = $2,
                stripe_customer_id = $3,
                updated_at = NOW()
             WHERE id = $4`,
            ['active', planId, session.customer, userId]
        );

        console.log(`Subscription created for user ${userId} with plan ${planId}`);
    } catch (error) {
        console.error('Error handling checkout session completed:', error);
        throw error;
    }
}

/**
 * Handle invoice.paid event
 * This is called when an invoice is paid
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
    try {
        if (!invoice.subscription || !invoice.customer) {
            console.error('Missing subscription or customer ID in invoice');
            return;
        }

        // Get the subscription from Stripe
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);

        // Get user from customer ID
        const userResult = await pool.query(
            `SELECT * FROM users WHERE stripe_customer_id = $1`,
            [invoice.customer]
        );

        if (userResult.rows.length === 0) {
            console.error(`No user found for customer ${invoice.customer}`);
            return;
        }

        const userId = userResult.rows[0].id;

        // Get the plan ID from the price
        let planId = null;
        if (subscription.items.data[0]?.price.metadata?.plan_id) {
            planId = subscription.items.data[0].price.metadata.plan_id;
        } else {
            // Try to find the plan by Stripe price ID
            const planResult = await pool.query(
                `SELECT * FROM subscription_plans WHERE stripe_price_id = $1`,
                [subscription.items.data[0]?.price.id]
            );

            if (planResult.rows.length > 0) {
                planId = planResult.rows[0].id;
            } else {
                console.error(`No plan found for price ${subscription.items.data[0]?.price.id}`);
                return;
            }
        }

        // Record the payment
        await pool.query(
            `INSERT INTO subscription_events (
                user_id, 
                event_type, 
                plan_id, 
                amount, 
                status,
                invoice_id,
                stripe_subscription_id,
                created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
            [
                userId,
                'invoice_paid',
                planId,
                invoice.amount_paid / 100, // Convert from cents
                'completed',
                invoice.id,
                subscription.id
            ]
        );

        // Update subscription status and end date
        await pool.query(
            `UPDATE subscriptions SET 
                status = $1, 
                end_date = $2,
                updated_at = NOW()
             WHERE stripe_subscription_id = $3`,
            [
                subscription.status,
                new Date(subscription.current_period_end * 1000), // Convert to Date
                subscription.id
            ]
        );

        console.log(`Invoice paid for subscription ${subscription.id}`);
    } catch (error) {
        console.error('Error handling invoice paid:', error);
        throw error;
    }
}

/**
 * Handle invoice.payment_failed event
 * This is called when an invoice payment fails
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
    try {
        if (!invoice.subscription || !invoice.customer) {
            console.error('Missing subscription or customer ID in invoice');
            return;
        }

        // Get user from customer ID
        const userResult = await pool.query(
            `SELECT * FROM users WHERE stripe_customer_id = $1`,
            [invoice.customer]
        );

        if (userResult.rows.length === 0) {
            console.error(`No user found for customer ${invoice.customer}`);
            return;
        }

        const userId = userResult.rows[0].id;

        // Record the failed payment
        await pool.query(
            `INSERT INTO subscription_events (
                user_id, 
                event_type, 
                amount, 
                status,
                invoice_id,
                stripe_subscription_id,
                created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
            [
                userId,
                'invoice_failed',
                invoice.amount_due / 100, // Convert from cents
                'failed',
                invoice.id,
                invoice.subscription
            ]
        );

        // If invoice is past due, update the subscription status
        if (invoice.status === 'past_due') {
            await pool.query(
                `UPDATE subscriptions SET 
                    status = $1, 
                    updated_at = NOW()
                 WHERE stripe_subscription_id = $2`,
                ['past_due', invoice.subscription]
            );

            // Update the user's subscription status
            await pool.query(
                `UPDATE users SET 
                    subscription_status = $1,
                    updated_at = NOW()
                 WHERE id = $2`,
                ['past_due', userId]
            );
        }

        console.log(`Payment failed for subscription ${invoice.subscription}`);
    } catch (error) {
        console.error('Error handling payment failed:', error);
        throw error;
    }
}

/**
 * Handle customer.subscription.created event
 * This is called when a subscription is created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
    try {
        if (!subscription.customer) {
            console.error('Missing customer ID in subscription');
            return;
        }

        // Get the subscription details
        const customerId = typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id;

        // Get user from customer ID
        const userResult = await pool.query(
            `SELECT * FROM users WHERE stripe_customer_id = $1`,
            [customerId]
        );

        if (userResult.rows.length === 0) {
            console.error(`No user found for customer ${customerId}`);
            return;
        }

        const userId = userResult.rows[0].id;

        // Get the plan ID from the price
        let planId = null;
        if (subscription.items.data[0]?.price.metadata?.plan_id) {
            planId = subscription.items.data[0].price.metadata.plan_id;
        } else {
            // Try to find the plan by Stripe price ID
            const planResult = await pool.query(
                `SELECT * FROM subscription_plans WHERE stripe_price_id = $1`,
                [subscription.items.data[0]?.price.id]
            );

            if (planResult.rows.length > 0) {
                planId = planResult.rows[0].id;
            } else {
                console.error(`No plan found for price ${subscription.items.data[0]?.price.id}`);
                return;
            }
        }

        // Create or update the subscription
        await pool.query(
            `INSERT INTO subscriptions (
                user_id, 
                plan_id, 
                status, 
                start_date,
                end_date,
                stripe_subscription_id,
                stripe_customer_id,
                created_at,
                updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
            ON CONFLICT (user_id) 
            DO UPDATE SET 
                plan_id = EXCLUDED.plan_id,
                status = EXCLUDED.status,
                start_date = EXCLUDED.start_date,
                end_date = EXCLUDED.end_date,
                stripe_subscription_id = EXCLUDED.stripe_subscription_id,
                stripe_customer_id = EXCLUDED.stripe_customer_id,
                updated_at = NOW()`,
            [
                userId,
                planId,
                subscription.status,
                new Date(subscription.current_period_start * 1000),
                new Date(subscription.current_period_end * 1000),
                subscription.id,
                customerId
            ]
        );

        // Update the user's subscription status
        await pool.query(
            `UPDATE users SET 
                subscription_status = $1, 
                subscription_plan = $2,
                updated_at = NOW()
             WHERE id = $3`,
            [subscription.status, planId, userId]
        );

        console.log(`Subscription created: ${subscription.id} for user ${userId}`);
    } catch (error) {
        console.error('Error handling subscription created:', error);
        throw error;
    }
}

/**
 * Handle customer.subscription.updated event
 * This is called when a subscription is updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    try {
        // Get the subscription from the database
        const subscriptionResult = await pool.query(
            `SELECT * FROM subscriptions WHERE stripe_subscription_id = $1`,
            [subscription.id]
        );

        if (subscriptionResult.rows.length === 0) {
            // This subscription doesn't exist in our database yet, treat it as new
            await handleSubscriptionCreated(subscription);
            return;
        }

        const existingSubscription = subscriptionResult.rows[0];
        const userId = existingSubscription.user_id;

        // Get the plan ID from the price
        let planId = existingSubscription.plan_id;
        if (subscription.items.data[0]?.price.metadata?.plan_id) {
            planId = subscription.items.data[0].price.metadata.plan_id;
        } else {
            // Try to find the plan by Stripe price ID
            const planResult = await pool.query(
                `SELECT * FROM subscription_plans WHERE stripe_price_id = $1`,
                [subscription.items.data[0]?.price.id]
            );

            if (planResult.rows.length > 0) {
                planId = planResult.rows[0].id;
            }
        }

        // Update the subscription
        await pool.query(
            `UPDATE subscriptions SET 
                status = $1, 
                plan_id = $2,
                start_date = $3,
                end_date = $4,
                updated_at = NOW()
             WHERE stripe_subscription_id = $5`,
            [
                subscription.status,
                planId,
                new Date(subscription.current_period_start * 1000),
                new Date(subscription.current_period_end * 1000),
                subscription.id
            ]
        );

        // Update the user's subscription status
        await pool.query(
            `UPDATE users SET 
                subscription_status = $1, 
                subscription_plan = $2,
                updated_at = NOW()
             WHERE id = $3`,
            [subscription.status, planId, userId]
        );

        // Record the subscription update event
        await pool.query(
            `INSERT INTO subscription_events (
                user_id, 
                event_type, 
                plan_id, 
                status,
                stripe_subscription_id,
                created_at
            ) VALUES ($1, $2, $3, $4, $5, NOW())`,
            [
                userId,
                'subscription_updated',
                planId,
                subscription.status,
                subscription.id
            ]
        );

        console.log(`Subscription updated: ${subscription.id} for user ${userId}`);
    } catch (error) {
        console.error('Error handling subscription updated:', error);
        throw error;
    }
}

/**
 * Handle customer.subscription.deleted event
 * This is called when a subscription is canceled or ended
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    try {
        // Get the subscription from the database
        const subscriptionResult = await pool.query(
            `SELECT * FROM subscriptions WHERE stripe_subscription_id = $1`,
            [subscription.id]
        );

        if (subscriptionResult.rows.length === 0) {
            console.error(`No subscription found for Stripe subscription ${subscription.id}`);
            return;
        }

        const existingSubscription = subscriptionResult.rows[0];
        const userId = existingSubscription.user_id;

        // Update the subscription status
        await pool.query(
            `UPDATE subscriptions SET 
                status = $1, 
                updated_at = NOW()
             WHERE stripe_subscription_id = $2`,
            ['canceled', subscription.id]
        );

        // Update the user's subscription status
        await pool.query(
            `UPDATE users SET 
                subscription_status = $1,
                updated_at = NOW()
             WHERE id = $2`,
            ['canceled', userId]
        );

        // Record the subscription cancellation event
        await pool.query(
            `INSERT INTO subscription_events (
                user_id, 
                event_type, 
                plan_id, 
                status,
                stripe_subscription_id,
                created_at
            ) VALUES ($1, $2, $3, $4, $5, NOW())`,
            [
                userId,
                'subscription_canceled',
                existingSubscription.plan_id,
                'canceled',
                subscription.id
            ]
        );

        console.log(`Subscription canceled: ${subscription.id} for user ${userId}`);
    } catch (error) {
        console.error('Error handling subscription deleted:', error);
        throw error;
    }
} 