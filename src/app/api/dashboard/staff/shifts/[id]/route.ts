import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET a specific shift
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verify authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const shiftId = params.id;

        // Fetch the shift
        const result = await executeQuery<any[]>(
            `SELECT s.*, staff.name as staff_name, staff.role
      FROM staff_shifts s
      JOIN staff ON s.staff_id = staff.id
      WHERE s.id = $1`,
            [shiftId]
        );

        if (result.length === 0) {
            return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
        }

        const row = result[0];

        // Format shift for response
        const shift = {
            id: row.id,
            staffId: row.staff_id,
            staffName: row.staff_name,
            role: row.role,
            date: row.shift_date.toISOString().split('T')[0],
            startTime: row.start_time.substring(0, 5), // HH:MM format
            endTime: row.end_time.substring(0, 5), // HH:MM format
            notes: row.notes
        };

        return NextResponse.json({ shift });
    } catch (error) {
        console.error('Error fetching shift:', error);
        return NextResponse.json(
            { error: 'Failed to fetch shift' },
            { status: 500 }
        );
    }
}

// PUT to update a shift
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verify authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const shiftId = params.id;
        const { staffId, date, startTime, endTime, notes } = await request.json();

        // Validate required fields
        if (!staffId || !date || !startTime || !endTime) {
            return NextResponse.json(
                { error: 'Staff ID, date, start time, and end time are required' },
                { status: 400 }
            );
        }

        // Check if shift exists
        const shiftCheck = await executeQuery<any[]>(
            'SELECT id FROM staff_shifts WHERE id = $1',
            [shiftId]
        );

        if (shiftCheck.length === 0) {
            return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
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

        // Check for overlapping shifts for the same staff member (excluding this shift)
        const overlapCheck = await executeQuery<any[]>(
            `SELECT id 
      FROM staff_shifts 
      WHERE staff_id = $1 
        AND shift_date = $2
        AND id != $3
        AND (
          (start_time <= $4 AND end_time > $4) OR
          (start_time < $5 AND end_time >= $5) OR
          (start_time >= $4 AND end_time <= $5)
        )`,
            [staffId, date, shiftId, startTime, endTime]
        );

        if (overlapCheck.length > 0) {
            return NextResponse.json(
                { error: 'This shift overlaps with an existing shift for this staff member' },
                { status: 400 }
            );
        }

        // Update the shift
        const result = await executeQuery<any[]>(
            `UPDATE staff_shifts 
      SET staff_id = $1, shift_date = $2, start_time = $3, end_time = $4, notes = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING id, staff_id, shift_date, start_time, end_time, notes`,
            [staffId, date, startTime, endTime, notes || null, shiftId]
        );

        const updatedShift = result[0];

        return NextResponse.json({
            message: 'Shift updated successfully',
            shift: {
                id: updatedShift.id,
                staffId: updatedShift.staff_id,
                staffName: staff.name,
                role: staff.role,
                date: updatedShift.shift_date.toISOString().split('T')[0],
                startTime: updatedShift.start_time.substring(0, 5),
                endTime: updatedShift.end_time.substring(0, 5),
                notes: updatedShift.notes
            }
        });
    } catch (error) {
        console.error('Error updating shift:', error);
        return NextResponse.json(
            { error: 'Failed to update shift' },
            { status: 500 }
        );
    }
}

// DELETE a shift
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verify authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const shiftId = params.id;

        // Check if shift exists
        const shiftCheck = await executeQuery<any[]>(
            'SELECT id FROM staff_shifts WHERE id = $1',
            [shiftId]
        );

        if (shiftCheck.length === 0) {
            return NextResponse.json({ error: 'Shift not found' }, { status: 404 });
        }

        // Delete the shift
        await pool.query('DELETE FROM staff_shifts WHERE id = $1', [shiftId]);

        return NextResponse.json({ message: 'Shift deleted successfully' });
    } catch (error) {
        console.error('Error deleting shift:', error);
        return NextResponse.json(
            { error: 'Failed to delete shift' },
            { status: 500 }
        );
    }
} 