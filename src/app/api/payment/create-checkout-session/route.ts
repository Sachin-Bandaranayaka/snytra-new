import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { executeQuery } from '@/lib/db';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16'
});

export async function POST(request: NextRequest) {
    try {
        const { planId, customerId, userEmail } = await request.json();

        if (!planId) {
            return NextResponse.json(
                { error: 'Plan ID is required' },
                { status: 400 }
            );
        }

        // Fetch plan details including Stripe price ID from the database
        const rows = await executeQuery<any[]>(
            `SELECT 
                id, name, description, price, billing_interval, 
                stripe_product_id, stripe_price_id, has_trial, trial_days
             FROM subscription_plans 
             WHERE id = $1`,
            [planId]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                { error: 'Invalid plan ID' },
                { status: 400 }
            );
        }

        const planDetails = rows[0];

        // Check if we have a Stripe price ID for this plan
        if (!planDetails.stripe_price_id) {
            return NextResponse.json(
                { error: 'Plan not synced with Stripe. Please sync the plan first.' },
                { status: 400 }
            );
        }

        // Create or retrieve customer in Stripe
        let stripeCustomerId: string;

        try {
            // Check if this user already has a Stripe customer
            const customerResult = await executeQuery<any[]>(
                `SELECT stripe_customer_id FROM users WHERE id = $1`,
                [customerId]
            );

            if (customerResult.length > 0 && customerResult[0].stripe_customer_id) {
                // User already has a Stripe customer ID
                stripeCustomerId = customerResult[0].stripe_customer_id;

                // Verify the customer exists in Stripe
                try {
                    await stripe.customers.retrieve(stripeCustomerId);
                } catch (err) {
                    // If customer doesn't exist in Stripe, create a new one
                    console.error('Customer exists in DB but not in Stripe, creating new customer');
                    const customer = await stripe.customers.create({
                        email: userEmail,
                        metadata: {
                            user_id: customerId.toString()
                        }
                    });
                    stripeCustomerId = customer.id;

                    // Update the customer ID in database
                    await pool.query(
                        `UPDATE users SET stripe_customer_id = $1 WHERE id = $2`,
                        [stripeCustomerId, customerId]
                    );
                }
            } else {
                // Create a new customer in Stripe
                const customer = await stripe.customers.create({
                    email: userEmail,
                    metadata: {
                        user_id: customerId.toString()
                    }
                });
                stripeCustomerId = customer.id;

                // Save the customer ID to the database
                await pool.query(
                    `UPDATE users SET stripe_customer_id = $1 WHERE id = $2`,
                    [stripeCustomerId, customerId]
                );
            }
        } catch (error) {
            console.error('Error managing Stripe customer:', error);
            return NextResponse.json(
                { error: 'Failed to process customer information' },
                { status: 500 }
            );
        }

        // Record subscription intent in database
        const eventResult = await executeQuery<any[]>(
            `INSERT INTO subscription_events (
                user_id, 
                event_type, 
                plan_id, 
                amount, 
                status
            ) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [
                customerId,
                'subscription_created',
                planDetails.id,
                planDetails.price,
                'pending'
            ]
        );

        const subscriptionEventId = eventResult[0].id;

        // Create checkout options
        const checkoutOptions: Stripe.Checkout.SessionCreateParams = {
            payment_method_types: ['card'],
            line_items: [
                {
                    price: planDetails.stripe_price_id,
                    quantity: 1
                }
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || ''}/subscription/success?session_id={CHECKOUT_SESSION_ID}&plan=${planDetails.name}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || ''}/pricing?canceled=true`,
            customer: stripeCustomerId,
            client_reference_id: customerId.toString(),
            metadata: {
                subscription_event_id: subscriptionEventId.toString(),
                user_id: customerId.toString(),
                plan_id: planDetails.id.toString()
            }
        };

        // Add trial period if available
        if (planDetails.has_trial && planDetails.trial_days > 0) {
            checkoutOptions.subscription_data = {
                trial_period_days: planDetails.trial_days
            };
        }

        // Create a checkout session
        const session = await stripe.checkout.sessions.create(checkoutOptions);

        // Update subscription event with session ID
        await pool.query(
            `UPDATE subscription_events SET session_id = $1 WHERE id = $2`,
            [session.id, subscriptionEventId]
        );

        return NextResponse.json({
            sessionId: session.id,
            url: session.url
        });
    } catch (error: any) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}

// Helper functions
function getPlanDetails(planId: string) {
    const plans = {
        'price_basic': {
            id: 'price_basic',
            name: 'Basic Plan',
            price: 29.00,
            features: ['Feature 1', 'Feature 2'],
            billing_interval: 'monthly'
        },
        'price_premium': {
            id: 'price_premium',
            name: 'Premium Plan',
            price: 59.00,
            features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'],
            billing_interval: 'monthly'
        },
        'price_enterprise': {
            id: 'price_enterprise',
            name: 'Enterprise Plan',
            price: 99.00,
            features: ['All Features', 'Priority Support', 'Custom Integrations'],
            billing_interval: 'monthly'
        },
        // Add support for direct plans
        'basic': {
            id: 'price_basic',
            name: 'Basic Plan',
            price: 29.00,
            features: ['Feature 1', 'Feature 2'],
            billing_interval: 'monthly'
        },
        'premium': {
            id: 'price_premium',
            name: 'Premium Plan',
            price: 59.00,
            features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'],
            billing_interval: 'monthly'
        },
        'pro': {
            id: 'price_premium',
            name: 'Pro Plan',
            price: 59.00,
            features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'],
            billing_interval: 'monthly'
        },
        'enterprise': {
            id: 'price_enterprise',
            name: 'Enterprise Plan',
            price: 99.00,
            features: ['All Features', 'Priority Support', 'Custom Integrations'],
            billing_interval: 'monthly'
        },
        // Support for number-based IDs as strings
        '1': {
            id: 1,
            name: 'Basic Plan',
            price: 49.99,
            features: ['Feature 1', 'Feature 2'],
            billing_interval: 'monthly'
        },
        '2': {
            id: 2,
            name: 'Standard Plan',
            price: 99.99,
            features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'],
            billing_interval: 'monthly'
        },
        '3': {
            id: 3,
            name: 'Premium Plan',
            price: 199.99,
            features: ['All Features', 'Priority Support', 'Custom Integrations'],
            billing_interval: 'monthly'
        },
        '4': {
            id: 4,
            name: 'Basic Annual Plan',
            price: 479.88,
            features: ['Feature 1', 'Feature 2'],
            billing_interval: 'yearly'
        },
        '5': {
            id: 5,
            name: 'Standard Annual Plan',
            price: 959.88,
            features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'],
            billing_interval: 'yearly'
        },
        '6': {
            id: 6,
            name: 'Premium Annual Plan',
            price: 1919.88,
            features: ['All Features', 'Priority Support', 'Custom Integrations'],
            billing_interval: 'yearly'
        }
    };

    return plans[planId as keyof typeof plans];
} 