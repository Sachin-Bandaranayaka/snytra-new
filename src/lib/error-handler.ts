/**
 * Standardized error handling for the application
 */
import { NextResponse } from 'next/server';
import { logger } from './logger';
import { ZodError } from 'zod';

// Application-specific error classes
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly isOperational: boolean;

    constructor(
        message: string,
        statusCode = 500,
        code = 'INTERNAL_ERROR',
        isOperational = true
    ) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;

        // Preserve proper stack trace
        Error.captureStackTrace(this, this.constructor);

        // Set prototype explicitly (required in TypeScript)
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

// Common error types
export class BadRequestError extends AppError {
    constructor(message = 'Bad request', code = 'BAD_REQUEST') {
        super(message, 400, code, true);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized', code = 'UNAUTHORIZED') {
        super(message, 401, code, true);
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden', code = 'FORBIDDEN') {
        super(message, 403, code, true);
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource not found', code = 'NOT_FOUND') {
        super(message, 404, code, true);
    }
}

export class ValidationError extends AppError {
    public readonly errors: Record<string, string[]>;

    constructor(
        message = 'Validation failed',
        errors: Record<string, string[]> = {},
        code = 'VALIDATION_ERROR'
    ) {
        super(message, 422, code, true);
        this.errors = errors;
    }
}

export class DatabaseError extends AppError {
    constructor(message = 'Database error', code = 'DATABASE_ERROR') {
        super(message, 500, code, true);
    }
}

export class ExternalServiceError extends AppError {
    constructor(message = 'External service error', code = 'EXTERNAL_SERVICE_ERROR') {
        super(message, 503, code, true);
    }
}

/**
 * Handle route errors in a standardized way
 * @param error The error to handle
 * @returns A NextResponse object with appropriate status and body
 */
export function handleRouteError(error: unknown): NextResponse {
    // Default response
    const defaultResponse = {
        success: false,
        message: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
    };

    // Determine the appropriate error response
    if (error instanceof AppError) {
        // Handle our custom application errors
        logger.error(`[${error.code}] ${error.message}`, error);

        return NextResponse.json(
            {
                success: false,
                message: error.message,
                code: error.code,
                ...(error instanceof ValidationError ? { errors: error.errors } : {}),
            },
            { status: error.statusCode }
        );
    } else if (error instanceof ZodError) {
        // Handle Zod validation errors
        const formattedErrors: Record<string, string[]> = {};
        error.errors.forEach((err) => {
            const path = err.path.join('.');
            if (!formattedErrors[path]) {
                formattedErrors[path] = [];
            }
            formattedErrors[path].push(err.message);
        });

        logger.error('Validation error', { errors: formattedErrors });

        return NextResponse.json(
            {
                success: false,
                message: 'Validation failed',
                code: 'VALIDATION_ERROR',
                errors: formattedErrors,
            },
            { status: 422 }
        );
    } else if (error instanceof Error) {
        // Handle standard JS errors
        logger.error('Unexpected error', error);

        // Don't expose internal error details in production
        const isProd = process.env.NODE_ENV === 'production';
        return NextResponse.json(
            {
                success: false,
                message: isProd ? 'An unexpected error occurred' : error.message,
                code: 'INTERNAL_ERROR',
            },
            { status: 500 }
        );
    }

    // Handle unknown errors
    logger.error('Unknown error type', { error });
    return NextResponse.json(defaultResponse, { status: 500 });
}

/**
 * Wrap an async route handler with error handling
 * @param handler The async route handler function
 * @returns A function that handles errors in a standardized way
 */
export function withErrorHandling(handler: Function) {
    return async (...args: any[]) => {
        try {
            return await handler(...args);
        } catch (error) {
            return handleRouteError(error);
        }
    };
}

/**
 * Validate request input using a Zod schema
 * Throws ValidationError if validation fails
 */
export async function validateRequest<T>(
    request: Request,
    schema: any,
    errorMessage = 'Invalid request data'
): Promise<T> {
    try {
        const json = await request.json();
        return schema.parse(json);
    } catch (error) {
        if (error instanceof ZodError) {
            const formattedErrors: Record<string, string[]> = {};
            error.errors.forEach((err) => {
                const path = err.path.join('.') || 'unknown';
                if (!formattedErrors[path]) {
                    formattedErrors[path] = [];
                }
                formattedErrors[path].push(err.message);
            });

            throw new ValidationError(errorMessage, formattedErrors);
        }
        throw new BadRequestError('Could not parse request body');
    }
}

export default {
    AppError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ValidationError,
    DatabaseError,
    ExternalServiceError,
    handleRouteError,
    withErrorHandling,
    validateRequest,
}; 