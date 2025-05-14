import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { pool } from '@/lib/db';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16'
});

// Webhook endpoint secret for verifying signatures
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
    console.log('============================================');
    console.log('Webhook received at:', new Date().toISOString());
    console.log('Webhook secret:', webhookSecret ? 'Secret is set' : 'Secret is missing!');

    try {
        const body = await request.text();
        console.log('Request body length:', body.length);

        const signature = (await headers()).get('stripe-signature') || '';
        console.log('Stripe signature present:', !!signature);

        // Verify webhook signature
        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
            console.log('Event verified successfully. Event type:', event.type);
        } catch (err) {
            console.error(`Webhook signature verification failed: ${err}`);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object as Stripe.Checkout.Session;
                console.log('Processing checkout.session.completed for session:', session.id);
                console.log('FULL SESSION DATA:', JSON.stringify(session));
                await handleCheckoutSessionCompleted(session);
                break;

            case 'invoice.payment_succeeded':
                const invoice = event.data.object as Stripe.Invoice;
                await handleInvoicePaymentSucceeded(invoice);
                break;

            case 'customer.subscription.updated':
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionUpdated(subscription);
                break;

            case 'customer.subscription.deleted':
                const canceledSubscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionCanceled(canceledSubscription);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        console.log('Webhook processed successfully');
        console.log('============================================');
        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Error handling webhook:', error);
        console.log('============================================');
        return NextResponse.json(
            { error: 'Error processing webhook' },
            { status: 500 }
        );
    }
}

// Handle successful checkout session completion
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    console.log('Checkout session completed:', session.id);
    console.log('Session metadata:', JSON.stringify(session.metadata || {}));
    console.log('Session customer:', session.customer);
    console.log('Session subscription:', session.subscription);

    try {
        // Extract the metadata from the session
        const { user_id, plan_id, subscription_event_id } = session.metadata || {};
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        console.log('Extracted data:', { user_id, plan_id, subscription_event_id, customerId, subscriptionId });

        if (!user_id || !customerId) {
            console.error('Missing user_id or customerId in session:', session.id);
            return;
        }

        // Check if subscription ID is present
        if (!subscriptionId) {
            console.error('Missing subscriptionId in session:', session.id);
            console.log('Mode:', session.mode);
            console.log('Payment status:', session.payment_status);
            // For some checkout sessions, especially one-time payments, there may not be a subscription
            if (session.mode !== 'subscription') {
                console.log('This is not a subscription checkout. Skipping subscription update.');
                return;
            }
        }

        const client = await pool.connect();
        console.log('Database connection established');

        try {
            // Start transaction
            await client.query('BEGIN');
            console.log('Transaction started');

            // Get subscription data from Stripe
            let subscription;
            let currentPeriodStart = new Date();
            let currentPeriodEnd = new Date();
            currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

            if (subscriptionId) {
                try {
                    subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    console.log('Fetched subscription from Stripe:', subscription.id, 'status:', subscription.status);

                    // Calculate current period and next billing dates
                    currentPeriodStart = new Date(subscription.current_period_start * 1000);
                    currentPeriodEnd = new Date(subscription.current_period_end * 1000);
                } catch (subError) {
                    console.error('Error fetching subscription from Stripe:', subError);
                    // Continue with default dates if retrieval fails
                }
            } else {
                console.log('No subscription ID available, using default dates');
            }

            console.log('Subscription period:', {
                start: currentPeriodStart.toISOString(),
                end: currentPeriodEnd.toISOString()
            });

            // Get the plan details from database if possible
            let planName = 'Basic Plan'; // Default fallback
            let planType = 'monthly';

            if (plan_id) {
                console.log('Looking up plan details for plan_id:', plan_id);
                const planResult = await client.query(
                    'SELECT name, billing_interval FROM subscription_plans WHERE id = $1',
                    [plan_id]
                );

                if (planResult.rows.length > 0) {
                    planName = planResult.rows[0].name;
                    planType = planResult.rows[0].billing_interval;
                    console.log('Found plan details:', { planName, planType });
                } else {
                    console.log('No plan found in database, using defaults');
                }
            }

            // Update user subscription details
            console.log('Updating user subscription details for user_id:', user_id);
            await client.query(
                `UPDATE users SET 
                    stripe_customer_id = $1,
                    stripe_subscription_id = $2,
                    subscription_status = $3,
                    subscription_plan = $4,
                    subscription_current_period_start = $5,
                    subscription_current_period_end = $6
                WHERE id = $7`,
                [
                    customerId,
                    subscriptionId,
                    'active', // Set subscription status to active
                    planName,
                    currentPeriodStart,
                    currentPeriodEnd,
                    user_id
                ]
            );
            console.log('User subscription details updated');

            // Insert or update subscription record
            console.log('Inserting/updating subscription record');
            const subscriptionResult = await client.query(
                `INSERT INTO subscriptions
                    (user_id, plan_id, status, current_period_start, current_period_end, 
                    stripe_subscription_id, billing_cycle, plan)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (user_id) 
                DO UPDATE SET
                    plan_id = $2,
                    status = $3,
                    current_period_start = $4,
                    current_period_end = $5,
                    stripe_subscription_id = $6,
                    billing_cycle = $7,
                    plan = $8,
                    updated_at = NOW()
                RETURNING id`,
                [
                    user_id,
                    plan_id,
                    'active',
                    currentPeriodStart,
                    currentPeriodEnd,
                    subscriptionId,
                    planType,
                    planName
                ]
            );
            console.log('Subscription record created/updated:', subscriptionResult.rows);

            // Update subscription_events table if event ID was provided
            if (subscription_event_id) {
                console.log('Updating subscription_event with ID:', subscription_event_id);
                await client.query(
                    `UPDATE subscription_events SET
                        status = $1,
                        stripe_subscription_id = $2,
                        completed_at = NOW()
                    WHERE id = $3`,
                    ['completed', subscriptionId, subscription_event_id]
                );
                console.log('Subscription event updated to completed');
            } else {
                console.log('No subscription_event_id provided, skipping event update');
            }

            // Commit transaction
            await client.query('COMMIT');
            console.log(`Successfully activated subscription for user ${user_id}`);
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error updating subscription status:', error);
            throw error;
        } finally {
            client.release();
            console.log('Database connection released');
        }
    } catch (error) {
        console.error('Error handling checkout session completion:', error);
    }
}

