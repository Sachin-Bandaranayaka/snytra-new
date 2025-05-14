import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/auth/me - Get the current authenticated user
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Check if the user is authenticated
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // Get the user data with subscription information
        const user = await db.users.findUnique({
            where: { id: userId },
            include: {
                subscription: {
                    include: {
                        plan: true
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Remove sensitive information
        const { password, ...userWithoutPassword } = user;

        return NextResponse.json({
            user: userWithoutPassword
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching current user:', error);
        return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }
} 