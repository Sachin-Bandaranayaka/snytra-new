import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
    try {
        // Get all active subscription plans
        const result = await pool.query(
            `SELECT * FROM subscription_plans 
             WHERE is_active = true
             ORDER BY price ASC`
        );

        return NextResponse.json({
            plans: result.rows
        });
    } catch (error) {
        console.error('Error retrieving subscription plans:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve subscription plans' },
            { status: 500 }
        );
    }
}