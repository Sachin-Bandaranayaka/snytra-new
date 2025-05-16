import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET endpoint to retrieve shifts
export async function GET(request: NextRequest) {
    try {
        // Verify authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const staffId = searchParams.get('staffId');

        // Build query
        let query = `
      SELECT s.*, staff.name as staff_name, staff.role
      FROM staff_shifts s
      JOIN staff ON s.staff_id = staff.id
      WHERE 1=1
    `;
        const queryParams: any[] = [];

        // Add filters if provided
        if (startDate && endDate) {
            queryParams.push(startDate, endDate);
            query += ` AND s.shift_date BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`;
        } else if (startDate) {
            queryParams.push(startDate);
            query += ` AND s.shift_date >= $${queryParams.length}`;
        } else if (endDate) {
            queryParams.push(endDate);
            query += ` AND s.shift_date <= $${queryParams.length}`;
        }

        if (staffId) {
            queryParams.push(parseInt(staffId));
            query += ` AND s.staff_id = $${queryParams.length}`;
        }

        query += ` ORDER BY s.shift_date ASC, s.start_time ASC`;

        // Execute query
        const result = await executeQuery<any[]>(query, queryParams);

        // Format shifts for response
        const shifts = result.map(row => ({
            id: row.id,
            staffId: row.staff_id,
            staffName: row.staff_name,
            role: row.role,
            date: row.shift_date.toISOString().split('T')[0],
            startTime: row.start_time.substring(0, 5), // HH:MM format
            endTime: row.end_time.substring(0, 5), // HH:MM format
            notes: row.notes
        }));

        return NextResponse.json({ shifts });
    } catch (error) {
        console.error('Error fetching shifts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch shifts' },
            { status: 500 }
        );
    }
}

// POST endpoint to create a new shift
export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Extract shift data from request
        const { staffId, date, startTime, endTime, notes } = await request.json();

        // Validate required fields
        if (!staffId || !date || !startTime || !endTime) {
            return NextResponse.json(
                { error: 'Staff ID, date, start time, and end time are required' },
                { status: 400 }
            );
        }

        // Check if staff member exists
        const staffCheck = await executeQuery<any[]>(
            'SELECT id, name, role FROM staff WHERE id = $1',
            [staffId]
        );

        if (staffCheck.length === 0) {
            return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
        }

        const staff = staffCheck[0];

        // Check for overlapping shifts for the same staff member
        const overlapCheck = await executeQuery<any[]>(
            `SELECT id 
      FROM staff_shifts 
      WHERE staff_id = $1 
        AND shift_date = $2
        AND (
          (start_time <= $3 AND end_time > $3) OR
          (start_time < $4 AND end_time >= $4) OR
          (start_time >= $3 AND end_time <= $4)
        )`,
            [staffId, date, startTime, endTime]
        );

        if (overlapCheck.length > 0) {
            return NextResponse.json(
                { error: 'This shift overlaps with an existing shift for this staff member' },
                { status: 400 }
            );
        }

        // Create new shift
        const result = await executeQuery<any[]>(
            `INSERT INTO staff_shifts (staff_id, shift_date, start_time, end_time, notes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, staff_id, shift_date, start_time, end_time, notes`,
            [staffId, date, startTime, endTime, notes || null]
        );

        const newShift = result[0];

        return NextResponse.json({
            message: 'Shift created successfully',
            shift: {
                id: newShift.id,
                staffId: newShift.staff_id,
                staffName: staff.name,
                role: staff.role,
                date: newShift.shift_date.toISOString().split('T')[0],
                startTime: newShift.start_time.substring(0, 5),
                endTime: newShift.end_time.substring(0, 5),
                notes: newShift.notes
            }
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating shift:', error);
        return NextResponse.json(
            { error: 'Failed to create shift' },
            { status: 500 }
        );
    }
} 