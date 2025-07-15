// src/app/api/pages/[slug]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    // The slug can include slashes like 'products/online-ordering-system', so we decode it.
    const slug = decodeURIComponent(params.slug);

    try {
        const query = 'SELECT * FROM pages WHERE slug = $1 AND status = $2 LIMIT 1';
        const result = await executeQuery<any[]>(query, [slug, 'published']);

        if (result && result.length > 0) {
            return NextResponse.json({ success: true, page: result[0] });
        } else {
            return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
        }
    } catch (error) {
        console.error(`Failed to fetch page with slug "${slug}":`, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ success: false, error: 'Failed to fetch page', message: errorMessage }, { status: 500 });
    }
}