"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Interfaces for feature management
interface Feature {
    key: string;
    name: string;
    description?: string;
}

export default function CreateSubscriptionPlan() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSyncingStripe, setIsSyncingStripe] = useState(false);
    const [availableFeatures, setAvailableFeatures] = useState<Feature[]>([]);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        billing_cycle: 'monthly',
        is_active: true,
        has_trial: false,
        trial_days: '0',
        selectedFeatures: [] as string[]
    });

    // Fetch available features when component mounts
    useEffect(() => {
        async function fetchFeatures() {
            try {
                const response = await fetch('/api/features');
                if (!response.ok) {
                    throw new Error('Failed to fetch features');
                }
                const data = await response.json();
                if (data.success && data.features) {
                    setAvailableFeatures(data.features);
                }
            } catch (err) {
                console.error('Error fetching features:', err);
                // Initialize with some default features if API fails
                setAvailableFeatures([
                    { key: 'menu_management', name: 'Menu Management' },
                    { key: 'online_ordering', name: 'Online Ordering' },
                    { key: 'reservation_system', name: 'Reservation System' },
                    { key: 'inventory_management', name: 'Inventory Management' },
                    { key: 'table_management', name: 'Table Management' },
                    { key: 'basic_analytics', name: 'Basic Analytics' },
                    { key: 'advanced_analytics', name: 'Advanced Analytics' },
                    { key: 'email_support', name: 'Email Support' },
                    { key: 'priority_support', name: 'Priority Support' },
                    { key: 'multi_location', name: 'Multi-location Support' },
                    { key: 'custom_reporting', name: 'Custom Reporting' },
                    { key: 'api_access', name: 'API Access' }
                ]);
            }
        }

        fetchFeatures();
    }, []);

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

    // Handle feature selection
    const handleFeatureToggle = (featureKey: string) => {
        setFormData(prev => {
            const isSelected = prev.selectedFeatures.includes(featureKey);
            const updatedFeatures = isSelected
                ? prev.selectedFeatures.filter(key => key !== featureKey)
                : [...prev.selectedFeatures, featureKey];

            return { ...prev, selectedFeatures: updatedFeatures };
        });
    };

    // Handle form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);

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
            const response = await fetch('/api/subscription-plans', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    price: price,
                    billing_cycle: formData.billing_cycle,
                    features: formData.selectedFeatures, // Send feature keys
                    is_active: formData.is_active,
                    has_trial: formData.has_trial,
                    trial_days: formData.has_trial ? parseInt(formData.trial_days) : 0
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create subscription plan');
            }

            const data = await response.json();

            if (data.success && data.plan) {
                setSuccessMessage('Plan created successfully! Would you like to sync with Stripe now?');
                // Now sync with Stripe
                await syncPlanWithStripe(data.plan.id);
            } else {
                router.push('/admin/subscriptions');
                router.refresh();
            }
        } catch (err: any) {
            console.error('Error creating subscription plan:', err);
            setError(err.message || 'Failed to create subscription plan. Please try again.');
            setIsSubmitting(false);
        }
    };

    // Function to sync a plan with Stripe
    const syncPlanWithStripe = async (planId: number) => {
        try {
            setIsSyncingStripe(true);

            const response = await fetch('/api/subscription-plans/stripe-sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ planId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to sync with Stripe');
            }

            setSuccessMessage('Plan synced with Stripe successfully!');
            setTimeout(() => {
                router.push('/admin/subscriptions');
                router.refresh();
            }, 2000);
        } catch (err: any) {
            console.error('Error syncing with Stripe:', err);
            setError(err.message || 'Failed to sync with Stripe. You can try again later.');
        } finally {
            setIsSyncingStripe(false);
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">Create Subscription Plan</h1>
                    <Link
                        href="/admin/subscriptions"
                        className="text-blue-600 hover:text-blue-800"
                    >
                        Back to Plans
                    </Link>
                </div>
                <p className="text-gray-600">Create a new subscription plan for your customers</p>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
                    {successMessage}
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg p-6">
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
                                    placeholder="e.g., Basic Plan"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Description of the plan"
                                    rows={3}
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                    Price (USD) *
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g., 49.99"
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="billing_cycle" className="block text-sm font-medium text-gray-700 mb-1">
                                    Billing Cycle
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

                            <div className="mb-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                                        Active Plan
                                    </label>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    If unchecked, this plan won't be available for new subscriptions
                                </p>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="has_trial"
                                        name="has_trial"
                                        checked={formData.has_trial}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="has_trial" className="ml-2 block text-sm text-gray-700">
                                        Offer Free Trial
                                    </label>
                                </div>

                                {formData.has_trial && (
                                    <div className="mt-2">
                                        <label htmlFor="trial_days" className="block text-sm font-medium text-gray-700 mb-1">
                                            Trial Days
                                        </label>
                                        <input
                                            type="number"
                                            id="trial_days"
                                            name="trial_days"
                                            value={formData.trial_days}
                                            onChange={handleChange}
                                            min="1"
                                            max="90"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Plan Features
                                </label>
                                <div className="bg-gray-50 rounded-md p-4 max-h-96 overflow-y-auto">
                                    <div className="space-y-2">
                                        {availableFeatures.map((feature) => (
                                            <div key={feature.key} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`feature-${feature.key}`}
                                                    checked={formData.selectedFeatures.includes(feature.key)}
                                                    onChange={() => handleFeatureToggle(feature.key)}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <label
                                                    htmlFor={`feature-${feature.key}`}
                                                    className="ml-2 block text-sm text-gray-700"
                                                >
                                                    {feature.name}
                                                    {feature.description && (
                                                        <span className="block text-xs text-gray-500">
                                                            {feature.description}
                                                        </span>
                                                    )}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end">
                        <Link
                            href="/admin/subscriptions"
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting || isSyncingStripe}
                            className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${(isSubmitting || isSyncingStripe) ? 'opacity-75 cursor-not-allowed' : ''
                                }`}
                        >
                            {isSubmitting ? 'Creating...' : isSyncingStripe ? 'Syncing with Stripe...' : 'Create Plan'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
} 