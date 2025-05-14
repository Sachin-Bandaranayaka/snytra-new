/**
 * Validated environment variables
 * This module validates all required environment variables at startup
 * and provides typed access to them throughout the application.
 */
import { z } from 'zod';
import { logger } from './logger';

// Schema for environment variables
const envSchema = z.object({
    // Node environment
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // Database
    DATABASE_URL: z.string().min(1, 'Database URL is required'),

    // Authentication (Stack Auth)
    NEXT_PUBLIC_STACK_PROJECT_ID: z.string().min(1, 'Stack Auth project ID is required'),
    NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: z.string().min(1, 'Stack Auth publishable key is required'),
    STACK_SECRET_SERVER_KEY: z.string().min(1, 'Stack Auth secret key is required'),

    // Stripe (Payment processing)
    STRIPE_SECRET_KEY: z.string().min(1, 'Stripe secret key is required'),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1, 'Stripe publishable key is required'),
    STRIPE_WEBHOOK_SECRET: z.string().min(1, 'Stripe webhook secret is required'),

    // Email service (Resend)
    RESEND_API_KEY: z.string().min(1, 'Resend API key is required'),
    EMAIL_FROM_ADDRESS: z.string().email('Valid from email is required'),

    // File uploads (Uploadthing)
    UPLOADTHING_SECRET: z.string().min(1, 'Uploadthing secret is required'),
    UPLOADTHING_APP_ID: z.string().min(1, 'Uploadthing app ID is required'),

    // Application URLs
    NEXT_PUBLIC_APP_URL: z.string().url('Valid app URL is required'),

    // Optional: Analytics
    NEXT_PUBLIC_ANALYTICS_ID: z.string().optional(),

    // Optional: Feature flags
    ENABLE_EXPERIMENTAL_FEATURES: z.enum(['true', 'false']).optional().default('false'),
});

// Process environment object with defaults for optional values
const _env = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_STACK_PROJECT_ID: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
    NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
    STACK_SECRET_SERVER_KEY: process.env.STACK_SECRET_SERVER_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS,
    UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
    UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID,
    ENABLE_EXPERIMENTAL_FEATURES: process.env.ENABLE_EXPERIMENTAL_FEATURES,
};

// Validate environment variables
function validateEnv() {
    const result = envSchema.safeParse(_env);

    if (!result.success) {
        console.error('❌ Invalid environment variables:');
        const errors = result.error.flatten().fieldErrors;

        // Log each validation error
        Object.entries(errors).forEach(([key, value]) => {
            console.error(`- ${key}: ${value?.join(', ')}`);
        });

        // In production, we want to fail fast if environment is not configured correctly
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Invalid environment variables, check server logs for details');
        } else {
            // In development, just log a warning
            console.warn('⚠️ Fix environment variables before deploying to production!');
        }

        return false;
    }

    return true;
}

// Exported validated environment
const isValid = validateEnv();

// Public environment variables (safe to use on the client)
export const publicEnv = {
    NEXT_PUBLIC_APP_URL: _env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_STACK_PROJECT_ID: _env.NEXT_PUBLIC_STACK_PROJECT_ID,
    NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: _env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: _env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_ANALYTICS_ID: _env.NEXT_PUBLIC_ANALYTICS_ID,
    ENABLE_EXPERIMENTAL_FEATURES: _env.ENABLE_EXPERIMENTAL_FEATURES === 'true',
    NODE_ENV: _env.NODE_ENV,
    IS_PRODUCTION: _env.NODE_ENV === 'production',
    IS_DEVELOPMENT: _env.NODE_ENV === 'development',
    IS_TEST: _env.NODE_ENV === 'test',
};

// Server environment variables (only use on the server)
export const serverEnv = {
    ...publicEnv,
    DATABASE_URL: _env.DATABASE_URL,
    STACK_SECRET_SERVER_KEY: _env.STACK_SECRET_SERVER_KEY,
    STRIPE_SECRET_KEY: _env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: _env.STRIPE_WEBHOOK_SECRET,
    RESEND_API_KEY: _env.RESEND_API_KEY,
    EMAIL_FROM_ADDRESS: _env.EMAIL_FROM_ADDRESS,
    UPLOADTHING_SECRET: _env.UPLOADTHING_SECRET,
    UPLOADTHING_APP_ID: _env.UPLOADTHING_APP_ID,
};

// Log environment status on server startup
if (typeof window === 'undefined') {
    if (isValid) {
        logger.info(`Environment validated successfully (${_env.NODE_ENV})`);
    } else {
        logger.warn(`Environment validation failed (${_env.NODE_ENV})`);
    }
}

export default { publicEnv, serverEnv }; 