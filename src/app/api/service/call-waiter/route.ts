import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { tableId, reason, timestamp } = body;

        if (!tableId) {
            return NextResponse.json(
                { success: false, error: 'Table ID is required' },
                { status: 400 }
            );
        }

        if (!reason) {
            return NextResponse.json(
                { success: false, error: 'Reason is required' },
                { status: 400 }
            );
        }

        // Insert the request into the database
        const result = await pool.query(
            `INSERT INTO waiter_calls (
        table_id, 
        reason, 
        status, 
        requested_at
      ) VALUES ($1, $2, $3, $4) 
      RETURNING id`,
            [tableId, reason, 'pending', timestamp || new Date().toISOString()]
        );

        // Optionally trigger a notification here (WebSockets, etc.)
        // This would be implemented in Phase 5-6

        return NextResponse.json({
            success: true,
            requestId: result.rows[0].id,
            message: 'Waiter call request received'
        });
    } catch (error: any) {
        console.error('Error processing waiter call request:', error);

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to process waiter call request' },
            { status: 500 }
        );
    }
} 