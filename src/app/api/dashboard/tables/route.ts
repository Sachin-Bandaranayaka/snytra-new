import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        // Check if the tables table exists
        const tableExists = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'tables'
            ) as table_exists
        `);

        // If the table doesn't exist, create it
        if (!tableExists.rows[0].table_exists) {
            await pool.query(`
                CREATE TABLE tables (
                    id SERIAL PRIMARY KEY,
                    table_number VARCHAR(20) NOT NULL,
                    seats INTEGER,
                    qr_code_url VARCHAR(255),
                    is_smoking BOOLEAN DEFAULT FALSE,
                    status VARCHAR(50) DEFAULT 'available'
                )
            `);
        }

        // Fetch tables with reservation information
        const tablesQuery = await pool.query(`
            SELECT 
                t.id, 
                t.table_number, 
                t.seats, 
                t.qr_code_url, 
                t.is_smoking, 
                t.status,
                r.id as reservation_id,
                r.name as reservation_name,
                r.date as reservation_date,
                r.time as reservation_time,
                r.party_size as reservation_party_size
            FROM 
                tables t
            LEFT JOIN 
                (SELECT * FROM reservations WHERE status = 'confirmed' AND date >= CURRENT_DATE) r 
                ON t.id = r.table_id
            ORDER BY 
                t.table_number ASC
        `);

        // Add placeholder QR code for any tables that don't have one
        const tablesWithQR = tablesQuery.rows.map(table => {
            if (!table.qr_code_url) {
                return {
                    ...table,
                    qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://your-restaurant-domain.com/menu?table=${table.table_number}`)}`
                };
            }
            return table;
        });

        // Get all upcoming reservations
        const currentDate = new Date().toISOString().split('T')[0];
        const reservationsQuery = await pool.query(`
            SELECT 
                r.id, 
                r.name, 
                r.date, 
                r.time, 
                r.party_size, 
                r.table_id,
                r.status,
                t.table_number
            FROM 
                reservations r
            LEFT JOIN 
                tables t ON r.table_id = t.id
            WHERE 
                r.date >= $1 AND r.status = 'confirmed'
            ORDER BY 
                r.date ASC, r.time ASC
        `, [currentDate]);

        return NextResponse.json({
            tables: tablesWithQR,
            reservations: reservationsQuery.rows,
            success: true
        });
    } catch (error: any) {
        console.error('Error fetching tables data:', error);
        return NextResponse.json(
            { error: error.message, success: false },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const { table_number, seats, is_smoking } = await req.json();

        // Validate the request data
        if (!table_number) {
            return NextResponse.json(
                { error: 'Table number is required', success: false },
                { status: 400 }
            );
        }

        if (!seats || isNaN(seats) || seats < 1) {
            return NextResponse.json(
                { error: 'Valid number of seats is required', success: false },
                { status: 400 }
            );
        }

        // Check if the tables table exists
        const tableExists = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'tables'
            ) as table_exists
        `);

        // If the table doesn't exist, create it
        if (!tableExists.rows[0].table_exists) {
            await pool.query(`
                CREATE TABLE tables (
                    id SERIAL PRIMARY KEY,
                    table_number VARCHAR(20) NOT NULL,
                    seats INTEGER,
                    qr_code_url VARCHAR(255),
                    is_smoking BOOLEAN DEFAULT FALSE,
                    status VARCHAR(50) DEFAULT 'available'
                )
            `);
        }

        // Check if table with the same number already exists
        const existingTable = await pool.query(
            'SELECT * FROM tables WHERE table_number = $1',
            [table_number]
        );

        if (existingTable.rows.length > 0) {
            return NextResponse.json(
                { error: 'A table with this number already exists', success: false },
                { status: 409 }
            );
        }

        // Generate QR code URL (In a real app, this would be a unique QR code)
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://your-restaurant-domain.com/menu?table=${table_number}`)}`;

        // First, check the schema of the tables table
        const tableSchema = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'tables'
        `);

        const columns = tableSchema.rows.map(row => row.column_name);

        // Determine if restaurant_id column exists
        let query;
        let params;

        if (columns.includes('restaurant_id')) {
            // If restaurant_id exists in the schema
            query = `INSERT INTO tables (restaurant_id, table_number, seats, qr_code_url, is_smoking, status)
                    VALUES (1, $1, $2, $3, $4, 'available')
                    RETURNING id, table_number, seats, qr_code_url, is_smoking, status`;
            params = [table_number, seats, qrCodeUrl, is_smoking || false];
        } else {
            // If restaurant_id doesn't exist
            query = `INSERT INTO tables (table_number, seats, qr_code_url, is_smoking, status)
                    VALUES ($1, $2, $3, $4, 'available')
                    RETURNING id, table_number, seats, qr_code_url, is_smoking, status`;
            params = [table_number, seats, qrCodeUrl, is_smoking || false];
        }

        // Insert the new table
        const result = await pool.query(query, params);

        const newTable = result.rows[0];

        return NextResponse.json({
            table: newTable,
            success: true
        });
    } catch (error: any) {
        console.error('Error creating table:', error);
        return NextResponse.json(
            { error: error.message, success: false },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { id, status, table_number, seats, is_smoking } = await req.json();

        if (!id) {
            return NextResponse.json(
                { error: 'Table ID is required', success: false },
                { status: 400 }
            );
        }

        // Check if table exists
        const existingTable = await pool.query(
            'SELECT * FROM tables WHERE id = $1',
            [id]
        );

        if (existingTable.rows.length === 0) {
            return NextResponse.json(
                { error: 'Table not found', success: false },
                { status: 404 }
            );
        }

        // Build update query dynamically based on provided fields
        let updateFields = [];
        let params = [id];
        let paramIndex = 2;

        if (status !== undefined) {
            updateFields.push(`status = $${paramIndex++}`);
            params.push(status);
        }

        if (table_number !== undefined) {
            updateFields.push(`table_number = $${paramIndex++}`);
            params.push(table_number);
        }

        if (seats !== undefined) {
            updateFields.push(`seats = $${paramIndex++}`);
            params.push(seats);
        }

        if (is_smoking !== undefined) {
            updateFields.push(`is_smoking = $${paramIndex++}`);
            params.push(is_smoking);
        }

        if (updateFields.length === 0) {
            return NextResponse.json(
                { error: 'No fields to update', success: false },
                { status: 400 }
            );
        }

        // Update the table
        const result = await pool.query(
            `UPDATE tables SET ${updateFields.join(', ')} WHERE id = $1 RETURNING *`,
            params
        );

        return NextResponse.json({
            table: result.rows[0],
            success: true
        });
    } catch (error: any) {
        console.error('Error updating table:', error);
        return NextResponse.json(
            { error: error.message, success: false },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Table ID is required', success: false },
                { status: 400 }
            );
        }

        // Check if table exists
        const existingTable = await pool.query(
            'SELECT * FROM tables WHERE id = $1',
            [id]
        );

        if (existingTable.rows.length === 0) {
            return NextResponse.json(
                { error: 'Table not found', success: false },
                { status: 404 }
            );
        }

        // Check if table has any reservations
        const reservations = await pool.query(
            'SELECT COUNT(*) FROM reservations WHERE table_id = $1 AND status = $2',
            [id, 'confirmed']
        );

        if (parseInt(reservations.rows[0].count) > 0) {
            return NextResponse.json(
                { error: 'Cannot delete table with active reservations', success: false },
                { status: 400 }
            );
        }

        // Delete the table
        await pool.query('DELETE FROM tables WHERE id = $1', [id]);

        return NextResponse.json({
            success: true,
            message: 'Table deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting table:', error);
        return NextResponse.json(
            { error: error.message, success: false },
            { status: 500 }
        );
    }
} 