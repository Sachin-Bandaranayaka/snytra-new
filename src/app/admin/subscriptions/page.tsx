"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SubscriptionPlan {
    id: number;
    name: string;
    description: string;
    price: number;
    billing_cycle: string;
    features: string[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
    user_count?: number;
}

export default function SubscriptionPlansManagement() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch subscription plans
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await fetch('/api/subscription-plans');
                if (!response.ok) {
                    throw new Error('Failed to fetch subscription plans');
                }

                const data = await response.json();
                setPlans(data.plans || []);
                setLoading(false);
            } catch (err) {
                setError('Failed to load subscription plans. Please try again.');
                setLoading(false);
                console.error('Error fetching subscription plans:', err);
            }
        };

        fetchPlans();
    }, []);

    // Toggle plan active status
    const handleToggleActive = async (planId: number, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/subscription-plans/${planId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    is_active: !currentStatus
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update plan status');
            }

            // Update plans in state
            setPlans(plans.map(plan =>
                plan.id === planId
                    ? { ...plan, is_active: !currentStatus }
                    : plan
            ));

            alert(`Plan ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        } catch (err) {
            console.error('Error updating plan status:', err);
            alert('Failed to update plan status. Please try again.');
        }
    };

    // Delete plan
    const handleDeletePlan = async (planId: number, planName: string) => {
        if (!window.confirm(`Are you sure you want to delete the "${planName}" plan? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/subscription-plans/${planId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete subscription plan');
            }

            // Remove plan from state
            setPlans(plans.filter(plan => plan.id !== planId));
            alert('Plan deleted successfully');
        } catch (err: any) {
            console.error('Error deleting subscription plan:', err);
            alert(err.message || 'Failed to delete plan. Please try again.');
        }
    };

    // Format price as currency
    const formatPrice = (price: number, cycle: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price) + `/${cycle === 'monthly' ? 'mo' : 'yr'}`;
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Subscription Plans</h1>
                    <p className="text-gray-600">Manage subscription plans for your customers</p>
                </div>
                <Link
                    href="/admin/subscriptions/new"
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                    Add New Plan
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    {error}
                </div>
            ) : plans.length === 0 ? (
                <div className="text-center p-8 bg-white rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No subscription plans found</h3>
                    <p className="text-gray-500 mb-4">Create your first subscription plan to start offering premium features to your customers.</p>
                    <Link
                        href="/admin/subscriptions/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        Create Subscription Plan
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`bg-white shadow rounded-lg overflow-hidden border-t-4 ${plan.is_active ? 'border-green-500' : 'border-gray-300'
                                }`}
                        >
                            <div className="p-5">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                                        <p className="text-xl font-bold mt-1">{formatPrice(plan.price, plan.billing_cycle)}</p>
                                    </div>
                                    <span
                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${plan.is_active
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}
                                    >
                                        {plan.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <p className="mt-2 text-sm text-gray-600">{plan.description}</p>

                                <div className="mt-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Features:</h4>
                                    <ul className="space-y-1">
                                        {plan.features && plan.features.slice(0, 3).map((feature, index) => (
                                            <li key={index} className="text-sm text-gray-600 flex items-start">
                                                <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                {feature}
                                            </li>
                                        ))}
                                        {plan.features && plan.features.length > 3 && (
                                            <li className="text-sm text-gray-600">
                                                +{plan.features.length - 3} more features
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                {plan.user_count !== undefined && (
                                    <div className="mt-4 text-sm text-gray-600">
                                        <span className="font-medium">{plan.user_count}</span> users subscribed
                                    </div>
                                )}
                            </div>

                            <div className="bg-gray-50 px-5 py-3 flex justify-between">
                                <div className="flex space-x-3">
                                    <Link
                                        href={`/admin/subscriptions/${plan.id}`}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        Edit
                                    </Link>
                                    {(!plan.user_count || plan.user_count === 0) && (
                                        <button
                                            onClick={() => handleDeletePlan(plan.id, plan.name)}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleToggleActive(plan.id, plan.is_active)}
                                    className={`text-sm font-medium ${plan.is_active
                                        ? 'text-red-600 hover:text-red-800'
                                        : 'text-green-600 hover:text-green-800'
                                        }`}
                                >
                                    {plan.is_active ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
} 