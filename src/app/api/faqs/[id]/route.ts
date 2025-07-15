import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const result = await executeQuery(
            `SELECT f.*, c.name as category_name
             FROM faqs f
             LEFT JOIN faq_categories c ON f.category_id = c.id
             WHERE f.id = $1`,
            [id]
        );

        if (result.length === 0) {
            return NextResponse.json(
                { error: 'FAQ not found', success: false },
                { status: 404 }
            );
        }

        return NextResponse.json({
            faq: result[0],
            success: true
        });
    } catch (error) {
        console.error('Error fetching FAQ:', error);
        return NextResponse.json(
            { error: 'Failed to fetch FAQ', success: false },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Check if FAQ exists before deleting
        const checkResult = await executeQuery(
            'SELECT id FROM faqs WHERE id = $1',
            [id]
        );

        if (checkResult.length === 0) {
            return NextResponse.json(
                { error: 'FAQ not found', success: false },
                { status: 404 }
            );
        }

        // Delete the FAQ
        await executeQuery('DELETE FROM faqs WHERE id = $1', [id]);

        return NextResponse.json({
            message: 'FAQ deleted successfully',
            success: true
        });
    } catch (error) {
        console.error('Error deleting FAQ:', error);
        return NextResponse.json(
            { error: 'Failed to delete FAQ', success: false },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await request.json();

        // Check if FAQ exists before updating
        const checkResult = await executeQuery(
            'SELECT id FROM faqs WHERE id = $1',
            [id]
        );

        if (checkResult.length === 0) {
            return NextResponse.json(
                { error: 'FAQ not found', success: false },
                { status: 404 }
            );
        }

        // Build dynamic update query based on provided fields
        const updateFields = [];
        const queryParams = [];
        let paramCounter = 1;

        // Track which fields were provided in the request
        const {
            question,
            answer,
            category_id,
            display_order,
            is_published
        } = data;

        if (question !== undefined) {
            updateFields.push(`question = $${paramCounter++}`);
            queryParams.push(question);
        }

        if (answer !== undefined) {
            updateFields.push(`answer = $${paramCounter++}`);
            queryParams.push(answer);
        }

        if (category_id !== undefined) {
            updateFields.push(`category_id = $${paramCounter++}`);
            queryParams.push(category_id);
        }

        if (display_order !== undefined) {
            updateFields.push(`display_order = $${paramCounter++}`);
            queryParams.push(display_order);
        }

        if (is_published !== undefined) {
            updateFields.push(`is_published = $${paramCounter++}`);
            queryParams.push(is_published);
        }

        // Always update the updated_at timestamp
        updateFields.push(`updated_at = NOW()`);

        // If no valid fields were provided
        if (updateFields.length === 1) {  // Only updated_at
            return NextResponse.json(
                { error: 'No valid fields to update', success: false },
                { status: 400 }
            );
        }

        // Add the id parameter at the end
        queryParams.push(id);

        const query = `
            UPDATE faqs 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramCounter}
            RETURNING *
        `;

        const result = await executeQuery(query, queryParams);

        return NextResponse.json({
            faq: result[0],
            success: true
        });
    } catch (error) {
        console.error('Error updating FAQ:', error);
        return NextResponse.json(
            { error: 'Failed to update FAQ', success: false },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await request.json();

        // Check if FAQ exists before updating
        const checkResult = await executeQuery(
            'SELECT id FROM faqs WHERE id = $1',
            [id]
        );

        if (checkResult.length === 0) {
            return NextResponse.json(
                { error: 'FAQ not found', success: false },
                { status: 404 }
            );
        }

        // Extract fields from request
        const {
            question,
            answer,
            category_id,
            display_order,
            is_published
        } = data;

        // Validate required fields
        if (!question || !answer) {
            return NextResponse.json(
                { error: 'Question and answer are required', success: false },
                { status: 400 }
            );
        }

        // Update the FAQ
        const query = `
            UPDATE faqs 
            SET 
                question = $1, 
                answer = $2, 
                category_id = $3, 
                display_order = $4, 
                is_published = $5, 
                updated_at = NOW()
            WHERE id = $6
            RETURNING *
        `;

        const result = await executeQuery(query, [
            question,
            answer,
            category_id,
            display_order || 0,
            is_published !== undefined ? is_published : true,
            id
        ]);

        return NextResponse.json({
            faq: result[0],
            success: true
        });
    } catch (error) {
        console.error('Error updating FAQ:', error);
        return NextResponse.json(
            { error: 'Failed to update FAQ', success: false },
            { status: 500 }
        );
    }
} 