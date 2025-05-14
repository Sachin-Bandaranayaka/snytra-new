import { NextRequest, NextResponse } from 'next/server';
import db, { getConnectionPool } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

interface RouteParams {
    params: {
        id: string;
    };
}

// GET a single blog post by ID
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const query = `
            SELECT p.*, u.name as author_name,
            array_agg(DISTINCT c.name) as categories,
            array_agg(DISTINCT c.slug) as category_slugs
            FROM blog_posts p
            LEFT JOIN users u ON p.author_id = u.id
            LEFT JOIN blog_post_categories pc ON p.id = pc.post_id
            LEFT JOIN blog_categories c ON pc.category_id = c.id
            WHERE p.id = $1
            GROUP BY p.id, u.name
        `;

        const id = await params.id;
        const result = await db.executeQuery(query, [id]);

        if (!result || result.length === 0) {
            return NextResponse.json(
                { error: 'Blog post not found', success: false },
                { status: 404 }
            );
        }

        return NextResponse.json({
            post: result[0],
            success: true
        });
    } catch (error) {
        console.error('Error fetching blog post:', error);
        return NextResponse.json(
            { error: 'Failed to fetch blog post', success: false },
            { status: 500 }
        );
    }
}

// PATCH to update a blog post
export async function PATCH(
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

        const id = await params.id;
        const data = await request.json();

        // Start a transaction
        const pool = getConnectionPool();
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // First check if the post exists
            const checkQuery = `SELECT id FROM blog_posts WHERE id = $1`;
            const checkResult = await client.query(checkQuery, [id]);

            if (checkResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return NextResponse.json(
                    { error: 'Blog post not found', success: false },
                    { status: 404 }
                );
            }

            // Build the update query dynamically based on which fields are provided
            const allowedFields = [
                'title', 'content', 'excerpt', 'author_id', 'featured_image',
                'status', 'meta_title', 'meta_description', 'tags', 'published',
                'featured', 'slug'
            ];

            const updateFields = Object.keys(data).filter(key =>
                allowedFields.includes(key) && data[key] !== undefined
            );

            if (updateFields.length === 0) {
                await client.query('ROLLBACK');
                return NextResponse.json({
                    message: 'No valid fields to update',
                    success: true,
                    post: checkResult.rows[0]
                });
            }

            const setClause = updateFields.map((field, index) => `${field} = $${index + 2}`).join(', ');
            const updateQuery = `
        UPDATE blog_posts
        SET ${setClause}, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

            const values = [id, ...updateFields.map(field => data[field])];
            const updateResult = await client.query(updateQuery, values);

            // If categories are provided, update them
            if (data.categories && Array.isArray(data.categories)) {
                // First delete existing category relationships
                await client.query(
                    `DELETE FROM blog_post_categories WHERE post_id = $1`,
                    [id]
                );

                // Then add new ones if any are provided
                if (data.categories.length > 0) {
                    const categoryValues = data.categories.map((categoryId, index) =>
                        `($1, $${index + 2})`
                    ).join(', ');

                    const insertCategoriesQuery = `
            INSERT INTO blog_post_categories (post_id, category_id)
            VALUES ${categoryValues}
          `;

                    await client.query(
                        insertCategoriesQuery,
                        [id, ...data.categories]
                    );
                }
            }

            await client.query('COMMIT');

            return NextResponse.json({
                post: updateResult.rows[0],
                success: true
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error updating blog post:', error);
        return NextResponse.json(
            { error: 'Failed to update blog post', success: false },
            { status: 500 }
        );
    }
}

// DELETE a blog post
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

        const id = await params.id;

        // Start a transaction
        const pool = getConnectionPool();
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // First check if the post exists
            const checkQuery = `SELECT id FROM blog_posts WHERE id = $1`;
            const checkResult = await client.query(checkQuery, [id]);

            if (checkResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return NextResponse.json(
                    { error: 'Blog post not found', success: false },
                    { status: 404 }
                );
            }

            // Delete associated category relationships first (due to foreign key constraints)
            await client.query(
                `DELETE FROM blog_post_categories WHERE post_id = $1`,
                [id]
            );

            // Delete the blog post
            await client.query(
                `DELETE FROM blog_posts WHERE id = $1`,
                [id]
            );

            await client.query('COMMIT');

            return NextResponse.json({
                message: 'Blog post deleted successfully',
                success: true
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error deleting blog post:', error);
        return NextResponse.json(
            { error: 'Failed to delete blog post', success: false },
            { status: 500 }
        );
    }
} 