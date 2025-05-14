import { NextRequest, NextResponse } from 'next/server'; import db, { executeQuery, getConnectionPool } from '@/lib/db'; import { ensureFeaturesIsArray, convertFeatureIdsToNames, convertFeatureNamesToIds } from '../helpers';

// Helper function to check if a plan is in use
async function isPlanInUse(planId: number) {
    const usageQuery = `
        SELECT COUNT(*) FROM users 
        WHERE (
            CASE 
                WHEN subscription_plan ~ E'^\\d+$' 
                THEN CAST(subscription_plan AS INTEGER) = $1 
                ELSE subscription_plan = (SELECT name FROM subscription_plans WHERE id = $1)
            END
        )
        AND subscription_status = 'active'
    `;
    const usageResult = await executeQuery(usageQuery, [planId]);
    return parseInt(usageResult[0].count) > 0;
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string | Promise<string> } }
) {
    try {
        // Properly handle the ID
        const idParam = await params.id;
        const id = parseInt(idParam);
        if (isNaN(id)) {
            return NextResponse.json(
                { error: 'Invalid subscription plan ID', success: false },
                { status: 400 }
            );
        }

        // Fetch the specific plan
        const query = `
            SELECT 
                sp.*,
                (
                    SELECT COUNT(*) 
                    FROM users 
                    WHERE CAST(subscription_plan AS INTEGER) = sp.id
                    AND subscription_status = 'active'
                ) as user_count
            FROM 
                subscription_plans sp
            WHERE
                sp.id = $1
        `;

        const result = await executeQuery(query, [id]);

        if (result.length === 0) {
            return NextResponse.json(
                { error: 'Subscription plan not found', success: false },
                { status: 404 }
            );
        }

        // Parse JSON fields
        const features = ensureFeaturesIsArray(result[0].features);

        const plan = {
            ...result[0],
            billing_cycle: result[0].billing_interval,
            features: convertFeatureIdsToNames(features)
        };

        return NextResponse.json({
            plan,
            success: true
        });
    } catch (error) {
        console.error('Error fetching subscription plan:', error);
        return NextResponse.json(
            { error: 'Failed to fetch subscription plan', success: false },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string | Promise<string> } }
) {
    try {
        // Properly handle the ID
        const idParam = await params.id;
        const id = parseInt(idParam);
        if (isNaN(id)) {
            return NextResponse.json(
                { error: 'Invalid subscription plan ID', success: false },
                { status: 400 }
            );
        }

        // Parse request body
        const data = await request.json();

        // Check if plan exists
        const checkQuery = 'SELECT * FROM subscription_plans WHERE id = $1';
        const checkResult = await executeQuery(checkQuery, [id]);
        if (checkResult.length === 0) {
            return NextResponse.json(
                { error: 'Subscription plan not found', success: false },
                { status: 404 }
            );
        }
        const existingPlan = checkResult[0];

        // Prepare update data
        const updateData: Record<string, any> = {};
        const updateFields: string[] = [];
        const values: any[] = [];
        let valueIndex = 1;

        if (data.name !== undefined) {
            updateData.name = data.name;
            updateFields.push(`name = $${valueIndex++}`);
            values.push(data.name);
        }

        if (data.description !== undefined) {
            updateData.description = data.description;
            updateFields.push(`description = $${valueIndex++}`);
            values.push(data.description);
        }

        if (data.price !== undefined) {
            updateData.price = data.price;
            updateFields.push(`price = $${valueIndex++}`);
            values.push(data.price);
        }

        if (data.billing_cycle !== undefined) {
            updateData.billing_interval = data.billing_cycle;
            updateFields.push(`billing_interval = $${valueIndex++}`);
            values.push(data.billing_cycle);
        }

        if (data.features !== undefined) {
            // Convert feature display names to IDs when possible
            const processedFeatures = convertFeatureNamesToIds(data.features);
            const featuresJson = JSON.stringify(processedFeatures);

            updateData.features = featuresJson;
            updateFields.push(`features = $${valueIndex++}`);
            values.push(featuresJson);
        }

        if (data.is_active !== undefined) {
            updateData.is_active = data.is_active;
            updateFields.push(`is_active = $${valueIndex++}`);
            values.push(data.is_active);
        }

        if (data.has_trial !== undefined) {
            updateData.has_trial = data.has_trial;
            updateFields.push(`has_trial = $${valueIndex++}`);
            values.push(data.has_trial);
        }

        if (data.trial_days !== undefined) {
            // Only set trial days if it's a valid number and has_trial is true
            if (typeof data.trial_days !== 'number' || data.trial_days < 0) {
                return NextResponse.json(
                    { error: 'Trial days must be a non-negative number', success: false },
                    { status: 400 }
                );
            }

            updateData.trial_days = data.has_trial ? data.trial_days : 0;
            updateFields.push(`trial_days = $${valueIndex++}`);
            values.push(updateData.trial_days);
        } else if (data.has_trial !== undefined) {
            // If only has_trial is set but not trial_days, ensure trial_days is set appropriately
            // If has_trial is false, set trial_days to 0
            // If has_trial is true, keep existing trial_days or set to default of 14
            if (data.has_trial === false) {
                updateData.trial_days = 0;
                updateFields.push(`trial_days = $${valueIndex++}`);
                values.push(0);
            } else if (data.has_trial === true && !existingPlan.has_trial) {
                updateData.trial_days = 14; // Default to 14 days if setting trial for first time
                updateFields.push(`trial_days = $${valueIndex++}`);
                values.push(14);
            }
        }

        // Add updated_at
        updateFields.push(`updated_at = NOW()`);

        // If no fields to update, return the existing plan
        if (updateFields.length === 0) {
            const existingFeatures = ensureFeaturesIsArray(existingPlan.features);

            return NextResponse.json({
                plan: {
                    ...existingPlan,
                    billing_cycle: existingPlan.billing_interval,
                    features: convertFeatureIdsToNames(existingFeatures)
                },
                success: true
            });
        }

        // Construct and execute update query
        const updateQuery = `
            UPDATE subscription_plans
            SET ${updateFields.join(', ')}
            WHERE id = $${valueIndex}
            RETURNING *
        `;

        values.push(id);
        const result = await executeQuery(updateQuery, values);

        // Format the result
        const features = ensureFeaturesIsArray(result[0].features);
        const updatedPlan = {
            ...result[0],
            billing_cycle: result[0].billing_interval,
            features: convertFeatureIdsToNames(features)
        };

        return NextResponse.json({
            plan: updatedPlan,
            success: true
        });
    } catch (error) {
        console.error('Error updating subscription plan:', error);
        return NextResponse.json(
            { error: 'Failed to update subscription plan', success: false },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string | Promise<string> } }
) {
    try {
        // Properly handle the ID
        const idParam = await params.id;
        const id = parseInt(idParam);
        if (isNaN(id)) {
            return NextResponse.json(
                { error: 'Invalid subscription plan ID', success: false },
                { status: 400 }
            );
        }

        // Check if plan exists
        const checkQuery = 'SELECT * FROM subscription_plans WHERE id = $1';
        const checkResult = await executeQuery(checkQuery, [id]);
        if (checkResult.length === 0) {
            return NextResponse.json(
                { error: 'Subscription plan not found', success: false },
                { status: 404 }
            );
        }

        // Check if plan is in use
        const activeUsersCount = await isPlanInUse(id);
        if (activeUsersCount) {
            return NextResponse.json(
                {
                    error: `Cannot delete plan because it is currently used by active users`,
                    success: false
                },
                { status: 400 }
            );
        }

        // Delete the plan
        const deleteQuery = 'DELETE FROM subscription_plans WHERE id = $1 RETURNING *';
        const result = await executeQuery(deleteQuery, [id]);

        // Check if deletion was successful
        if (result.length === 0) {
            return NextResponse.json(
                { error: 'Failed to delete subscription plan', success: false },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'Subscription plan deleted successfully',
            success: true
        });
    } catch (error) {
        console.error('Error deleting subscription plan:', error);
        return NextResponse.json(
            { error: 'Failed to delete subscription plan', success: false },
            { status: 500 }
        );
    }
} 