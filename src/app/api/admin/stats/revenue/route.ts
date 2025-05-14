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
            // Get first day of current month
            const now = new Date();
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            try {
                // Check if the orders table exists
                const tableCheck = await db.sql`
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = 'orders'
                    ) as exists
                `;

                const tableExists = tableCheck[0]?.exists || false;

                if (tableExists) {
                    // Query to sum order totals for the current month
                    const result = await db.sql`
                        SELECT COALESCE(SUM(total_amount), 0) as total
                        FROM orders
                        WHERE created_at >= ${firstDayOfMonth.toISOString()} AND status != 'cancelled'
                    `;

                    const total = parseFloat(result[0]?.total || '0');
                    return NextResponse.json({ total });
                } else {
                    // Table doesn't exist yet
                    return NextResponse.json({ total: 0 });
                }
            } catch (tableError) {
                console.log('Orders table may not exist yet:', tableError);
                return NextResponse.json({ total: 0 });
            }
        }

        // If no admin role in session, verify in the database
        const admin = await db.sql`
            SELECT role FROM users WHERE email = ${session.user.email} LIMIT 1
        `;

        if (!admin || admin.length === 0 || admin[0].role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
        }

        // Get first day of current month
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        try {
            // Check if the orders table exists
            const tableCheck = await db.sql`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'orders'
                ) as exists
            `;

            const tableExists = tableCheck[0]?.exists || false;

            if (tableExists) {
                // Query to sum order totals for the current month
                const result = await db.sql`
                    SELECT COALESCE(SUM(total_amount), 0) as total
                    FROM orders
                    WHERE created_at >= ${firstDayOfMonth.toISOString()} AND status != 'cancelled'
                `;

                const total = parseFloat(result[0]?.total || '0');
                return NextResponse.json({ total });
            } else {
                // Table doesn't exist yet
                return NextResponse.json({ total: 0 });
            }
        } catch (tableError) {
            console.log('Orders table may not exist yet:', tableError);
            return NextResponse.json({ total: 0 });
        }
    } catch (error) {
        console.error('Error fetching revenue data:', error);
        return NextResponse.json({ error: 'Failed to fetch revenue data' }, { status: 500 });
    }
} 