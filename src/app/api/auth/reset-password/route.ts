import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token, password } = body;

        if (!token || !password) {
            return NextResponse.json(
                { error: 'Token and password are required' },
                { status: 400 }
            );
        }

        // Find user with this token and check if token is still valid
        const user = await prisma.$queryRaw`
            SELECT id, email 
            FROM users 
            WHERE reset_token = ${token} 
            AND reset_token_expires > NOW()
        `;

        if (!user || !Array.isArray(user) || user.length === 0) {
            return NextResponse.json(
                { error: 'Invalid or expired reset token' },
                { status: 400 }
            );
        }

        // Hash the new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Update password and clear reset token
        await prisma.$executeRaw`
            UPDATE users 
            SET password_hash = ${hashedPassword}, 
                reset_token = NULL, 
                reset_token_expires = NULL,
                updated_at = NOW()
            WHERE id = ${user[0].id}
        `;

        return NextResponse.json({
            success: true,
            message: 'Password has been reset successfully'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { error: 'Failed to reset password' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 