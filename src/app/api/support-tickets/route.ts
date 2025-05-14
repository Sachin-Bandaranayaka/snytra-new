import { NextRequest, NextResponse } from 'next/server';
import { getConnectionPool, executeQuery } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        // Get user and limit from query params
        const { searchParams } = new URL(request.url);
        const userParam = searchParams.get('user');
        const limitParam = searchParams.get('limit');
        const statusParam = searchParams.get('status');

        // Build the query
        let query = `
            SELECT t.*, u.name as user_name, a.name as assigned_name
            FROM support_tickets t
            LEFT JOIN users u ON t.user_id = u.id
            LEFT JOIN users a ON t.assigned_to = a.id
            WHERE 1=1
        `;

        const queryParams = [];
        let paramIndex = 1;

        // Add filters if provided
        if (userParam) {
            query += ` AND t.user_id = $${paramIndex}`;
            queryParams.push(parseInt(userParam, 10));
            paramIndex++;
        }

        if (statusParam) {
            query += ` AND t.status = $${paramIndex}`;
            queryParams.push(statusParam);
            paramIndex++;
        }

        // Add ordering
        query += ` ORDER BY t.created_at DESC`;

        // Add limit if provided
        if (limitParam) {
            query += ` LIMIT $${paramIndex}`;
            queryParams.push(parseInt(limitParam, 10));
        }

        // Use executeQuery instead of direct pool.query
        const tickets = await executeQuery(query, queryParams);

        return NextResponse.json({
            tickets,
            success: true
        });
    } catch (error) {
        console.error('Error fetching support tickets:', error);
        return NextResponse.json(
            { error: 'Failed to fetch support tickets', success: false },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        let data;
        if (request.headers.get('content-type')?.includes('multipart/form-data')) {
            // Handle form data
            const formData = await request.formData();
            data = {
                userId: formData.get('userId'),
                title: formData.get('title'),
                description: formData.get('description'),
                priority: formData.get('priority'),
                category: formData.get('category')
            };
            // Handle file attachments if needed later
        } else {
            // Handle JSON data
            data = await request.json();
        }

        const { userId, title, description, priority, category } = data;

        // Validate input
        if (!userId || !title || !description) {
            return NextResponse.json(
                { error: 'User ID, title, and description are required', success: false },
                { status: 400 }
            );
        }

        // First check if the user exists
        const userCheck = await executeQuery('SELECT id FROM users WHERE id = $1', [userId]);
        if (userCheck.length === 0) {
            return NextResponse.json(
                { error: 'User does not exist. Please log out and log in again.', success: false },
                { status: 400 }
            );
        }

        // Insert the new ticket
        const query = `
            INSERT INTO support_tickets (
                user_id, title, description, priority, category, status, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            RETURNING *
        `;

        const result = await executeQuery(query, [
            userId,
            title,
            description,
            priority || 'medium',
            category || null,
            'open'
        ]);

        return NextResponse.json({
            ticket: result[0],
            success: true
        });
    } catch (error: any) {
        console.error('Error creating support ticket:', error);

        // Better error handling for foreign key constraint violations
        if (error.code === '23503') { // Foreign key violation
            return NextResponse.json(
                {
                    error: 'Invalid user ID. Please log out and log in again.',
                    details: error.detail,
                    success: false
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create support ticket', success: false },
            { status: 500 }
        );
    }
} 