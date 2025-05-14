"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "react-hot-toast";

interface Job {
    id: string;
    title: string;
    department: string;
    location: string;
    type: string;
    isActive: boolean;
    createdAt: string;
}

export default function AdminJobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/admin/jobs");
            if (!response.ok) {
                throw new Error("Failed to fetch jobs");
            }
            const data = await response.json();
            setJobs(data);
        } catch (error) {
            console.error("Error fetching jobs:", error);
            toast.error("Failed to load jobs");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleJobStatus = async (id: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/admin/jobs/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ isActive: !currentStatus }),
            });

            if (!response.ok) {
                throw new Error("Failed to update job status");
            }

            setJobs((prevJobs) =>
                prevJobs.map((job) =>
                    job.id === id ? { ...job, isActive: !currentStatus } : job
                )
            );

            toast.success(`Job ${!currentStatus ? "activated" : "deactivated"} successfully`);
        } catch (error) {
            console.error("Error toggling job status:", error);
            toast.error("Failed to update job status");
        }
    };

    const deleteJob = async (id: string) => {
        if (!confirm("Are you sure you want to delete this job?")) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/jobs/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete job");
            }

            setJobs((prevJobs) => prevJobs.filter((job) => job.id !== id));
            toast.success("Job deleted successfully");
        } catch (error) {
            console.error("Error deleting job:", error);
            toast.error("Failed to delete job");
        }
    };

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Manage Job Listings</h1>
                <Button onClick={() => router.push("/admin/jobs/new")}>
                    Add New Job
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
            ) : jobs.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <h3 className="text-xl font-medium text-gray-700">No jobs found</h3>
                    <p className="mt-2 text-gray-500">
                        Create your first job listing to get started.
                    </p>
                    <Button
                        className="mt-4"
                        onClick={() => router.push("/admin/jobs/new")}
                    >
                        Add Job
                    </Button>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {jobs.map((job) => (
                                <TableRow key={job.id}>
                                    <TableCell className="font-medium">{job.title}</TableCell>
                                    <TableCell>{job.department}</TableCell>
                                    <TableCell>{job.location}</TableCell>
                                    <TableCell>{job.type}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs ${job.isActive
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {job.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(job.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.push(`/admin/jobs/edit/${job.id}`)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant={job.isActive ? "destructive" : "outline"}
                                            size="sm"
                                            onClick={() => toggleJobStatus(job.id, job.isActive)}
                                        >
                                            {job.isActive ? "Deactivate" : "Activate"}
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => deleteJob(job.id)}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
} 