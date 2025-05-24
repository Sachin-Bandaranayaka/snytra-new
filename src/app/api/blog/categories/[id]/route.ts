import { NextRequest, NextResponse } from 'next/server';
import db, { getConnectionPool } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

interface RouteParams {
    params: {
        id: string;
    };
}

// GET a single blog category by ID
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const query = `
            SELECT c.*, 
                (SELECT COUNT(*) FROM blog_post_categories WHERE category_id = c.id) as post_count
            FROM blog_categories c
            WHERE c.id = $1
        `;

        const id = params.id;
        const result = await db.executeQuery(query, [id]);

        if (!result || result.length === 0) {
            return NextResponse.json(
                { error: 'Blog category not found', success: false },
                { status: 404 }
            );
        }

        return NextResponse.json({
            category: result[0],
            success: true
        });
    } catch (error) {
        console.error('Error fetching blog category:', error);
        return NextResponse.json(
            { error: 'Failed to fetch blog category', success: false },
            { status: 500 }
        );
    }
}

// PUT to update a blog category
export async function PUT(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        // Check if user is admin
        const auth = await isAdmin();
        if (!auth.success) {
            return NextResponse.json(
                { error: 'Unauthorized', success: false },
                { status: 401 }
            );
        }

        const id = params.id;
        const data = await request.json();
        const { name, slug, description } = data;

        if (!name || !slug) {
            return NextResponse.json(
                { error: 'Name and slug are required', success: false },
                { status: 400 }
            );
        }

        // Check if the slug already exists for other categories
        const checkQuery = `
            SELECT id FROM blog_categories 
            WHERE slug = $1 AND id != $2
        `;
        const existingCategory = await db.executeQuery(checkQuery, [slug, id]);

        if (existingCategory && existingCategory.length > 0) {
            return NextResponse.json(
                { error: 'Another category with this slug already exists', success: false },
                { status: 400 }
            );
        }

        // Update the category
        const updateQuery = `
            UPDATE blog_categories
            SET name = $1, slug = $2, description = $3, updated_at = NOW()
            WHERE id = $4
            RETURNING *
        `;

        const result = await db.executeQuery(updateQuery, [
            name,
            slug,
            description || null,
            id
        ]);

        if (!result || result.length === 0) {
            return NextResponse.json(
                { error: 'Category not found', success: false },
                { status: 404 }
            );
        }

        return NextResponse.json({
            category: result[0],
            success: true
        });
    } catch (error) {
        console.error('Error updating blog category:', error);
        return NextResponse.json(
            { error: 'Failed to update blog category', success: false },
            { status: 500 }
        );
    }
}

// DELETE a blog category
export async function DELETE(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        // Check if user is admin
        const auth = await isAdmin();
        if (!auth.success) {
            return NextResponse.json(
                { error: 'Unauthorized', success: false },
                { status: 401 }
            );
        }

        const id = params.id;

        // Start a transaction
        const pool = getConnectionPool();
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // First check if the category exists
            const checkQuery = `SELECT id FROM blog_categories WHERE id = $1`;
            const checkResult = await client.query(checkQuery, [id]);

            if (checkResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return NextResponse.json(
                    { error: 'Blog category not found', success: false },
                    { status: 404 }
                );
            }

            // Check if there are any posts using this category
            const postCheckQuery = `
                SELECT COUNT(*) as post_count 
                FROM blog_post_categories 
                WHERE category_id = $1
            `;
            const postCheckResult = await client.query(postCheckQuery, [id]);
            const postCount = parseInt(postCheckResult.rows[0].post_count);

            if (postCount > 0) {
                await client.query('ROLLBACK');
                return NextResponse.json(
                    {
                        error: 'Cannot delete category that is associated with posts. Remove the category from all posts first.',
                        success: false
                    },
                    { status: 400 }
                );
            }

            // Delete the blog category
            await client.query(
                `DELETE FROM blog_categories WHERE id = $1`,
                [id]
            );

            await client.query('COMMIT');

            return NextResponse.json({
                message: 'Blog category deleted successfully',
                success: true
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error deleting blog category:', error);
        return NextResponse.json(
            { error: 'Failed to delete blog category', success: false },
            { status: 500 }
        );
    }
}

// OPTIONS method for CORS
export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Origin': '*',
        },
    });
} 