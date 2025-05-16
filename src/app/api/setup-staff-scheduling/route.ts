import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { executeQuery } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        // Verify authentication with admin role
        const session = await getServerSession(authOptions);
        if (!session || !session.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
        }

        // Read the SQL file
        const filePath = path.resolve(process.cwd(), 'src/lib/staff-scheduling-schema.sql');
        const schemaSQL = fs.readFileSync(filePath, 'utf8');

        // Execute the SQL script
        const client = await pool.connect();

        try {
            // Begin transaction
            await client.query('BEGIN');
            await client.query(schemaSQL);

            // Create sample data if requested
            const { createSampleData } = await request.json();

            if (createSampleData) {
                // Add some sample tables
                await client.query(`
          INSERT INTO tables (table_number, capacity, status, location)
          VALUES 
            ('A1', 4, 'available', 'Window'),
            ('A2', 4, 'available', 'Window'),
            ('B1', 6, 'available', 'Center'),
            ('B2', 6, 'available', 'Center'),
            ('C1', 2, 'available', 'Bar'),
            ('C2', 2, 'available', 'Bar')
          ON CONFLICT (table_number) DO NOTHING;
        `);

                // Get staff members for sample shifts
                const staffResult = await client.query('SELECT id FROM staff LIMIT 3');

                if (staffResult.length > 0) {
                    // Create sample shifts for the next 7 days
                    const today = new Date();

                    for (let i = 0; i < staffResult.length; i++) {
                        const staffId = staffResult[i].id;

                        for (let day = 0; day < 7; day++) {
                            const shiftDate = new Date(today);
                            shiftDate.setDate(today.getDate() + day);

                            // Format date as YYYY-MM-DD
                            const formattedDate = shiftDate.toISOString().split('T')[0];

                            // Create morning and evening shifts
                            await client.query(`
                INSERT INTO staff_shifts (staff_id, shift_date, start_time, end_time, notes)
                VALUES 
                  ($1, $2, '09:00', '17:00', 'Morning shift'),
                  ($1, $2, '17:00', '01:00', 'Evening shift')
                ON CONFLICT DO NOTHING;
              `, [staffId, formattedDate]);
                        }
                    }
                }
            }

            // Commit transaction
            await client.query('COMMIT');

            return NextResponse.json({
                success: true,
                message: 'Staff scheduling schema applied successfully'
            });
        } catch (error) {
            // Rollback on error
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error applying staff scheduling schema:', error);
        return NextResponse.json(
            { error: 'Failed to apply staff scheduling schema' },
            { status: 500 }
        );
    }
} 