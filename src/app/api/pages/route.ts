import { NextRequest, NextResponse } from 'next/server';
import { pool, sql } from '@/lib/db';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

// Helper: Check admin authentication using cookies API and database verification
async function isAdmin() {
    try {
        // Get admin email from cookies - using the server-side cookies API
        const cookieStore = cookies();
        const adminEmail = await cookieStore.get('admin_email')?.value;

        if (!adminEmail) {
            return false;
        }

        // Verify admin role in database
        const admin = await sql`
            SELECT role FROM users WHERE email = ${adminEmail} LIMIT 1
        `;

        if (!admin || admin.length === 0 || admin[0].role !== 'admin') {
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error verifying admin:', error);
        return false;
    }
}

// GET: List all pages
export async function GET() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    try {
        const result = await executeQuery<any[]>('SELECT * FROM pages ORDER BY id ASC');
        return NextResponse.json({ pages: result, success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
    }
}

// POST: Create a new page
export async function POST(request: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    try {
        const { title, slug, status, content } = await request.json();
        if (!title || !slug) {
            return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 });
        }
        const result = await executeQuery<any[]>(
            'INSERT INTO pages (title, slug, status, content) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, slug, status || 'draft', content || '']
        );
        return NextResponse.json({ page: result[0], success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
    }
}

// PATCH: Update a page (expects id in body)
export async function PATCH(request: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    try {
        const { id, title, slug, status, content } = await request.json();
        if (!id) {
            return NextResponse.json({ error: 'Page ID is required' }, { status: 400 });
        }
        const result = await executeQuery<any[]>(
            'UPDATE pages SET title = $1, slug = $2, status = $3, content = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
            [title, slug, status, content, id]
        );
        if (result.length === 0) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }
        return NextResponse.json({ page: result[0], success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
    }
}

// DELETE: Delete a page (expects id in body)
export async function DELETE(request: NextRequest) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    try {
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ error: 'Page ID is required' }, { status: 400 });
        }
        const result = await executeQuery<any[]>('DELETE FROM pages WHERE id = $1 RETURNING *', [id]);
        if (result.length === 0) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
    }
} 