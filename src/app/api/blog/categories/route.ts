import { NextRequest, NextResponse } from 'next/server';
import db, { getConnectionPool } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const adminParam = searchParams.get('admin');

        // Different query for admin view vs. public view
        let query;
        if (adminParam === 'true') {
            // For admin view, get all categories
            query = `
                SELECT * FROM blog_categories
                ORDER BY name ASC
            `;
        } else {
            // For public view, only get categories that have at least one published post
            query = `
                SELECT DISTINCT c.*
                FROM blog_categories c
                JOIN blog_post_categories pc ON c.id = pc.category_id
                JOIN blog_posts p ON pc.post_id = p.id
                WHERE p.status = 'published'
                ORDER BY c.name ASC
            `;
        }

        const result = await db.executeQuery(query);

        return NextResponse.json({
            categories: result,
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
        // Check if user is admin
        const auth = await isAdmin();
        if (!auth.success) {
            return NextResponse.json(
                { error: 'Unauthorized', success: false },
                { status: 401 }
            );
        }

        const data = await request.json();
        const { name, slug, description } = data;

        if (!name || !slug) {
            return NextResponse.json(
                { error: 'Name and slug are required', success: false },
                { status: 400 }
            );
        }

        // Check if the slug already exists
        const checkQuery = `
            SELECT id FROM blog_categories 
            WHERE slug = $1
        `;
        const existingCategory = await db.executeQuery(checkQuery, [slug]);

        if (existingCategory && existingCategory.length > 0) {
            return NextResponse.json(
                { error: 'A category with this slug already exists', success: false },
                { status: 400 }
            );
        }

        // Insert the new category
        const insertQuery = `
            INSERT INTO blog_categories (name, slug, description)
            VALUES ($1, $2, $3)
            RETURNING *
        `;

        const result = await db.executeQuery(insertQuery, [
            name,
            slug,
            description || null
        ]);

        return NextResponse.json({
            category: result[0],
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

// OPTIONS method for CORS
export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Origin': '*',
        },
    });
} 