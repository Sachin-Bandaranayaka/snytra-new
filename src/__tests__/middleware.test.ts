import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../middleware';

// Mock NextResponse
vi.mock('next/server', async () => {
    const actual = await vi.importActual('next/server');
    return {
        ...actual,
        NextResponse: {
            next: vi.fn(() => ({ type: 'next' })),
            rewrite: vi.fn((url) => ({ type: 'rewrite', url })),
        },
    };
});

describe('Middleware Tests', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    function createMockRequest(path: string, cookies: Record<string, string> = {}) {
        const url = new URL(`http://localhost:3000${path}`);

        const cookieStore = new Map<string, { name: string; value: string }>();
        Object.entries(cookies).forEach(([name, value]) => {
            cookieStore.set(name, { name, value });
        });

        return {
            nextUrl: url,
            url: url.toString(),
            cookies: {
                get: (name: string) => cookieStore.get(name),
                getAll: () => Array.from(cookieStore.values()),
                has: (name: string) => cookieStore.has(name),
                set: vi.fn(),
                delete: vi.fn(),
            },
        } as unknown as NextRequest;
    }

    it('should allow access to allowed paths regardless of maintenance mode', async () => {
        const allowedPaths = [
            '/api/settings',
            '/api/auth/session',
            '/api/maintenance-status',
            '/admin/dashboard',
            '/login',
            '/auth/signin',
            '/maintenance',
        ];

        for (const path of allowedPaths) {
            const request = createMockRequest(path, { maintenance_mode: 'true' });
            await middleware(request);

            expect(NextResponse.next).toHaveBeenCalled();
            expect(NextResponse.rewrite).not.toHaveBeenCalled();

            vi.resetAllMocks();
        }
    });

    it('should allow access to regular paths when maintenance mode is off', async () => {
        const request = createMockRequest('/products', { maintenance_mode: 'false' });

        await middleware(request);

        expect(NextResponse.next).toHaveBeenCalled();
        expect(NextResponse.rewrite).not.toHaveBeenCalled();
    });

    it('should redirect to maintenance page when maintenance mode is on', async () => {
        const request = createMockRequest('/products', { maintenance_mode: 'true' });

        await middleware(request);

        expect(NextResponse.next).not.toHaveBeenCalled();
        expect(NextResponse.rewrite).toHaveBeenCalledWith(
            expect.objectContaining({
                pathname: '/maintenance',
            })
        );
    });

    it('should allow admin access to protected paths even when maintenance mode is on', async () => {
        const request = createMockRequest(
            '/products',
            {
                maintenance_mode: 'true',
                'next-auth.session-token': 'admin-token',
            }
        );

        await middleware(request);

        expect(NextResponse.next).toHaveBeenCalled();
        expect(NextResponse.rewrite).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
        // Create a request that will cause an error
        const request = createMockRequest('/products');

        // Make cookies.get throw an error
        request.cookies.get = vi.fn().mockImplementation(() => {
            throw new Error('Cookie error');
        });

        await middleware(request);

        // Should default to allowing the request through
        expect(NextResponse.next).toHaveBeenCalled();
    });
}); 