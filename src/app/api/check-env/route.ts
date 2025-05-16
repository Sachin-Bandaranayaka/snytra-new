import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        stripeKeyExists: Boolean(process.env.STRIPE_SECRET_KEY),
        stripeKeyLength: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.length : 0,
        stripeKeyStart: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 4) : null,
        nodeEnv: process.env.NODE_ENV,
        databaseUrlExists: Boolean(process.env.DATABASE_URL),
    });
} 