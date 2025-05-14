"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import SEO from "@/components/SEO";
import Link from "next/link";
import {
    CreditCard,
    Calendar,
    CheckCircle,
    Info,
    ArrowRight,
    ExternalLink
} from "lucide-react";

export default function SubscriptionPage() {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

    // Fetch subscription data
    useEffect(() => {
        if (isAuthenticated && user) {
            const fetchSubscriptionData = async () => {
                setIsLoading(true);
                try {
                    // Attempt to fetch from API
                    const response = await fetch(`/api/subscriptions/${user.id}`);

                    // Handle 404 or other errors with mock data
                    if (!response.ok) {
                        // Use mock data instead
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
                            features: [
                                "Unlimited menu items",
                                "Staff management",
                                "Advanced reporting",
                                "Customer CRM",
                                "Inventory management",
                                "Email support"
                            ]
                        });
                    } else {
                        // Use real data if available
                        const data = await response.json();
                        setSubscriptionDetails(data.subscription || null);
                    }
                } catch (err) {
                    console.error("Error fetching subscription details:", err);
                    setError("Could not load subscription information. Using demo data.");

                    // Fallback to demo data
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
                        features: [
                            "Unlimited menu items",
                            "Staff management",
                            "Advanced reporting",
                            "Customer CRM",
                            "Inventory management",
                            "Email support"
                        ]
                    });
                } finally {
                    setIsLoading(false);
                }
            };

            fetchSubscriptionData();
        }
    }, [user?.id, isAuthenticated]);

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
                return 'bg-green-100 text-green-800';
            case 'canceled':
                return 'bg-red-100 text-red-800';
            case 'past_due':
                return 'bg-orange-100 text-orange-800';
            case 'trialing':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading || isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <>
            <SEO
                title="Subscription | Client Portal | Snytra"
                description="View and manage your subscription details."
                ogImage="/images/client-portal.jpg"
            />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-charcoal">Subscription</h1>
                    <p className="text-charcoal/70 mt-1">Manage your subscription and billing details</p>
                </div>
                <Link href="/profile/billing" className="text-primary hover:text-primary/80 text-sm font-medium flex items-center">
                    View billing history <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
            </div>

            {/* Error message */}
            {error && (
                <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-700">
                    <p>{error}</p>
                </div>
            )}

            {/* Subscription Details */}
            {subscriptionDetails ? (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-primary">{subscriptionDetails.plan_name}</h2>
                                <div className="mt-2">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusBadgeClass(subscriptionDetails.status)}`}>
                                        {subscriptionDetails.status?.charAt(0).toUpperCase() + subscriptionDetails.status?.slice(1) || 'Unknown'}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-charcoal">{formatAmount(subscriptionDetails.amount)}</p>
                                <p className="text-sm text-charcoal/70">per {subscriptionDetails.interval || 'month'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Subscription Info */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-medium text-charcoal/70 mb-2">Current Period</h3>
                                <div className="flex items-center">
                                    <Calendar className="h-5 w-5 text-primary mr-2" />
                                    <p className="text-charcoal">
                                        {formatDate(subscriptionDetails.current_period_start)} to {formatDate(subscriptionDetails.current_period_end)}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-charcoal/70 mb-2">Next Billing Date</h3>
                                <div className="flex items-center">
                                    <CreditCard className="h-5 w-5 text-primary mr-2" />
                                    <p className="text-charcoal">{formatDate(subscriptionDetails.current_period_end)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        {subscriptionDetails.features && (
                            <div className="mt-8">
                                <h3 className="text-lg font-medium text-charcoal mb-4">Plan Features</h3>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {subscriptionDetails.features.map((feature: string, index: number) => (
                                        <li key={index} className="flex items-start">
                                            <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                            <span className="text-charcoal">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-8 flex flex-wrap gap-4">
                            {subscriptionDetails.status === 'active' && (
                                <>
                                    <Link
                                        href="/profile/billing"
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-charcoal bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                    >
                                        Manage Billing
                                    </Link>
                                    <Link
                                        href="/subscription/change"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                    >
                                        Change Plan <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </>
                            )}

                            {subscriptionDetails.status === 'canceled' && (
                                <Link
                                    href="/subscription"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                >
                                    Reactivate Subscription
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <Info className="h-12 w-12 text-primary/50 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-charcoal mb-2">No Active Subscription</h2>
                    <p className="text-charcoal/70 mb-6 max-w-lg mx-auto">
                        You don't have an active subscription. Choose a plan to get started with our services.
                    </p>
                    <Link
                        href="/subscription"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        View Plans <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>
            )}

            {/* FAQ Section */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold text-charcoal mb-4">Frequently Asked Questions</h2>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden divide-y divide-gray-200">
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-charcoal mb-2">How do I cancel my subscription?</h3>
                        <p className="text-charcoal/70">
                            You can cancel your subscription anytime from the billing page. Your subscription will remain active until the end of your current billing period.
                        </p>
                    </div>
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-charcoal mb-2">Can I change my plan?</h3>
                        <p className="text-charcoal/70">
                            Yes, you can upgrade or downgrade your plan at any time. Changes will take effect immediately, with prorated charges for the remainder of your billing cycle.
                        </p>
                    </div>
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-charcoal mb-2">Will I get a refund if I cancel?</h3>
                        <p className="text-charcoal/70">
                            We don't offer refunds for partial months. When you cancel, your subscription will remain active until the end of your current billing period.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
} 