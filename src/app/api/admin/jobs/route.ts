import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all jobs
export async function GET(request: NextRequest) {
    try {
        const jobs = await prisma.job.findMany({
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(jobs);
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return NextResponse.json(
            { error: "Failed to fetch jobs" },
            { status: 500 }
        );
    }
}

// POST create new job
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        // Validate required fields
        const requiredFields = [
            "title",
            "department",
            "location",
            "type",
            "description",
            "responsibilities",
            "requirements",
        ];

        for (const field of requiredFields) {
            if (!data[field]) {
                return NextResponse.json(
                    { error: `${field} is required` },
                    { status: 400 }
                );
            }
        }

        const job = await prisma.job.create({
            data: {
                title: data.title,
                department: data.department,
                location: data.location,
                type: data.type,
                description: data.description,
                responsibilities: data.responsibilities,
                requirements: data.requirements,
                benefits: data.benefits || null,
                salary: data.salary || null,
            },
        });

        return NextResponse.json(job, { status: 201 });
    } catch (error) {
        console.error("Error creating job:", error);
        return NextResponse.json(
            { error: "Failed to create job" },
            { status: 500 }
        );
    }
} 