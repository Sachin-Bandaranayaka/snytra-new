import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { pool } from '@/lib/db';
import { convertNumericStrings, processCartItem } from '@/utils/dataConverter';

// GET - Retrieve a cart by session ID
export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID is required', success: false },
                { status: 400 }
            );
        }

        // Check if cart exists
        const cartResult = await pool.query(
            `SELECT id, session_id, table_id, customer_name, customer_email, customer_phone
             FROM carts 
             WHERE session_id = $1`,
            [sessionId]
        );

        if (cartResult.rows.length === 0) {
            return NextResponse.json(
                {
                    sessionId,
                    itemCount: 0,
                    subtotal: 0,
                    items: [],
                    success: true
                }
            );
        }

        const cart = cartResult.rows[0];

        // Get cart items
        const itemsResult = await pool.query(
            `SELECT ci.id, ci.menu_item_id as "menuItemId", m.name as "menuItemName", 
                    ci.quantity, ci.price, ci.subtotal, ci.special_instructions as "specialInstructions"
             FROM cart_items ci
             JOIN menu_items m ON ci.menu_item_id = m.id
             WHERE ci.cart_id = $1`,
            [cart.id]
        );

        // Convert string numeric values to actual numbers
        const items = convertNumericStrings(itemsResult.rows);

        // Calculate totals
        const itemCount = items.reduce((total, item) => total + item.quantity, 0);
        const subtotal = items.reduce((total, item) => total + item.subtotal, 0);

        return NextResponse.json({
            id: cart.id,
            sessionId: cart.session_id,
            tableId: cart.table_id,
            customerName: cart.customer_name,
            customerEmail: cart.customer_email,
            customerPhone: cart.customer_phone,
            itemCount,
            subtotal,
            items,
            success: true
        });
    } catch (error: any) {
        console.error('Error fetching cart:', error);
        return NextResponse.json(
            { error: error.message, success: false },
            { status: 500 }
        );
    }
}

// POST - Create or update a cart
export async function POST(req: NextRequest) {
    try {
        const cartData = await req.json();
        const { sessionId, tableId, customerName, customerEmail, customerPhone, items } = cartData;

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID is required', success: false },
                { status: 400 }
            );
        }

        // Begin transaction
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Check if cart already exists
            const existingCartResult = await client.query(
                'SELECT id FROM carts WHERE session_id = $1',
                [sessionId]
            );

            let cartId;

            if (existingCartResult.rows.length > 0) {
                // Update existing cart
                cartId = existingCartResult.rows[0].id;
                await client.query(
                    `UPDATE carts 
                     SET table_id = $1, customer_name = $2, customer_email = $3, customer_phone = $4, updated_at = NOW()
                     WHERE id = $5`,
                    [tableId || null, customerName || null, customerEmail || null, customerPhone || null, cartId]
                );

                // Delete existing items to replace with new ones
                await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
            } else {
                // Create new cart
                const newCartResult = await client.query(
                    `INSERT INTO carts (session_id, table_id, customer_name, customer_email, customer_phone)
                     VALUES ($1, $2, $3, $4, $5)
                     RETURNING id`,
                    [sessionId, tableId || null, customerName || null, customerEmail || null, customerPhone || null]
                );
                cartId = newCartResult.rows[0].id;
            }

            // Process items to ensure numeric values are numbers not strings
            const processedItems = items ? convertNumericStrings(items) : [];

            // Insert cart items
            if (processedItems && processedItems.length > 0) {
                for (const item of processedItems) {
                    await client.query(
                        `INSERT INTO cart_items (cart_id, menu_item_id, menu_item_name, quantity, price, subtotal, special_instructions)
                         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                        [cartId, item.menuItemId, item.menuItemName, item.quantity, item.price, item.subtotal, item.specialInstructions || null]
                    );
                }
            }

            await client.query('COMMIT');

            // Calculate totals with proper number types
            const itemCount = processedItems.reduce((total, item) => total + item.quantity, 0);
            const subtotal = processedItems.reduce((total, item) => total + item.subtotal, 0);

            // Return updated cart
            return NextResponse.json({
                id: cartId,
                sessionId,
                tableId,
                customerName,
                customerEmail,
                customerPhone,
                itemCount,
                subtotal,
                items: processedItems,
                success: true
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error: any) {
        console.error('Error saving cart:', error);
        return NextResponse.json(
            { error: error.message, success: false },
            { status: 500 }
        );
    }
}

// DELETE - Clear a cart
export async function DELETE(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID is required', success: false },
                { status: 400 }
            );
        }

        // Check if cart exists
        const cartResult = await pool.query(
            'SELECT id FROM carts WHERE session_id = $1',
            [sessionId]
        );

        if (cartResult.rows.length > 0) {
            const cartId = cartResult.rows[0].id;

            // Delete cart items first
            await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

            // Then delete the cart
            await pool.query('DELETE FROM carts WHERE id = $1', [cartId]);
        }

        return NextResponse.json({
            success: true,
            message: 'Cart cleared successfully'
        });
    } catch (error: any) {
        console.error('Error deleting cart:', error);
        return NextResponse.json(
            { error: error.message, success: false },
            { status: 500 }
        );
    }
} 