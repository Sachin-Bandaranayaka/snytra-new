// src/app/api/pages/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getSqlClient, executeQuery } from '@/lib/db';
import { isUserAdmin } from '@/lib/authUtils';
import { prisma } from '@/lib/prisma';

// GET: List all pages
export async function GET() {
    try {
        // Check auth only after attempting to connect to avoid silent failures
        const isAdmin = await isUserAdmin();
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized', success: false }, { status: 403 });
        }

        // Get all pages with proper error handling
        const result = await executeQuery<any[]>('SELECT * FROM pages ORDER BY menu_order ASC, title ASC');

        if (!result || !Array.isArray(result)) {
            console.error('Pages query returned invalid result:', result);
            return NextResponse.json({
                error: 'Database returned invalid result',
                success: false,
                debug: { resultType: typeof result }
            }, { status: 500 });
        }

        return NextResponse.json({
            pages: result,
            success: true,
            count: result.length
        });
    } catch (error) {
        console.error('Failed to fetch pages:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({
            error: 'Failed to fetch pages',
            message: errorMessage,
            success: false
        }, { status: 500 });
    }
}

// POST: Create a new page
export async function POST(request: NextRequest) {
    try {
        if (!(await isUserAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const {
            title,
            slug,
            status,
            content,
            parent_id,
            menu_order,
            page_template,
            show_in_menu,
            show_in_footer,
            meta_title,
            meta_description
        } = await request.json();

        if (!title || !slug) {
            return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 });
        }

        const result = await executeQuery<any[]>(
            `INSERT INTO pages (
                title, 
                slug, 
                status, 
                content,
                parent_id,
                menu_order,
                page_template,
                show_in_menu,
                show_in_footer,
                meta_title,
                meta_description
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [
                title,
                slug,
                status || 'draft',
                content || '',
                parent_id,
                menu_order || 0,
                page_template || 'default',
                show_in_menu || false,
                show_in_footer || false,
                meta_title || '',
                meta_description || ''
            ]
        );
        return NextResponse.json({ page: result[0], success: true });
    } catch (error) {
        console.error('Create page error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: 'Failed to create page', message: errorMessage }, { status: 500 });
    }
}

// PATCH: Update a page (expects id in body)
export async function PATCH(request: NextRequest) {
    try {
        if (!(await isUserAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const {
            id,
            title,
            slug,
            status,
            content,
            parent_id,
            menu_order,
            page_template,
            show_in_menu,
            show_in_footer,
            meta_title,
            meta_description
        } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Page ID is required' }, { status: 400 });
        }

        const result = await executeQuery<any[]>(
            `UPDATE pages SET 
                title = $1, 
                slug = $2, 
                status = $3, 
                content = $4, 
                parent_id = $5,
                menu_order = $6,
                page_template = $7,
                show_in_menu = $8,
                show_in_footer = $9,
                meta_title = $10,
                meta_description = $11,
                updated_at = NOW() 
            WHERE id = $12 RETURNING *`,
            [
                title,
                slug,
                status,
                content,
                parent_id,
                menu_order || 0,
                page_template || 'default',
                show_in_menu || false,
                show_in_footer || false,
                meta_title || '',
                meta_description || '',
                id
            ]
        );

        if (result.length === 0) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }
        return NextResponse.json({ page: result[0], success: true });
    } catch (error) {
        console.error('Update page error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: 'Failed to update page', message: errorMessage }, { status: 500 });
    }
}

// DELETE: Delete a page (expects id in body)
export async function DELETE(request: NextRequest) {
    try {
        if (!(await isUserAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ error: 'Page ID is required' }, { status: 400 });
        }

        // First update any child pages to set their parent_id to null
        await executeQuery<any[]>('UPDATE pages SET parent_id = NULL WHERE parent_id = $1', [id]);

        // Then delete the page
        const result = await executeQuery<any[]>('DELETE FROM pages WHERE id = $1 RETURNING *', [id]);

        if (result.length === 0) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete page error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: 'Failed to delete page', message: errorMessage }, { status: 500 });
    }
} 