// Handle successful invoice payment (recurring payments)
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    console.log('Invoice payment succeeded:', invoice.id);

    try {
        // Get subscription ID from the invoice
        const subscriptionId = invoice.subscription as string;
        if (!subscriptionId) {
            console.log('No subscription ID in invoice, skipping');
            return;
        }

        // Get subscription details from Stripe
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const customerId = subscription.customer as string;

        // Find user by Stripe customer ID
        const { rows } = await pool.query(
            'SELECT id FROM users WHERE stripe_customer_id = $1',
            [customerId]
        );

        if (rows.length === 0) {
            console.error(`No user found with Stripe customer ID ${customerId}`);
            return;
        }

        const userId = rows[0].id;
        const currentPeriodStart = new Date(subscription.current_period_start * 1000);
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

        // Update user's subscription period
        await pool.query(
            `UPDATE users SET 
                subscription_current_period_start = $1,
                subscription_current_period_end = $2,
                subscription_status = 'active'
            WHERE id = $3`,
            [currentPeriodStart, currentPeriodEnd, userId]
        );

        // Update subscription record
        await pool.query(
            `UPDATE subscriptions SET 
                current_period_start = $1,
                current_period_end = $2,
                next_billing_date = $3,
                status = 'active',
                updated_at = NOW()
            WHERE user_id = $4 AND stripe_subscription_id = $5`,
            [currentPeriodStart, currentPeriodEnd, currentPeriodEnd, userId, subscriptionId]
        );

        // Get detailed invoice information including line items
        const invoiceDetails = await stripe.invoices.retrieve(invoice.id, {
            expand: ['lines.data']
        });

        // Extract plan information from the invoice
        let planName = 'Unknown Plan';
        let planAmount = invoice.amount_paid;

        if (invoiceDetails.lines && invoiceDetails.lines.data.length > 0) {
            const lineItem = invoiceDetails.lines.data[0];
            if (lineItem.plan) {
                planName = lineItem.plan.nickname || 'Subscription';
            } else if (lineItem.description) {
                planName = lineItem.description;
            }
        }

        // Log payment in subscription_payments table with more details
        await pool.query(
            `INSERT INTO subscription_payments (
                user_id, 
                stripe_invoice_id, 
                stripe_subscription_id, 
                amount, 
                period_start, 
                period_end, 
                payment_date,
                plan_name,
                currency,
                invoice_pdf,
                invoice_number
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8, $9, $10)`,
            [
                userId,
                invoice.id,
                subscriptionId,
                invoice.amount_paid / 100, // Convert from cents to dollars
                currentPeriodStart,
                currentPeriodEnd,
                planName,
                invoice.currency,
                invoice.invoice_pdf,
                invoice.number
            ]
        );

        // Record the event in subscription_events
        await pool.query(
            `INSERT INTO subscription_events (
                user_id, 
                event_type, 
                stripe_subscription_id, 
                status,
                amount,
                created_at
            ) VALUES ($1, $2, $3, $4, $5, NOW())`,
            [
                userId,
                'payment_succeeded',
                subscriptionId,
                'completed',
                invoice.amount_paid / 100 // Convert from cents to dollars
            ]
        );

        console.log(`Successfully processed invoice payment for user ${userId}`);
    } catch (error) {
        console.error('Error handling invoice payment:', error);
    }
}

