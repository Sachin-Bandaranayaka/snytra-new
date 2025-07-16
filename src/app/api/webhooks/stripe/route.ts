import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { executeQuery } from '@/lib/db';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16'
});

// Verify that this webhook is from Stripe
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
    try {
        // Get the request body as text
        const body = await request.text();
        const headersList = await headers();
        const signature = headersList.get('stripe-signature');

        if (!signature || !webhookSecret) {
            console.error('Missing Stripe signature or webhook secret');
            return NextResponse.json(
                { error: 'Missing signature or webhook secret' },
                { status: 400 }
            );
        }

        // Verify the event
        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err: any) {
            console.error(`Webhook signature verification failed: ${err.message}`);
            return NextResponse.json(
                { error: `Webhook signature verification failed: ${err.message}` },
                { status: 400 }
            );
        }

        console.log(`Processing webhook event: ${event.type}`);

        // Handle the event based on its type
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
                break;

            case 'invoice.payment_succeeded':
                await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
                break;

            case 'invoice.payment_failed':
                await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
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

            case 'customer.subscription.trial_will_end':
                await handleTrialWillEnd(event.data.object as Stripe.Subscription);
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
        console.log('Processing checkout session completed:', session.id);
        
        if (!session.customer || !session.subscription) {
            console.error('Missing customer or subscription in session');
            return;
        }

        const customerId = typeof session.customer === 'string' ? session.customer : session.customer.id;
        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
        const planId = session.metadata?.planId ? parseInt(session.metadata.planId) : null;

        if (!planId) {
            console.error('Missing planId in session metadata');
            return;
        }

        // Get user by customer ID
        const userResult = await executeQuery<any[]>(
            `SELECT id FROM users WHERE stripe_customer_id = $1`,
            [customerId]
        );

        if (userResult.length === 0) {
            console.error(`No user found for customer ${customerId}`);
            return;
        }

        const userId = userResult[0].id;

        // Insert or update subscription
        await executeQuery(
            `INSERT INTO user_subscriptions (
                user_id, subscription_plan_id, stripe_subscription_id, 
                status, current_period_start, current_period_end, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, NOW(), NOW() + INTERVAL '1 month', NOW(), NOW())
            ON CONFLICT (stripe_subscription_id) 
            DO UPDATE SET 
                status = EXCLUDED.status,
                updated_at = NOW()`,
            [userId, planId, subscriptionId, 'active']
        );

        // Update user subscription status
        await executeQuery(
            `UPDATE users SET subscription_status = $1, updated_at = NOW() WHERE id = $2`,
            ['active', userId]
        );

        // Log the event
        await executeQuery(
            `INSERT INTO subscription_events (
                user_id, event_type, plan_id, status, stripe_subscription_id, created_at
            ) VALUES ($1, $2, $3, $4, $5, NOW())`,
            [userId, 'checkout_completed', planId, 'active', subscriptionId]
        );

        console.log(`Checkout completed for customer ${customerId}, subscription ${subscriptionId}`);
    } catch (error) {
        console.error('Error handling checkout session completed:', error);
        throw error;
    }
}

