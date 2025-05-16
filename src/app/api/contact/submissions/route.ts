import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { prisma } from '@/lib/prisma';

// Helper function to authenticate admin users
async function authenticateAdmin(request: NextRequest) {
    // Get authorization header or cookie
    const authHeader = request.headers.get('Authorization');

    // Extract user from JSON in request cookies if available
    const userCookie = request.cookies.get('user')?.value;
    let user = null;

    if (userCookie) {
        try {
            user = JSON.parse(decodeURIComponent(userCookie));

            // Validate user from cookie exists in database and is admin
            if (user && user.id) {
                const dbUser = await prisma.$queryRaw`
                    SELECT id, role FROM users WHERE id = ${user.id} AND role = 'admin'
                `;

                if (dbUser && Array.isArray(dbUser) && dbUser.length > 0) {
                    return true;
                }
            }
        } catch (error) {
            console.error('Error parsing user cookie:', error);
        }
    }

    // Check auth header
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);

        // Verify token validity - this is a simplified check
        // In a real app, you'd validate JWT or another token type
        if (token) {
            try {
                // Check if token exists in database
                const tokenUser = await prisma.$queryRaw`
                    SELECT id, role FROM users 
                    WHERE remember_token = ${token} AND role = 'admin'
                `;

                if (tokenUser && Array.isArray(tokenUser) && tokenUser.length > 0) {
                    return true;
                }
            } catch (error) {
                console.error('Token validation error:', error);
            }
        }
    }

    return false;
}

export async function GET(request: NextRequest) {
    try {
        // Check if user is authenticated and has admin role
        const isAdmin = await authenticateAdmin(request);

        if (!isAdmin) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Get query parameters
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '10');
        const status = searchParams.get('status') || undefined;
        const search = searchParams.get('search') || undefined;

        // Calculate offset for pagination
        const offset = (page - 1) * pageSize;

        // Build query conditions
        let conditions = [];
        let params: any[] = [];
        let paramIndex = 1;

        if (status) {
            conditions.push(`status = $${paramIndex++}`);
            params.push(status);
        }

        if (search) {
            conditions.push(`(name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR message ILIKE $${paramIndex})`);
            params.push(`%${search}%`);
            paramIndex++;
        }

        // Create WHERE clause if conditions exist
        const whereClause = conditions.length > 0
            ? `WHERE ${conditions.join(' AND ')}`
            : '';

        // Get total count
        const countQuery = `
      SELECT COUNT(*) as total 
      FROM contact_submissions
      ${whereClause}
    `;

        const countResult = await executeQuery<any[]>(countQuery, params);
        const total = parseInt(countResult[0].total);

        // Get paginated submissions
        const selectQuery = `
      SELECT id, name, email, phone, message, status, created_at, notes
      FROM contact_submissions
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

        const dataParams = [...params, pageSize, offset];
        const submissionsResult = await executeQuery<any[]>(selectQuery, dataParams);

        const totalPages = Math.ceil(total / pageSize);

        return NextResponse.json({
            submissions: submissionsResult,
            pagination: {
                total,
                page,
                pageSize,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            }
        });

    } catch (error) {
        console.error('Error retrieving contact submissions:', error);

        return NextResponse.json(
            { error: 'Failed to retrieve contact submissions' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        // Check if user is authenticated and has admin role
        const isAdmin = await authenticateAdmin(request);

        if (!isAdmin) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { id, status, notes } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Submission ID is required' },
                { status: 400 }
            );
        }

        // Update the submission
        const updateQuery = `
      UPDATE contact_submissions
      SET 
        status = COALESCE($1, status),
        notes = COALESCE($2, notes)
      WHERE id = $3
      RETURNING id, name, email, phone, message, status, created_at, notes
    `;

        const result = await executeQuery<any[]>(updateQuery, [status, notes, id]);

        if (result.length === 0) {
            return NextResponse.json(
                { error: 'Submission not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            submission: result[0]
        });

    } catch (error) {
        console.error('Error updating contact submission:', error);

        return NextResponse.json(
            { error: 'Failed to update contact submission' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 