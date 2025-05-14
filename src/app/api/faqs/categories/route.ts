import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const query = `
            SELECT c.*, COUNT(f.id) as faq_count
            FROM faq_categories c
            LEFT JOIN faqs f ON c.id = f.category_id
            GROUP BY c.id
            ORDER BY c.display_order, c.name
        `;

        const result = await executeQuery(query);

        return NextResponse.json({
            categories: result,
            success: true
        });
    } catch (error) {
        console.error('Error fetching FAQ categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch FAQ categories', success: false },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { name, description, displayOrder } = data;

        // Validate input
        if (!name) {
            return NextResponse.json(
                { error: 'Category name is required', success: false },
                { status: 400 }
            );
        }

        // Insert the category
        const query = `
            INSERT INTO faq_categories (
                name, description, display_order, created_at, updated_at
            ) VALUES ($1, $2, $3, NOW(), NOW())
            RETURNING *
        `;

        const result = await executeQuery(query, [
            name,
            description || null,
            displayOrder || 0
        ]);

        return NextResponse.json({
            category: result[0],
            success: true
        });
    } catch (error) {
        console.error('Error creating FAQ category:', error);
        return NextResponse.json(
            { error: 'Failed to create FAQ category', success: false },
            { status: 500 }
        );
    }
} 