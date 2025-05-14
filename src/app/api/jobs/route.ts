import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET active jobs for public view
export async function GET(request: NextRequest) {
    try {
        const jobs = await prisma.job.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(jobs);
    } catch (error) {
        console.error("Error fetching public jobs:", error);
        return NextResponse.json(
            { error: "Failed to fetch jobs" },
            { status: 500 }
        );
    }
} 