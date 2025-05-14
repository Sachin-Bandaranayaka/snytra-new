import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        // Get user from NextAuth
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
        }

        // Verify admin role
        const admin = await db.sql`
            SELECT role FROM users WHERE email = ${session.user.email} LIMIT 1
        `;

        if (!admin || admin.length === 0 || admin[0].role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
        }

        // Query to get recent system activities
        // First check if the activity_logs table exists
        const tableCheck = await db.sql`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'activity_logs'
            ) as exists
        `;

        const tableExists = tableCheck[0]?.exists || false;

        let activities = [];

        if (tableExists) {
            // If the activity_logs table exists, query it
            const result = await db.sql`
                SELECT 
                    id, 
                    activity_type as activity, 
                    user_name as "user", 
                    to_char(created_at, 'DD Mon YYYY HH24:MI') as time,
                    status
                FROM activity_logs
                ORDER BY created_at DESC
                LIMIT 5
            `;

            activities = result;
        } else {
            // If the table doesn't exist yet, provide some placeholder data
            // This should be removed once the activity_logs table is created
            activities = [
                {
                    id: 1,
                    activity: 'New user registered',
                    user: 'John Smith',
                    time: '10 minutes ago',
                    status: 'completed'
                },
                {
                    id: 2,
                    activity: 'Support ticket created',
                    user: 'Emily Johnson',
                    time: '1 hour ago',
                    status: 'pending'
                },
                {
                    id: 3,
                    activity: 'New reservation',
                    user: 'Michael Davis',
                    time: '3 hours ago',
                    status: 'completed'
                },
                {
                    id: 4,
                    activity: 'Payment failed',
                    user: 'Sarah Wilson',
                    time: '5 hours ago',
                    status: 'failed'
                }
            ];
        }

        return NextResponse.json({ activities });
    } catch (error) {
        console.error('Error fetching activity data:', error);
        return NextResponse.json({ error: 'Failed to fetch activities data' }, { status: 500 });
    }
} 