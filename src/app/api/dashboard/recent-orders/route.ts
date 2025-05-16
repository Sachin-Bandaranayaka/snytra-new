import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        // Fetch the 5 most recent orders
        const rows = await executeQuery<any[]>(`
      SELECT id, customer_name, status, total_amount, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 5
    `);

        return NextResponse.json({
            orders: rows,
            success: true
        });
    } catch (error: any) {
        console.error('Error fetching recent orders:', error);
        return NextResponse.json(
            { error: error.message, success: false },
            { status: 500 }
        );
    }
} 