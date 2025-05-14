"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SubscriptionPlan {
    id: number;
    name: string;
    description: string;
    price: number;
    billing_cycle: string;
    features: string[];
    is_active: boolean;
}

interface UserSubscription {
    subscription_plan?: number;
    subscription_status?: string;
    subscription_current_period_start?: string;
    subscription_current_period_end?: string;
}

export default function SubscriptionPage() {
    const router = useRouter();
    const [user, setUser] = useState<UserSubscription | null>(null);
    const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
    const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch user data and subscription plans
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user data
                const userResponse = await fetch('/api/auth/me');
                if (!userResponse.ok) {
                    throw new Error('Failed to fetch user data');
                }
                const userData = await userResponse.json();
                setUser(userData.user);

                // Fetch all subscription plans
                const plansResponse = await fetch('/api/subscription-plans');
                if (!plansResponse.ok) {
                    throw new Error('Failed to fetch subscription plans');
                }
                const plansData = await plansResponse.json();

                // Filter active plans
                const activePlans = plansData.plans.filter((plan: SubscriptionPlan) => plan.is_active);
                setAvailablePlans(activePlans);

                // Get current plan
                if (userData.user.subscription_plan) {
                    const current = plansData.plans.find(
                        (plan: SubscriptionPlan) => plan.id === userData.user.subscription_plan
                    );
                    setCurrentPlan(current || null);
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load subscription information. Please try again.');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleChangePlan = (planId: number) => {
        router.push(`/dashboard/account/subscription/change?plan=${planId}`);
    };

    const handleCancelSubscription = async () => {
        if (!window.confirm('Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.')) {
            return;
        }

        try {
            const response = await fetch('/api/subscriptions/cancel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user?.id,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to cancel subscription');
            }

            // Refresh the page to show updated subscription status
            window.location.reload();
        } catch (err) {
            console.error('Error canceling subscription:', err);
            alert('Failed to cancel subscription. Please try again or contact support.');
        }
    };

    // Format date
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                            {error}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Subscription Management</h1>

                {/* Current Subscription */}
                <div className="bg-white rounded-lg shadow mb-8">
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Current Subscription</h2>

                        {!currentPlan || user?.subscription_status !== 'active' ? (
                            <div>
                                <p className="text-gray-500 mb-4">
                                    You don't have an active subscription. Choose a plan below to get started.
                                </p>
                                <Link
                                    href="/pricing"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    View Plans
                                </Link>
                            </div>
                        ) : (
                            <div>
                                <div className="bg-gray-50 p-4 rounded-md mb-6">
                                    <div className="flex justify-between flex-wrap">
                                        <div className="mb-4 md:mb-0">
                                            <p className="text-sm text-gray-500">Plan</p>
                                            <p className="font-medium text-gray-900">{currentPlan.name}</p>
                                        </div>
                                        <div className="mb-4 md:mb-0">
                                            <p className="text-sm text-gray-500">Status</p>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {user?.subscription_status}
                                            </span>
                                        </div>
                                        <div className="mb-4 md:mb-0">
                                            <p className="text-sm text-gray-500">Billing</p>
                                            <p className="font-medium text-gray-900">
                                                ${currentPlan.price}/{currentPlan.billing_cycle === 'monthly' ? 'mo' : 'yr'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Current Period</p>
                                            <p className="font-medium text-gray-900">
                                                {formatDate(user?.subscription_current_period_start)} - {formatDate(user?.subscription_current_period_end)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-gray-900">Plan Features:</h3>
                                    <ul className="mt-2 space-y-2">
                                        {currentPlan.features.map((feature, index) => (
                                            <li key={index} className="flex items-start">
                                                <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-6 space-x-4">
                                    <button
                                        onClick={() => router.push('/dashboard/account/subscription/change')}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        Change Plan
                                    </button>
                                    <button
                                        onClick={handleCancelSubscription}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                                    >
                                        Cancel Subscription
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Billing History */}
                <div className="bg-white rounded-lg shadow mb-8">
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Billing History</h2>

                        <div className="border border-gray-200 rounded-md overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Description
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {/* Example invoice - in a real app, these would come from the API */}
                                    {currentPlan ? (
                                        <tr>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(user?.subscription_current_period_start)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {currentPlan.name} - {currentPlan.billing_cycle === 'monthly' ? 'Monthly' : 'Annual'} Subscription
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                ${currentPlan.price}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Paid
                                                </span>
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                No billing history available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h2>

                        <div className="bg-gray-50 p-4 rounded-md flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="bg-white p-2 rounded-md mr-4">
                                    <svg className="h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                        <line x1="1" y1="10" x2="23" y2="10"></line>
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                                    <p className="text-sm text-gray-500">Expires 12/2025</p>
                                </div>
                            </div>
                            <button
                                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Update
                            </button>
                        </div>

                        <div className="mt-4">
                            <button
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Add Payment Method
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 