import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        // Get user from NextAuth session
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
        }

        // Check if user has admin role in the session
        if (session.user.role === 'admin') {
            // Get date 30 days ago
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            // Query to count users registered in the last 30 days
            const result = await db.sql`
                SELECT COUNT(*) as count
                FROM users
                WHERE created_at >= ${thirtyDaysAgo.toISOString()}
            `;

            const count = parseInt(result[0]?.count || '0', 10);

            return NextResponse.json({ count });
        }

        // If user doesn't have admin role in the session, verify in the database
        const admin = await db.sql`
            SELECT role FROM users WHERE email = ${session.user.email} LIMIT 1
        `;

        if (!admin || admin.length === 0 || admin[0].role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
        }

        // Get date 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Query to count users registered in the last 30 days
        const result = await db.sql`
            SELECT COUNT(*) as count
            FROM users
            WHERE created_at >= ${thirtyDaysAgo.toISOString()}
        `;

        const count = parseInt(result[0]?.count || '0', 10);

        return NextResponse.json({ count });
    } catch (error) {
        console.error('Error fetching new users count:', error);
        return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }
} 