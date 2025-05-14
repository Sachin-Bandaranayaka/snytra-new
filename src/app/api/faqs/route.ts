import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        // Get query parameters
        const { searchParams } = new URL(request.url);
        const categoryIdParam = searchParams.get('category');
        const publishedParam = searchParams.get('published');

        let query = `
            SELECT f.*, c.name as category_name
            FROM faqs f
            LEFT JOIN faq_categories c ON f.category_id = c.id
            WHERE 1=1
        `;

        const queryParams = [];
        let paramIndex = 1;

        // Add category filter if provided
        if (categoryIdParam) {
            query += ` AND f.category_id = $${paramIndex}`;
            queryParams.push(parseInt(categoryIdParam, 10));
            paramIndex++;
        }

        // Add published filter if provided
        if (publishedParam === 'true') {
            query += ` AND f.is_published = true`;
        } else if (publishedParam === 'false') {
            query += ` AND f.is_published = false`;
        }

        // Add ordering
        query += ` ORDER BY c.display_order, f.display_order`;

        const result = await executeQuery(query, queryParams);

        // Group FAQs by category for easier frontend consumption
        const faqsByCategory: Record<string, any> = {};

        for (const faq of result) {
            const categoryId = faq.category_id?.toString() || 'uncategorized';

            if (!faqsByCategory[categoryId]) {
                faqsByCategory[categoryId] = {
                    id: faq.category_id,
                    name: faq.category_name || 'Uncategorized',
                    faqs: []
                };
            }

            faqsByCategory[categoryId].faqs.push({
                id: faq.id,
                question: faq.question,
                answer: faq.answer,
                display_order: faq.display_order,
                is_published: faq.is_published
            });
        }

        return NextResponse.json({
            faqsByCategory: Object.values(faqsByCategory),
            faqs: result,
            success: true
        });
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch FAQs', success: false },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { categoryId, question, answer, displayOrder, isPublished } = data;

        // Validate input
        if (!question || !answer) {
            return NextResponse.json(
                { error: 'Question and answer are required', success: false },
                { status: 400 }
            );
        }

        // Insert the FAQ
        const query = `
            INSERT INTO faqs (
                category_id, question, answer, display_order, is_published,
                created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
            RETURNING *
        `;

        const result = await executeQuery(query, [
            categoryId || null,
            question,
            answer,
            displayOrder || 0,
            isPublished !== undefined ? isPublished : true
        ]);

        return NextResponse.json({
            faq: result[0],
            success: true
        });
    } catch (error) {
        console.error('Error creating FAQ:', error);
        return NextResponse.json(
            { error: 'Failed to create FAQ', success: false },
            { status: 500 }
        );
    }
} 