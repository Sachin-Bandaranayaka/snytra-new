import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Get recent images from the database, ordered by upload date
        const result = await db.sql`
      SELECT 
        id, 
        filename, 
        original_filename, 
        file_path, 
        file_size, 
        file_type, 
        uploaded_at
      FROM uploaded_files
      WHERE file_type LIKE 'image/%'
      ORDER BY uploaded_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

        return NextResponse.json({
            images: result
        });
    } catch (error) {
        console.error('Error fetching recent images:', error);
        return NextResponse.json({
            error: 'Failed to fetch recent images'
        }, { status: 500 });
    }
} 