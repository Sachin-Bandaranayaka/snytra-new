import { NextRequest, NextResponse } from 'next/server';
import { pool, sql } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        // Test pool connection
        const poolResult = await executeQuery<any[]>('SELECT NOW() as server_time');

        // Test serverless connection
        const sqlResult = await sql`SELECT NOW() as server_time`;

        return NextResponse.json({
            success: true,
            poolConnectionTime: poolResult[0].server_time,
            serverlessConnectionTime: sqlResult[0].server_time,
            message: 'Database connections successful!'
        });
    } catch (error: any) {
        console.error('Database connection test failed:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                message: 'Database connection test failed'
            },
            { status: 500 }
        );
    }
} 