/**
 * Handle invoice.payment_succeeded event
 * This is called when an invoice is paid
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    try {
        if (!invoice.subscription || !invoice.customer) {
            console.error('Missing subscription or customer ID in invoice');
            return;
        }

        const subscriptionId = invoice.subscription as string;
        
        // Get subscription from our database
        const subscriptionResult = await executeQuery<any[]>(
            `SELECT us.*, u.id as user_id FROM user_subscriptions us 
             JOIN users u ON us.user_id = u.id 
             WHERE us.stripe_subscription_id = $1`,
            [subscriptionId]
        );

        if (subscriptionResult.length === 0) {
            console.error('Subscription not found for Stripe ID:', subscriptionId);
            return;
        }

        const subscription = subscriptionResult[0];
        const userId = subscription.user_id;
        const planId = subscription.subscription_plan_id;
        
        // Log the payment event
        await executeQuery(
            `INSERT INTO subscription_events (
                user_id, event_type, plan_id, status, stripe_subscription_id, created_at
            ) VALUES ($1, $2, $3, $4, $5, NOW())`,
            [userId, 'payment_succeeded', planId, 'active', subscriptionId]
        );
        
        // Update subscription status to active if it was past_due
        if (subscription.status === 'past_due') {
            await executeQuery(
                `UPDATE user_subscriptions SET status = $1, updated_at = NOW() 
                 WHERE stripe_subscription_id = $2`,
                ['active', subscriptionId]
            );
        }
        
        console.log(`Payment succeeded for user ${userId}, amount: ${invoice.amount_paid / 100}`);
    } catch (error) {
        console.error('Error handling invoice payment succeeded:', error);
        throw error;
    }
}

/**
 * Handle invoice.payment_failed event
 * This is called when an invoice payment fails
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    try {
        if (!invoice.subscription || !invoice.customer) {
            console.error('Missing subscription or customer ID in invoice');
            return;
        }

        const subscriptionId = invoice.subscription as string;
        
        // Get subscription from our database
        const subscriptionResult = await executeQuery<any[]>(
            `SELECT us.*, u.id as user_id FROM user_subscriptions us 
             JOIN users u ON us.user_id = u.id 
             WHERE us.stripe_subscription_id = $1`,
            [subscriptionId]
        );

        if (subscriptionResult.length === 0) {
            console.error('Subscription not found for Stripe ID:', subscriptionId);
            return;
        }

        const subscription = subscriptionResult[0];
        const userId = subscription.user_id;
        const planId = subscription.subscription_plan_id;

        // Log the failed payment event
        await executeQuery(
            `INSERT INTO subscription_events (
                user_id, event_type, plan_id, status, stripe_subscription_id, created_at
            ) VALUES ($1, $2, $3, $4, $5, NOW())`,
            [userId, 'payment_failed', planId, 'past_due', subscriptionId]
        );

        // Update subscription status to past_due if invoice is past due
        if (invoice.status === 'past_due') {
            await executeQuery(
                `UPDATE user_subscriptions SET status = $1, updated_at = NOW() 
                 WHERE stripe_subscription_id = $2`,
                ['past_due', subscriptionId]
            );
        }

        console.log(`Payment failed for subscription ${subscriptionId}`);
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

        const customerId = typeof subscription.customer === 'string'
            ? subscription.customer
            : subscription.customer.id;

        // Get user from customer ID
        const userResult = await executeQuery<any[]>(
            `SELECT * FROM users WHERE stripe_customer_id = $1`,
            [customerId]
        );

        if (userResult.length === 0) {
            console.error(`No user found for customer ${customerId}`);
            return;
        }

        const userId = userResult[0].id;

        // Get the plan ID from the price
        let planId = null;
        if (subscription.items.data[0]?.price.metadata?.planId) {
            planId = parseInt(subscription.items.data[0].price.metadata.planId);
        } else {
            // Try to find the plan by Stripe price ID
            const planResult = await executeQuery<any[]>(
                `SELECT * FROM subscription_plans WHERE stripe_price_id = $1`,
                [subscription.items.data[0]?.price.id]
            );

            if (planResult.length > 0) {
                planId = planResult[0].id;
            } else {
                console.error(`No plan found for price ${subscription.items.data[0]?.price.id}`);
                return;
            }
        }

        // Insert or update subscription in database
        await executeQuery(
            `INSERT INTO user_subscriptions (
                user_id, subscription_plan_id, stripe_subscription_id, 
                status, current_period_start, current_period_end, 
                trial_start, trial_end, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
            ON CONFLICT (stripe_subscription_id) 
            DO UPDATE SET 
                status = EXCLUDED.status,
                current_period_start = EXCLUDED.current_period_start,
                current_period_end = EXCLUDED.current_period_end,
                updated_at = NOW()`,
            [
                userId,
                planId,
                subscription.id,
                subscription.status,
                new Date(subscription.current_period_start * 1000),
                new Date(subscription.current_period_end * 1000),
                subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
                subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
            ]
        );

        // Update user subscription status
        await executeQuery(
            `UPDATE users SET subscription_status = $1, updated_at = NOW() WHERE id = $2`,
            [subscription.status, userId]
        );

        // Log the subscription creation event
        await executeQuery(
            `INSERT INTO subscription_events (
                user_id, event_type, plan_id, status, stripe_subscription_id, created_at
            ) VALUES ($1, $2, $3, $4, $5, NOW())`,
            [userId, 'subscription_created', planId, subscription.status, subscription.id]
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
        // Get the subscription from our database
        const subscriptionResult = await executeQuery<any[]>(
            `SELECT us.*, u.id as user_id FROM user_subscriptions us 
             JOIN users u ON us.user_id = u.id 
             WHERE us.stripe_subscription_id = $1`,
            [subscription.id]
        );
        
        if (subscriptionResult.length === 0) {
            // This subscription doesn't exist in our database yet, treat it as new
            await handleSubscriptionCreated(subscription);
            return;
        }

        const existingSubscription = subscriptionResult[0];
        const userId = existingSubscription.user_id;

        // Get the plan ID from the price
        let planId = existingSubscription.subscription_plan_id;
        if (subscription.items.data[0]?.price.metadata?.planId) {
            planId = parseInt(subscription.items.data[0].price.metadata.planId);
        } else {
            // Try to find the plan by Stripe price ID
            const planResult = await executeQuery<any[]>(
                `SELECT * FROM subscription_plans WHERE stripe_price_id = $1`,
                [subscription.items.data[0]?.price.id]
            );

            if (planResult.length > 0) {
                planId = planResult[0].id;
            }
        }

        // Update the subscription in database
        await executeQuery(
            `UPDATE user_subscriptions SET 
                subscription_plan_id = $1,
                status = $2,
                current_period_start = $3,
                current_period_end = $4,
                trial_start = $5,
                trial_end = $6,
                updated_at = NOW()
             WHERE stripe_subscription_id = $7`,
            [
                planId,
                subscription.status,
                new Date(subscription.current_period_start * 1000),
                new Date(subscription.current_period_end * 1000),
                subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
                subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
                subscription.id
            ]
        );

        // Update user subscription status
        await executeQuery(
            `UPDATE users SET subscription_status = $1, updated_at = NOW() WHERE id = $2`,
            [subscription.status, userId]
        );

        // Log the event
        await executeQuery(
            `INSERT INTO subscription_events (
                user_id, event_type, plan_id, status, stripe_subscription_id, created_at
            ) VALUES ($1, $2, $3, $4, $5, NOW())`,
            [userId, 'subscription_updated', planId, subscription.status, subscription.id]
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
        // Get the subscription from our database
        const subscriptionResult = await executeQuery<any[]>(
            `SELECT us.*, u.id as user_id FROM user_subscriptions us 
             JOIN users u ON us.user_id = u.id 
             WHERE us.stripe_subscription_id = $1`,
            [subscription.id]
        );
        
        if (subscriptionResult.length === 0) {
            console.error(`No subscription found for Stripe subscription ${subscription.id}`);
            return;
        }

        const existingSubscription = subscriptionResult[0];
        const userId = existingSubscription.user_id;
        const planId = existingSubscription.subscription_plan_id;

        // Update the subscription status to canceled
        await executeQuery(
            `UPDATE user_subscriptions SET 
                status = $1, 
                canceled_at = $2,
                updated_at = NOW()
             WHERE stripe_subscription_id = $3`,
            ['canceled', new Date(), subscription.id]
        );

        // Update user subscription status
        await executeQuery(
            `UPDATE users SET subscription_status = $1, updated_at = NOW() WHERE id = $2`,
            ['canceled', userId]
        );

        // Log the cancellation event
        await executeQuery(
            `INSERT INTO subscription_events (
                user_id, event_type, plan_id, status, stripe_subscription_id, created_at
            ) VALUES ($1, $2, $3, $4, $5, NOW())`,
            [userId, 'subscription_canceled', planId, 'canceled', subscription.id]
        );

        console.log(`Subscription canceled: ${subscription.id} for user ${userId}`);
    } catch (error) {
        console.error('Error handling subscription deleted:', error);
        throw error;
    }
}

/**
 * Handle customer.subscription.trial_will_end event
 * This is called when a subscription trial is about to end
 */
async function handleTrialWillEnd(subscription: Stripe.Subscription) {
    try {
        // Get the subscription from our database
        const subscriptionResult = await executeQuery<any[]>(
            `SELECT us.*, u.id as user_id FROM user_subscriptions us 
             JOIN users u ON us.user_id = u.id 
             WHERE us.stripe_subscription_id = $1`,
            [subscription.id]
        );
        
        if (subscriptionResult.length === 0) {
            console.error(`No subscription found for Stripe subscription ${subscription.id}`);
            return;
        }

        const existingSubscription = subscriptionResult[0];
        const userId = existingSubscription.user_id;
        const planId = existingSubscription.subscription_plan_id;

        // Log the trial will end event
        await executeQuery(
            `INSERT INTO subscription_events (
                user_id, event_type, plan_id, status, stripe_subscription_id, created_at
            ) VALUES ($1, $2, $3, $4, $5, NOW())`,
            [userId, 'trial_will_end', planId, subscription.status, subscription.id]
        );

        console.log(`Trial will end soon for subscription ${subscription.id}, user ${userId}`);
    } catch (error) {
        console.error('Error handling trial will end:', error);
        throw error;
    }
}