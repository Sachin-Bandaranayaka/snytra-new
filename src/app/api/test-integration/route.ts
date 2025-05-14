import { NextRequest, NextResponse } from 'next/server';
import { pool, sql } from '@/lib/db';
import { hash } from 'bcrypt';
import { sendTestEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
    try {
        const results = {
            database: {
                status: 'pending',
                message: '',
            },
            email: {
                status: 'pending',
                message: '',
            },
            serverless: {
                status: 'pending',
                message: '',
            },
        };

        // Test database connection
        try {
            const { rows } = await pool.query('SELECT NOW() as time');
            results.database = {
                status: 'success',
                message: `Connected to database. Server time: ${rows[0].time}`,
            };
        } catch (error: any) {
            results.database = {
                status: 'error',
                message: `Database connection failed: ${error.message}`,
            };
        }

        // Test serverless driver
        try {
            const result = await sql`SELECT NOW() as time`;
            results.serverless = {
                status: 'success',
                message: `Serverless connection successful. Server time: ${result[0].time}`,
            };
        } catch (error: any) {
            results.serverless = {
                status: 'error',
                message: `Serverless connection failed: ${error.message}`,
            };
        }

        // Test email sending using our service
        try {
            const result = await sendTestEmail();

            if (!result.success) {
                throw new Error(result.error);
            }

            results.email = {
                status: 'success',
                message: `Email test successful. Email ID: ${result.data?.id}`,
            };

        } catch (error: any) {
            results.email = {
                status: 'error',
                message: `Email sending failed: ${error.message}`,
            };
        }

        // Return test results
        return NextResponse.json(results);
    } catch (error: any) {
        return NextResponse.json(
            { error: `Integration test failed: ${error.message}` },
            { status: 500 }
        );
    }
} 