import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { pool } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('session_id');

    if (!sessionId) {
        return NextResponse.json(
            { error: 'Session ID is required' },
            { status: 400 }
        );
    }

    try {
        // Retrieve the Stripe session
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // Get order ID from metadata or query the database
        let orderId = session.metadata?.order_id;

        if (!orderId) {
            // Try to find the order ID in the database
            const result = await pool.query(
                `SELECT id FROM orders WHERE session_id = $1 LIMIT 1`,
                [sessionId]
            );

            if (result.rows.length > 0) {
                orderId = result.rows[0].id;
            } else {
                return NextResponse.json(
                    { error: 'Order not found' },
                    { status: 404 }
                );
            }
        }

        // Check the payment status
        let paymentStatus = 'pending';
        if (session.payment_status === 'paid') {
            paymentStatus = 'paid';
        } else if (session.status === 'complete') {
            paymentStatus = 'complete';
        }

        // Update the order status in the database if payment is successful
        if (paymentStatus === 'paid' || paymentStatus === 'complete') {
            await pool.query(
                `UPDATE orders SET status = 'paid', payment_status = $1 WHERE session_id = $2`,
                [paymentStatus, sessionId]
            );
        }

        return NextResponse.json({
            status: paymentStatus,
            orderId: orderId,
            payment_intent: session.payment_intent,
            customer: session.customer
        });
    } catch (error: any) {
        console.error('Error verifying payment:', error);
        return NextResponse.json(
            { error: 'Failed to verify payment status' },
            { status: 500 }
        );
    }
} 