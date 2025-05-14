/**
 * Testing utilities for the application
 * This provides helper functions for unit and integration tests
 */
import { NextRequest, NextResponse } from 'next/server';
import { vi, expect } from 'vitest';
import { PrismaClient } from '../generated/prisma';
import { configureLogger } from './logger';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Configure logger for tests
configureLogger({
    enabled: false,  // Disable logging in tests by default
});

// Mock user for authentication tests
export const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
};

// Mock admin user for admin tests
export const mockAdminUser = {
    id: 'test-admin-id',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
};

// Mock NextRequest creator
export function createMockRequest(options: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    cookies?: Record<string, string>;
    body?: any;
}) {
    const {
        method = 'GET',
        url = 'http://localhost:3000',
        headers = {},
        cookies = {},
        body = null
    } = options;

    let bodyText = body ? JSON.stringify(body) : null;

    // Create a mock Request object
    const request = new Request(url, {
        method,
        headers: new Headers(headers),
        body: bodyText,
    });

    // Create a NextRequest from the Request
    const nextRequest = new NextRequest(request, {
        geo: { country: 'US' },
        ip: '127.0.0.1',
        nextUrl: new URL(url),
    });

    // Add cookies
    Object.entries(cookies).forEach(([key, value]) => {
        nextRequest.cookies.set(key, value);
    });

    return nextRequest;
}

// Mock auth for testing API routes
export function mockAuth(user = mockUser) {
    // Mock NextAuth session
    vi.mock('next-auth/next', () => ({
        getServerSession: vi.fn().mockResolvedValue({
            user: user
        })
    }));

    return {
        cleanup: () => {
            vi.restoreAllMocks();
        }
    };
}

// Test database utilities
let prismaClient: PrismaClient | null = null;

// Get a test database client
export function getTestDb() {
    if (!prismaClient) {
        // Use test database URL
        process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

        if (!process.env.DATABASE_URL) {
            throw new Error('TEST_DATABASE_URL environment variable is required for tests');
        }

        prismaClient = new PrismaClient();
    }

    return prismaClient;
}

// Clean up test database
export async function cleanupTestDb() {
    if (prismaClient) {
        await prismaClient.$disconnect();
        prismaClient = null;
    }
}

// Create a test transaction that will be rolled back
export async function withTestTransaction<T>(
    callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
    const prisma = getTestDb();

    // Start transaction
    const [result] = await prisma.$transaction(async (tx) => {
        const result = await callback(tx as unknown as PrismaClient);
        return [result];
    });

    return result;
}

// Custom response assertions
export function expectSuccessResponse(response: NextResponse) {
    expect(response.status).toBeLessThan(400);

    // Check if response has JSON body
    if (response.headers.get('content-type')?.includes('application/json')) {
        const data = response.json();
        return { ...expect(data), data };
    }

    return expect(response);
}

export function expectErrorResponse(response: NextResponse, statusCode?: number) {
    if (statusCode) {
        expect(response.status).toBe(statusCode);
    } else {
        expect(response.status).toBeGreaterThanOrEqual(400);
    }

    // Check if response has JSON body
    if (response.headers.get('content-type')?.includes('application/json')) {
        const data = response.json();
        return { ...expect(data), data };
    }

    return expect(response);
}

export default {
    mockUser,
    mockAdminUser,
    createMockRequest,
    mockAuth,
    getTestDb,
    cleanupTestDb,
    withTestTransaction,
    expectSuccessResponse,
    expectErrorResponse,
}; 