import { NextRequest, NextResponse } from 'next/server';
import { getConnectionPool, executeQuery } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        // Get query parameters
        const { searchParams } = new URL(request.url);
        const limitParam = searchParams.get('limit');
        const pageParam = searchParams.get('page');
        const categoryParam = searchParams.get('category');
        const slugParam = searchParams.get('slug');
        const adminParam = searchParams.get('admin');

        const pool = getConnectionPool();

        // Check if we're requesting a single post by slug
        if (slugParam) {
            const postQuery = `
                SELECT p.*, u.name as author_name,
                array_agg(DISTINCT c.name) as categories,
                array_agg(DISTINCT c.slug) as category_slugs
                FROM blog_posts p
                LEFT JOIN users u ON p.author_id = u.id
                LEFT JOIN blog_post_categories pc ON p.id = pc.post_id
                LEFT JOIN blog_categories c ON pc.category_id = c.id
                WHERE p.slug = $1 AND p.status = 'published'
                GROUP BY p.id, u.name
            `;

            const postResult = await pool.query(postQuery, [slugParam]);

            if (postResult.rows.length === 0) {
                return NextResponse.json(
                    { error: 'Post not found', success: false },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                post: postResult.rows[0],
                success: true
            });
        }

        // For list view
        const limit = limitParam ? parseInt(limitParam, 10) : 10;
        const page = pageParam ? parseInt(pageParam, 10) : 1;
        const offset = (page - 1) * limit;

        // Build query for post list
        let queryParams = [];
        let paramIndex = 1;

        // Different query for admin view vs. public view
        let postsQuery;

        if (adminParam === 'true') {
            // For admin - get all posts with status (for admin panel)
            postsQuery = `
                SELECT p.id, p.title, p.slug, p.excerpt, p.featured_image, 
                    p.published_at, p.status, u.name as author_name,
                    array_agg(DISTINCT c.name) as categories,
                    array_agg(DISTINCT c.slug) as category_slugs,
                    p.status = 'published' as published,
                    p.created_at, p.updated_at
                FROM blog_posts p
                LEFT JOIN users u ON p.author_id = u.id
                LEFT JOIN blog_post_categories pc ON p.id = pc.post_id
                LEFT JOIN blog_categories c ON pc.category_id = c.id
            `;
        } else {
            // For public view - only published posts
            postsQuery = `
                SELECT p.id, p.title, p.slug, p.excerpt, p.featured_image, 
                    p.published_at, u.name as author_name,
                    array_agg(DISTINCT c.name) as categories,
                    array_agg(DISTINCT c.slug) as category_slugs
                FROM blog_posts p
                LEFT JOIN users u ON p.author_id = u.id
                LEFT JOIN blog_post_categories pc ON p.id = pc.post_id
                LEFT JOIN blog_categories c ON pc.category_id = c.id
                WHERE p.status = 'published'
            `;
        }

        // Add category filter if provided
        if (categoryParam) {
            postsQuery += paramIndex === 1 ? ' WHERE ' : ' AND ';
            postsQuery += `EXISTS (
                SELECT 1 FROM blog_post_categories pc2
                JOIN blog_categories c2 ON pc2.category_id = c2.id
                WHERE pc2.post_id = p.id AND c2.slug = $${paramIndex}
            )`;
            queryParams.push(categoryParam);
            paramIndex++;
        }

        // Group, order and paginate
        postsQuery += `
            GROUP BY p.id, u.name
            ORDER BY p.created_at DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;
        queryParams.push(limit, offset);

        // Count total for pagination
        let countQuery;
        if (adminParam === 'true') {
            countQuery = `
                SELECT COUNT(DISTINCT p.id) as total
                FROM blog_posts p
            `;
        } else {
            countQuery = `
                SELECT COUNT(DISTINCT p.id) as total
                FROM blog_posts p
                WHERE p.status = 'published'
            `;
        }

        if (categoryParam && adminParam !== 'true') {
            countQuery += ` AND EXISTS (
                SELECT 1 FROM blog_post_categories pc2
                JOIN blog_categories c2 ON pc2.category_id = c2.id
                WHERE pc2.post_id = p.id AND c2.slug = $1
            )`;
        } else if (categoryParam) {
            countQuery += ` WHERE EXISTS (
                SELECT 1 FROM blog_post_categories pc2
                JOIN blog_categories c2 ON pc2.category_id = c2.id
                WHERE pc2.post_id = p.id AND c2.slug = $1
            )`;
        }

        const [postsResult, countResult] = await Promise.all([
            pool.query(postsQuery, queryParams),
            pool.query(countQuery, categoryParam ? [categoryParam] : [])
        ]);

        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            posts: postsResult.rows,
            pagination: {
                total,
                totalPages,
                currentPage: page,
                limit
            },
            success: true
        });
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch blog posts', success: false },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const {
            title,
            content,
            excerpt,
            authorId,
            featuredImage,
            status,
            metaTitle,
            metaDescription,
            tags,
            categories,
            slug: providedSlug
        } = data;

        // Validate input
        if (!title || !content || !authorId) {
            return NextResponse.json(
                { error: 'Title, content, and author ID are required', success: false },
                { status: 400 }
            );
        }

        // Generate slug if not provided
        const slug = providedSlug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        // Start a transaction
        const pool = getConnectionPool();
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Check if user exists
            const userCheckQuery = `SELECT id FROM users WHERE id = $1`;
            const userResult = await client.query(userCheckQuery, [authorId]);

            if (userResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return NextResponse.json(
                    { error: `Author with ID ${authorId} does not exist`, success: false },
                    { status: 400 }
                );
            }

            // Insert the blog post
            const insertPostQuery = `
                INSERT INTO blog_posts (
                    title, slug, content, excerpt, author_id, featured_image, 
                    status, meta_title, meta_description, tags,
                    created_at, updated_at, published_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW(), $11)
                RETURNING *
            `;

            const publishedAt = status === 'published' ? new Date() : null;

            const postResult = await client.query(insertPostQuery, [
                title,
                slug,
                content,
                excerpt || null,
                authorId,
                featuredImage || null,
                status || 'draft',
                metaTitle || title,
                metaDescription || excerpt || null,
                tags || null,
                publishedAt
            ]);

            const postId = postResult.rows[0].id;

            // If categories provided, link them to the post
            if (categories && categories.length > 0) {
                const categoryValues = categories.map((categoryId: number, index: number) =>
                    `($1, $${index + 2})`
                ).join(', ');

                const insertCategoriesQuery = `
                    INSERT INTO blog_post_categories (post_id, category_id)
                    VALUES ${categoryValues}
                `;

                await client.query(
                    insertCategoriesQuery,
                    [postId, ...categories]
                );
            }

            await client.query('COMMIT');

            return NextResponse.json({
                post: postResult.rows[0],
                success: true
            });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error creating blog post:', error);
        return NextResponse.json(
            { error: 'Failed to create blog post', success: false },
            { status: 500 }
        );
    }
} 