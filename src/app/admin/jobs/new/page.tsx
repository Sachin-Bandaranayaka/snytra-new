"use client";

import { useState } from "react";
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

export default function NewJobPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        department: "",
        location: "",
        type: "Full-time",
        description: "",
        responsibilities: "",
        requirements: "",
        benefits: "",
        salary: "",
    });

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

            const response = await fetch("/api/admin/jobs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to create job");
            }

            toast.success("Job created successfully");
            router.push("/admin/jobs");
        } catch (error) {
            console.error("Error creating job:", error);
            toast.error("Failed to create job");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Add New Job</h1>
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
                        {isSubmitting ? "Creating..." : "Create Job"}
                    </Button>
                </div>
            </form>
        </div>
    );
} 