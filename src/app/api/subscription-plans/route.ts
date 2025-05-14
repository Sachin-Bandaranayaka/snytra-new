import { NextRequest, NextResponse } from 'next/server';
import db, { executeQuery, getConnectionPool } from '@/lib/db';
import {
    ensureFeaturesIsArray,
    convertFeatureIdsToNames,
    convertFeatureNamesToIds
} from './helpers';

export async function GET(request: NextRequest) {
    try {
        const query = `
            SELECT 
                sp.*,
                (
                    SELECT COUNT(*) 
                    FROM users 
                    WHERE (
                        -- Try to match by ID first
                        (subscription_plan ~ '^[0-9]+$' AND CAST(subscription_plan AS INTEGER) = sp.id)
                        OR 
                        -- Then try to match by name
                        (subscription_plan = sp.name)
                    )
                    AND subscription_status = 'active'
                ) as user_count
            FROM 
                subscription_plans sp
            ORDER BY 
                sp.price ASC
        `;

        const result = await executeQuery(query);

        // Parse JSON fields
        const plans = result.map(plan => {
            const features = ensureFeaturesIsArray(plan.features);

            return {
                ...plan,
                billing_cycle: plan.billing_interval,
                features: convertFeatureIdsToNames(features)
            };
        });

        return NextResponse.json({
            plans,
            success: true
        });
    } catch (error) {
        console.error('Error fetching subscription plans:', error);
        return NextResponse.json(
            { error: 'Failed to fetch subscription plans', success: false },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const {
            name,
            description,
            price,
            billing_cycle,
            features,
            is_active,
            has_trial,
            trial_days
        } = await request.json();

        // Validate required fields
        if (!name || !price) {
            return NextResponse.json(
                { error: 'Name and price are required', success: false },
                { status: 400 }
            );
        }

        // Use connection pool for transaction
        let client;
        try {
            // Only attempt to get connection pool in non-serverless environment
            const pool = getConnectionPool();
            client = await pool.connect();

            await client.query('BEGIN');

            // Insert the subscription plan
            const insertQuery = `
                INSERT INTO subscription_plans (
                    name, 
                    description, 
                    price, 
                    billing_interval, 
                    features, 
                    is_active,
                    has_trial,
                    trial_days,
                    created_at, 
                    updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
                RETURNING *
            `;

            const featuresJson = JSON.stringify(features || []);

            const result = await client.query(insertQuery, [
                name,
                description || '',
                price,
                billing_cycle || 'monthly',
                featuresJson,
                is_active === undefined ? true : is_active,
                has_trial || false,
                has_trial ? trial_days || 0 : 0
            ]);

            const planId = result.rows[0].id;

            // Add features to plan_features table
            if (features && features.length > 0) {
                const featureValues = features.map((featureKey: string) => {
                    return `(${planId}, '${featureKey}')`;
                }).join(', ');

                const featureQuery = `
                    INSERT INTO plan_features (plan_id, feature_key)
                    VALUES ${featureValues}
                    ON CONFLICT (plan_id, feature_key) DO NOTHING
                `;

                await client.query(featureQuery);
            }

            // Commit transaction
            await client.query('COMMIT');

            // Fetch features for the response
            const featuresResult = await client.query(
                `SELECT f.* 
                 FROM plan_features pf
                 JOIN features f ON pf.feature_key = f.key
                 WHERE pf.plan_id = $1`,
                [planId]
            );

            const plan = {
                ...result.rows[0],
                billing_cycle: result.rows[0].billing_interval,
                feature_details: featuresResult.rows
            };

            return NextResponse.json({
                plan,
                success: true
            });
        } catch (error) {
            if (client) {
                await client.query('ROLLBACK');
            }
            throw error;
        } finally {
            if (client) {
                client.release();
            }
        }
    } catch (error) {
        console.error('Error creating subscription plan:', error);
        return NextResponse.json(
            { error: 'Failed to create subscription plan', success: false },
            { status: 500 }
        );
    }
} 