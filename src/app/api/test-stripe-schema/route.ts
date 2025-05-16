import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        // Test users table with stripe_customer_id
        const usersResult = await executeQuery<any[]>(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name IN ('stripe_customer_id', 'stripe_subscription_id')
        `);

        // Test subscription_events table
        const eventsResult = await executeQuery<any[]>(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'subscription_events'
            ) as table_exists
        `);

        return NextResponse.json({
            success: true,
            stripeColumnsInUsers: usersResult,
            subscriptionEventsTableExists: eventsResult[0].table_exists
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