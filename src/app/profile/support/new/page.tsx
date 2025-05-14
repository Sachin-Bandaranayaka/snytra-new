"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import SEO from "@/components/SEO";
import Link from "next/link";
import {
    LifeBuoy,
    ArrowLeft,
    Send,
    ChevronUp,
    ChevronDown
} from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface TicketForm {
    title: string;
    description: string;
    priority: string;
    category: string;
    attachments?: FileList | null;
}

export default function NewTicketPage() {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [form, setForm] = useState<TicketForm>({
        title: "",
        description: "",
        priority: "medium",
        category: "general",
        attachments: null
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [faqOpen, setFaqOpen] = useState<Record<string, boolean>>({
        '1': false,
        '2': false,
        '3': false
    });

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

    // Handle form change
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        // Clear error when field is updated
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    // Handle file attachment
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, attachments: e.target.files });
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!form.title.trim()) {
            newErrors.title = "Please enter a title for your ticket";
        } else if (form.title.length < 5) {
            newErrors.title = "Title must be at least 5 characters";
        }

        if (!form.description.trim()) {
            newErrors.description = "Please describe your issue";
        } else if (form.description.length < 20) {
            newErrors.description = "Description must be at least 20 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Check if user is available
            if (!user || !user.id) {
                throw new Error('User information is not available. Please log in again.');
            }

            // Create FormData if there are attachments
            if (form.attachments && form.attachments.length > 0) {
                const formData = new FormData();
                formData.append('title', form.title);
                formData.append('description', form.description);
                formData.append('priority', form.priority);
                formData.append('category', form.category);
                formData.append('userId', user.id.toString());

                // Append each file
                for (let i = 0; i < form.attachments.length; i++) {
                    formData.append('attachments', form.attachments[i]);
                }

                const response = await fetch('/api/support-tickets', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to create ticket');
                }
            } else {
                // Send JSON data if no attachments
                const response = await fetch('/api/support-tickets', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: form.title,
                        description: form.description,
                        priority: form.priority,
                        category: form.category,
                        userId: parseInt(user.id), // Ensure userId is an integer
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to create ticket');
                }
            }

            // Show success notification
            toast({
                title: "Ticket Created",
                description: "Your support ticket has been submitted successfully.",
                type: "success",
            });

            // Redirect to tickets page
            setTimeout(() => {
                router.push('/profile/support');
            }, 1500);
        } catch (error) {
            console.error("Error creating ticket:", error);
            toast({
                title: "Submission Failed",
                description: error instanceof Error ? error.message : "There was a problem creating your ticket. Please try again.",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Toggle FAQ
    const toggleFaq = (id: string) => {
        setFaqOpen({ ...faqOpen, [id]: !faqOpen[id] });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <>
            <SEO
                title="Create Support Ticket | Client Portal | Snytra"
                description="Submit a new support ticket for assistance."
                ogImage="/images/client-portal.jpg"
            />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <Link href="/profile/support" className="text-primary hover:text-primary/80 flex items-center mb-2">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Tickets
                    </Link>
                    <h1 className="text-3xl font-bold text-charcoal">Create New Support Ticket</h1>
                    <p className="text-charcoal/70 mt-1">Submit a request for assistance or report an issue</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ticket Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-charcoal flex items-center">
                                <LifeBuoy className="mr-2 h-5 w-5 text-primary" />
                                Ticket Details
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-6">
                                {/* Title */}
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-charcoal mb-1">
                                        Ticket Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="Brief summary of your issue"
                                        className={`w-full rounded-md border ${errors.title ? 'border-red-300' : 'border-gray-300'
                                            } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary`}
                                        required
                                    />
                                    {errors.title && (
                                        <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                    )}
                                </div>

                                {/* Category */}
                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-charcoal mb-1">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none bg-white"
                                        required
                                    >
                                        <option value="general">General Inquiry</option>
                                        <option value="technical">Technical Issue</option>
                                        <option value="billing">Billing & Payments</option>
                                        <option value="account">Account Access</option>
                                        <option value="feature">Feature Request</option>
                                    </select>
                                </div>

                                {/* Priority */}
                                <div>
                                    <label htmlFor="priority" className="block text-sm font-medium text-charcoal mb-1">
                                        Priority <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="priority"
                                        name="priority"
                                        value={form.priority}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none bg-white"
                                        required
                                    >
                                        <option value="low">Low - General question or non-urgent issue</option>
                                        <option value="medium">Medium - Important issue but not blocking work</option>
                                        <option value="high">High - Urgent issue affecting core functionality</option>
                                    </select>
                                </div>

                                {/* Description */}
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-charcoal mb-1">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        placeholder="Please provide detailed information about your issue..."
                                        rows={6}
                                        className={`w-full rounded-md border ${errors.description ? 'border-red-300' : 'border-gray-300'
                                            } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary`}
                                        required
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                    )}
                                    <p className="mt-1 text-xs text-charcoal/60">
                                        Please include any relevant details such as error messages, steps to reproduce,
                                        and when the issue started.
                                    </p>
                                </div>

                                {/* Attachments */}
                                <div>
                                    <label htmlFor="attachments" className="block text-sm font-medium text-charcoal mb-1">
                                        Attachments (Optional)
                                    </label>
                                    <input
                                        type="file"
                                        id="attachments"
                                        name="attachments"
                                        onChange={handleFileChange}
                                        multiple
                                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                    />
                                    <p className="mt-1 text-xs text-charcoal/60">
                                        You can attach screenshots or relevant files. Maximum 5 files, 5MB each.
                                        Accepted formats: .jpg, .png, .pdf, .doc, .docx
                                    </p>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="mt-8">
                                <button
                                    type="submit"
                                    className="w-full md:w-auto px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center disabled:opacity-70"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Submit Ticket
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Help & FAQs */}
                <div>
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-charcoal">Common Questions</h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {/* FAQ Item 1 */}
                                <div>
                                    <button
                                        onClick={() => toggleFaq('1')}
                                        className="flex justify-between items-center w-full text-left font-medium text-charcoal py-2 focus:outline-none"
                                    >
                                        <span>How quickly will I receive a response?</span>
                                        {faqOpen['1'] ? (
                                            <ChevronUp className="h-4 w-4 text-primary" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-charcoal/60" />
                                        )}
                                    </button>
                                    {faqOpen['1'] && (
                                        <div className="mt-2 text-sm text-charcoal/80">
                                            <p>
                                                Our support team typically responds within 24 hours for standard inquiries.
                                                High-priority issues are addressed more quickly, usually within 4-8 hours during business days.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* FAQ Item 2 */}
                                <div>
                                    <button
                                        onClick={() => toggleFaq('2')}
                                        className="flex justify-between items-center w-full text-left font-medium text-charcoal py-2 focus:outline-none"
                                    >
                                        <span>What information should I include?</span>
                                        {faqOpen['2'] ? (
                                            <ChevronUp className="h-4 w-4 text-primary" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-charcoal/60" />
                                        )}
                                    </button>
                                    {faqOpen['2'] && (
                                        <div className="mt-2 text-sm text-charcoal/80">
                                            <p>
                                                To help us resolve your issue faster, please include:
                                            </p>
                                            <ul className="list-disc list-inside mt-2 space-y-1">
                                                <li>Detailed description of the problem</li>
                                                <li>Steps to reproduce the issue</li>
                                                <li>When the issue started occurring</li>
                                                <li>Screenshots or error messages</li>
                                                <li>Any troubleshooting steps you've already tried</li>
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {/* FAQ Item 3 */}
                                <div>
                                    <button
                                        onClick={() => toggleFaq('3')}
                                        className="flex justify-between items-center w-full text-left font-medium text-charcoal py-2 focus:outline-none"
                                    >
                                        <span>Can I update my ticket after submission?</span>
                                        {faqOpen['3'] ? (
                                            <ChevronUp className="h-4 w-4 text-primary" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-charcoal/60" />
                                        )}
                                    </button>
                                    {faqOpen['3'] && (
                                        <div className="mt-2 text-sm text-charcoal/80">
                                            <p>
                                                Yes, you can add additional information or attachments to your ticket after submission.
                                                Simply visit the ticket details page and use the reply box to provide updates.
                                                You'll also receive email notifications when there are updates to your ticket.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-blue-50 rounded-md">
                                <h3 className="font-medium text-blue-700">Need Immediate Help?</h3>
                                <p className="text-sm text-blue-700 mt-1">
                                    For urgent issues that require immediate assistance, please call our support line at
                                    <strong> (888) 555-1234</strong>, available 24/7.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
} 