"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

export default function EditSubscriptionPlan() {
    const params = useParams();
    const planId = params.id as string;
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [plan, setPlan] = useState<SubscriptionPlan | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        billing_cycle: 'monthly',
        is_active: true,
        feature: '',
        features: [] as string[]
    });

    // Fetch plan data
    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const response = await fetch(`/api/subscription-plans/${planId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch subscription plan');
                }

                const data = await response.json();
                setPlan(data.plan);
                setFormData({
                    name: data.plan.name,
                    description: data.plan.description || '',
                    price: data.plan.price.toString(),
                    billing_cycle: data.plan.billing_cycle,
                    is_active: data.plan.is_active,
                    feature: '',
                    features: data.plan.features || []
                });
                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching subscription plan:', err);
                setError('Failed to load subscription plan. Please try again.');
                setIsLoading(false);
            }
        };

        if (planId) {
            fetchPlan();
        }
    }, [planId]);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checkbox = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Handle feature addition
    const handleAddFeature = () => {
        if (formData.feature.trim()) {
            setFormData(prev => ({
                ...prev,
                features: [...prev.features, prev.feature.trim()],
                feature: ''
            }));
        }
    };

    // Handle feature removal
    const handleRemoveFeature = (index: number) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    // Handle form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // Validate form
        if (!formData.name || !formData.price) {
            setError('Name and price are required');
            setIsSubmitting(false);
            return;
        }

        // Validate price is a number
        const price = parseFloat(formData.price);
        if (isNaN(price) || price < 0) {
            setError('Price must be a positive number');
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch(`/api/subscription-plans/${planId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    price: price,
                    billing_cycle: formData.billing_cycle,
                    features: formData.features,
                    is_active: formData.is_active
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update subscription plan');
            }

            // Redirect to subscription plans list
            router.push('/admin/subscriptions');
            router.refresh();
        } catch (err: any) {
            console.error('Error updating subscription plan:', err);
            setError(err.message || 'Failed to update subscription plan. Please try again.');
            setIsSubmitting(false);
        }
    };

    // Handle plan deletion
    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this subscription plan? This action cannot be undone.')) {
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

            router.push('/admin/subscriptions');
            router.refresh();
        } catch (err: any) {
            console.error('Error deleting subscription plan:', err);
            setError(err.message || 'Failed to delete subscription plan. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error && !plan) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
                <div className="mt-4">
                    <Link
                        href="/admin/subscriptions"
                        className="text-blue-600 hover:text-blue-800"
                    >
                        Back to Plans
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">Edit Subscription Plan</h1>
                    <Link
                        href="/admin/subscriptions"
                        className="text-blue-600 hover:text-blue-800"
                    >
                        Back to Plans
                    </Link>
                </div>
                <p className="text-gray-600">Update subscription plan details</p>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
                    {error}
                </div>
            )}

            <div className="bg-white shadow rounded-lg p-6">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="mb-4">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Plan Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="mb-4 grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                        Price *
                                    </label>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="billing_cycle" className="block text-sm font-medium text-gray-700 mb-1">
                                        Billing Cycle *
                                    </label>
                                    <select
                                        id="billing_cycle"
                                        name="billing_cycle"
                                        value={formData.billing_cycle}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                                        Active (available for purchase)
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Features
                                </label>
                                <div className="flex mb-2">
                                    <input
                                        type="text"
                                        name="feature"
                                        value={formData.feature}
                                        onChange={handleChange}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Add a feature"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddFeature}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="mt-3">
                                    {formData.features.length === 0 ? (
                                        <p className="text-sm text-gray-500">No features added yet</p>
                                    ) : (
                                        <ul className="bg-gray-50 rounded-md p-3 space-y-1">
                                            {formData.features.map((feature, index) => (
                                                <li key={index} className="flex items-center justify-between text-sm">
                                                    <div className="flex items-start">
                                                        <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        <span>{feature}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFeature(index)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        Remove
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            {plan?.user_count !== undefined && plan.user_count > 0 && (
                                <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-md">
                                    <p className="font-medium">Plan Usage Information</p>
                                    <p className="mt-1 text-sm">
                                        This plan currently has <span className="font-bold">{plan.user_count}</span> active subscribers.
                                    </p>
                                    <p className="mt-1 text-sm">
                                        Changes to the plan will affect all subscribers. If you deactivate this plan, existing subscribers will still have access until their current billing period ends.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={handleDelete}
                            className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${plan?.user_count && plan.user_count > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={plan?.user_count !== undefined && plan.user_count > 0}
                            title={plan?.user_count && plan.user_count > 0 ? "Cannot delete a plan with active subscribers" : ""}
                        >
                            Delete Plan
                        </button>

                        <div className="flex items-center">
                            <Link
                                href="/admin/subscriptions"
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
} 