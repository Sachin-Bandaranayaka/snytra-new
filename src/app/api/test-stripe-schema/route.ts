import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        // Test users table with stripe_customer_id
        const usersResult = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name IN ('stripe_customer_id', 'stripe_subscription_id')
        `);

        // Test subscription_events table
        const eventsResult = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'subscription_events'
            ) as table_exists
        `);

        return NextResponse.json({
            success: true,
            stripeColumnsInUsers: usersResult.rows,
            subscriptionEventsTableExists: eventsResult.rows[0].table_exists
        });
    } catch (error: any) {
        console.error('Error testing Stripe schema:', error);
        return NextResponse.json(
            {
                error: error.message,
                success: false
            },
            { status: 500 }
        );
    }
} 