import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/db/postgres";

// Temporary bypass endpoint to delete a review without NextAuth authentication
export async function DELETE(request: NextRequest) {
    try {
        const reviewId = request.nextUrl.searchParams.get("id");

        if (!reviewId) {
            return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
        }

        console.log(`Attempting to delete review with ID: ${reviewId}`);

        const result = await sql`
      DELETE FROM reviews
      WHERE id = ${parseInt(reviewId)}
      RETURNING id
    `;

        if (result.length === 0) {
            return NextResponse.json({ error: "Review not found" }, { status: 404 });
        }

        return NextResponse.json({ id: result[0].id, success: true }, { status: 200 });
    } catch (error) {
        console.error("Error in bypass delete:", error);
        return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
    }
} 