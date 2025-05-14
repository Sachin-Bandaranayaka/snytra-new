import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function GET(request: NextRequest) {
    try {
        // Get query parameters
        const { searchParams } = new URL(request.url);
        const roleParam = searchParams.get('role');
        const searchParam = searchParams.get('search');

        // Build query
        let query = `
            SELECT 
                u.id, u.name, u.email, u.role, u.created_at, u.updated_at,
                u.subscription_plan, u.subscription_status,
                u.subscription_current_period_start, u.subscription_current_period_end
            FROM users u
            WHERE 1=1
        `;

        const queryParams = [];
        let paramIndex = 1;

        // Add role filter if provided
        if (roleParam) {
            query += ` AND u.role = $${paramIndex}`;
            queryParams.push(roleParam);
            paramIndex++;
        }

        // Add search filter if provided
        if (searchParam) {
            query += ` AND (
                u.name ILIKE $${paramIndex} OR 
                u.email ILIKE $${paramIndex}
            )`;
            queryParams.push(`%${searchParam}%`);
            paramIndex++;
        }

        // Add ordering
        query += ` ORDER BY u.created_at DESC`;

        const result = await pool.query(query, queryParams);

        return NextResponse.json({
            users: result.rows,
            success: true
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users', success: false },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { name, email, password, role } = data;

        // Validate input
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Name, email, and password are required', success: false },
                { status: 400 }
            );
        }

        // Check if user with email already exists
        const checkEmailQuery = 'SELECT id FROM users WHERE email = $1';
        const emailCheck = await pool.query(checkEmailQuery, [email]);

        if (emailCheck.rowCount > 0) {
            return NextResponse.json(
                { error: 'A user with this email already exists', success: false },
                { status: 400 }
            );
        }

        // Hash password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Insert the new user
        const insertQuery = `
            INSERT INTO users (
                name, email, password_hash, role, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, NOW(), NOW())
            RETURNING id, name, email, role, created_at
        `;

        const result = await pool.query(insertQuery, [
            name,
            email,
            password_hash,
            role || 'user'
        ]);

        return NextResponse.json({
            user: result.rows[0],
            success: true
        });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { error: 'Failed to create user', success: false },
            { status: 500 }
        );
    }
} 