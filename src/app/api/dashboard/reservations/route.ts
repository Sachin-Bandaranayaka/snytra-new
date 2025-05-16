import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// GET endpoint to retrieve all reservations and waitlist entries
export async function GET(req: NextRequest) {
    try {
        // Get filter parameters
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const dateFilter = searchParams.get('date');
        const searchTerm = searchParams.get('search');

        // Build the query based on filters
        let query = `
            SELECT 
                r.id, 
                r.name, 
                r.email, 
                r.phone_number, 
                r.date, 
                r.time, 
                r.party_size, 
                r.table_id, 
                r.status, 
                r.special_instructions, 
                r.created_at,
                t.table_number,
                t.seats,
                t.qr_code_url
            FROM 
                reservations r
            LEFT JOIN 
                tables t ON r.table_id = t.id
            WHERE 1=1
        `;

        const params: any[] = [];
        let paramIndex = 1;

        if (status) {
            query += ` AND r.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        if (dateFilter) {
            query += ` AND r.date = $${paramIndex}`;
            params.push(dateFilter);
            paramIndex++;
        }

        if (searchTerm) {
            query += ` AND (
                r.name ILIKE $${paramIndex} OR 
                r.phone_number ILIKE $${paramIndex} OR 
                r.email ILIKE $${paramIndex}
            )`;
            params.push(`%${searchTerm}%`);
            paramIndex++;
        }

        console.log('Executing query:', query, 'with params:', params);
        query += ` ORDER BY r.date DESC, r.time ASC`;

        const reservationsResult = await executeQuery<any[]>(query, params);
        console.log('Reservations found:', reservationsResult.length);

        // Also get waitlist entries
        const waitlistResult = await executeQuery<any[]>(`
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

        // Get all available tables for assigning to reservations
        const tablesResult = await executeQuery<any[]>(`
            SELECT 
                id, 
                table_number, 
                seats, 
                status,
                qr_code_url
            FROM 
                tables 
            WHERE 
                status = 'available' 
            ORDER BY 
                seats ASC
        `);

        return NextResponse.json({
            reservations: reservationsResult,
            waitlist: waitlistResult,
            available_tables: tablesResult,
            success: true
        });
    } catch (error: any) {
        console.error('Error fetching reservations data:', error);
        return NextResponse.json(
            { error: error.message, success: false },
            { status: 500 }
        );
    }
}

// PUT endpoint to update reservation status
export async function PUT(req: NextRequest) {
    try {
        const { id, status, table_id } = await req.json();

        // Validate required fields
        if (!id || !status) {
            return NextResponse.json(
                { error: 'Reservation ID and status are required', success: false },
                { status: 400 }
            );
        }

        // Get the current reservation to check if there's a table change
        const currentReservation = await executeQuery<any[]>(
            'SELECT table_id FROM reservations WHERE id = $1',
            [id]
        );

        if (currentReservation.length === 0) {
            return NextResponse.json(
                { error: 'Reservation not found', success: false },
                { status: 404 }
            );
        }

        const oldTableId = currentReservation[0].table_id;

        // Update the reservation
        const result = await executeQuery<any[]>(
            `UPDATE reservations 
             SET status = $1, table_id = $2, updated_at = NOW() 
             WHERE id = $3 
             RETURNING *`,
            [status, table_id || null, id]
        );

        if (result.length === 0) {
            return NextResponse.json(
                { error: 'Reservation not found', success: false },
                { status: 404 }
            );
        }

        // If confirming a reservation, also update the table status
        if (status === 'confirmed' && table_id) {
            await pool.query(
                `UPDATE tables SET status = 'reserved' WHERE id = $1`,
                [table_id]
            );
        }

        // If the old table is different from the new table, update the old table status back to available
        if (oldTableId && oldTableId !== table_id) {
            await pool.query(
                `UPDATE tables SET status = 'available' WHERE id = $1`,
                [oldTableId]
            );
        }

        // Get the updated reservation with table information
        const updatedReservation = await executeQuery<any[]>(
            `SELECT 
                r.*, 
                t.table_number, 
                t.seats, 
                t.qr_code_url
             FROM 
                reservations r
             LEFT JOIN 
                tables t ON r.table_id = t.id
             WHERE 
                r.id = $1`,
            [id]
        );

        return NextResponse.json({
            reservation: updatedReservation[0],
            success: true,
            message: `Reservation ${status === 'confirmed' ? 'confirmed' : 'updated'} successfully`
        });
    } catch (error: any) {
        console.error('Error updating reservation:', error);
        return NextResponse.json(
            { error: error.message, success: false },
            { status: 500 }
        );
    }
}

// DELETE endpoint to delete a reservation
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Reservation ID is required', success: false },
                { status: 400 }
            );
        }

        // Get the reservation first to check if it has a table assigned
        const checkReservation = await executeQuery<any[]>(
            'SELECT table_id FROM reservations WHERE id = $1',
            [id]
        );

        if (checkReservation.length === 0) {
            return NextResponse.json(
                { error: 'Reservation not found', success: false },
                { status: 404 }
            );
        }

        const tableId = checkReservation[0].table_id;

        // Delete the reservation
        await pool.query('DELETE FROM reservations WHERE id = $1', [id]);

        // If the reservation had a table assigned, update the table status
        if (tableId) {
            await pool.query(
                `UPDATE tables SET status = 'available' WHERE id = $1`,
                [tableId]
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Reservation deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting reservation:', error);
        return NextResponse.json(
            { error: error.message, success: false },
            { status: 500 }
        );
    }
}