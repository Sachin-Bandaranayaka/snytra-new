import { NextRequest, NextResponse } from 'next/server';
import db, { executeQuery } from '@/lib/db';
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

        // Using executeQuery helper for serverless compatibility

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

            const postResult = await executeQuery(postQuery, [slugParam]);

            if (!postResult || postResult.length === 0) {
                return NextResponse.json(
                    { error: 'Post not found', success: false },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                post: postResult[0],
                success: true
            });
        }

        // Regular pagination parameters
        const limit = parseInt(limitParam || '10');
        const page = parseInt(pageParam || '1');
        const offset = (page - 1) * limit;

        // If admin parameter is set, check if user is admin and include all posts
        let statusFilter = "p.status = 'published'";
        if (adminParam === 'true') {
            const auth = await isAdmin();
            if (auth.success) {
                statusFilter = "1=1"; // Include all posts for admin
            }
        }

        // Build query based on parameters
        let postsQuery = `
            SELECT p.*, u.name as author_name,
            array_agg(DISTINCT c.name) as categories,
            array_agg(DISTINCT c.slug) as category_slugs
            FROM blog_posts p
            LEFT JOIN users u ON p.author_id = u.id
            LEFT JOIN blog_post_categories pc ON p.id = pc.post_id
            LEFT JOIN blog_categories c ON pc.category_id = c.id
            WHERE ${statusFilter}
        `;

        let countQuery = `
            SELECT COUNT(DISTINCT p.id) as total
            FROM blog_posts p
            LEFT JOIN blog_post_categories pc ON p.id = pc.post_id
            LEFT JOIN blog_categories c ON pc.category_id = c.id
            WHERE ${statusFilter}
        `;

        const queryParams = [];

        // Add category filter if specified
        if (categoryParam) {
            postsQuery += ` AND c.slug = $${queryParams.length + 1}`;
            countQuery += ` AND c.slug = $${queryParams.length + 1}`;
            queryParams.push(categoryParam);
        }

        // Add ordering and pagination
        postsQuery += `
            GROUP BY p.id, u.name
            ORDER BY p.created_at DESC
            LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
        `;

        queryParams.push(limit, offset);

        const [postsResult, countResult] = await Promise.all([
            executeQuery(postsQuery, queryParams),
            executeQuery(countQuery, categoryParam ? [categoryParam] : [])
        ]);

        const total = parseInt(countResult[0].total);
        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            posts: postsResult,
            pagination: {
                total,
                totalPages,
                currentPage: page,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
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

// POST to create a new blog post
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
        const {
            title,
            content,
            excerpt,
            authorId,
            featuredImage,
            featured_image,
            metaTitle,
            metaDescription,
            tags,
            published,
            featured,
            slug,
            categoryIds
        } = data;

        // Handle both field naming conventions for featured image
        const finalFeaturedImage = featuredImage || featured_image;

        // Handle field mapping for compatibility
        let { status } = data;
        let publishedAt = null;
        
        // Convert 'published' boolean to 'status' and set publishedAt
        if (published === true) {
            status = 'published';
            publishedAt = new Date();
        } else if (published === false || !status) {
            status = status || 'draft';
            publishedAt = null;
        } else if (status === 'published') {
            publishedAt = new Date();
        }

        if (!title || !content || !authorId) {
            return NextResponse.json(
                { error: 'Missing required fields', success: false },
                { status: 400 }
            );
        }

        // Use individual queries instead of transactions for serverless compatibility
        try {
            // Check if user exists
            const userCheckQuery = `SELECT id FROM users WHERE id = $1`;
            const userResult = await executeQuery(userCheckQuery, [authorId]);

            if (!userResult || userResult.length === 0) {
                return NextResponse.json(
                    { error: 'Invalid author ID', success: false },
                    { status: 400 }
                );
            }

            // Check if slug is unique (if provided)
            if (slug) {
                const slugCheckQuery = `SELECT id FROM blog_posts WHERE slug = $1`;
                const slugResult = await executeQuery(slugCheckQuery, [slug]);

                if (slugResult && slugResult.length > 0) {
                    return NextResponse.json(
                        { error: 'Slug already exists', success: false },
                        { status: 400 }
                    );
                }
            }

            // Insert the blog post
            const insertQuery = `
                INSERT INTO blog_posts 
                (title, content, excerpt, author_id, featured_image, status, meta_title, meta_description, tags, slug, created_at, updated_at, published_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW(), $11)
                RETURNING id
            `;

            const insertResult = await executeQuery(insertQuery, [
                title,
                content,
                excerpt || null,
                authorId,
                finalFeaturedImage || null,
                status || 'draft',
                metaTitle || null,
                metaDescription || null,
                tags || [],
                slug || null,
                publishedAt
            ]);

            if (!insertResult || insertResult.length === 0) {
                return NextResponse.json(
                    { error: 'Failed to create blog post', success: false },
                    { status: 500 }
                );
            }

            const postId = insertResult[0].id;

            // Handle category associations if provided
            if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
                const categoryValues = categoryIds.map((categoryId, index) => 
                    `($1, $${index + 2})`
                ).join(', ');

                const categoryQuery = `
                    INSERT INTO blog_post_categories (post_id, category_id)
                    VALUES ${categoryValues}
                `;

                await executeQuery(categoryQuery, [postId, ...categoryIds]);
            }

            return NextResponse.json({
                id: postId,
                success: true
            });

        } catch (error) {
            console.error('Error in blog post creation:', error);
            return NextResponse.json(
                { error: 'Failed to create blog post', success: false },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Error creating blog post:', error);
        return NextResponse.json(
            { error: 'Failed to create blog post', success: false },
            { status: 500 }
        );
    }
} 