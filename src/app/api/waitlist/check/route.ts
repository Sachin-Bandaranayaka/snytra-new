import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const phone = searchParams.get('phone');

        if (!phone) {
            return NextResponse.json(
                { error: 'Phone number is required' },
                { status: 400 }
            );
        }

        // Find waitlist entries by phone number
        const result = await pool.query(
            `SELECT * FROM waitlist 
       WHERE phone_number = $1 
       AND status = 'waiting'
       AND requested_date >= CURRENT_DATE
       ORDER BY requested_date, requested_time`,
            [phone]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { message: 'No active waitlist entries found for this phone number' },
                { status: 404 }
            );
        }

        // For each entry, get its position in the waitlist
        const entries = await Promise.all(
            result.rows.map(async (entry) => {
                // Count entries ahead in the queue for the same date and time
                const positionResult = await pool.query(
                    `SELECT COUNT(*) as position 
           FROM waitlist
           WHERE requested_date = $1 
           AND requested_time = $2
           AND status = 'waiting'
           AND id < $3`,
                    [entry.requested_date, entry.requested_time, entry.id]
                );

                // Add 1 to get actual position (since we start counting from 0)
                const position = parseInt(positionResult.rows[0].position) + 1;

                return {
                    id: entry.id,
                    customerName: entry.customer_name,
                    partySize: entry.party_size,
                    date: entry.requested_date,
                    time: entry.requested_time,
                    estimatedWaitTime: entry.estimated_wait_time,
                    position: position,
                    createdAt: entry.created_at
                };
            })
        );

        return NextResponse.json({
            success: true,
            entries
        });
    } catch (error) {
        console.error('Error checking waitlist status:', error);
        return NextResponse.json(
            { error: 'Failed to check waitlist status' },
            { status: 500 }
        );
    }
} 