// Handle subscription updates (upgrades, downgrades)
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    console.log('Subscription updated:', subscription.id);

    try {
        const subscriptionId = subscription.id;
        const customerId = subscription.customer as string;
        const status = subscription.status;

        // Find user by Stripe customer ID
        const { rows } = await pool.query(
            'SELECT id FROM users WHERE stripe_customer_id = $1',
            [customerId]
        );

        if (rows.length === 0) {
            console.error(`No user found with Stripe customer ID ${customerId}`);
            return;
        }

        const userId = rows[0].id;

        // Map Stripe status to our internal status
        let subscriptionStatus = 'active';
        if (status === 'past_due') subscriptionStatus = 'past_due';
        else if (status === 'canceled') subscriptionStatus = 'canceled';
        else if (status === 'unpaid') subscriptionStatus = 'unpaid';
        else if (status === 'incomplete_expired') subscriptionStatus = 'expired';
        else if (status === 'incomplete') subscriptionStatus = 'incomplete';

        // Update user's subscription status
        await pool.query(
            `UPDATE users SET 
                subscription_status = $1,
                updated_at = NOW()
            WHERE id = $2`,
            [subscriptionStatus, userId]
        );

        // Update subscription record
        await pool.query(
            `UPDATE subscriptions SET 
                status = $1,
                current_period_start = $2, 
                current_period_end = $3,
                updated_at = NOW()
            WHERE user_id = $4 AND stripe_subscription_id = $5`,
            [subscriptionStatus, subscription.current_period_start, subscription.current_period_end, userId, subscriptionId]
        );

        console.log(`Updated subscription record for user ${userId}`);

        // Record the event in subscription_events
        await pool.query(
            `INSERT INTO subscription_events (
                user_id, 
                event_type, 
                stripe_subscription_id, 
                status,
                created_at
            ) VALUES ($1, $2, $3, $4, NOW())`,
            [
                userId,
                'subscription_updated',
                subscriptionId,
                subscriptionStatus
            ]
        );

        console.log(`Successfully processed subscription update for user ${userId}`);
    } catch (error) {
        console.error('Error handling subscription update:', error);
    }
}

// Handle subscription cancellation
async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
    console.log('Subscription canceled:', subscription.id);

    try {
        const subscriptionId = subscription.id;
        const customerId = subscription.customer as string;

        // Find user by Stripe customer ID
        const { rows } = await pool.query(
            'SELECT id FROM users WHERE stripe_customer_id = $1',
            [customerId]
        );

        if (rows.length === 0) {
            console.error(`No user found with Stripe customer ID ${customerId}`);
            return;
        }

        const userId = rows[0].id;

        // Update user's subscription status
        await pool.query(
            `UPDATE users SET 
                subscription_status = 'canceled',
                updated_at = NOW()
            WHERE id = $1`,
            [userId]
        );

        // Update subscription record
        await pool.query(
            `UPDATE subscriptions SET 
                status = 'canceled',
                updated_at = NOW()
            WHERE user_id = $1 AND stripe_subscription_id = $2`,
            [userId, subscriptionId]
        );

        // Record the event in subscription_events
        await pool.query(
            `INSERT INTO subscription_events (
                user_id, 
                event_type, 
                stripe_subscription_id, 
                status,
                created_at
            ) VALUES ($1, $2, $3, $4, NOW())`,
            [
                userId,
                'subscription_canceled',
                subscriptionId,
                'canceled'
            ]
        );

        console.log(`Successfully processed subscription cancellation for user ${userId}`);
    } catch (error) {
        console.error('Error handling subscription cancellation:', error);
    }
}