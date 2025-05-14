import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/db/postgres";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface RouteParams {
    params: {
        id: string;
    };
}

// Helper function to verify admin status using Next Auth
async function verifyAdminStatus() {
    try {
        // Get session from Next Auth
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return null;
        }

        // Direct database query to verify admin
        const result = await sql`
            SELECT id, role FROM users 
            WHERE email = ${session.user.email} AND role = 'admin'
        `;

        if (result.length > 0) {
            return result[0];
        }

        return null;
    } catch (error) {
        console.error("Error verifying admin:", error);
        return null;
    }
}

// GET a specific review
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        // Verify admin status using Next Auth
        const admin = await verifyAdminStatus();

        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;

        const review = await sql`
            SELECT id, customer_name, customer_image_url, rating, review_text, is_active, display_order, created_at, updated_at
            FROM reviews
            WHERE id = ${parseInt(id)}
        `;

        if (review.length === 0) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }

        return NextResponse.json({ review: review[0] }, { status: 200 });
    } catch (error) {
        console.error("Error fetching review:", error);
        return NextResponse.json(
            { error: "Failed to fetch review" },
            { status: 500 }
        );
    }
}

// UPDATE a review
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        // Verify admin status using Next Auth
        const admin = await verifyAdminStatus();

        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;
        const { customer_name, customer_image_url, rating, review_text, is_active, display_order } = await request.json();

        if (!customer_name || !rating || !review_text) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const result = await sql`
            UPDATE reviews
            SET 
                customer_name = ${customer_name},
                customer_image_url = ${customer_image_url || null},
                rating = ${rating},
                review_text = ${review_text},
                is_active = ${is_active === undefined ? true : is_active},
                display_order = ${display_order || 0},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${parseInt(id)}
            RETURNING id
        `;

        if (result.length === 0) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }

        return NextResponse.json({ id: result[0].id }, { status: 200 });
    } catch (error) {
        console.error("Error updating review:", error);
        return NextResponse.json(
            { error: "Failed to update review" },
            { status: 500 }
        );
    }
}

// DELETE a review
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        // Verify admin status using Next Auth
        const admin = await verifyAdminStatus();

        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;

        const result = await sql`
            DELETE FROM reviews
            WHERE id = ${parseInt(id)}
            RETURNING id
        `;

        if (result.length === 0) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }

        return NextResponse.json({ id: result[0].id }, { status: 200 });
    } catch (error) {
        console.error("Error deleting review:", error);
        return NextResponse.json(
            { error: "Failed to delete review" },
            { status: 500 }
        );
    }
} 