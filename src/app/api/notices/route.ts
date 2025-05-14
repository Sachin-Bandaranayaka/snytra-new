import { NextRequest, NextResponse } from 'next/server';
import { getConnectionPool, executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        // Get query parameters
        const { searchParams } = new URL(request.url);
        const limitParam = searchParams.get('limit');
        const importantParam = searchParams.get('important');

        // Build query
        let query = `
            SELECT * 
            FROM notices 
            WHERE published = true 
            AND (expires_at IS NULL OR expires_at > NOW())
        `;

        const queryParams = [];
        let paramIndex = 1;

        // Add filter for important notices if requested
        if (importantParam === 'true') {
            query += ` AND important = true`;
        }

        // Add ordering
        query += ` ORDER BY created_at DESC`;

        // Add limit if provided
        if (limitParam) {
            query += ` LIMIT $${paramIndex}`;
            queryParams.push(parseInt(limitParam, 10));
        }

        const result = await executeQuery(query, queryParams);

        return NextResponse.json({
            notices: result,
            success: true
        });
    } catch (error) {
        console.error('Error fetching notices:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notices', success: false },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { title, content, important, expiresAt } = data;

        // Validate input
        if (!title || !content) {
            return NextResponse.json(
                { error: 'Title and content are required', success: false },
                { status: 400 }
            );
        }

        // Insert the new notice
        const query = `
            INSERT INTO notices (
                title, content, important, expires_at, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, NOW(), NOW())
            RETURNING *
        `;

        const result = await executeQuery(query, [
            title,
            content,
            important || false,
            expiresAt || null
        ]);

        return NextResponse.json({
            notice: result[0],
            success: true
        });
    } catch (error) {
        console.error('Error creating notice:', error);
        return NextResponse.json(
            { error: 'Failed to create notice', success: false },
            { status: 500 }
        );
    }
} 