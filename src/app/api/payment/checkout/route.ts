import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export async function POST(req: NextRequest) {
    try {
        const { items, restaurantId, customerInfo } = await req.json();

        // Validate inputs
        if (!items || !items.length || !restaurantId || !customerInfo) {
            return NextResponse.json(
                { error: 'Missing required information' },
                { status: 400 }
            );
        }

        // Calculate total amount
        const totalAmount = items.reduce(
            (sum: number, item: any) => sum + (item.price * item.quantity),
            0
        );

        // Create order in database
        const { rows: [order] } = await pool.query(
            `INSERT INTO orders 
       (restaurant_id, customer_name, customer_email, customer_phone, total_amount) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id`,
            [
                restaurantId,
                customerInfo.name,
                customerInfo.email,
                customerInfo.phone,
                totalAmount
            ]
        );

        // Create order items
        for (const item of items) {
            await pool.query(
                `INSERT INTO order_items 
         (order_id, menu_item_name, quantity, price, subtotal, notes) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    order.id,
                    item.name,
                    item.quantity,
                    item.price,
                    item.price * item.quantity,
                    item.notes || null
                ]
            );
        }

        // Create Stripe session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: items.map((item: any) => ({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name,
                        description: item.description || '',
                    },
                    unit_amount: Math.round(item.price * 100), // Stripe uses cents
                },
                quantity: item.quantity,
            })),
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL || req.headers.get('origin') || ''}/order-confirmation?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || req.headers.get('origin') || ''}/cart?canceled=true`,
            metadata: {
                order_id: order.id,
                restaurant_id: restaurantId
            },
        });

        // Send order confirmation email
        const apiUrl = process.env.NEXT_PUBLIC_BASE_URL || req.headers.get('origin') || '';
        const emailResponse = await fetch(`${apiUrl}/api/send-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: customerInfo.email,
                subject: 'Order Confirmation',
                template: 'order-confirmation',
                data: {
                    name: customerInfo.name,
                    orderId: order.id,
                    items: items.map((item: any) => `${item.name} x${item.quantity}`),
                    total: totalAmount.toFixed(2)
                }
            }),
        });

        if (!emailResponse.ok) {
            console.error('Failed to send order confirmation email');
        }

        // Return success response with Stripe session ID
        return NextResponse.json({
            sessionId: session.id,
            orderId: order.id,
            url: session.url
        });
    } catch (error) {
        console.error('Checkout error:', error);
        return NextResponse.json(
            { error: 'Failed to process payment' },
            { status: 500 }
        );
    }
} 