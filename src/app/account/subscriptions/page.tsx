"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
    id: string;
    name: string;
    email: string;
    subscription_plan?: string;
    subscription_status?: string;
    subscription_current_period_end?: string;
}

interface Subscription {
    id: string;
    status: string;
    plan_id: string;
    start_date: string;
    end_date: string;
}

export default function SubscriptionsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Get user from localStorage
        const loadUser = () => {
            const userJson = localStorage.getItem('user');
            if (userJson) {
                setUser(JSON.parse(userJson));
            }
        };

        // Fetch subscription details
        const fetchSubscription = async (userId: string) => {
            try {
                const response = await fetch(`/api/subscriptions?userId=${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch subscription');
                }
                const data = await response.json();
                if (data.subscriptions && data.subscriptions.length > 0) {
                    setSubscription(data.subscriptions[0]);
                }
            } catch (err: any) {
                console.error('Error fetching subscription:', err);
                setError(err.message || 'Failed to load subscription details');
            } finally {
                setLoading(false);
            }
        };

        loadUser();
        if (user?.id) {
            fetchSubscription(user.id);
        } else {
            setLoading(false);
        }
    }, [user?.id]);

    // Helper function to format dates
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Helper function to get plan name
    const getPlanName = (planId?: string) => {
        if (!planId) return 'No Plan';

        const planMap: Record<string, string> = {
            'price_basic': 'Basic Plan',
            'basic': 'Basic Plan',
            'price_premium': 'Premium Plan',
            'premium': 'Premium Plan',
            'price_enterprise': 'Enterprise Plan',
            'enterprise': 'Enterprise Plan'
        };

        return planMap[planId] || 'Unknown Plan';
    };

    // Helper function to get plan price
    const getPlanPrice = (planId?: string) => {
        if (!planId) return '0';

        const priceMap: Record<string, string> = {
            'price_basic': '29',
            'basic': '29',
            'price_premium': '59',
            'premium': '59',
            'price_enterprise': '99',
            'enterprise': '99'
        };

        return priceMap[planId] || '0';
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">Your Subscription</h1>
                <div className="text-center py-12">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">Your Subscription</h1>
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                    <p>{error}</p>
                </div>
                <Link href="/dashboard" className="text-blue-600 hover:underline">
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">Your Subscription</h1>
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
                    <p>You need to be logged in to view subscription details.</p>
                </div>
                <Link href="/login" className="text-blue-600 hover:underline">
                    Log In
                </Link>
            </div>
        );
    }

    const hasActiveSubscription = subscription?.status === 'active' || user.subscription_status === 'active';
    const planName = subscription ? getPlanName(subscription.plan_id) : getPlanName(user.subscription_plan);
    const planPrice = subscription ? getPlanPrice(subscription.plan_id) : getPlanPrice(user.subscription_plan);
    const renewalDate = subscription ? formatDate(subscription.end_date) : formatDate(user.subscription_current_period_end);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Your Subscription</h1>

            {!hasActiveSubscription ? (
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">No Active Subscription</h2>
                    <p className="text-gray-600 mb-4">
                        You don't have an active subscription plan. Choose a subscription plan to access premium features.
                    </p>
                    <Link
                        href="/subscription"
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Choose a Plan
                    </Link>
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 className="text-lg font-medium mb-1">{planName}</h3>
                            <p className="text-2xl font-bold">${planPrice}<span className="text-sm font-normal text-gray-500">/month</span></p>
                            <div className="mt-2">
                                <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                    Active
                                </span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div>
                                <span className="text-gray-500">Next Billing Date</span>
                                <p className="font-medium">{renewalDate}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Payment Method</span>
                                <p className="font-medium">Credit Card</p>
                            </div>
                        </div>
                    </div>
                    <div className="border-t pt-4 flex flex-wrap gap-3">
                        <Link
                            href="/subscription"
                            className="inline-block bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            Change Plan
                        </Link>
                        <button
                            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
                            onClick={() => alert('This would cancel your subscription in a real implementation.')}
                        >
                            Cancel Subscription
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-6">
                <Link href="/dashboard" className="text-blue-600 hover:underline">
                    Return to Dashboard
                </Link>
            </div>
        </div>
    );
} 