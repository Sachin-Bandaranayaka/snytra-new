import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const date = searchParams.get('date');
        const time = searchParams.get('time');
        const partySize = searchParams.get('party_size');

        if (!date || !time) {
            return NextResponse.json({
                error: 'Date and time are required',
                success: false
            }, { status: 400 });
        }

        // Get all tables that can accommodate the party size
        const sizeCondition = partySize ? `AND seats >= ${parseInt(partySize)}` : '';

        // Find tables that are not already reserved at the given time
        const query = `
            SELECT id, table_number, seats, is_smoking, status, qr_code_url 
            FROM tables 
            WHERE status = 'available' 
            ${sizeCondition}
            AND id NOT IN (
                SELECT table_id FROM reservations 
                WHERE date = $1 
                AND time = $2 
                AND status = 'confirmed'
                AND table_id IS NOT NULL
            )
            ORDER BY seats ASC
        `;

        console.log('Executing query:', query);
        const result = await executeQuery<any[]>(query, [date, time]);

        return NextResponse.json({
            tables: result,
            success: true
        });
    } catch (error: any) {
        console.error('Error fetching available tables:', error);
        return NextResponse.json({
            error: error.message,
            success: false
        }, { status: 500 });
    }
} 