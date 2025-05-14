import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';

export async function POST(request: Request) {
    try {
        // Get session from Next Auth
        const session = await getServerSession(authOptions);

        // Check if user exists and is an admin
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
        }

        // Check if the table already exists
        const tableCheck = await db.sql`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'activity_logs'
            ) as exists
        `;

        const tableExists = tableCheck[0]?.exists || false;

        if (tableExists) {
            return NextResponse.json({
                message: 'Table activity_logs already exists',
                success: true
            });
        }

        // Create the activity_logs table
        await db.sql`
            CREATE TABLE activity_logs (
                id SERIAL PRIMARY KEY,
                activity_type VARCHAR(255) NOT NULL,
                user_id INTEGER,
                user_name VARCHAR(255),
                details JSONB,
                status VARCHAR(50) DEFAULT 'completed',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                CONSTRAINT fk_user
                    FOREIGN KEY(user_id) 
                    REFERENCES users(id)
                    ON DELETE SET NULL
            )
        `;

        // Create indices for faster querying
        await db.sql`CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at)`;
        await db.sql`CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id)`;
        await db.sql`CREATE INDEX idx_activity_logs_status ON activity_logs(status)`;

        // Insert sample activity logs
        await db.sql`
            INSERT INTO activity_logs 
                (activity_type, user_name, status, details) 
            VALUES 
                ('New user registered', 'John Smith', 'completed', ${'{"ip": "192.168.1.1", "browser": "Chrome"}'})
        `;

        await db.sql`
            INSERT INTO activity_logs 
                (activity_type, user_name, status, details) 
            VALUES 
                ('Support ticket created', 'Emily Johnson', 'pending', ${'{"ticket_id": 101, "priority": "high"}'})
        `;

        await db.sql`
            INSERT INTO activity_logs 
                (activity_type, user_name, status, details) 
            VALUES 
                ('New reservation', 'Michael Davis', 'completed', ${'{"reservation_id": 1024, "guests": 4}'})
        `;

        await db.sql`
            INSERT INTO activity_logs 
                (activity_type, user_name, status, details) 
            VALUES 
                ('Payment failed', 'Sarah Wilson', 'failed', ${'{"amount": 129.99, "error": "Insufficient funds"}'})
        `;

        return NextResponse.json({
            message: 'Activity logs table created successfully',
            success: true
        });
    } catch (error) {
        console.error('Error creating activity_logs table:', error);
        return NextResponse.json({
            error: 'Failed to create activity_logs table',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
} 