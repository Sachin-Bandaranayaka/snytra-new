import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: Request) {
    try {
        // Get query parameters
        const url = new URL(request.url);
        const staffId = url.searchParams.get('staff_id');
        const startDateParam = url.searchParams.get('start_date');
        const endDateParam = url.searchParams.get('end_date');
        const status = url.searchParams.get('status');

        // Build query
        let query = `
      SELECT ss.*, 
             s.first_name, s.last_name,
             sr.name as role_name
      FROM staff_shifts ss
      JOIN staff s ON ss.staff_id = s.id
      JOIN staff_roles sr ON s.role_id = sr.id
      WHERE 1=1
    `;

        const params = [];
        let paramIndex = 1;

        if (staffId) {
            query += ` AND ss.staff_id = $${paramIndex++}`;
            params.push(staffId);
        }

        if (startDateParam) {
            query += ` AND ss.shift_date >= $${paramIndex++}`;
            params.push(startDateParam);
        }

        if (endDateParam) {
            query += ` AND ss.shift_date <= $${paramIndex++}`;
            params.push(endDateParam);
        }

        if (status) {
            query += ` AND ss.status = $${paramIndex++}`;
            params.push(status);
        }

        query += ` ORDER BY ss.shift_date, ss.start_time`;

        const result = await pool.query(query, params);

        return NextResponse.json({
            success: true,
            shifts: result.rows
        });
    } catch (error: any) {
        console.error('Error fetching shifts:', error);

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch shifts' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            staff_id,
            shift_date,
            start_time,
            end_time,
            break_minutes,
            status,
            notes
        } = body;

        // Validate required fields
        if (!staff_id || !shift_date || !start_time) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing required fields: staff_id, shift_date, and start_time are required'
                },
                { status: 400 }
            );
        }

        // Check if staff exists
        const staffCheck = await pool.query(
            'SELECT id FROM staff WHERE id = $1',
            [staff_id]
        );

        if (staffCheck.rowCount === 0) {
            return NextResponse.json(
                { success: false, error: 'Staff member not found' },
                { status: 400 }
            );
        }

        // Create new shift
        const result = await pool.query(
            `INSERT INTO staff_shifts 
        (staff_id, shift_date, start_time, end_time, break_minutes, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
            [
                staff_id,
                shift_date,
                start_time,
                end_time || null,
                break_minutes || 0,
                status || 'scheduled',
                notes || null
            ]
        );

        return NextResponse.json({
            success: true,
            shift: result.rows[0]
        });
    } catch (error: any) {
        console.error('Error creating shift:', error);

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create shift' },
            { status: 500 }
        );
    }
} 