import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { userId, subscriptionId, amount, paymentMethod, status } = await req.json();

        // Validate inputs
        if (!userId || !subscriptionId || !amount) {
            return NextResponse.json(
                { error: 'User ID, subscription ID, and amount are required' },
                { status: 400 }
            );
        }

        // Create a payment record in the database
        const currentDate = new Date();
        const nextMonthDate = new Date(currentDate);
        nextMonthDate.setMonth(currentDate.getMonth() + 1);

        // Use subscription_payments table to log the payment
        const rows = await executeQuery<any[]>(
            `INSERT INTO subscription_payments (
                user_id,
                stripe_invoice_id, 
                stripe_subscription_id,
                amount,
                period_start,
                period_end,
                payment_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [
                userId,
                `local_invoice_${Date.now()}`, // Local invoice ID
                `local_subscription_${subscriptionId}`, // Local subscription ID
                amount,
                currentDate,
                nextMonthDate,
                currentDate
            ]
        );

        const paymentId = rows[0].id;

        // Return success
        return NextResponse.json({
            success: true,
            message: 'Payment recorded successfully',
            paymentId: paymentId
        });
    } catch (error: any) {
        console.error('Error recording payment:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to record payment' },
            { status: 500 }
        );
    }
} 