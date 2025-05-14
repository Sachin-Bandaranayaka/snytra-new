"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import SEO from "@/components/SEO";
import Link from "next/link";
import {
    CreditCard,
    Calendar,
    Bell,
    LifeBuoy,
    FileText,
    ArrowRight,
    User,
    Settings,
    ExternalLink,
    CheckCircle2,
    AlertCircle
} from "lucide-react";

// Quick actions for the dashboard
const quickActions = [
    { name: "Update Profile", icon: User, href: "/profile/account", color: "bg-blue-500" },
    { name: "View Invoices", icon: FileText, href: "/profile/billing", color: "bg-green-500" },
    { name: "Create Support Ticket", icon: LifeBuoy, href: "/profile/support/new", color: "bg-purple-500" },
    { name: "Upgrade Plan", icon: CreditCard, href: "/pricing", color: "bg-amber-500" },
];

export default function ProfilePage() {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);
    const [billingHistory, setBillingHistory] = useState<any[]>([]);
    const [supportTickets, setSupportTickets] = useState<any[]>([]);
    const [notices, setNotices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Redirect if not authenticated
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated && user) {
            // Fetch all data in parallel
            const fetchAllData = async () => {
                setIsLoading(true);
                try {
                    // Fetch subscription details
                    const subscriptionPromise = fetch(`/api/subscriptions/${user.id}`)
                        .then(res => res.ok ? res.json() : { subscription: null })
                        .then(data => setSubscriptionDetails(data.subscription))
                        .catch(err => {
                            console.error("Error fetching subscription details:", err);
                            return null;
                        });

                    // Fetch recent billing history - just 3 items
                    const billingPromise = fetch(`/api/subscriptions/${user.id}/billing-history?limit=3`)
                        .then(res => res.ok ? res.json() : { invoices: [] })
                        .then(data => setBillingHistory(data.invoices))
                        .catch(err => {
                            console.error("Error fetching billing history:", err);
                            return [];
                        });

                    // Fetch recent support tickets - just 3 items
                    const ticketsPromise = fetch(`/api/support-tickets?user=${user.id}&limit=3`)
                        .then(res => res.ok ? res.json() : { tickets: [] })
                        .then(data => setSupportTickets(data.tickets || []))
                        .catch(err => {
                            console.error("Error fetching support tickets:", err);
                            return [];
                        });

                    // Fetch recent notices - just 3 items
                    const noticesPromise = fetch(`/api/notices?limit=3`)
                        .then(res => res.ok ? res.json() : { notices: [] })
                        .then(data => setNotices(data.notices || []))
                        .catch(err => {
                            console.error("Error fetching notices:", err);
                            return [];
                        });

                    // Wait for all promises to resolve
                    await Promise.all([
                        subscriptionPromise,
                        billingPromise,
                        ticketsPromise,
                        noticesPromise
                    ]);

                } catch (error) {
                    console.error("Error fetching dashboard data:", error);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchAllData();

            // Mock data for development
            if (process.env.NODE_ENV === 'development') {
                // Set mock data for subscription if none from API
                if (!subscriptionDetails) {
                    setSubscriptionDetails({
                        id: 1,
                        user_id: user.id,
                        plan_id: 2,
                        plan_name: 'Professional Plan',
                        status: 'active',
                        amount: 2999,
                        interval: 'month',
                        stripe_subscription_id: 'sub_mock12345',
                        start_date: Date.now() - 2592000000, // 30 days ago
                        end_date: Date.now() + 2592000000, // 30 days from now
                        current_period_start: Date.now() - 864000000, // 10 days ago
                        current_period_end: Date.now() + 1728000000, // 20 days from now
                    });
                }

                // Set mock data for billing history if none from API
                if (billingHistory.length === 0) {
                    setBillingHistory([
                        {
                            id: 'inv_mock123',
                            number: 'INV-001',
                            created: Date.now() - 2592000000,
                            period_start: Date.now() - 2592000000,
                            period_end: Date.now() - 1728000000,
                            amount_due: 2999,
                            amount_paid: 2999,
                            amount_remaining: 0,
                            status: 'paid',
                            currency: 'usd',
                        },
                        {
                            id: 'inv_mock124',
                            number: 'INV-002',
                            created: Date.now() - 5184000000,
                            period_start: Date.now() - 5184000000,
                            period_end: Date.now() - 2592000000,
                            amount_due: 2999,
                            amount_paid: 2999,
                            amount_remaining: 0,
                            status: 'paid',
                            currency: 'usd',
                        },
                    ]);
                }

                // Set mock data for support tickets if none from API
                if (supportTickets.length === 0) {
                    setSupportTickets([
                        { id: 1, title: 'Payment issue with subscription', status: 'open', created_at: Date.now() - 86400000 },
                        { id: 2, title: 'Cannot access reporting features', status: 'in_progress', created_at: Date.now() - 172800000 },
                        { id: 3, title: 'Question about API integration', status: 'closed', created_at: Date.now() - 432000000 },
                    ]);
                }

                // Set mock data for notices if none from API
                if (notices.length === 0) {
                    setNotices([
                        { id: 1, title: 'Scheduled Maintenance: June 15, 2025', content: 'System will be down for maintenance between 2AM-4AM EST.', important: true, created_at: Date.now() - 86400000 },
                        { id: 2, title: 'New Feature Release: Advanced Analytics', content: 'Check out our new analytics dashboard!', important: false, created_at: Date.now() - 172800000 },
                        { id: 3, title: 'Holiday Hours Update', content: 'Support hours will be limited during upcoming holidays.', important: false, created_at: Date.now() - 432000000 },
                    ]);
                }
            }
        }
    }, [user?.id, isAuthenticated]); // Only re-run if user ID or auth status changes

    if (loading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-beige">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Format date to a readable string
    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Format currency amount
    const formatAmount = (amount: number, currency: string = 'usd') => {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        });

        return formatter.format(amount / 100);
    };

    // Get status badge color based on status
    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'active':
            case 'paid':
            case 'closed':
                return 'bg-green-100 text-green-800';
            case 'canceled':
            case 'unpaid':
                return 'bg-red-100 text-red-800';
            case 'open':
                return 'bg-blue-100 text-blue-800';
            case 'in_progress':
            case 'trialing':
                return 'bg-yellow-100 text-yellow-800';
            case 'past_due':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Format ticket status for display
    const formatStatus = (status: string) => {
        return status.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    return (
        <>
            <SEO
                title="Dashboard | Client Portal | Snytra"
                description="View and manage your account, subscription, billing, and support tickets."
                ogImage="/images/client-portal.jpg"
            />

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-charcoal">Welcome back, {user?.name?.split(' ')[0] || 'there'}!</h1>
                <p className="text-charcoal/70 mt-1">Here's an overview of your account</p>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-charcoal">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action) => (
                        <Link
                            key={action.name}
                            href={action.href}
                            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow group"
                        >
                            <div className="flex items-center">
                                <div className={`${action.color} p-3 rounded-md mr-4 text-white`}>
                                    <action.icon className="h-5 w-5" />
                                </div>
                                <span className="font-medium text-charcoal group-hover:text-primary transition-colors">{action.name}</span>
                                <ArrowRight className="h-4 w-4 ml-auto text-charcoal/40 group-hover:text-primary transition-colors" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subscription Information */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-charcoal flex items-center">
                            <FileText className="mr-2 h-5 w-5 text-primary" />
                            Subscription
                        </h2>
                        <Link href="/profile/subscription" className="text-primary hover:text-primary/80 text-sm font-medium flex items-center">
                            View details <ExternalLink className="ml-1 h-3 w-3" />
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : subscriptionDetails ? (
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="font-semibold text-lg text-primary">{subscriptionDetails.plan_name}</p>
                                    <div className="mt-1">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusBadgeClass(subscriptionDetails.status)}`}>
                                            {subscriptionDetails.status.charAt(0).toUpperCase() + subscriptionDetails.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-charcoal/70">Current Period</p>
                                    <p className="text-sm text-charcoal">
                                        {subscriptionDetails.current_period_start ? formatDate(subscriptionDetails.current_period_start) : '-'} to {subscriptionDetails.current_period_end ? formatDate(subscriptionDetails.current_period_end) : '-'}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4 mt-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-charcoal/70">Next billing</p>
                                        <p className="text-sm font-medium text-charcoal">
                                            {subscriptionDetails.current_period_end ? formatDate(subscriptionDetails.current_period_end) : '-'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-charcoal/70">Amount</p>
                                        <p className="text-sm font-medium text-charcoal">
                                            {formatAmount(subscriptionDetails.amount)} / {subscriptionDetails.interval || 'month'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-charcoal mb-4">No active subscription found.</p>
                            <Link href="/pricing" className="inline-block bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                                View subscription plans
                            </Link>
                        </div>
                    )}
                </div>

                {/* Recent Invoices */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-charcoal flex items-center">
                            <CreditCard className="mr-2 h-5 w-5 text-primary" />
                            Recent Invoices
                        </h2>
                        <Link href="/profile/billing" className="text-primary hover:text-primary/80 text-sm font-medium flex items-center">
                            View all <ExternalLink className="ml-1 h-3 w-3" />
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : billingHistory && billingHistory.length > 0 ? (
                        <div className="space-y-3">
                            {billingHistory.slice(0, 3).map((invoice) => (
                                <div key={invoice.id} className="flex justify-between items-center p-3 hover:bg-beige/30 rounded-md transition-colors">
                                    <div className="flex items-center">
                                        <Calendar className="h-5 w-5 text-charcoal/60 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-charcoal">{formatDate(invoice.created)}</p>
                                            <p className="text-xs text-charcoal/70">Invoice #{invoice.number}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <span className={`mr-3 px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusBadgeClass(invoice.status)}`}>
                                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                        </span>
                                        <span className="text-sm font-medium text-charcoal">{formatAmount(invoice.amount_paid)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-6 text-center">
                            <p className="text-charcoal/70">No billing history available.</p>
                        </div>
                    )}
                </div>

                {/* Support Tickets */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-charcoal flex items-center">
                            <LifeBuoy className="mr-2 h-5 w-5 text-primary" />
                            Support Tickets
                        </h2>
                        <Link href="/profile/support" className="text-primary hover:text-primary/80 text-sm font-medium flex items-center">
                            View all <ExternalLink className="ml-1 h-3 w-3" />
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : supportTickets && supportTickets.length > 0 ? (
                        <div className="space-y-3">
                            {supportTickets.map((ticket) => (
                                <Link
                                    key={ticket.id}
                                    href={`/profile/support/${ticket.id}`}
                                    className="flex justify-between items-center p-3 hover:bg-beige/30 rounded-md transition-colors"
                                >
                                    <div className="flex items-start mr-2">
                                        <div className="mt-0.5">
                                            {ticket.status === 'closed' ? (
                                                <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" />
                                            ) : (
                                                <AlertCircle className="h-5 w-5 text-amber-500 mr-3" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-charcoal">{ticket.title}</p>
                                            <p className="text-xs text-charcoal/70">Created {formatDate(ticket.created_at)}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusBadgeClass(ticket.status)}`}>
                                        {formatStatus(ticket.status)}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="py-6 text-center">
                            <p className="text-charcoal/70 mb-4">No support tickets found.</p>
                            <Link
                                href="/profile/support/new"
                                className="inline-block bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                            >
                                Create a ticket
                            </Link>
                        </div>
                    )}
                </div>

                {/* Recent Notices */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-charcoal flex items-center">
                            <Bell className="mr-2 h-5 w-5 text-primary" />
                            Recent Notices
                        </h2>
                        <Link href="/profile/notices" className="text-primary hover:text-primary/80 text-sm font-medium flex items-center">
                            View all <ExternalLink className="ml-1 h-3 w-3" />
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : notices && notices.length > 0 ? (
                        <div className="space-y-3">
                            {notices.map((notice) => (
                                <Link
                                    key={notice.id}
                                    href={`/profile/notices/${notice.id}`}
                                    className="block p-3 hover:bg-beige/30 rounded-md transition-colors"
                                >
                                    <div className="flex items-start">
                                        <div className="mt-0.5">
                                            {notice.important ? (
                                                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                                            ) : (
                                                <Bell className="h-5 w-5 text-blue-400 mr-3" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-charcoal">{notice.title}</p>
                                            <p className="text-xs text-charcoal/60 mt-1 line-clamp-2">{notice.content}</p>
                                            <p className="text-xs text-charcoal/70 mt-1">{formatDate(notice.created_at)}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="py-6 text-center">
                            <p className="text-charcoal/70">No notices available.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
} 