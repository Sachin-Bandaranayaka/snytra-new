import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const orderId = params.id;

    if (!orderId) {
        return NextResponse.json(
            { success: false, error: 'Order ID is required' },
            { status: 400 }
        );
    }

    try {
        const body = await request.json();
        const { priority } = body;

        if (!priority) {
            return NextResponse.json(
                { success: false, error: 'Priority is required' },
                { status: 400 }
            );
        }

        // Validate priority
        const validPriorities = ['low', 'normal', 'high'];
        if (!validPriorities.includes(priority)) {
            return NextResponse.json(
                { success: false, error: 'Invalid priority value' },
                { status: 400 }
            );
        }

        // First, check if the priority column exists
        const checkColumnResult = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'orders' AND column_name = 'priority'
        `);

        // If the column doesn't exist, let's create it
        if (checkColumnResult.rowCount === 0) {
            await pool.query(`
                ALTER TABLE orders 
                ADD COLUMN priority VARCHAR(10) DEFAULT 'normal'
            `);
        }

        // Update order priority in the database
        const result = await pool.query(
            'UPDATE orders SET priority = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [priority, orderId]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { success: false, error: 'Order not found' },
                { status: 404 }
            );
        }

        const updatedOrder = result.rows[0];

        return NextResponse.json({
            success: true,
            order: {
                id: updatedOrder.id,
                priority: updatedOrder.priority,
                updatedAt: updatedOrder.updated_at
            }
        });
    } catch (error: any) {
        console.error('Error updating order priority:', error);

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update order priority' },
            { status: 500 }
        );
    }
} 