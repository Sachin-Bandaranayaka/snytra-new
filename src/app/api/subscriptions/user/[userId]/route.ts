import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest, props: { params: Promise<{ userId: string }> }) {
    const params = await props.params;
    const userId = parseInt(params.userId);

    if (isNaN(userId)) {
        return NextResponse.json(
            { error: 'Invalid user ID' },
            { status: 400 }
        );
    }

    try {
        // Get user with subscription information
        const userResult = await pool.query(
            `SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.stripe_customer_id,
        s.plan_id AS subscription_plan,
        s.status AS subscription_status,
        s.stripe_subscription_id,
        s.current_period_start AS subscription_current_period_start,
        s.current_period_end AS subscription_current_period_end
      FROM 
        users u
      LEFT JOIN 
        subscriptions s ON u.id = s.user_id AND s.status IN ('active', 'canceled')
      WHERE 
        u.id = $1`,
            [userId]
        );

        if (userResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Get payment history
        const paymentsResult = await pool.query(
            `SELECT 
        id,
        amount,
        period_start,
        period_end,
        payment_date,
        stripe_invoice_id
      FROM 
        subscription_payments
      WHERE 
        user_id = $1
      ORDER BY 
        payment_date DESC`,
            [userId]
        );

        return NextResponse.json({
            user: userResult.rows[0],
            payments: paymentsResult.rows
        });
    } catch (error) {
        console.error('Error fetching user subscription data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch subscription data' },
            { status: 500 }
        );
    }
} 