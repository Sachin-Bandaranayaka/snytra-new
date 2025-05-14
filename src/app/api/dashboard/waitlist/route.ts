import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// GET endpoint to retrieve all waitlist entries
export async function GET(req: NextRequest) {
    try {
        const waitlistResult = await pool.query(`
            SELECT 
                id, 
                name, 
                phone_number, 
                party_size, 
                created_at
            FROM 
                waitlist 
            ORDER BY 
                created_at DESC
        `);

        return NextResponse.json({
            waitlist: waitlistResult.rows,
            success: true
        });
    } catch (error: any) {
        console.error('Error fetching waitlist data:', error);
        return NextResponse.json(
            { error: error.message, success: false },
            { status: 500 }
        );
    }
}

// POST endpoint to convert a waitlist entry to a reservation
export async function POST(req: NextRequest) {
    try {
        const { id, date, time, table_id } = await req.json();

        // Validate required fields
        if (!id || !date || !time) {
            return NextResponse.json(
                { error: 'Waitlist ID, date, and time are required', success: false },
                { status: 400 }
            );
        }

        // Get the waitlist entry first
        const waitlistEntry = await pool.query(
            'SELECT * FROM waitlist WHERE id = $1',
            [id]
        );

        if (waitlistEntry.rows.length === 0) {
            return NextResponse.json(
                { error: 'Waitlist entry not found', success: false },
                { status: 404 }
            );
        }

        const entry = waitlistEntry.rows[0];

        // Create a new reservation from the waitlist entry
        const result = await pool.query(
            `INSERT INTO reservations 
             (name, phone_number, date, time, party_size, table_id, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING *`,
            [
                entry.name,
                entry.phone_number,
                date,
                time,
                entry.party_size,
                table_id || null,
                table_id ? 'confirmed' : 'waitlist'
            ]
        );

        // If a table was assigned, update its status
        if (table_id) {
            await pool.query(
                `UPDATE tables SET status = 'reserved' WHERE id = $1`,
                [table_id]
            );
        }

        // Delete the waitlist entry
        await pool.query('DELETE FROM waitlist WHERE id = $1', [id]);

        return NextResponse.json({
            reservation: result.rows[0],
            success: true,
            message: 'Waitlist entry converted to reservation successfully'
        });
    } catch (error: any) {
        console.error('Error converting waitlist to reservation:', error);
        return NextResponse.json(
            { error: error.message, success: false },
            { status: 500 }
        );
    }
}

// DELETE endpoint to delete a waitlist entry
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Waitlist ID is required', success: false },
                { status: 400 }
            );
        }

        // Delete the waitlist entry
        const result = await pool.query('DELETE FROM waitlist WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return NextResponse.json(
                { error: 'Waitlist entry not found', success: false },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Waitlist entry deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting waitlist entry:', error);
        return NextResponse.json(
            { error: error.message, success: false },
            { status: 500 }
        );
    }
} 