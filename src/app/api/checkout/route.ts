import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { userId, planId } = data;

        // Validate input
        if (!userId || !planId) {
            return NextResponse.json(
                { error: 'User ID and Plan ID are required', success: false },
                { status: 400 }
            );
        }

        // Check if user exists
        const userQuery = 'SELECT id FROM users WHERE id = $1';
        const userResult = await executeQuery<any[]>(userQuery, [userId]);

        if (userResult.length === 0) {
            return NextResponse.json(
                { error: 'User not found', success: false },
                { status: 404 }
            );
        }

        // Check if plan exists and is active
        const planQuery = 'SELECT * FROM subscription_plans WHERE id = $1 AND is_active = true';
        const planResult = await executeQuery<any[]>(planQuery, [planId]);

        if (planResult.length === 0) {
            return NextResponse.json(
                { error: 'Subscription plan not found or inactive', success: false },
                { status: 404 }
            );
        }

        const plan = planResult[0];

        // In a real application, we would integrate with a payment provider here
        // For this mock, we'll just update the user's subscription details

        // Calculate subscription period based on billing interval
        const now = new Date();
        const periodEnd = new Date(now);

        if (plan.billing_interval === 'monthly') {
            periodEnd.setMonth(periodEnd.getMonth() + 1);
        } else if (plan.billing_interval === 'yearly') {
            periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        }

        // Update user's subscription info
        const updateQuery = `
            UPDATE users 
            SET 
                subscription_plan = $1,
                subscription_status = 'active',
                subscription_current_period_start = NOW(),
                subscription_current_period_end = $2,
                updated_at = NOW()
            WHERE id = $3
            RETURNING id, subscription_plan, subscription_status, subscription_current_period_start, subscription_current_period_end
        `;

        const updateResult = await executeQuery<any[]>(updateQuery, [planId, periodEnd, userId]);

        if (updateResult.length === 0) {
            throw new Error('Failed to update user subscription');
        }

        return NextResponse.json({
            success: true,
            subscription: updateResult[0],
            message: 'Subscription activated successfully'
        });
    } catch (error) {
        console.error('Error processing checkout:', error);
        return NextResponse.json(
            { error: 'Failed to process checkout', success: false },
            { status: 500 }
        );
    }
} 