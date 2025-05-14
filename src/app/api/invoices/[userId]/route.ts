import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16'
});

export async function GET(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const userId = params.userId;

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Get user data with Stripe customer ID
        const { rows: userRows } = await pool.query(
            `SELECT id, name, email, stripe_customer_id, subscription_status 
             FROM users 
             WHERE id = $1`,
            [userId]
        );

        if (userRows.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const user = userRows[0];
        const stripeCustomerId = user.stripe_customer_id;

        // If no Stripe customer ID, return an empty list
        if (!stripeCustomerId) {
            return NextResponse.json({
                invoices: [],
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    subscription_status: user.subscription_status,
                }
            });
        }

        // Try to fetch invoices from our database first
        const { rows: dbInvoices } = await pool.query(
            `SELECT 
                id, 
                stripe_invoice_id, 
                stripe_subscription_id, 
                amount, 
                currency,
                period_start, 
                period_end, 
                payment_date, 
                plan_name,
                invoice_pdf,
                invoice_number,
                payment_status
             FROM subscription_payments
             WHERE user_id = $1
             ORDER BY payment_date DESC
             LIMIT 20`,
            [userId]
        );

        // If we have sufficient invoice records in our database, return those
        if (dbInvoices.length > 0) {
            return NextResponse.json({
                invoices: dbInvoices,
                source: 'database',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    subscription_status: user.subscription_status,
                }
            });
        }

        // If we don't have records in our database, fetch from Stripe
        try {
            const invoices = await stripe.invoices.list({
                customer: stripeCustomerId,
                limit: 20,
                status: 'paid',
                expand: ['data.lines.data']
            });

            // Format the invoice data
            const formattedInvoices = invoices.data.map(invoice => {
                // Extract plan name if available
                let planName = 'Subscription';
                if (invoice.lines.data && invoice.lines.data.length > 0) {
                    const lineItem = invoice.lines.data[0];
                    if (lineItem.plan && lineItem.plan.nickname) {
                        planName = lineItem.plan.nickname;
                    } else if (lineItem.description) {
                        planName = lineItem.description;
                    }
                }

                return {
                    id: null, // No database ID
                    stripe_invoice_id: invoice.id,
                    stripe_subscription_id: invoice.subscription,
                    amount: invoice.amount_paid / 100, // Convert from cents to dollars
                    currency: invoice.currency,
                    period_start: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
                    period_end: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
                    payment_date: invoice.status_transitions?.paid_at
                        ? new Date(invoice.status_transitions.paid_at * 1000)
                        : new Date(invoice.created * 1000),
                    plan_name: planName,
                    invoice_pdf: invoice.invoice_pdf,
                    invoice_number: invoice.number,
                    payment_status: invoice.status
                };
            });

            return NextResponse.json({
                invoices: formattedInvoices,
                source: 'stripe',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    subscription_status: user.subscription_status,
                }
            });
        } catch (stripeError) {
            console.error('Error fetching invoices from Stripe:', stripeError);

            // Return empty array if Stripe fails
            return NextResponse.json({
                invoices: [],
                error: 'Could not fetch invoices from Stripe',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    subscription_status: user.subscription_status,
                }
            });
        }
    } catch (error: any) {
        console.error('Error fetching invoice data:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch invoice data' },
            { status: 500 }
        );
    }
} 