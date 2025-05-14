import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function GET(req: NextRequest) {
    try {
        // Fetch staff members
        const staffQuery = await pool.query(`
      SELECT id, name, email, role, is_active, hiring_date, phone, profile_image
      FROM staff
      ORDER BY name ASC
    `);

        return NextResponse.json({
            staff: staffQuery.rows,
            success: true
        });
    } catch (error: any) {
        console.error('Error fetching staff data:', error);
        return NextResponse.json(
            { error: error.message, success: false },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const { name, email, password, role, is_active, phone, profile_image } = data;

        // Basic validation
        if (!name || !email || !role || !password) {
            return NextResponse.json(
                { error: 'Missing required fields', success: false },
                { status: 400 }
            );
        }

        // Set default hiring_date to today if not provided
        const hiring_date = data.hiring_date || new Date().toISOString().split('T')[0];

        // Hash the password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Insert staff member
        const result = await pool.query(
            `INSERT INTO staff (name, email, role, is_active, hiring_date, phone, profile_image, password_hash)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id, name, email, role, is_active, hiring_date, phone, profile_image`,
            [name, email, role, is_active, hiring_date, phone || null, profile_image || null, password_hash]
        );

        return NextResponse.json({
            staff: result.rows[0],
            success: true
        });
    } catch (error: any) {
        console.error('Error adding staff member:', error);

        // Handle duplicate email error
        if (error.code === '23505' && error.constraint === 'idx_staff_email') {
            return NextResponse.json(
                { error: 'Email address is already in use', success: false },
                { status: 400 }
            );
        }

        // Handle foreign key violation (restaurant_id)
        if (error.code === '23503' && error.constraint === 'fk_staff_restaurant') {
            return NextResponse.json(
                { error: 'Invalid restaurant ID', success: false },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: error.message, success: false },
            { status: 500 }
        );
    }
} 