import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { pool } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        console.log('Creating payment intent - START');
        const { cart, customerId, customerEmail, customerName, totalAmount, metadata } = await request.json();
        console.log('Request params received:', { customerEmail, customerName, totalAmount, metadata });

        if (!cart || !totalAmount) {
            console.error('Missing required fields:', { cart: !!cart, totalAmount });
            return NextResponse.json(
                { error: 'Cart and total amount are required' },
                { status: 400 }
            );
        }

        // Amount in cents for Stripe
        const amount = Math.round(totalAmount * 100);
        console.log('Amount in cents:', amount);

        // Create a payment intent with Stripe
        console.log('Creating Stripe payment intent');
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            payment_method_types: ['card'],
            description: 'Restaurant order payment',
            receipt_email: customerEmail,
            customer: customerId || undefined,
            metadata: {
                order_id: metadata?.orderId || 'pending',
                customer_name: customerName || 'Guest',
                item_count: cart.items.length,
                ...metadata
            }
        });
        console.log('Payment intent created with ID:', paymentIntent.id);

        // If we already have an order ID, update the order with payment intent ID
        if (metadata?.orderId) {
            try {
                console.log('Updating order with payment intent ID');
                await pool.query(
                    `UPDATE orders SET payment_id = $1, payment_status = 'pending' WHERE id = $2`,
                    [paymentIntent.id, metadata.orderId]
                );
                console.log('Order updated successfully');
            } catch (dbError) {
                console.error('Error updating order with payment intent:', dbError);
                // Continue even if there's an error updating the order
            }
        }

        console.log('Returning payment intent client secret');
        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error: any) {
        console.error('Error creating payment intent:', error);

        return NextResponse.json(
            {
                error: 'Failed to create payment intent',
                message: error.message
            },
            { status: 500 }
        );
    }
} 