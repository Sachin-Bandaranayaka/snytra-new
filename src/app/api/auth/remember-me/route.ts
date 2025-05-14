import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json(
                { error: 'Token is required' },
                { status: 400 }
            );
        }

        // Find user with this remember token
        const user = await prisma.$queryRaw`
            SELECT id, name, email, role
            FROM users 
            WHERE remember_token = ${token}
        `;

        if (!user || !Array.isArray(user) || user.length === 0) {
            return NextResponse.json(
                { error: 'Invalid remember token' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            user: user[0]
        });

    } catch (error) {
        console.error('Remember me validation error:', error);
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 