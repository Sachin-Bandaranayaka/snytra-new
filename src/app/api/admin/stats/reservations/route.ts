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

        // Get current date
        const now = new Date();

        try {
            // First check if the reservations table exists and get the date column name
            const columnsCheck = await db.sql`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'reservations' 
                AND (column_name LIKE '%date%' OR column_name LIKE '%time%')
                LIMIT 1
            `;

            if (columnsCheck && columnsCheck.length > 0) {
                const dateColumn = columnsCheck[0].column_name;

                // Query using the dynamically found date column
                const result = await db.sql`
                    SELECT COUNT(*) as count
                    FROM reservations
                    WHERE ${db.sql(dateColumn)} >= ${now.toISOString()} 
                    AND status = 'confirmed'
                `;

                const count = parseInt(result[0]?.count || '0', 10);
                return NextResponse.json({ count });
            } else {
                // Table exists but no date column found
                return NextResponse.json({ count: 0 });
            }
        } catch (tableError) {
            // If the query fails, the table might not exist
            console.log('Reservations table may not exist yet:', tableError);
            return NextResponse.json({ count: 0 });
        }
    } catch (error) {
        console.error('Error fetching reservations count:', error);
        return NextResponse.json({ error: 'Failed to fetch reservations data' }, { status: 500 });
    }
} 