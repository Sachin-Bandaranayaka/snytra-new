import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16'
});

/**
 * Sync a subscription plan with Stripe
 * This endpoint creates or updates a Stripe product and price for a subscription plan
 */
export async function POST(request: NextRequest) {
    try {
        const { planId } = await request.json();

        if (!planId) {
            return NextResponse.json(
                { error: 'Plan ID is required', success: false },
                { status: 400 }
            );
        }

        // Get the plan details from the database
        const planResult = await pool.query(
            `SELECT * FROM subscription_plans WHERE id = $1`,
            [planId]
        );

        if (planResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Plan not found', success: false },
                { status: 404 }
            );
        }

        const plan = planResult.rows[0];

        // Get the features for the plan
        const featuresResult = await pool.query(
            `SELECT f.key, f.name, f.description 
             FROM plan_features pf
             JOIN features f ON pf.feature_key = f.key
             WHERE pf.plan_id = $1`,
            [planId]
        );

        const features = featuresResult.rows.map(row => row.key);

        // Check if this plan already has a Stripe product ID
        let productId = plan.stripe_product_id;
        let priceId = plan.stripe_price_id;

        if (productId) {
            // Update the existing product
            await stripe.products.update(productId, {
                name: plan.name,
                description: plan.description || undefined,
                active: plan.is_active,
                metadata: {
                    plan_id: planId.toString(),
                    features: JSON.stringify(features)
                }
            });

            console.log(`Updated Stripe product: ${productId}`);
        } else {
            // Create a new product
            const product = await stripe.products.create({
                name: plan.name,
                description: plan.description || undefined,
                active: plan.is_active,
                metadata: {
                    plan_id: planId.toString(),
                    features: JSON.stringify(features)
                }
            });

            productId = product.id;
            console.log(`Created new Stripe product: ${productId}`);
        }

        // Handle the price
        const isYearly = plan.billing_interval === 'yearly' || plan.billing_interval === 'year' || plan.billing_interval === 'annual';
        const interval = isYearly ? 'year' : 'month';

        if (priceId) {
            // We can't update the amount or currency of a price, so we need to archive the old one and create a new one
            await stripe.prices.update(priceId, { active: false });
            console.log(`Archived old Stripe price: ${priceId}`);
        }

        // Create a new price
        const price = await stripe.prices.create({
            product: productId,
            unit_amount: Math.round(plan.price * 100), // convert to cents
            currency: 'usd',
            recurring: {
                interval: interval,
            },
            metadata: {
                plan_id: planId.toString(),
                billing_cycle: plan.billing_interval
            }
        });

        priceId = price.id;
        console.log(`Created new Stripe price: ${priceId}`);

        // Update the plan with the Stripe IDs
        await pool.query(
            `UPDATE subscription_plans 
             SET stripe_product_id = $1, stripe_price_id = $2, updated_at = NOW()
             WHERE id = $3`,
            [productId, priceId, planId]
        );

        return NextResponse.json({
            success: true,
            plan: {
                ...plan,
                stripe_product_id: productId,
                stripe_price_id: priceId
            }
        });
    } catch (error) {
        console.error('Error syncing plan with Stripe:', error);
        return NextResponse.json(
            { error: 'Failed to sync plan with Stripe', success: false },
            { status: 500 }
        );
    }
}

/**
 * Sync all subscription plans with Stripe
 */
export async function GET(request: NextRequest) {
    try {
        // Get all active subscription plans
        const plansResult = await pool.query(
            `SELECT * FROM subscription_plans WHERE is_active = true`
        );

        const plans = plansResult.rows;
        const results = [];

        for (const plan of plans) {
            // Get the features for the plan
            const featuresResult = await pool.query(
                `SELECT f.key, f.name, f.description 
                FROM plan_features pf
                JOIN features f ON pf.feature_key = f.key
                WHERE pf.plan_id = $1`,
                [plan.id]
            );

            const features = featuresResult.rows.map(row => row.key);

            // Check if this plan already has a Stripe product ID
            let productId = plan.stripe_product_id;
            let priceId = plan.stripe_price_id;

            if (productId) {
                // Update the existing product
                await stripe.products.update(productId, {
                    name: plan.name,
                    description: plan.description || undefined,
                    active: plan.is_active,
                    metadata: {
                        plan_id: plan.id.toString(),
                        features: JSON.stringify(features)
                    }
                });

                console.log(`Updated Stripe product: ${productId}`);
            } else {
                // Create a new product
                const product = await stripe.products.create({
                    name: plan.name,
                    description: plan.description || undefined,
                    active: plan.is_active,
                    metadata: {
                        plan_id: plan.id.toString(),
                        features: JSON.stringify(features)
                    }
                });

                productId = product.id;
                console.log(`Created new Stripe product: ${productId}`);
            }

            // Handle the price
            const isYearly = plan.billing_interval === 'yearly' || plan.billing_interval === 'year' || plan.billing_interval === 'annual';
            const interval = isYearly ? 'year' : 'month';

            if (priceId) {
                // We can't update the amount or currency of a price, so we archive if it's changed
                const existingPrice = await stripe.prices.retrieve(priceId);
                const priceNeedUpdate =
                    existingPrice.unit_amount !== Math.round(plan.price * 100) ||
                    existingPrice.recurring?.interval !== interval;

                if (priceNeedUpdate) {
                    await stripe.prices.update(priceId, { active: false });
                    console.log(`Archived old Stripe price: ${priceId}`);
                    priceId = null; // Force creation of new price
                }
            }

            // Create a new price if needed
            if (!priceId) {
                const price = await stripe.prices.create({
                    product: productId,
                    unit_amount: Math.round(plan.price * 100), // convert to cents
                    currency: 'usd',
                    recurring: {
                        interval: interval,
                    },
                    metadata: {
                        plan_id: plan.id.toString(),
                        billing_cycle: plan.billing_interval
                    }
                });

                priceId = price.id;
                console.log(`Created new Stripe price: ${priceId}`);
            }

            // Update the plan with the Stripe IDs
            await pool.query(
                `UPDATE subscription_plans 
                SET stripe_product_id = $1, stripe_price_id = $2, updated_at = NOW()
                WHERE id = $3`,
                [productId, priceId, plan.id]
            );

            results.push({
                id: plan.id,
                name: plan.name,
                stripe_product_id: productId,
                stripe_price_id: priceId
            });
        }

        return NextResponse.json({
            success: true,
            results
        });
    } catch (error) {
        console.error('Error syncing plans with Stripe:', error);
        return NextResponse.json(
            { error: 'Failed to sync plans with Stripe', success: false },
            { status: 500 }
        );
    }
} 