import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET handler to retrieve all tables
export async function GET(request: NextRequest) {
    try {
        // Verify authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get additional parameters for filtering
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const location = searchParams.get('location');
        const capacity = searchParams.get('capacity');

        // Build query
        let query = `
      SELECT t.*, 
        o.id as order_id, o.status as order_status, o.created_at as order_time,
        r.id as reservation_id, r.customer_name, r.reservation_time, r.party_size
      FROM tables t
      LEFT JOIN orders o ON t.id = o.table_id AND o.status IN ('pending', 'processing', 'ready')
      LEFT JOIN reservations r ON t.id = r.table_id AND r.status = 'confirmed' AND r.reservation_date >= CURRENT_DATE
      WHERE 1=1
    `;

        const queryParams: any[] = [];

        // Add filters if provided
        if (status) {
            queryParams.push(status);
            query += ` AND t.status = $${queryParams.length}`;
        }

        if (location) {
            queryParams.push(`%${location}%`);
            query += ` AND t.location ILIKE $${queryParams.length}`;
        }

        if (capacity) {
            queryParams.push(parseInt(capacity));
            query += ` AND t.capacity >= $${queryParams.length}`;
        }

        query += ` ORDER BY t.table_number`;

        // Execute query
        const result = await executeQuery<any[]>(query, queryParams);

        // Format response with current order and reservation details
        const tables = result.map(row => {
            const table = {
                id: row.id,
                tableNumber: row.table_number,
                capacity: row.capacity,
                status: row.status,
                location: row.location || null,
                currentOrder: row.order_id ? {
                    id: row.order_id,
                    status: row.order_status,
                    startTime: row.order_time
                } : null,
                reservation: row.reservation_id ? {
                    id: row.reservation_id,
                    customerName: row.customer_name,
                    time: row.reservation_time,
                    partySize: row.party_size
                } : null
            };

            return table;
        });

        return NextResponse.json({ tables });
    } catch (error) {
        console.error('Error fetching tables:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tables' },
            { status: 500 }
        );
    }
}

// POST handler to create a new table
export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Extract table data from request
        const { tableNumber, capacity, status, location } = await request.json();

        // Validate required fields
        if (!tableNumber || !capacity) {
            return NextResponse.json(
                { error: 'Table number and capacity are required' },
                { status: 400 }
            );
        }

        // Check if table number already exists
        const existingTable = await executeQuery<any[]>(
            'SELECT id FROM tables WHERE table_number = $1',
            [tableNumber]
        );

        if (existingTable.length > 0) {
            return NextResponse.json(
                { error: 'A table with this number already exists' },
                { status: 400 }
            );
        }

        // Create new table
        const result = await executeQuery<any[]>(
            `INSERT INTO tables (table_number, capacity, status, location) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, table_number, capacity, status, location`,
            [tableNumber, capacity, status || 'available', location || null]
        );

        const table = result[0];

        return NextResponse.json({
            message: 'Table created successfully',
            table: {
                id: table.id,
                tableNumber: table.table_number,
                capacity: table.capacity,
                status: table.status,
                location: table.location
            }
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating table:', error);
        return NextResponse.json(
            { error: 'Failed to create table' },
            { status: 500 }
        );
    }
} 