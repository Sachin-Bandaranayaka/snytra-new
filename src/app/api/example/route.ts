/**
 * Example API route using standardized error handling and authentication
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createApiHandler } from '@/lib/api-handler';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

// Validation schema for POST requests
const createExampleSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100),
    description: z.string().optional(),
});

// GET: Retrieve examples (public)
export const GET = createApiHandler(
    {
        method: 'GET',
    },
    async ({ searchParams }) => {
        // Get query parameters
        const limit = parseInt(searchParams.get('limit') || '10');
        const page = parseInt(searchParams.get('page') || '1');

        // Calculate offset for pagination
        const offset = (page - 1) * limit;

        try {
            // Get examples from database
            const examples = await db.executeQuery(
                `SELECT * FROM examples ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
                [limit, offset]
            );

            // Get total count for pagination
            const countResult = await db.executeQuery(
                `SELECT COUNT(*) FROM examples`
            );

            const total = parseInt(countResult[0]?.count || '0');

            // Return successful response
            return NextResponse.json({
                success: true,
                data: examples,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit),
                },
            });
        } catch (error) {
            logger.error('Failed to fetch examples', error);
            throw error;
        }
    }
);

// POST: Create a new example (authenticated)
export const POST = createApiHandler(
    {
        method: 'POST',
        schema: createExampleSchema,
        auth: { required: true },
    },
    async ({ data, user }) => {
        try {
            // Insert example into database
            const result = await db.executeQuery(
                `INSERT INTO examples (title, description, user_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
                [data.title, data.description || null, user.id]
            );

            logger.info('Created new example', { id: result[0]?.id });

            // Return successful response
            return NextResponse.json({
                success: true,
                data: result[0],
            }, { status: 201 });
        } catch (error) {
            logger.error('Failed to create example', error);
            throw error;
        }
    }
); 