import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { pool } from '@/lib/db';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
    try {
        const { cartItems, userEmail, customerInfo } = await request.json();

        if (!cartItems || !cartItems.length) {
            return NextResponse.json(
                { error: 'Cart is empty' },
                { status: 400 }
            );
        }

        if (!userEmail) {
            return NextResponse.json(
                { error: 'User email is required' },
                { status: 400 }
            );
        }

        // Calculate total amount
        const totalAmount = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

        // Create an order in the database first
        const orderResult = await pool.query(
            `INSERT INTO orders (
                customer_email, 
                customer_name, 
                customer_phone,
                total_amount, 
                status,
                session_id
            ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [
                userEmail,
                customerInfo.name,
                customerInfo.phone,
                totalAmount,
                'pending',
                null // Will update this after creating the Stripe session
            ]
        );

        const orderId = orderResult.rows[0].id;

        // Insert order items
        for (const item of cartItems) {
            await pool.query(
                `INSERT INTO order_items (
                    order_id,
                    menu_item_name,
                    price,
                    quantity,
                    subtotal
                ) VALUES ($1, $2, $3, $4, $5)`,
                [
                    orderId,
                    item.name,
                    item.price,
                    item.quantity,
                    item.price * item.quantity
                ]
            );
        }

        // Create line items for Stripe
        const lineItems = cartItems.map((item: any) => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    description: item.description || '',
                },
                unit_amount: Math.round(item.price * 100), // Stripe expects amount in cents
            },
            quantity: item.quantity,
        }));

        // Create a checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL || request.headers.get('origin') || ''}/order-confirmation?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || request.headers.get('origin') || ''}/checkout?canceled=true`,
            customer_email: userEmail,
            metadata: {
                order_id: orderId,
                customer_name: customerInfo.name,
                customer_phone: customerInfo.phone
            },
        });

        // Update the order with the session ID
        await pool.query(
            `UPDATE orders SET session_id = $1 WHERE id = $2`,
            [session.id, orderId]
        );

        // Return the checkout session URL and order information
        return NextResponse.json({
            url: session.url,
            sessionId: session.id,
            orderId: orderId
        });

    } catch (error: any) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create checkout session' },
            { status: 500 }
        );
    }
} 