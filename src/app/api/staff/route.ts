import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
    try {
        const result = await pool.query(`
      SELECT s.*, 
             sr.name as role_name, 
             sr.permissions as role_permissions,
             u.email as user_email
      FROM staff s
      JOIN staff_roles sr ON s.role_id = sr.id
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.last_name, s.first_name
    `);

        return NextResponse.json({
            success: true,
            staff: result.rows
        });
    } catch (error: any) {
        console.error('Error fetching staff:', error);

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch staff' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
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

        // Validate required fields
        if (!role_id || !first_name || !last_name || !email || !hire_date) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing required fields: role_id, first_name, last_name, email, and hire_date are required'
                },
                { status: 400 }
            );
        }

        // Check if email already exists
        const emailCheck = await pool.query(
            'SELECT id FROM staff WHERE email = $1',
            [email]
        );

        if (emailCheck.rowCount > 0) {
            return NextResponse.json(
                { success: false, error: 'Email already in use' },
                { status: 400 }
            );
        }

        // Check if role exists
        const roleCheck = await pool.query(
            'SELECT id FROM staff_roles WHERE id = $1',
            [role_id]
        );

        if (roleCheck.rowCount === 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid role_id' },
                { status: 400 }
            );
        }

        // Create new staff member
        const result = await pool.query(
            `INSERT INTO staff 
        (user_id, role_id, first_name, last_name, email, phone, hire_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
            [
                user_id || null,
                role_id,
                first_name,
                last_name,
                email,
                phone || null,
                hire_date,
                status || 'active'
            ]
        );

        return NextResponse.json({
            success: true,
            staff: result.rows[0]
        });
    } catch (error: any) {
        console.error('Error creating staff member:', error);

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create staff member' },
            { status: 500 }
        );
    }
} 