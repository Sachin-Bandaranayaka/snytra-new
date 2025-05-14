/**
 * Tests for the example API route
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { NextResponse } from 'next/server';
import { GET, POST } from './route';
import {
    createMockRequest,
    mockAuth,
    mockUser,
    expectSuccessResponse,
    expectErrorResponse
} from '@/lib/test-utils';
import { db } from '@/lib/db';

// Mock the database
vi.mock('@/lib/db', () => ({
    db: {
        executeQuery: vi.fn(),
    },
}));

describe('Example API Routes', () => {
    describe('GET /api/example', () => {
        it('should return a list of examples', async () => {
            // Mock database response
            const mockExamples = [
                { id: '1', title: 'Example 1', description: 'Test description 1' },
                { id: '2', title: 'Example 2', description: 'Test description 2' },
            ];

            // Setup db mock
            vi.mocked(db.executeQuery).mockImplementation((query) => {
                if (query.includes('COUNT')) {
                    return Promise.resolve([{ count: '2' }]);
                }
                return Promise.resolve(mockExamples);
            });

            // Create mock request
            const req = createMockRequest({
                method: 'GET',
                url: 'http://localhost:3000/api/example?limit=10&page=1',
            });

            // Call the handler
            const response = await GET(req);

            // Assert the response
            expect(response).toBeInstanceOf(NextResponse);
            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data).toEqual(mockExamples);
            expect(data.pagination).toEqual({
                total: 2,
                page: 1,
                limit: 10,
                pages: 1,
            });
        });

        it('should handle pagination parameters', async () => {
            // Setup db mock
            vi.mocked(db.executeQuery).mockImplementation((query, params) => {
                if (query.includes('COUNT')) {
                    return Promise.resolve([{ count: '100' }]);
                }

                // Verify the pagination parameters
                expect(params[0]).toBe(5);  // limit
                expect(params[1]).toBe(10); // offset

                return Promise.resolve([]);
            });

            // Create mock request with pagination
            const req = createMockRequest({
                method: 'GET',
                url: 'http://localhost:3000/api/example?limit=5&page=3',
            });

            // Call the handler
            const response = await GET(req);

            // Assert the pagination
            const data = await response.json();
            expect(data.pagination).toEqual({
                total: 100,
                page: 3,
                limit: 5,
                pages: 20,
            });
        });

        it('should handle database errors', async () => {
            // Setup db mock to throw an error
            vi.mocked(db.executeQuery).mockRejectedValue(new Error('Database error'));

            // Create mock request
            const req = createMockRequest({ method: 'GET' });

            // Call the handler and expect an error
            try {
                await GET(req);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toBe('Database error');
            }
        });
    });

    describe('POST /api/example', () => {
        // Setup auth mock
        let authCleanup;

        beforeAll(() => {
            const mockAuthResult = mockAuth(mockUser);
            authCleanup = mockAuthResult.cleanup;
        });

        afterAll(() => {
            authCleanup();
        });

        it('should create a new example', async () => {
            // Mock example data
            const exampleData = {
                title: 'New Example',
                description: 'This is a test example',
            };

            // Mock database response
            const createdExample = {
                id: '123',
                ...exampleData,
                user_id: mockUser.id,
                created_at: new Date().toISOString(),
            };

            // Setup db mock
            vi.mocked(db.executeQuery).mockResolvedValue([createdExample]);

            // Create mock request
            const req = createMockRequest({
                method: 'POST',
                body: exampleData,
            });

            // Call the handler
            const response = await POST(req);

            // Assert the response
            expectSuccessResponse(response);
            expect(response.status).toBe(201);

            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data).toEqual(createdExample);
        });

        it('should validate request data', async () => {
            // Invalid example data (missing title)
            const invalidData = {
                description: 'No title provided',
            };

            // Create mock request
            const req = createMockRequest({
                method: 'POST',
                body: invalidData,
            });

            // Call the handler
            const response = await POST(req);

            // Assert the response
            expectErrorResponse(response, 422);

            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.code).toBe('VALIDATION_ERROR');
            expect(data.errors).toBeDefined();
        });
    });
}); 