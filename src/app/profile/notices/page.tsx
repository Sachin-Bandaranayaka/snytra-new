"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import SEO from "@/components/SEO";
import Link from "next/link";
import {
    Bell,
    Search,
    AlertTriangle,
    Info,
    Calendar,
    ChevronRight,
    Tag
} from "lucide-react";

// Notice type for company/system announcements
interface Notice {
    id: number;
    title: string;
    content: string;
    important: boolean;
    category: string;
    created_at: number;
    read: boolean;
}

export default function NoticesPage() {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

    // Fetch notices
    useEffect(() => {
        if (isAuthenticated) {
            const fetchNotices = async () => {
                try {
                    const response = await fetch('/api/notices');
                    if (response.ok) {
                        const data = await response.json();
                        setNotices(data.notices || []);
                    }
                } catch (error) {
                    console.error("Error fetching notices:", error);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchNotices();

            // Set mock data for development
            if (process.env.NODE_ENV === 'development') {
                const mockNotices: Notice[] = [
                    {
                        id: 1,
                        title: 'Scheduled Maintenance: June 15, 2025',
                        content: 'Our systems will be down for scheduled maintenance between 2AM-4AM EST on June 15, 2025. During this time, you will not be able to access your account or dashboard. We apologize for any inconvenience this may cause.',
                        important: true,
                        category: 'maintenance',
                        created_at: Date.now() - 86400000, // 1 day ago
                        read: false
                    },
                    {
                        id: 2,
                        title: 'New Feature Release: Advanced Analytics',
                        content: 'We\'re excited to announce the release of our new Advanced Analytics module! This update includes customizable reports, enhanced visualization tools, and the ability to export data in multiple formats. Check it out on your dashboard today!',
                        important: false,
                        category: 'update',
                        created_at: Date.now() - 172800000, // 2 days ago
                        read: true
                    },
                    {
                        id: 3,
                        title: 'Holiday Hours Update',
                        content: 'Please note that our support team will be operating with limited hours during the upcoming holidays. From December 24-26 and December 31-January 2, support will be available from 9AM-3PM EST only.',
                        important: false,
                        category: 'announcement',
                        created_at: Date.now() - 432000000, // 5 days ago
                        read: true
                    },
                    {
                        id: 4,
                        title: 'Security Alert: Password Policy Update',
                        content: 'To enhance account security, we\'ve updated our password requirements. All passwords must now be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character. You\'ll be prompted to update your password on your next login if your current password doesn\'t meet these requirements.',
                        important: true,
                        category: 'security',
                        created_at: Date.now() - 259200000, // 3 days ago
                        read: false
                    },
                    {
                        id: 5,
                        title: 'New Pricing Plans Available',
                        content: 'We\'ve updated our pricing plans to better serve your needs. The new plans include more features, increased storage, and competitive pricing. Existing customers will maintain their current rates, but you can opt to switch to one of the new plans by contacting our support team.',
                        important: false,
                        category: 'announcement',
                        created_at: Date.now() - 518400000, // 6 days ago
                        read: true
                    },
                ];
                setNotices(mockNotices);
                setIsLoading(false);
            }
        }
    }, [isAuthenticated]);

    // Format date to readable string
    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Filter notices based on search term and category filter
    const filteredNotices = notices.filter(notice => {
        const matchesSearch =
            searchTerm === "" ||
            notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notice.content.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
            categoryFilter === "all" ||
            notice.category === categoryFilter;

        return matchesSearch && matchesCategory;
    });

    // Get color for category badge
    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'maintenance':
                return 'bg-purple-100 text-purple-800';
            case 'update':
                return 'bg-blue-100 text-blue-800';
            case 'security':
                return 'bg-red-100 text-red-800';
            case 'announcement':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Mark a notice as read
    const markAsRead = async (noticeId: number) => {
        try {
            // In a real app, you would update the read status via API
            // For now, we'll just update it locally
            setNotices(notices.map(notice =>
                notice.id === noticeId ? { ...notice, read: true } : notice
            ));
        } catch (error) {
            console.error("Error marking notice as read:", error);
        }
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
                title="Notices & Announcements | Client Portal | Snytra"
                description="View important company announcements and service notifications."
                ogImage="/images/client-portal.jpg"
            />

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-charcoal">Notices & Announcements</h1>
                <p className="text-charcoal/70 mt-1">Stay informed about system updates and important announcements</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
                    {/* Search input */}
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-charcoal/40" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search notices..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Category filter */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Tag className="h-4 w-4 text-charcoal/40" />
                        </div>
                        <select
                            className="pl-10 pr-8 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none bg-white"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="update">Updates</option>
                            <option value="security">Security</option>
                            <option value="announcement">Announcements</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Notices List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : filteredNotices.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {filteredNotices.map((notice) => (
                            <Link
                                key={notice.id}
                                href={`/profile/notices/${notice.id}`}
                                className={`block hover:bg-beige/20 transition-colors ${!notice.read ? 'bg-beige/10' : ''}`}
                                onClick={() => markAsRead(notice.id)}
                            >
                                <div className="p-6">
                                    <div className="flex items-start">
                                        <div className="mr-4 mt-1">
                                            {notice.important ? (
                                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                            ) : (
                                                <Info className="h-5 w-5 text-blue-500" />
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                                <h3 className={`text-lg font-medium ${!notice.read ? 'text-primary font-semibold' : 'text-charcoal'}`}>
                                                    {notice.title}
                                                    {!notice.read && (
                                                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">New</span>
                                                    )}
                                                </h3>
                                                <span
                                                    className={`px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${getCategoryColor(notice.category)}`}
                                                >
                                                    {notice.category ? (notice.category.charAt(0).toUpperCase() + notice.category.slice(1)) : 'General'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-charcoal/70 mb-3 line-clamp-2">{notice.content}</p>
                                            <div className="flex items-center text-xs text-charcoal/60">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                <span>{formatDate(notice.created_at)}</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-charcoal/40 ml-4 self-center" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Bell className="h-12 w-12 text-charcoal/30 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-charcoal mb-1">No notices found</h3>
                        <p className="text-charcoal/70">
                            {searchTerm || categoryFilter !== "all"
                                ? "No notices match your search criteria"
                                : "There are no announcements or notifications at this time"}
                        </p>
                    </div>
                )}
            </div>
        </>
    );
} 