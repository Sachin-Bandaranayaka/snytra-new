import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { sql } from '@/db/postgres';
import { isUserAdmin } from '@/lib/authUtils';

// Mock dependencies
vi.mock('@/db/postgres', () => ({
    sql: vi.fn(),
}));

vi.mock('@/lib/authUtils', () => ({
    isUserAdmin: vi.fn(),
}));

// Properly mock Next.js objects
vi.mock('next/server', () => {
    // Create a proper NextResponse mock with working json method
    class MockNextResponse {
        status = 200;
        headers = new Map();
        data = null;

        constructor(data, options = {}) {
            this.data = data;
            if (options.status) {
                this.status = options.status;
            }
        }

        // This is the method called in the route handler
        static json(data, options = {}) {
            return new MockNextResponse(data, options);
        }

        // This is the method called in tests
        json() {
            return Promise.resolve(this.data);
        }
    }

    // Create a proper NextRequest mock
    class MockNextRequest {
        url = '';
        method = 'GET';
        bodyContent = '';

        constructor(url, init = {}) {
            this.url = url;
            this.method = init.method || 'GET';
            this.bodyContent = init.body || '{}';
        }

        // This is what the POST handler uses
        json() {
            return Promise.resolve(JSON.parse(this.bodyContent));
        }
    }

    return {
        NextResponse: MockNextResponse,
        NextRequest: MockNextRequest
    };
});

vi.mock('next/headers', () => ({
    cookies: () => ({
        set: vi.fn(),
        get: vi.fn(),
    }),
}));

describe('Maintenance Status API', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('GET handler', () => {
        it('should return maintenance mode status as false if not set in database', async () => {
            // Mock the database response
            (sql as any).mockResolvedValueOnce([]);

            // Call the GET handler
            const response = await GET();
            const data = await response.json();

            // Assertions
            expect(data).toEqual({ maintenanceMode: false });
            // SQL is called as a tagged template literal, so we just verify it was called
            expect(sql).toHaveBeenCalled();
        });

        it('should return maintenance mode status as true if set in database', async () => {
            // Mock the database response
            (sql as any).mockResolvedValueOnce([{ maintenance_mode: 'true' }]);

            // Call the GET handler
            const response = await GET();
            const data = await response.json();

            // Assertions
            expect(data).toEqual({ maintenanceMode: true });
        });

        it('should handle errors gracefully', async () => {
            // Mock a database error
            (sql as any).mockRejectedValueOnce(new Error('Database error'));

            // Call the GET handler
            const response = await GET();
            const data = await response.json();

            // Assertions
            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Failed to check maintenance mode' });
        });
    });

    describe('POST handler', () => {
        it('should return 401 if user is not admin', async () => {
            // Mock isUserAdmin to return false
            (isUserAdmin as any).mockResolvedValueOnce(false);

            // Create a mock request
            const request = new NextRequest('http://localhost:3000/api/maintenance-status', {
                method: 'POST',
                body: JSON.stringify({ maintenanceMode: true }),
            });

            // Call the POST handler
            const response = await POST(request);
            const data = await response.json();

            // Assertions
            expect(response.status).toBe(401);
            expect(data).toEqual({ error: 'Unauthorized' });
            expect(isUserAdmin).toHaveBeenCalled();
            expect(sql).not.toHaveBeenCalled();
        });

        it('should return 400 if maintenanceMode is not a boolean', async () => {
            // Mock isUserAdmin to return true
            (isUserAdmin as any).mockResolvedValueOnce(true);

            // Create a mock request with invalid data
            const request = new NextRequest('http://localhost:3000/api/maintenance-status', {
                method: 'POST',
                body: JSON.stringify({ maintenanceMode: 'not-a-boolean' }),
            });

            // Call the POST handler
            const response = await POST(request);
            const data = await response.json();

            // Assertions
            expect(response.status).toBe(400);
            expect(data).toEqual({ error: 'maintenanceMode must be a boolean' });
        });

        it('should update maintenance mode when user is admin and data is valid', async () => {
            // Mock isUserAdmin to return true
            (isUserAdmin as any).mockResolvedValueOnce(true);

            // Mock database responses
            (sql as any).mockResolvedValueOnce([{ value: { enableRegistration: true } }])
                .mockResolvedValueOnce([{ key: 'advanced', value: { enableRegistration: true, maintenanceMode: true } }]);

            // Create a mock request with valid data
            const request = new NextRequest('http://localhost:3000/api/maintenance-status', {
                method: 'POST',
                body: JSON.stringify({ maintenanceMode: true }),
            });

            // Call the POST handler
            const response = await POST(request);
            const data = await response.json();

            // Assertions
            expect(data).toEqual({ success: true, maintenanceMode: true });
            expect(sql).toHaveBeenCalledTimes(2);
        });

        it('should handle errors gracefully', async () => {
            // Mock isUserAdmin to return true
            (isUserAdmin as any).mockResolvedValueOnce(true);

            // Mock a database error
            (sql as any).mockRejectedValueOnce(new Error('Database error'));

            // Create a mock request
            const request = new NextRequest('http://localhost:3000/api/maintenance-status', {
                method: 'POST',
                body: JSON.stringify({ maintenanceMode: true }),
            });

            // Call the POST handler
            const response = await POST(request);
            const data = await response.json();

            // Assertions
            expect(response.status).toBe(500);
            expect(data).toEqual({ error: 'Failed to update maintenance mode' });
        });
    });
}); 