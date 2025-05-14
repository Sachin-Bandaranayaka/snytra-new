/**
 * Test setup file for running tests with Vitest
 */
import { expect, afterAll, beforeAll, afterEach, vi } from 'vitest';
import { configureLogger } from '../lib/logger';
import { cleanupTestDb } from '../lib/test-utils';

// Configure environment for testing
process.env.NODE_ENV = 'test';
process.env.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

// Mock fetch globally
import { fetch, Headers, Request, Response } from 'cross-fetch';
global.fetch = fetch;
global.Headers = Headers;
global.Request = Request;
global.Response = Response;

// Disable all logging in tests
configureLogger({
    enabled: false,
});

// Mock environment variables
vi.mock('../lib/env', () => {
    return {
        publicEnv: {
            NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
            NEXT_PUBLIC_STACK_PROJECT_ID: 'test-project-id',
            NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: 'pck_test',
            NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test',
            NEXT_PUBLIC_ANALYTICS_ID: 'test-analytics',
            ENABLE_EXPERIMENTAL_FEATURES: false,
            NODE_ENV: 'test',
            IS_PRODUCTION: false,
            IS_DEVELOPMENT: false,
            IS_TEST: true,
        },
        serverEnv: {
            NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
            NEXT_PUBLIC_STACK_PROJECT_ID: 'test-project-id',
            NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: 'pck_test',
            NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test',
            NEXT_PUBLIC_ANALYTICS_ID: 'test-analytics',
            ENABLE_EXPERIMENTAL_FEATURES: false,
            NODE_ENV: 'test',
            IS_PRODUCTION: false,
            IS_DEVELOPMENT: false,
            IS_TEST: true,
            DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
            STACK_SECRET_SERVER_KEY: 'ssk_test',
            STRIPE_SECRET_KEY: 'sk_test',
            STRIPE_WEBHOOK_SECRET: 'whsec_test',
            RESEND_API_KEY: 'test_api_key',
            EMAIL_FROM_ADDRESS: 'test@example.com',
            UPLOADTHING_SECRET: 'sk_test',
            UPLOADTHING_APP_ID: 'test-app-id',
        },
        default: {
            publicEnv: {
                NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
                NEXT_PUBLIC_STACK_PROJECT_ID: 'test-project-id',
                NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: 'pck_test',
                NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test',
                NEXT_PUBLIC_ANALYTICS_ID: 'test-analytics',
                ENABLE_EXPERIMENTAL_FEATURES: false,
                NODE_ENV: 'test',
                IS_PRODUCTION: false,
                IS_DEVELOPMENT: false,
                IS_TEST: true,
            },
            serverEnv: {
                NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
                NEXT_PUBLIC_STACK_PROJECT_ID: 'test-project-id',
                NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: 'pck_test',
                NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test',
                NEXT_PUBLIC_ANALYTICS_ID: 'test-analytics',
                ENABLE_EXPERIMENTAL_FEATURES: false,
                NODE_ENV: 'test',
                IS_PRODUCTION: false,
                IS_DEVELOPMENT: false,
                IS_TEST: true,
                DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
                STACK_SECRET_SERVER_KEY: 'ssk_test',
                STRIPE_SECRET_KEY: 'sk_test',
                STRIPE_WEBHOOK_SECRET: 'whsec_test',
                RESEND_API_KEY: 'test_api_key',
                EMAIL_FROM_ADDRESS: 'test@example.com',
                UPLOADTHING_SECRET: 'sk_test',
                UPLOADTHING_APP_ID: 'test-app-id',
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

// Set up an optional database cleanup after all tests
afterAll(async () => {
    await cleanupTestDb();
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