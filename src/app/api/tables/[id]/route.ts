import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET handler to retrieve a single table
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verify authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tableId = params.id;

        // Fetch table with current order and reservation
        const result = await executeQuery<any[]>(
            `SELECT t.*, 
        o.id as order_id, o.status as order_status, o.created_at as order_time,
        r.id as reservation_id, r.customer_name, r.reservation_time, r.party_size
      FROM tables t
      LEFT JOIN orders o ON t.id = o.table_id AND o.status IN ('pending', 'processing', 'ready')
      LEFT JOIN reservations r ON t.id = r.table_id AND r.status = 'confirmed' AND r.reservation_date >= CURRENT_DATE
      WHERE t.id = $1`,
            [tableId]
        );

        if (result.length === 0) {
            return NextResponse.json({ error: 'Table not found' }, { status: 404 });
        }

        const row = result[0];

        // Format response
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

        return NextResponse.json({ table });
    } catch (error) {
        console.error('Error fetching table:', error);
        return NextResponse.json(
            { error: 'Failed to fetch table' },
            { status: 500 }
        );
    }
}

// PUT handler to update a table
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verify authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tableId = params.id;
        const { tableNumber, capacity, status, location } = await request.json();

        // Validate required fields
        if (!tableNumber || !capacity) {
            return NextResponse.json(
                { error: 'Table number and capacity are required' },
                { status: 400 }
            );
        }

        // Check if table exists
        const tableCheck = await executeQuery<any[]>(
            'SELECT id FROM tables WHERE id = $1',
            [tableId]
        );

        if (tableCheck.length === 0) {
            return NextResponse.json({ error: 'Table not found' }, { status: 404 });
        }

        // Check if new table number already exists (except for current table)
        const duplicateCheck = await executeQuery<any[]>(
            'SELECT id FROM tables WHERE table_number = $1 AND id != $2',
            [tableNumber, tableId]
        );

        if (duplicateCheck.length > 0) {
            return NextResponse.json(
                { error: 'A table with this number already exists' },
                { status: 400 }
            );
        }

        // Update table
        const result = await executeQuery<any[]>(
            `UPDATE tables 
       SET table_number = $1, capacity = $2, status = $3, location = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING id, table_number, capacity, status, location`,
            [tableNumber, capacity, status || 'available', location || null, tableId]
        );

        const table = result[0];

        return NextResponse.json({
            message: 'Table updated successfully',
            table: {
                id: table.id,
                tableNumber: table.table_number,
                capacity: table.capacity,
                status: table.status,
                location: table.location
            }
        });
    } catch (error) {
        console.error('Error updating table:', error);
        return NextResponse.json(
            { error: 'Failed to update table' },
            { status: 500 }
        );
    }
}

// PATCH handler to update table status
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verify authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tableId = params.id;
        const { status } = await request.json();

        // Validate status
        if (!status) {
            return NextResponse.json(
                { error: 'Status is required' },
                { status: 400 }
            );
        }

        // Valid statuses
        const validStatuses = ['available', 'occupied', 'reserved', 'dirty', 'maintenance'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status value' },
                { status: 400 }
            );
        }

        // Check if table exists
        const tableCheck = await executeQuery<any[]>(
            'SELECT id FROM tables WHERE id = $1',
            [tableId]
        );

        if (tableCheck.length === 0) {
            return NextResponse.json({ error: 'Table not found' }, { status: 404 });
        }

        // Update table status
        const result = await executeQuery<any[]>(
            `UPDATE tables 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, table_number, status`,
            [status, tableId]
        );

        return NextResponse.json({
            message: 'Table status updated successfully',
            table: {
                id: result[0].id,
                tableNumber: result[0].table_number,
                status: result[0].status
            }
        });
    } catch (error) {
        console.error('Error updating table status:', error);
        return NextResponse.json(
            { error: 'Failed to update table status' },
            { status: 500 }
        );
    }
}

// DELETE handler to remove a table
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Verify authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tableId = params.id;

        // Check if table exists
        const tableCheck = await executeQuery<any[]>(
            'SELECT id FROM tables WHERE id = $1',
            [tableId]
        );

        if (tableCheck.length === 0) {
            return NextResponse.json({ error: 'Table not found' }, { status: 404 });
        }

        // Check if table has active orders
        const activeOrders = await executeQuery<any[]>(
            `SELECT id FROM orders WHERE table_id = $1 AND status IN ('pending', 'processing', 'ready')`,
            [tableId]
        );

        if (activeOrders.length > 0) {
            return NextResponse.json(
                { error: 'Cannot delete table with active orders' },
                { status: 400 }
            );
        }

        // Check if table has upcoming reservations
        const upcomingReservations = await executeQuery<any[]>(
            `SELECT id FROM reservations 
       WHERE table_id = $1 
       AND status = 'confirmed' 
       AND reservation_date >= CURRENT_DATE`,
            [tableId]
        );

        if (upcomingReservations.length > 0) {
            return NextResponse.json(
                { error: 'Cannot delete table with upcoming reservations' },
                { status: 400 }
            );
        }

        // Delete table
        await pool.query('DELETE FROM tables WHERE id = $1', [tableId]);

        return NextResponse.json({
            message: 'Table deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting table:', error);
        return NextResponse.json(
            { error: 'Failed to delete table' },
            { status: 500 }
        );
    }
} 