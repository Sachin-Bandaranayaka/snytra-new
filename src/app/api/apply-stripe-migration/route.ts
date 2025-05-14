import { NextRequest, NextResponse } from 'next/server';
import applyStripeMigration from '@/lib/apply-stripe-migration';

export async function POST(req: NextRequest) {
    try {
        await applyStripeMigration();

        return NextResponse.json({
            success: true,
            message: 'Stripe migration applied successfully'
        });
    } catch (error: any) {
        console.error('Error applying Stripe migration:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                message: 'Failed to apply Stripe migration'
            },
            { status: 500 }
        );
    }
} 