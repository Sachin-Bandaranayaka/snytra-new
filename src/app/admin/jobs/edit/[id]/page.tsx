"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";

interface JobFormData {
    title: string;
    department: string;
    location: string;
    type: string;
    description: string;
    responsibilities: string;
    requirements: string;
    benefits: string;
    salary: string;
    isActive: boolean;
}

export default function EditJobPage({ params }: { params: { id: string } }) {
    const { id } = React.use(params);

    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<JobFormData>({
        title: "",
        department: "",
        location: "",
        type: "Full-time",
        description: "",
        responsibilities: "",
        requirements: "",
        benefits: "",
        salary: "",
        isActive: true,
    });

    useEffect(() => {
        const fetchJob = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/admin/jobs/${id}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        toast.error("Job not found");
                        router.push("/admin/jobs");
                        return;
                    }
                    throw new Error("Failed to fetch job");
                }

                const data = await response.json();
                setFormData({
                    title: data.title,
                    department: data.department,
                    location: data.location,
                    type: data.type,
                    description: data.description,
                    responsibilities: data.responsibilities,
                    requirements: data.requirements,
                    benefits: data.benefits || "",
                    salary: data.salary || "",
                    isActive: data.isActive,
                });
            } catch (error) {
                console.error("Error fetching job:", error);
                toast.error("Failed to load job details");
            } finally {
                setIsLoading(false);
            }
        };

        fetchJob();
    }, [id, router]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.title || !formData.department || !formData.location || !formData.type ||
            !formData.description || !formData.responsibilities || !formData.requirements) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await fetch(`/api/admin/jobs/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to update job");
            }

            toast.success("Job updated successfully");
            router.push("/admin/jobs");
        } catch (error) {
            console.error("Error updating job:", error);
            toast.error("Failed to update job");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-10">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Edit Job</h1>
                <Button variant="outline" onClick={() => router.push("/admin/jobs")}>
                    Back to Jobs
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Job Title *</Label>
                        <Input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. Restaurant Manager"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="department">Department *</Label>
                        <Input
                            id="department"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            placeholder="e.g. Management"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Location *</Label>
                        <Input
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g. New York, NY"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Job Type *</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value) => handleSelectChange("type", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select job type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Full-time">Full-time</SelectItem>
                                <SelectItem value="Part-time">Part-time</SelectItem>
                                <SelectItem value="Contract">Contract</SelectItem>
                                <SelectItem value="Temporary">Temporary</SelectItem>
                                <SelectItem value="Internship">Internship</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="salary">Salary Range (Optional)</Label>
                        <Input
                            id="salary"
                            name="salary"
                            value={formData.salary}
                            onChange={handleChange}
                            placeholder="e.g. $50,000 - $70,000 per year"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={formData.isActive ? "active" : "inactive"}
                            onValueChange={(value) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    isActive: value === "active"
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Job Description *</Label>
                    <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter a detailed job description"
                        rows={5}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="responsibilities">Responsibilities *</Label>
                    <Textarea
                        id="responsibilities"
                        name="responsibilities"
                        value={formData.responsibilities}
                        onChange={handleChange}
                        placeholder="Enter job responsibilities"
                        rows={5}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="requirements">Requirements *</Label>
                    <Textarea
                        id="requirements"
                        name="requirements"
                        value={formData.requirements}
                        onChange={handleChange}
                        placeholder="Enter job requirements"
                        rows={5}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="benefits">Benefits (Optional)</Label>
                    <Textarea
                        id="benefits"
                        name="benefits"
                        value={formData.benefits}
                        onChange={handleChange}
                        placeholder="Enter job benefits"
                        rows={4}
                    />
                </div>

                <div className="flex justify-end space-x-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/admin/jobs")}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Updating..." : "Update Job"}
                    </Button>
                </div>
            </form>
        </div>
    );
} 