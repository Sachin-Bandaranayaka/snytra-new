import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/db/postgres';
import { isUserAdmin } from '@/lib/authUtils';

// GET - Retrieve all slideshow entries
export async function GET(req: NextRequest) {
    try {
        const rows = await sql`
      SELECT * FROM slideshow ORDER BY "order" ASC
    `;

        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching slideshow data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch slideshow data' },
            { status: 500 }
        );
    }
}

// POST - Create a new slideshow entry
export async function POST(req: NextRequest) {
    try {
        // Check if the user is an admin
        const isAdmin = await isUserAdmin();

        // Check if admin authentication was successful
        if (!isAdmin) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { title, description, imageUrl, iconType, order = 0, isActive = true } = await req.json();

        // Validate required fields
        if (!title || !description || !imageUrl || !iconType) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const result = await sql`
      INSERT INTO slideshow (title, description, image_url, icon_type, "order", is_active) 
      VALUES (${title}, ${description}, ${imageUrl}, ${iconType}, ${order}, ${isActive}) 
      RETURNING *
    `;

        return NextResponse.json(result[0], { status: 201 });
    } catch (error) {
        console.error('Error creating slideshow entry:', error);
        return NextResponse.json(
            { error: 'Failed to create slideshow entry' },
            { status: 500 }
        );
    }
}

// PATCH - Update a slideshow entry
export async function PATCH(req: NextRequest) {
    try {
        // Check if the user is an admin
        const isAdmin = await isUserAdmin();

        // Check if admin authentication was successful
        if (!isAdmin) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id, title, description, imageUrl, iconType, order, isActive } = await req.json();

        if (!id) {
            return NextResponse.json(
                { error: 'Missing slide ID' },
                { status: 400 }
            );
        }

        // Build dynamic update query using SQL template literals
        const updateFields = [];
        const values = {};

        if (title !== undefined) {
            updateFields.push(`title = ${sql.unsafe(title)}`);
            values.title = title;
        }
        if (description !== undefined) {
            updateFields.push(`description = ${sql.unsafe(description)}`);
            values.description = description;
        }
        if (imageUrl !== undefined) {
            updateFields.push(`image_url = ${sql.unsafe(imageUrl)}`);
            values.imageUrl = imageUrl;
        }
        if (iconType !== undefined) {
            updateFields.push(`icon_type = ${sql.unsafe(iconType)}`);
            values.iconType = iconType;
        }
        if (order !== undefined) {
            updateFields.push(`"order" = ${order}`);
            values.order = order;
        }
        if (isActive !== undefined) {
            updateFields.push(`is_active = ${isActive}`);
            values.isActive = isActive;
        }

        if (Object.keys(values).length === 0) {
            return NextResponse.json(
                { error: 'No fields to update' },
                { status: 400 }
            );
        }

        // Join the update fields with comma
        const setClause = updateFields.join(', ');

        // Execute the update query
        const result = await sql`
            UPDATE slideshow
            SET ${sql.unsafe(setClause)}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
            RETURNING *
        `;

        if (result.length === 0) {
            return NextResponse.json(
                { error: 'Slideshow entry not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error('Error updating slideshow entry:', error);
        return NextResponse.json(
            { error: 'Failed to update slideshow entry' },
            { status: 500 }
        );
    }
}

// DELETE - Remove a slideshow entry
export async function DELETE(req: NextRequest) {
    try {
        // Check if the user is an admin
        const isAdmin = await isUserAdmin();

        // Check if admin authentication was successful
        if (!isAdmin) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Parse the URL to get the ID
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Missing slideshow ID' },
                { status: 400 }
            );
        }

        const result = await sql`
      DELETE FROM slideshow
      WHERE id = ${id}
      RETURNING *
    `;

        if (result.length === 0) {
            return NextResponse.json(
                { error: 'Slideshow entry not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, deleted: result[0] });
    } catch (error) {
        console.error('Error deleting slideshow entry:', error);
        return NextResponse.json(
            { error: 'Failed to delete slideshow entry' },
            { status: 500 }
        );
    }
} 