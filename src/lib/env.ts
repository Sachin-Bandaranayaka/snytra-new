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

    // Authentication (NextAuth)
    NEXTAUTH_URL: z.string().url('NextAuth URL must be a valid URL'),
    NEXTAUTH_SECRET: z.string().min(1, 'NextAuth secret is required'),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),

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

// Process environment variables
function processEnv() {
    // Use environment variables
    const _env = {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL,

        // Authentication
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

        // Stripe
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,

        // Email (Resend)
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        EMAIL_FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS,

        // Uploadthing
        UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
        UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID,

        // URLs
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,

        // Analytics
        NEXT_PUBLIC_ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID,

        // Feature flags
        ENABLE_EXPERIMENTAL_FEATURES: process.env.ENABLE_EXPERIMENTAL_FEATURES,
    };

    try {
        return envSchema.parse(_env);
    } catch (error: any) {
        if (error.errors) {
            const missingVars = error.errors
                .map((err: any) => `${err.path.join('.')}: ${err.message}`)
                .join('\n');

            logger.error(`Environment validation error: \n${missingVars}`);

            if (process.env.NODE_ENV === 'development') {
                console.error('\n❌ Invalid environment variables:', error.format());
            }
        }

        throw new Error('Invalid environment variables');
    }
}

// Parse and validated environment
const env = processEnv();

// Export validated environment
export default env; 