import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { Cart } from '@/components/providers/CartProvider';

export async function POST(request: NextRequest) {
    try {
        const { cart, specialInstructions, paymentMethod } = await request.json();

        if (!cart || !cart.items || cart.items.length === 0) {
            return NextResponse.json(
                { error: 'Cart is empty' },
                { status: 400 }
            );
        }

        // Start a transaction
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Calculate totals (we recalculate on the server to ensure accuracy)
            const subtotal = cart.items.reduce((total: number, item: any) => total + parseFloat(item.subtotal), 0);
            const tax = subtotal * 0.07; // 7% tax
            const totalAmount = subtotal + tax;

            // Create order
            const orderResult = await client.query(
                `INSERT INTO orders 
         (customer_name, customer_email, customer_phone, status, total_amount, 
          payment_status, payment_method, special_instructions) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING id`,
                [
                    cart.customerName,
                    cart.customerEmail,
                    cart.customerPhone,
                    'pending', // Initial status
                    totalAmount,
                    'pending', // Initial payment status
                    paymentMethod,
                    specialInstructions || null
                ]
            );

            const orderId = orderResult.rows[0].id;

            // Insert order items
            for (const item of cart.items) {
                await client.query(
                    `INSERT INTO order_items 
           (order_id, menu_item_id, menu_item_name, quantity, price, subtotal, notes) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [
                        orderId,
                        item.menuItemId,
                        item.menuItemName,
                        item.quantity,
                        item.price,
                        item.subtotal,
                        item.specialInstructions || null
                    ]
                );
            }

            // If the cart has an ID, delete it and its items
            if (cart.id) {
                await client.query(
                    `DELETE FROM cart_items WHERE cart_id = $1`,
                    [cart.id]
                );

                await client.query(
                    `DELETE FROM carts WHERE id = $1`,
                    [cart.id]
                );
            }

            await client.query('COMMIT');

            // Send order confirmation email if email is provided
            if (cart.customerEmail) {
                try {
                    await fetch('/api/send-order-confirmation', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            orderId,
                            customerName: cart.customerName,
                            customerEmail: cart.customerEmail,
                            items: cart.items,
                            subtotal,
                            tax,
                            totalAmount,
                            paymentMethod
                        }),
                    });
                } catch (emailError) {
                    console.error('Failed to send order confirmation email:', emailError);
                    // Continue with order creation even if email fails
                }
            }

            return NextResponse.json({
                success: true,
                orderId,
                message: 'Order created successfully'
            });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { error: 'Failed to create order' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');

        if (orderId) {
            // Get specific order
            const orderResult = await pool.query(
                `SELECT * FROM orders WHERE id = $1`,
                [orderId]
            );

            if (orderResult.rows.length === 0) {
                return NextResponse.json(
                    { error: 'Order not found' },
                    { status: 404 }
                );
            }

            const order = orderResult.rows[0];

            // Get order items
            const itemsResult = await pool.query(
                `SELECT * FROM order_items WHERE order_id = $1`,
                [orderId]
            );

            return NextResponse.json({
                order: {
                    id: order.id,
                    customerName: order.customer_name,
                    customerEmail: order.customer_email,
                    customerPhone: order.customer_phone,
                    status: order.status,
                    totalAmount: parseFloat(order.total_amount),
                    paymentStatus: order.payment_status,
                    paymentMethod: order.payment_method,
                    specialInstructions: order.special_instructions,
                    createdAt: order.created_at,
                    updatedAt: order.updated_at,
                    items: itemsResult.rows.map(item => ({
                        id: item.id,
                        menuItemId: item.menu_item_id,
                        menuItemName: item.menu_item_name,
                        quantity: item.quantity,
                        price: parseFloat(item.price),
                        subtotal: parseFloat(item.subtotal),
                        notes: item.notes
                    }))
                }
            });
        } else {
            // Get all orders (with pagination)
            const page = parseInt(searchParams.get('page') || '1');
            const limit = parseInt(searchParams.get('limit') || '10');
            const offset = (page - 1) * limit;

            const ordersResult = await pool.query(
                `SELECT * FROM orders ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
                [limit, offset]
            );

            const countResult = await pool.query(`SELECT COUNT(*) FROM orders`);
            const totalOrders = parseInt(countResult.rows[0].count);

            return NextResponse.json({
                orders: ordersResult.rows.map(order => ({
                    id: order.id,
                    customerName: order.customer_name,
                    status: order.status,
                    totalAmount: parseFloat(order.total_amount),
                    paymentStatus: order.payment_status,
                    createdAt: order.created_at
                })),
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalOrders / limit),
                    totalItems: totalOrders
                }
            });
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
} 