import { NextResponse } from 'next/server';
import { sql } from '@/db/postgres';
import { isUserAdmin } from '@/lib/authUtils';

export async function GET() {
    try {
        // Check if the dashboard_slides table exists
        const checkTableQuery = await sql`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'dashboard_slides'
            );
        `;

        if (!checkTableQuery[0].exists) {
            // If table doesn't exist, return empty array
            return NextResponse.json({ slides: [] }, { status: 200 });
        }

        // Get all dashboard slides
        const dashboardSlides = await sql`
            SELECT * FROM dashboard_slides 
            ORDER BY "order" ASC
        `;

        return NextResponse.json({ slides: dashboardSlides }, { status: 200 });
    } catch (error) {
        console.error('Error fetching dashboard slides:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard slides' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const { slide } = await request.json();

        // Check if user is authorized
        const isAdmin = await isUserAdmin();
        if (!isAdmin) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if the dashboard_slides table exists, if not create it
        const checkTableQuery = await sql`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'dashboard_slides'
            );
        `;

        if (!checkTableQuery[0].exists) {
            // Create the dashboard_slides table
            await sql`
                CREATE TABLE dashboard_slides (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    description TEXT,
                    image_url TEXT NOT NULL,
                    features TEXT[] NOT NULL,
                    color TEXT NOT NULL,
                    "order" INTEGER NOT NULL,
                    is_active BOOLEAN DEFAULT true
                );
            `;
        }

        // Check if slide with this ID already exists
        const existingSlide = await sql`
            SELECT * FROM dashboard_slides WHERE id = ${slide.id}
        `;

        if (existingSlide.length > 0) {
            // Update existing slide
            const updatedSlide = await sql`
                UPDATE dashboard_slides 
                SET title = ${slide.title}, 
                    description = ${slide.description}, 
                    image_url = ${slide.image_url}, 
                    features = ${slide.features},
                    color = ${slide.color},
                    "order" = ${slide.order},
                    is_active = ${slide.is_active}
                WHERE id = ${slide.id}
                RETURNING *
            `;

            return NextResponse.json({ slide: updatedSlide[0] }, { status: 200 });
        } else {
            // Insert new slide
            const newSlide = await sql`
                INSERT INTO dashboard_slides (
                    id, title, description, image_url, features, color, "order", is_active
                ) VALUES (
                    ${slide.id},
                    ${slide.title},
                    ${slide.description},
                    ${slide.image_url},
                    ${slide.features},
                    ${slide.color},
                    ${slide.order},
                    ${slide.is_active !== undefined ? slide.is_active : true}
                )
                RETURNING *
            `;

            return NextResponse.json({ slide: newSlide[0] }, { status: 201 });
        }
    } catch (error) {
        console.error('Error saving dashboard slide:', error);
        return NextResponse.json(
            { error: 'Failed to save dashboard slide' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Slide ID is required' },
                { status: 400 }
            );
        }

        // Check if user is authorized
        const isAdmin = await isUserAdmin();
        if (!isAdmin) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Delete the slide
        const deletedSlide = await sql`
            DELETE FROM dashboard_slides 
            WHERE id = ${id}
            RETURNING *
        `;

        if (deletedSlide.length === 0) {
            return NextResponse.json(
                { error: 'Slide not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, deleted: deletedSlide[0] }, { status: 200 });
    } catch (error) {
        console.error('Error deleting dashboard slide:', error);
        return NextResponse.json(
            { error: 'Failed to delete dashboard slide' },
            { status: 500 }
        );
    }
} 