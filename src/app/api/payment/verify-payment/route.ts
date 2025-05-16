import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { executeQuery } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        console.log('Payment verification - START');
        const { paymentIntentId, orderId } = await request.json();
        console.log('Request params received:', { paymentIntentId, orderId });

        if (!paymentIntentId || !orderId) {
            console.error('Missing required fields:', { paymentIntentId: !!paymentIntentId, orderId: !!orderId });
            return NextResponse.json(
                { error: 'Payment intent ID and order ID are required' },
                { status: 400 }
            );
        }

        // Retrieve the payment intent to verify its status
        console.log('Retrieving payment intent from Stripe');
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        console.log('Payment intent status:', paymentIntent.status);

        if (paymentIntent.status !== 'succeeded') {
            console.error('Payment intent status is not succeeded:', paymentIntent.status);
            return NextResponse.json(
                { error: 'Payment has not been completed' },
                { status: 400 }
            );
        }

        // Update the order status to 'paid'
        console.log('Updating order status to paid');
        try {
            const result = await executeQuery<any[]>(
                `UPDATE orders SET payment_status = 'paid', status = 'confirmed' WHERE id = $1 RETURNING *`,
                [orderId]
            );

            if (result.length === 0) {
                console.error('Order not found for payment verification:', orderId);
                return NextResponse.json(
                    { error: 'Order not found' },
                    { status: 404 }
                );
            }

            console.log('Order updated successfully');
            return NextResponse.json({
                success: true,
                message: 'Payment verified and order updated successfully',
                order: result[0]
            });
        } catch (dbError) {
            console.error('Database error while updating order:', dbError);
            return NextResponse.json(
                { error: 'Failed to update order status' },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error('Error verifying payment:', error);
        return NextResponse.json(
            { error: 'Failed to verify payment', message: error.message },
            { status: 500 }
        );
    }
} 