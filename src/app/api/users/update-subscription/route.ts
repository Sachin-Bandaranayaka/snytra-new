import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { userId, subscriptionPlan, subscriptionStatus } = await req.json();

        // Validate inputs
        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Get current date for subscription periods
        const currentDate = new Date();
        const nextMonthDate = new Date(currentDate);
        nextMonthDate.setMonth(currentDate.getMonth() + 1);

        // Update user's subscription information
        await pool.query(
            `UPDATE users 
            SET subscription_plan = $1,
                subscription_status = $2,
                subscription_current_period_start = $3,
                subscription_current_period_end = $4,
                updated_at = NOW()
            WHERE id = $5`,
            [
                subscriptionPlan,
                subscriptionStatus,
                currentDate,
                nextMonthDate,
                userId
            ]
        );

        // Return success
        return NextResponse.json({
            success: true,
            message: 'User subscription updated successfully'
        });
    } catch (error: any) {
        console.error('Error updating user subscription:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update user subscription' },
            { status: 500 }
        );
    }
} 