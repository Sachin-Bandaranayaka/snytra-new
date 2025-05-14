import { NextResponse } from "next/server";
import { sql } from "@/db/postgres";

export async function GET() {
    try {
        const reviews = await sql`
      SELECT id, customer_name, customer_image_url, rating, review_text
      FROM reviews
      WHERE is_active = true
      ORDER BY display_order, created_at DESC
    `;

        return NextResponse.json({ reviews }, { status: 200 });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return NextResponse.json(
            { error: "Failed to fetch reviews" },
            { status: 500 }
        );
    }
} 