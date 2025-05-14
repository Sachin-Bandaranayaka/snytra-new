/**
 * Tests for the Blog Posts API endpoints
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Import the handler to test (adjust the import path if needed)
import { GET, POST, OPTIONS } from '../route';

// Mock the database connection and queries
vi.mock('@/lib/db', () => ({
    db: {
        query: vi.fn(),
        one: vi.fn(),
        many: vi.fn(),
        none: vi.fn(),
        any: vi.fn(),
    }
}));

// Import the mocked db
import { db } from '@/lib/db';

describe('Blog Posts API', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('GET handler', () => {
        it('should return blog posts with admin=true parameter', async () => {
            // Mock database response for admin request
            (db.query as vi.Mock).mockResolvedValueOnce({
                posts: [
                    {
                        id: 'post1',
                        title: 'Test Post 1',
                        slug: 'test-post-1',
                        excerpt: 'Test excerpt 1',
                        category_id: 'cat1',
                        category_name: 'Category 1',
                        featured: true,
                        published: true,
                        created_at: '2023-01-01T00:00:00.000Z',
                        updated_at: '2023-01-01T00:00:00.000Z'
                    }
                ]
            });

            // Create a mock request with admin=true
            const request = new NextRequest(
                new URL('http://localhost:3000/api/blog/posts?admin=true')
            );

            // Call the GET handler
            const response = await GET(request);
            const data = await response.json();

            // Assertions
            expect(response.status).toBe(200);
            expect(data).toHaveProperty('posts');
            expect(data.posts).toBeInstanceOf(Array);
            expect(data.posts.length).toBe(1);
            expect(data.posts[0].title).toBe('Test Post 1');

            // Verify query was called with the right parameters
            expect(db.query).toHaveBeenCalledTimes(1);
            expect(db.query).toHaveBeenCalledWith(
                expect.stringMatching(/SELECT(.*)FROM blog_posts/i),
                expect.any(Object)
            );
        });

        it('should return published blog posts with admin=false parameter', async () => {
            // Mock database response for public request
            (db.query as vi.Mock).mockResolvedValueOnce({
                posts: [
                    {
                        id: 'post1',
                        title: 'Test Post 1',
                        slug: 'test-post-1',
                        excerpt: 'Test excerpt 1',
                        category_id: 'cat1',
                        category_name: 'Category 1',
                        featured: true,
                        published: true,
                        created_at: '2023-01-01T00:00:00.000Z',
                        updated_at: '2023-01-01T00:00:00.000Z'
                    }
                ]
            });

            // Create a mock request without admin parameter
            const request = new NextRequest(
                new URL('http://localhost:3000/api/blog/posts')
            );

            // Call the GET handler
            const response = await GET(request);
            const data = await response.json();

            // Assertions
            expect(response.status).toBe(200);
            expect(data).toHaveProperty('posts');

            // Verify query was called with published filter
            expect(db.query).toHaveBeenCalledTimes(1);
            expect(db.query).toHaveBeenCalledWith(
                expect.stringMatching(/SELECT(.*)WHERE(.*)published = true/i),
                expect.any(Object)
            );
        });

        it('should handle errors during fetching blog posts', async () => {
            // Mock database query to throw an error
            (db.query as vi.Mock).mockRejectedValueOnce(new Error('Database error'));

            // Create a mock request
            const request = new NextRequest(
                new URL('http://localhost:3000/api/blog/posts')
            );

            // Call the GET handler
            const response = await GET(request);

            // Assertions
            expect(response.status).toBe(500);
            const data = await response.json();
            expect(data).toHaveProperty('error');
        });
    });

    describe('POST handler', () => {
        it('should create a new blog post with valid data', async () => {
            // Mock successful database insertion
            (db.one as vi.Mock).mockResolvedValueOnce({
                id: 'new-post-id',
                title: 'New Test Post',
                slug: 'new-test-post',
                content: 'Test content',
                excerpt: 'Test excerpt',
                category_id: 'cat1',
                featured: false,
                published: false,
                created_at: '2023-01-01T00:00:00.000Z',
                updated_at: '2023-01-01T00:00:00.000Z'
            });

            // Create post data
            const postData = {
                title: 'New Test Post',
                content: 'Test content',
                excerpt: 'Test excerpt',
                category_id: 'cat1',
                featured: false,
                published: false
            };

            // Create a mock request with post data
            const request = new NextRequest(
                'http://localhost:3000/api/blog/posts',
                {
                    method: 'POST',
                    body: JSON.stringify(postData),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Call the POST handler
            const response = await POST(request);
            const data = await response.json();

            // Assertions
            expect(response.status).toBe(201);
            expect(data).toHaveProperty('post');
            expect(data.post.title).toBe('New Test Post');

            // Verify database call
            expect(db.one).toHaveBeenCalledTimes(1);
            expect(db.one).toHaveBeenCalledWith(
                expect.stringMatching(/INSERT INTO blog_posts/i),
                expect.objectContaining({
                    title: 'New Test Post',
                    content: 'Test content'
                })
            );
        });

        it('should return validation error with invalid data', async () => {
            // Create invalid post data (missing required fields)
            const postData = {
                // Missing title and content
                excerpt: 'Test excerpt',
                category_id: 'cat1'
            };

            // Create a mock request with invalid data
            const request = new NextRequest(
                'http://localhost:3000/api/blog/posts',
                {
                    method: 'POST',
                    body: JSON.stringify(postData),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Call the POST handler
            const response = await POST(request);

            // Assertions
            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data).toHaveProperty('error');

            // Verify database was not called
            expect(db.one).not.toHaveBeenCalled();
        });

        it('should handle database errors during post creation', async () => {
            // Mock database error
            (db.one as vi.Mock).mockRejectedValueOnce(new Error('Database error'));

            // Create valid post data
            const postData = {
                title: 'New Test Post',
                content: 'Test content',
                excerpt: 'Test excerpt',
                category_id: 'cat1',
                featured: false,
                published: false
            };

            // Create a mock request
            const request = new NextRequest(
                'http://localhost:3000/api/blog/posts',
                {
                    method: 'POST',
                    body: JSON.stringify(postData),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Call the POST handler
            const response = await POST(request);

            // Assertions
            expect(response.status).toBe(500);
            const data = await response.json();
            expect(data).toHaveProperty('error');
        });
    });

    describe('OPTIONS handler', () => {
        it('should return correct CORS headers', async () => {
            const response = await OPTIONS();

            expect(response.status).toBe(204);
            expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, OPTIONS');
            expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization');
        });
    });
}); 