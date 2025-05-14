import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// POST handler to update QR code URL for a table
export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const tableId = params.id;

    if (!tableId) {
        return NextResponse.json(
            { success: false, error: 'Table ID is required' },
            { status: 400 }
        );
    }

    try {
        const body = await request.json();
        const { qr_code_url } = body;

        if (!qr_code_url) {
            return NextResponse.json(
                { success: false, error: 'QR code URL is required' },
                { status: 400 }
            );
        }

        // Update the QR code URL in the database
        const result = await pool.query(
            'UPDATE tables SET qr_code_url = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [qr_code_url, tableId]
        );

        if (result.rowCount === 0) {
            return NextResponse.json(
                { success: false, error: 'Table not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            table: result.rows[0]
        });
    } catch (error: any) {
        console.error('Error updating table QR code:', error);

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update table QR code' },
            { status: 500 }
        );
    }
} 