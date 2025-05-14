import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const query = `
            SELECT c.*, COUNT(pc.post_id) as post_count
            FROM blog_categories c
            LEFT JOIN blog_post_categories pc ON c.id = pc.category_id
            LEFT JOIN blog_posts p ON pc.post_id = p.id AND p.status = 'published'
            GROUP BY c.id
            ORDER BY c.name ASC
        `;

        const result = await pool.query(query);

        return NextResponse.json({
            categories: result.rows,
            success: true
        });
    } catch (error) {
        console.error('Error fetching blog categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch blog categories', success: false },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { name, description, slug: providedSlug } = data;

        // Validate input
        if (!name) {
            return NextResponse.json(
                { error: 'Category name is required', success: false },
                { status: 400 }
            );
        }

        // Generate slug if not provided
        const slug = providedSlug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        // Check if slug already exists
        const checkQuery = `
            SELECT id FROM blog_categories WHERE slug = $1
        `;

        const checkResult = await pool.query(checkQuery, [slug]);

        if (checkResult.rows.length > 0) {
            return NextResponse.json(
                { error: 'A category with this slug already exists', success: false },
                { status: 400 }
            );
        }

        // Insert the category
        const insertQuery = `
            INSERT INTO blog_categories (name, slug, description, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
            RETURNING *
        `;

        const result = await pool.query(insertQuery, [
            name,
            slug,
            description || null
        ]);

        return NextResponse.json({
            category: result.rows[0],
            success: true
        });
    } catch (error) {
        console.error('Error creating blog category:', error);
        return NextResponse.json(
            { error: 'Failed to create blog category', success: false },
            { status: 500 }
        );
    }
} 