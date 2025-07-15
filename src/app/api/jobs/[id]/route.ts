import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET a specific job for public view
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const job = await prisma.job.findUnique({
            where: {
                id,
                isActive: true,
            },
        });

        if (!job) {
            return NextResponse.json(
                { error: "Job not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(job);
    } catch (error) {
        console.error("Error fetching job:", error);
        return NextResponse.json(
            { error: "Failed to fetch job" },
            { status: 500 }
        );
    }
} 