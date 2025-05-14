import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({
                error: `File size exceeds the limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`
            }, { status: 400 });
        }

        // Validate file type
        const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
        if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
            return NextResponse.json({
                error: `Invalid file format. Allowed formats: ${ALLOWED_EXTENSIONS.join(', ')}`
            }, { status: 400 });
        }

        // Create unique filename
        const fileName = `${uuidv4()}.${fileExt}`;

        // Path inside public directory
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'blog');
        const publicPath = `/uploads/blog/${fileName}`;
        const filePath = path.join(uploadDir, fileName);

        // Create directory if it doesn't exist
        await mkdir(uploadDir, { recursive: true });

        // Write file to disk
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filePath, fileBuffer);

        // Store reference in database
        const result = await db.sql`
      INSERT INTO uploaded_files (
        filename, 
        original_filename, 
        file_path, 
        file_size, 
        file_type, 
        uploaded_at
      ) VALUES (
        ${fileName}, 
        ${file.name}, 
        ${publicPath}, 
        ${file.size}, 
        ${file.type}, 
        NOW()
      ) RETURNING id
    `;

        return NextResponse.json({
            success: true,
            url: publicPath,
            fileId: result[0]?.id
        });

    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({
            error: 'Failed to upload file'
        }, { status: 500 });
    }
} 