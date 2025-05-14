import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// Get a single notice by ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        // Validate ID
        if (!id || isNaN(Number(id))) {
            return NextResponse.json(
                { error: 'Invalid notice ID', success: false },
                { status: 400 }
            );
        }

        // Query the notice
        const query = `
            SELECT * FROM notices 
            WHERE id = $1
        `;

        const result = await executeQuery(query, [id]);

        if (!result || result.length === 0) {
            return NextResponse.json(
                { error: 'Notice not found', success: false },
                { status: 404 }
            );
        }

        return NextResponse.json({
            notice: result[0],
            success: true
        });
    } catch (error) {
        console.error('Error fetching notice:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notice', success: false },
            { status: 500 }
        );
    }
}

// Update a notice by ID
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        // Validate ID
        if (!id || isNaN(Number(id))) {
            return NextResponse.json(
                { error: 'Invalid notice ID', success: false },
                { status: 400 }
            );
        }

        const data = await request.json();
        const { title, content, important, published, expiresAt } = data;

        // Validate input
        if (!title || !content) {
            return NextResponse.json(
                { error: 'Title and content are required', success: false },
                { status: 400 }
            );
        }

        // Check if notice exists
        const checkQuery = 'SELECT id FROM notices WHERE id = $1';
        const checkResult = await executeQuery(checkQuery, [id]);

        if (!checkResult || checkResult.length === 0) {
            return NextResponse.json(
                { error: 'Notice not found', success: false },
                { status: 404 }
            );
        }

        // Update the notice
        const query = `
            UPDATE notices 
            SET title = $1, 
                content = $2, 
                important = $3, 
                published = $4, 
                expires_at = $5,
                updated_at = NOW()
            WHERE id = $6
            RETURNING *
        `;

        const result = await executeQuery(query, [
            title,
            content,
            important !== undefined ? important : false,
            published !== undefined ? published : true,
            expiresAt || null,
            id
        ]);

        return NextResponse.json({
            notice: result[0],
            success: true
        });
    } catch (error) {
        console.error('Error updating notice:', error);
        return NextResponse.json(
            { error: 'Failed to update notice', success: false },
            { status: 500 }
        );
    }
}

// Delete a notice by ID
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        // Validate ID
        if (!id || isNaN(Number(id))) {
            return NextResponse.json(
                { error: 'Invalid notice ID', success: false },
                { status: 400 }
            );
        }

        // Check if notice exists
        const checkQuery = 'SELECT id FROM notices WHERE id = $1';
        const checkResult = await executeQuery(checkQuery, [id]);

        if (!checkResult || checkResult.length === 0) {
            return NextResponse.json(
                { error: 'Notice not found', success: false },
                { status: 404 }
            );
        }

        // Delete the notice
        const query = 'DELETE FROM notices WHERE id = $1 RETURNING id';
        const result = await executeQuery(query, [id]);

        return NextResponse.json({
            message: `Notice ${id} successfully deleted`,
            success: true
        });
    } catch (error) {
        console.error('Error deleting notice:', error);
        return NextResponse.json(
            { error: 'Failed to delete notice', success: false },
            { status: 500 }
        );
    }
} 