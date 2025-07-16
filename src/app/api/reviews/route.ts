import { NextResponse } from "next/server";
import { sql } from "@/db/postgres";

// Helper function to validate if a string is a valid URL
function isValidUrl(string: string): boolean {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'data:';
    } catch (_) {
        return false;
    }
}

export async function GET() {
    try {
        const reviews = await sql`
      SELECT id, customer_name, customer_image_url, rating, review_text
      FROM reviews
      WHERE is_active = true
      ORDER BY display_order, created_at DESC
    `;

        // Validate and sanitize image URLs
        const sanitizedReviews = reviews.map(review => ({
            ...review,
            customer_image_url: review.customer_image_url && isValidUrl(review.customer_image_url) 
                ? review.customer_image_url 
                : null
        }));

        return NextResponse.json({ reviews: sanitizedReviews }, { status: 200 });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return NextResponse.json(
            { error: "Failed to fetch reviews" },
            { status: 500 }
        );
    }
} 