import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { compare } from 'bcrypt';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Query the database for the staff member with the provided email
        const result = await pool.query(
            'SELECT * FROM staff WHERE email = $1',
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        const staff = result.rows[0];

        // Check if password matches using bcrypt
        const passwordMatch = await compare(password, staff.password_hash);

        if (!passwordMatch) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Check if staff is active
        if (!staff.is_active) {
            return NextResponse.json(
                { error: 'Your account has been deactivated. Please contact your manager.' },
                { status: 403 }
            );
        }

        // Get restaurant information
        const restaurantResult = await pool.query(
            'SELECT name FROM restaurants WHERE id = $1',
            [staff.restaurant_id]
        );

        // Don't send sensitive data back to the client
        const { password_hash, ...staffWithoutSensitiveData } = staff;

        return NextResponse.json({
            message: 'Login successful',
            staff: {
                ...staffWithoutSensitiveData,
                restaurant_name: restaurantResult.rows.length > 0 ? restaurantResult.rows[0].name : null
            }
        });
    } catch (error) {
        console.error('Staff login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 