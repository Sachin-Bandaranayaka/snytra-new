"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import SEO from "@/components/SEO";
import Link from "next/link";
import {
    LifeBuoy,
    Plus,
    Search,
    CheckCircle2,
    AlertCircle,
    Clock,
    MessageSquare,
    Filter,
    ChevronRight
} from "lucide-react";

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'closed':
                return 'bg-green-100 text-green-800';
            case 'open':
                return 'bg-blue-100 text-blue-800';
            case 'in_progress':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Format status for display
    const formatStatus = (status: string) => {
        if (!status) return 'Unknown';

        return status.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    return (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusBadgeClass(status)}`}>
            {formatStatus(status)}
        </span>
    );
};

export default function SupportTicketsPage() {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [tickets, setTickets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

    // Fetch tickets
    useEffect(() => {
        if (isAuthenticated && user) {
            const fetchTickets = async () => {
                try {
                    const response = await fetch(`/api/support-tickets?user=${user.id}`);
                    if (response.ok) {
                        const data = await response.json();
                        setTickets(data.tickets || []);
                    }
                } catch (error) {
                    console.error("Error fetching support tickets:", error);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchTickets();

            // Set mock data for development
            if (process.env.NODE_ENV === 'development') {
                const mockTickets = [
                    {
                        id: 1,
                        title: 'Payment issue with subscription',
                        description: 'I was charged twice for my monthly subscription. Please help resolve this issue.',
                        status: 'open',
                        priority: 'high',
                        created_at: Date.now() - 86400000, // 1 day ago
                        updated_at: Date.now() - 43200000, // 12 hours ago
                        message_count: 3
                    },
                    {
                        id: 2,
                        title: 'Cannot access reporting features',
                        description: 'The reporting section shows an error when I try to generate monthly sales report.',
                        status: 'in_progress',
                        priority: 'medium',
                        created_at: Date.now() - 172800000, // 2 days ago
                        updated_at: Date.now() - 86400000, // 1 day ago
                        message_count: 2
                    },
                    {
                        id: 3,
                        title: 'Question about API integration',
                        description: 'I need assistance with integrating your API with our existing systems.',
                        status: 'closed',
                        priority: 'low',
                        created_at: Date.now() - 432000000, // 5 days ago
                        updated_at: Date.now() - 345600000, // 4 days ago
                        message_count: 5
                    },
                    {
                        id: 4,
                        title: 'Feature request: customizable menu categories',
                        description: 'It would be great to have the ability to create and customize menu categories beyond the default ones.',
                        status: 'open',
                        priority: 'low',
                        created_at: Date.now() - 518400000, // 6 days ago
                        updated_at: Date.now() - 518400000, // 6 days ago
                        message_count: 1
                    },
                    {
                        id: 5,
                        title: 'Login issues on mobile app',
                        description: 'I cannot log in to the mobile app but website login works fine.',
                        status: 'in_progress',
                        priority: 'high',
                        created_at: Date.now() - 259200000, // 3 days ago
                        updated_at: Date.now() - 172800000, // 2 days ago
                        message_count: 4
                    },
                ];
                setTickets(mockTickets);
                setIsLoading(false);
            }
        }
    }, [user, isAuthenticated]);

    // Format date to readable string
    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Get the status icon based on ticket status
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'closed':
                return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case 'open':
                return <AlertCircle className="h-5 w-5 text-blue-500" />;
            case 'in_progress':
                return <Clock className="h-5 w-5 text-yellow-500" />;
            default:
                return <AlertCircle className="h-5 w-5 text-gray-500" />;
        }
    };

    // Filter tickets based on search term and status filter
    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch =
            searchTerm === "" ||
            ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.description.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === "all" ||
            ticket.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

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
                title="Support Tickets | Client Portal | Snytra"
                description="View and manage your support tickets."
                ogImage="/images/client-portal.jpg"
            />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-charcoal">Support Tickets</h1>
                    <p className="text-charcoal/70 mt-1">View and manage your support requests</p>
                </div>
                <Link
                    href="/profile/support/new"
                    className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New Ticket
                </Link>
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
                            placeholder="Search tickets..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Status filter */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Filter className="h-4 w-4 text-charcoal/40" />
                        </div>
                        <select
                            className="pl-10 pr-8 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary appearance-none bg-white"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tickets List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : filteredTickets.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {filteredTickets.map((ticket) => (
                            <Link
                                key={ticket.id}
                                href={`/profile/support/${ticket.id}`}
                                className="block hover:bg-beige/20 transition-colors"
                            >
                                <div className="p-6">
                                    <div className="flex items-start">
                                        <div className="mr-4 mt-1">
                                            {getStatusIcon(ticket.status)}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-lg font-medium text-charcoal">{ticket.title}</h3>
                                                <StatusBadge status={ticket.status} />
                                            </div>
                                            <p className="text-sm text-charcoal/70 mb-3 line-clamp-2">{ticket.description}</p>
                                            <div className="flex flex-wrap items-center text-xs text-charcoal/60 gap-x-4 gap-y-1">
                                                <span>Created: {formatDate(ticket.created_at)}</span>
                                                <span>Last Updated: {formatDate(ticket.updated_at)}</span>
                                                <span className="flex items-center">
                                                    <MessageSquare className="h-3 w-3 mr-1" />
                                                    {ticket.message_count} {ticket.message_count === 1 ? 'message' : 'messages'}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full ${ticket.priority === 'high' ? 'bg-red-50 text-red-700' :
                                                    ticket.priority === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                                                        'bg-green-50 text-green-700'
                                                    }`}>
                                                    {ticket.priority ? (ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)) : 'Normal'} Priority
                                                </span>
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
                        <LifeBuoy className="h-12 w-12 text-charcoal/30 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-charcoal mb-1">No tickets found</h3>
                        <p className="text-charcoal/70 mb-4">
                            {searchTerm || statusFilter !== "all"
                                ? "No tickets match your search criteria"
                                : "You haven't created any support tickets yet"}
                        </p>
                        <Link
                            href="/profile/support/new"
                            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Your First Ticket
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
} 