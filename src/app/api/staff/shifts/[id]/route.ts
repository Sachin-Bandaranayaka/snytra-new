import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const shiftId = params.id;

    if (!shiftId) {
        return NextResponse.json(
            { success: false, error: 'Shift ID is required' },
            { status: 400 }
        );
    }

    try {
        const result = await pool.query(`
      SELECT ss.*, 
             s.first_name, s.last_name,
             sr.name as role_name
      FROM staff_shifts ss
      JOIN staff s ON ss.staff_id = s.id
      JOIN staff_roles sr ON s.role_id = sr.id
      WHERE ss.id = $1
    `, [shiftId]);

        if (result.rowCount === 0) {
            return NextResponse.json(
                { success: false, error: 'Shift not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            shift: result.rows[0]
        });
    } catch (error: any) {
        console.error('Error fetching shift:', error);

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch shift' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const shiftId = params.id;

    if (!shiftId) {
        return NextResponse.json(
            { success: false, error: 'Shift ID is required' },
            { status: 400 }
        );
    }

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

        // Check if shift exists
        const shiftCheck = await pool.query(
            'SELECT id FROM staff_shifts WHERE id = $1',
            [shiftId]
        );

        if (shiftCheck.rowCount === 0) {
            return NextResponse.json(
                { success: false, error: 'Shift not found' },
                { status: 404 }
            );
        }

        // Build update query dynamically
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (staff_id !== undefined) {
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

            updates.push(`staff_id = $${paramIndex++}`);
            values.push(staff_id);
        }

        if (shift_date !== undefined) {
            updates.push(`shift_date = $${paramIndex++}`);
            values.push(shift_date);
        }

        if (start_time !== undefined) {
            updates.push(`start_time = $${paramIndex++}`);
            values.push(start_time);
        }

        if (end_time !== undefined) {
            updates.push(`end_time = $${paramIndex++}`);
            values.push(end_time);
        }

        if (break_minutes !== undefined) {
            updates.push(`break_minutes = $${paramIndex++}`);
            values.push(break_minutes);
        }

        if (status !== undefined) {
            updates.push(`status = $${paramIndex++}`);
            values.push(status);
        }

        if (notes !== undefined) {
            updates.push(`notes = $${paramIndex++}`);
            values.push(notes);
        }

        if (updates.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No fields to update' },
                { status: 400 }
            );
        }

        // Add the WHERE parameter
        values.push(shiftId);

        // Execute the update
        const result = await pool.query(
            `UPDATE staff_shifts SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
            values
        );

        return NextResponse.json({
            success: true,
            shift: result.rows[0]
        });
    } catch (error: any) {
        console.error('Error updating shift:', error);

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update shift' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const shiftId = params.id;

    if (!shiftId) {
        return NextResponse.json(
            { success: false, error: 'Shift ID is required' },
            { status: 400 }
        );
    }

    try {
        // Check if shift exists
        const shiftCheck = await pool.query(
            'SELECT id FROM staff_shifts WHERE id = $1',
            [shiftId]
        );

        if (shiftCheck.rowCount === 0) {
            return NextResponse.json(
                { success: false, error: 'Shift not found' },
                { status: 404 }
            );
        }

        // Delete the shift
        await pool.query('DELETE FROM staff_shifts WHERE id = $1', [shiftId]);

        return NextResponse.json({
            success: true,
            message: 'Shift deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting shift:', error);

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete shift' },
            { status: 500 }
        );
    }
} 