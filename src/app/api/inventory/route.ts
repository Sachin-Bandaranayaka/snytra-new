import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Connect to the database
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function GET() {
    try {
        // Connect to the database
        const client = await pool.connect();

        try {
            // Query the inventory_items table
            const result = await client.query('SELECT * FROM inventory_items ORDER BY id');

            // Return the inventory items
            return NextResponse.json(result.rows, { status: 200 });
        } finally {
            // Release the client back to the pool
            client.release();
        }
    } catch (error) {
        console.error('Error fetching inventory:', error);
        return NextResponse.json(
            { error: 'Failed to fetch inventory data' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Validate required fields
        if (!data.name || !data.quantity || !data.unit) {
            return NextResponse.json(
                { error: 'Missing required fields: name, quantity, unit' },
                { status: 400 }
            );
        }

        // Connect to the database
        const client = await pool.connect();

        try {
            // Insert the new inventory item
            const query = `
        INSERT INTO inventory_items (name, quantity, unit, status, image_url) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *
      `;

            // Determine status based on quantity (example logic)
            const status = data.quantity < 20 ? 'Low' : 'Plenty';

            const values = [
                data.name,
                data.quantity,
                data.unit,
                data.status || status,
                data.image_url || null
            ];

            const result = await client.query(query, values);

            // Return the created item
            return NextResponse.json(result.rows[0], { status: 201 });
        } finally {
            // Release the client back to the pool
            client.release();
        }
    } catch (error) {
        console.error('Error creating inventory item:', error);
        return NextResponse.json(
            { error: 'Failed to create inventory item' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();

        // Validate required fields
        if (!data.id) {
            return NextResponse.json(
                { error: 'Missing required field: id' },
                { status: 400 }
            );
        }

        // Connect to the database
        const client = await pool.connect();

        try {
            // Build the update query dynamically based on provided fields
            let updateFields = [];
            let values = [data.id];
            let paramCounter = 2;

            if (data.name !== undefined) {
                updateFields.push(`name = $${paramCounter++}`);
                values.push(data.name);
            }

            if (data.quantity !== undefined) {
                updateFields.push(`quantity = $${paramCounter++}`);
                values.push(data.quantity);
            }

            if (data.unit !== undefined) {
                updateFields.push(`unit = $${paramCounter++}`);
                values.push(data.unit);
            }

            if (data.status !== undefined) {
                updateFields.push(`status = $${paramCounter++}`);
                values.push(data.status);
            }

            if (data.image_url !== undefined) {
                updateFields.push(`image_url = $${paramCounter++}`);
                values.push(data.image_url);
            }

            // Always update the updated_at timestamp
            updateFields.push('updated_at = NOW()');

            if (updateFields.length === 0) {
                return NextResponse.json(
                    { error: 'No fields to update' },
                    { status: 400 }
                );
            }

            const query = `
        UPDATE inventory_items 
        SET ${updateFields.join(', ')} 
        WHERE id = $1 
        RETURNING *
      `;

            const result = await client.query(query, values);

            if (result.rowCount === 0) {
                return NextResponse.json(
                    { error: 'Inventory item not found' },
                    { status: 404 }
                );
            }

            // Return the updated item
            return NextResponse.json(result.rows[0], { status: 200 });
        } finally {
            // Release the client back to the pool
            client.release();
        }
    } catch (error) {
        console.error('Error updating inventory item:', error);
        return NextResponse.json(
            { error: 'Failed to update inventory item' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Missing required parameter: id' },
                { status: 400 }
            );
        }

        // Connect to the database
        const client = await pool.connect();

        try {
            // Delete the inventory item
            const query = 'DELETE FROM inventory_items WHERE id = $1 RETURNING *';
            const result = await client.query(query, [id]);

            if (result.rowCount === 0) {
                return NextResponse.json(
                    { error: 'Inventory item not found' },
                    { status: 404 }
                );
            }

            // Return success message
            return NextResponse.json(
                { message: 'Inventory item deleted successfully' },
                { status: 200 }
            );
        } finally {
            // Release the client back to the pool
            client.release();
        }
    } catch (error) {
        console.error('Error deleting inventory item:', error);
        return NextResponse.json(
            { error: 'Failed to delete inventory item' },
            { status: 500 }
        );
    }
} 