import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const staffId = params.id;

    if (!staffId) {
        return NextResponse.json(
            { success: false, error: 'Staff ID is required' },
            { status: 400 }
        );
    }

    try {
        const result = await executeQuery<any[]>(`
      SELECT s.*, 
             sr.name as role_name, 
             sr.permissions as role_permissions,
             u.email as user_email
      FROM staff s
      JOIN staff_roles sr ON s.role_id = sr.id
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = $1
    `, [staffId]);

        if (result.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Staff member not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            staff: result[0]
        });
    } catch (error: any) {
        console.error('Error fetching staff member:', error);

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch staff member' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const staffId = params.id;

    if (!staffId) {
        return NextResponse.json(
            { success: false, error: 'Staff ID is required' },
            { status: 400 }
        );
    }

    try {
        const body = await request.json();
        const {
            user_id,
            role_id,
            first_name,
            last_name,
            email,
            phone,
            hire_date,
            status
        } = body;

        // Check if staff exists
        const staffCheck = await executeQuery<any[]>(
            'SELECT id FROM staff WHERE id = $1',
            [staffId]
        );

        if (staffCheck.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Staff member not found' },
                { status: 404 }
            );
        }

        // Build update query dynamically
        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (role_id !== undefined) {
            updates.push(`role_id = $${paramIndex++}`);
            values.push(role_id);
        }

        if (first_name !== undefined) {
            updates.push(`first_name = $${paramIndex++}`);
            values.push(first_name);
        }

        if (last_name !== undefined) {
            updates.push(`last_name = $${paramIndex++}`);
            values.push(last_name);
        }

        if (email !== undefined) {
            updates.push(`email = $${paramIndex++}`);
            values.push(email);
        }

        if (phone !== undefined) {
            updates.push(`phone = $${paramIndex++}`);
            values.push(phone);
        }

        if (hire_date !== undefined) {
            updates.push(`hire_date = $${paramIndex++}`);
            values.push(hire_date);
        }

        if (status !== undefined) {
            updates.push(`status = $${paramIndex++}`);
            values.push(status);
        }

        if (user_id !== undefined) {
            updates.push(`user_id = $${paramIndex++}`);
            values.push(user_id);
        }

        if (updates.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No fields to update' },
                { status: 400 }
            );
        }

        // Add the WHERE parameter
        values.push(staffId);

        // Execute the update
        const result = await executeQuery<any[]>(
            `UPDATE staff SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
            values
        );

        return NextResponse.json({
            success: true,
            staff: result[0]
        });
    } catch (error: any) {
        console.error('Error updating staff member:', error);

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update staff member' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const staffId = params.id;

    if (!staffId) {
        return NextResponse.json(
            { success: false, error: 'Staff ID is required' },
            { status: 400 }
        );
    }

    try {
        // Check if staff exists
        const staffCheck = await executeQuery<any[]>(
            'SELECT id FROM staff WHERE id = $1',
            [staffId]
        );

        if (staffCheck.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Staff member not found' },
                { status: 404 }
            );
        }

        // Delete the staff member
        await pool.query('DELETE FROM staff WHERE id = $1', [staffId]);

        return NextResponse.json({
            success: true,
            message: 'Staff member deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting staff member:', error);

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete staff member' },
            { status: 500 }
        );
    }
} 