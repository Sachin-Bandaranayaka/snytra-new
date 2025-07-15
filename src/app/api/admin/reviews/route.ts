import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/db/postgres";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

// GET all reviews for admin
export async function GET() {
    try {
        // Verify admin status using Next Auth
        const admin = await verifyAdminStatus();

        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const reviews = await sql`
      SELECT id, customer_name, customer_image_url, rating, review_text, is_active, display_order, created_at, updated_at
      FROM reviews
      ORDER BY display_order, created_at DESC
    `;

        return NextResponse.json({ reviews }, { status: 200 });
    } catch (error) {
        console.error("Error fetching reviews for admin:", error);
        return NextResponse.json(
            { error: "Failed to fetch reviews" },
            { status: 500 }
        );
    }
}

// CREATE a new review
export async function POST(request: NextRequest) {
    try {
        // Verify admin status using Next Auth
        const admin = await verifyAdminStatus();

        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { customer_name, customer_image_url, rating, review_text, is_active, display_order } = await request.json();

        if (!customer_name || !rating || !review_text) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        let result;
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
            try {
                result = await sql`
          INSERT INTO reviews 
            (customer_name, customer_image_url, rating, review_text, is_active, display_order)
          VALUES 
            (${customer_name}, ${customer_image_url || null}, ${rating}, ${review_text}, ${is_active || true}, ${display_order || 0})
          RETURNING id
        `;
                break;
            } catch (insertError: any) {
                console.error(`Insert attempt ${retryCount + 1} failed:`, insertError);
                
                if (insertError.code === '23505' && insertError.constraint_name === 'reviews_pkey') {
                    // Fix sequence issue
                    try {
                        await sql`
              SELECT setval('reviews_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM reviews), false)
            `;
                        console.log('Fixed reviews sequence');
                        retryCount++;
                        
                        if (retryCount >= maxRetries) {
                            throw new Error('Failed to insert after sequence fixes');
                        }
                        continue;
                    } catch (seqError) {
                        console.error('Error fixing sequence:', seqError);
                        throw insertError;
                    }
                } else {
                    throw insertError;
                }
            }
        }

        return NextResponse.json({ id: result[0].id }, { status: 201 });
    } catch (error) {
        console.error("Error creating review:", error);
        return NextResponse.json(
            { error: "Failed to create review" },
            { status: 500 }
        );
    }
} 