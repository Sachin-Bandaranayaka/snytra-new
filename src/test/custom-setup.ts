/**
 * Custom test setup file for running tests without Stack Auth dependencies
 */
import { expect, vi } from 'vitest';

// Configure environment for testing
process.env.NODE_ENV = 'test';

// Mock fetch globally
import { fetch, Headers, Request, Response } from 'cross-fetch';
global.fetch = fetch;
global.Headers = Headers;
global.Request = Request;
global.Response = Response;

// Mock environment variables
vi.mock('../lib/env', () => {
    return {
        publicEnv: {
            NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
            NODE_ENV: 'test',
            IS_PRODUCTION: false,
            IS_DEVELOPMENT: false,
            IS_TEST: true,
        },
        serverEnv: {
            NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
            NODE_ENV: 'test',
            IS_PRODUCTION: false,
            IS_DEVELOPMENT: false,
            IS_TEST: true,
            DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
        },
        default: {
            publicEnv: {
                NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
                NODE_ENV: 'test',
                IS_PRODUCTION: false,
                IS_DEVELOPMENT: false,
                IS_TEST: true,
            },
            serverEnv: {
                NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
                NODE_ENV: 'test',
                IS_PRODUCTION: false,
                IS_DEVELOPMENT: false,
                IS_TEST: true,
                DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
            },
        },
    };
});

// Setup global mocks
vi.mock('next/headers', () => {
    return {
        cookies: () => ({
            get: vi.fn().mockReturnValue({ value: 'test-cookie' }),
            set: vi.fn(),
            delete: vi.fn(),
        }),
        headers: () => ({
            get: (header: string) => {
                if (header === 'x-forwarded-for') return '127.0.0.1';
                if (header === 'user-agent') return 'vitest-agent';
                return null;
            },
        }),
    };
});

// Custom matcher for dates
expect.extend({
    toBeValidDate(received) {
        const pass = received instanceof Date && !isNaN(received.getTime());
        if (pass) {
            return {
                message: () => `expected ${received} not to be a valid Date object`,
                pass: true,
            };
        } else {
            return {
                message: () => `expected ${received} to be a valid Date object`,
                pass: false,
            };
        }
    },
}); 