import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET a specific job
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = params.id;

        const job = await prisma.job.findUnique({
            where: { id },
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

// PATCH update a job
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        const data = await request.json();

        // Check if job exists
        const existingJob = await prisma.job.findUnique({
            where: { id },
        });

        if (!existingJob) {
            return NextResponse.json(
                { error: "Job not found" },
                { status: 404 }
            );
        }

        // Update job
        const updatedJob = await prisma.job.update({
            where: { id },
            data,
        });

        return NextResponse.json(updatedJob);
    } catch (error) {
        console.error("Error updating job:", error);
        return NextResponse.json(
            { error: "Failed to update job" },
            { status: 500 }
        );
    }
}

// DELETE a job
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const id = params.id;

        // Check if job exists
        const existingJob = await prisma.job.findUnique({
            where: { id },
        });

        if (!existingJob) {
            return NextResponse.json(
                { error: "Job not found" },
                { status: 404 }
            );
        }

        // Delete job
        await prisma.job.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Job deleted successfully" });
    } catch (error) {
        console.error("Error deleting job:", error);
        return NextResponse.json(
            { error: "Failed to delete job" },
            { status: 500 }
        );
    }
} 