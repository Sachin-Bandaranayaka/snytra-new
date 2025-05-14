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

        try {
            // Check if the contact_messages table exists
            const tableCheck = await db.sql`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'contact_messages'
                ) as exists
            `;

            const tableExists = tableCheck[0]?.exists || false;

            if (tableExists) {
                // Query to count pending contact form submissions
                const result = await db.sql`
                    SELECT COUNT(*) as count
                    FROM contact_messages
                    WHERE status = 'pending'
                `;

                const count = parseInt(result[0]?.count || '0', 10);
                return NextResponse.json({ count });
            } else {
                // Table doesn't exist yet
                return NextResponse.json({ count: 0 });
            }
        } catch (tableError) {
            console.log('Contact messages table may not exist yet:', tableError);
            return NextResponse.json({ count: 0 });
        }
    } catch (error) {
        console.error('Error fetching contact submissions count:', error);
        return NextResponse.json({ error: 'Failed to fetch contact data' }, { status: 500 });
    }
} 