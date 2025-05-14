import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import bcrypt from 'bcryptjs';

/**
 * DEBUG ENDPOINT - For development only
 * Tests direct database authentication
 * POST with {email, password} to test login without NextAuth
 * 
 * IMPORTANT: Don't use this in production!
 */
export async function POST(request: NextRequest) {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
    }

    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }

        console.log('Debug login test for:', email);

        // Get user with raw SQL
        const result = await executeQuery(
            'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
            [email]
        );

        if (result.length === 0) {
            return NextResponse.json({
                error: 'User not found',
                success: false,
                status: 'not_found'
            });
        }

        const user = result[0];

        // Check if password field exists
        if (!user.password_hash) {
            return NextResponse.json({
                error: 'No password hash found for user',
                success: false,
                status: 'no_password',
                user: {
                    id: user.id,
                    email: user.email,
                    hasPasswordField: !!user.password_hash,
                    passwordFieldName: 'password_hash',
                    availableFields: Object.keys(user).filter(k => k !== 'password_hash')
                }
            });
        }

        // Compare password
        const isValid = await bcrypt.compare(password, user.password_hash);

        return NextResponse.json({
            success: isValid,
            status: isValid ? 'valid' : 'invalid_password',
            user: isValid ? {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            } : null
        });

    } catch (error) {
        console.error('Debug login test error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Unknown error',
            success: false,
            status: 'error'
        }, { status: 500 });
    }
} 