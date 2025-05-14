import { NextRequest, NextResponse } from 'next/server';
import { executeTransaction } from '@/lib/db';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const data = await request.json();
        const { newOrder, swapWithId, swapWithOrder } = data;

        if (newOrder === undefined || !swapWithId || swapWithOrder === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields for reordering', success: false },
                { status: 400 }
            );
        }

        // Create a transaction with multiple queries
        const queries = [
            {
                query: 'UPDATE faqs SET display_order = $1, updated_at = NOW() WHERE id = $2',
                params: [newOrder, id]
            },
            {
                query: 'UPDATE faqs SET display_order = $1, updated_at = NOW() WHERE id = $2',
                params: [swapWithOrder, swapWithId]
            }
        ];

        // Execute transaction
        await executeTransaction(queries);

        return NextResponse.json({
            message: 'FAQ order updated successfully',
            success: true
        });
    } catch (error) {
        console.error('Error reordering FAQ:', error);
        return NextResponse.json(
            { error: 'Failed to reorder FAQ', success: false },
            { status: 500 }
        );
    }
} 