/**
 * Standardized API route handler creator
 * Provides consistent error handling, validation, and authentication for API routes
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from './logger';
import {
    handleRouteError,
    BadRequestError,
    UnauthorizedError,
    ValidationError
} from './error-handler';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Types for route handler configuration
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiHandlerOptions<T = any> {
    method: HttpMethod | HttpMethod[];
    schema?: z.ZodType<T>;
    auth?: {
        required: boolean;
        roles?: string[];
    };
    rateLimit?: {
        maxRequests: number;
        windowMs: number;
    };
}

interface ApiHandlerContext<T = any> {
    req: NextRequest;
    params: Record<string, string>;
    searchParams: URLSearchParams;
    data?: T;
    user?: any;
}

// Helper function to validate request against a Zod schema
async function validateData<T>(req: NextRequest, schema?: z.ZodType<T>): Promise<T | undefined> {
    if (!schema) return undefined;

    try {
        // Only attempt to parse body for methods that might have one
        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            const body = await req.json();
            return schema.parse(body);
        }
        return undefined;
    } catch (error) {
        if (error instanceof z.ZodError) {
            const formattedErrors: Record<string, string[]> = {};
            error.errors.forEach((err) => {
                const path = err.path.join('.') || 'unknown';
                if (!formattedErrors[path]) {
                    formattedErrors[path] = [];
                }
                formattedErrors[path].push(err.message);
            });

            throw new ValidationError('Validation failed', formattedErrors);
        }
        throw new BadRequestError('Invalid request data');
    }
}

// Helper function to authenticate the request
async function authenticateRequest(
    req: NextRequest,
    auth?: ApiHandlerOptions['auth']
) {
    if (!auth?.required) return null;

    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            throw new UnauthorizedError('Authentication required');
        }

        // Check if user has required role
        if (auth.roles && auth.roles.length > 0) {
            const userRole = session.user.role || 'user';
            if (!auth.roles.includes(userRole)) {
                throw new UnauthorizedError('Insufficient permissions');
            }
        }

        return session.user;
    } catch (error) {
        if (error instanceof UnauthorizedError) {
            throw error;
        }
        logger.error('Authentication error', error);
        throw new UnauthorizedError('Authentication failed');
    }
}

/**
 * Create a standardized API route handler
 * 
 * @example
 * export const GET = createApiHandler({
 *   method: 'GET',
 *   auth: { required: true, roles: ['admin'] },
 * }, async ({ req, user }) => {
 *   // Your handler logic here
 *   return NextResponse.json({ data: 'Success' });
 * });
 */
export function createApiHandler<T = any>(
    options: ApiHandlerOptions<T>,
    handler: (context: ApiHandlerContext<T>) => Promise<NextResponse>
) {
    return async (req: NextRequest, { params = {} }: { params?: Record<string, string> } = {}) => {
        try {
            // Validate HTTP method
            const allowedMethods = Array.isArray(options.method)
                ? options.method
                : [options.method];

            if (!allowedMethods.includes(req.method as HttpMethod)) {
                return NextResponse.json(
                    { error: `Method ${req.method} Not Allowed` },
                    { status: 405 }
                );
            }

            // Extract search params
            const searchParams = req.nextUrl.searchParams;

            // Authenticate user if required
            const user = await authenticateRequest(req, options.auth);

            // Validate request data against schema
            const data = await validateData<T>(req, options.schema);

            // Call the handler with context
            return await handler({
                req,
                params,
                searchParams,
                data,
                user,
            });
        } catch (error) {
            return handleRouteError(error);
        }
    };
}

export default createApiHandler; 