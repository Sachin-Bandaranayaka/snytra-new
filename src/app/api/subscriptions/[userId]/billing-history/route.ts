import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16'
});

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        // Extract userId from params first
        const { userId } = await params;

        // First, get the user's stripe customer ID
        const { rows } = await pool.query(
            `SELECT stripe_customer_id FROM users WHERE id = $1`,
            [userId]
        );

        if (rows.length === 0 || !rows[0].stripe_customer_id) {
            return NextResponse.json({ invoices: [] });
        }

        const stripeCustomerId = rows[0].stripe_customer_id;

        // Fetch invoices from Stripe
        const invoices = await stripe.invoices.list({
            customer: stripeCustomerId,
            limit: 25, // Limit to last 25 invoices
        });

        // Transform the data to include only what we need
        const processedInvoices = invoices.data.map(invoice => ({
            id: invoice.id,
            number: invoice.number,
            created: invoice.created,
            period_start: invoice.period_start,
            period_end: invoice.period_end,
            amount_due: invoice.amount_due,
            amount_paid: invoice.amount_paid,
            amount_remaining: invoice.amount_remaining,
            status: invoice.status,
            invoice_pdf: invoice.invoice_pdf,
            hosted_invoice_url: invoice.hosted_invoice_url,
            currency: invoice.currency,
            subscription: invoice.subscription,
            paid: invoice.paid,
            billing_reason: invoice.billing_reason,
            lines: invoice.lines.data.map(line => ({
                id: line.id,
                amount: line.amount,
                description: line.description,
                period: line.period,
                plan: line.plan ? {
                    id: line.plan.id,
                    name: line.plan.nickname || line.plan.product,
                    amount: line.plan.amount,
                    interval: line.plan.interval,
                } : null,
            })),
        }));

        return NextResponse.json({ invoices: processedInvoices });
    } catch (error) {
        console.error('Error fetching billing history:', error);
        return NextResponse.json(
            { error: 'Failed to fetch billing history' },
            { status: 500 }
        );
    }
} 