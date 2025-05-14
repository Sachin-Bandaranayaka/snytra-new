'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { CATEGORY_NAMES, FEATURE_CATEGORIES, SYSTEM_FEATURES, getFeaturesByCategory } from '@/lib/system-features';

export default function NewPackagePage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
        FEATURE_CATEGORIES.reduce((acc, category) => ({
            ...acc,
            [category]: true
        }), {})
    );
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        billing_cycle: 'monthly',
        selectedFeatures: [] as string[],
        is_active: true,
        has_trial: false,
        trial_days: 14
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData({
            ...formData,
            [name]: checked
        });
    };

    const toggleCategory = (category: string) => {
        setExpandedCategories({
            ...expandedCategories,
            [category]: !expandedCategories[category]
        });
    };

    const handleFeatureChange = (featureId: string, checked: boolean) => {
        if (checked) {
            setFormData({
                ...formData,
                selectedFeatures: [...formData.selectedFeatures, featureId]
            });
        } else {
            setFormData({
                ...formData,
                selectedFeatures: formData.selectedFeatures.filter(id => id !== featureId)
            });
        }
    };

    const selectAllInCategory = (category: string, selected: boolean) => {
        const categoryFeatures = getFeaturesByCategory(category).map(f => f.id);
        let updatedFeatures;

        if (selected) {
            // Add all features from this category (avoiding duplicates)
            updatedFeatures = [...new Set([...formData.selectedFeatures, ...categoryFeatures])];
        } else {
            // Remove all features from this category
            updatedFeatures = formData.selectedFeatures.filter(id => !categoryFeatures.includes(id));
        }

        setFormData({
            ...formData,
            selectedFeatures: updatedFeatures
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // Validate price is a number
            const price = parseFloat(formData.price);
            if (isNaN(price) || price <= 0) {
                throw new Error('Price must be a positive number');
            }

            // Validate trial days if trial is enabled
            if (formData.has_trial && (isNaN(Number(formData.trial_days)) || Number(formData.trial_days) <= 0)) {
                throw new Error('Trial days must be a positive number');
            }

            // Convert the features to the format expected by the API
            // The API expects an array of feature strings or objects
            const featureStrings = formData.selectedFeatures.map(featureId => {
                const feature = SYSTEM_FEATURES.find(f => f.id === featureId);
                return feature ? feature.name : featureId;
            });

            const response = await fetch('/api/subscription-plans', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    price,
                    billing_cycle: formData.billing_cycle,
                    features: featureStrings,
                    is_active: formData.is_active,
                    has_trial: formData.has_trial,
                    trial_days: formData.has_trial ? Number(formData.trial_days) : 0
                })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to create package');
            }

            router.push('/admin/packages');
            router.refresh();
        } catch (err) {
            console.error('Error creating package:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Create New Package</h1>
                    <button
                        onClick={() => router.back()}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-xl p-6 mb-8">
                    <div className="mb-6">
                        <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Package Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="e.g. Basic Plan"
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="description" className="block text-gray-700 font-medium mb-2">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="Describe what this package offers"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label htmlFor="price" className="block text-gray-700 font-medium mb-2">Price</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-600">$</span>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    required
                                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="29.99"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="billing_cycle" className="block text-gray-700 font-medium mb-2">Billing Cycle</label>
                            <select
                                id="billing_cycle"
                                name="billing_cycle"
                                value={formData.billing_cycle}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-center mb-2">
                            <input
                                type="checkbox"
                                id="has_trial"
                                name="has_trial"
                                checked={formData.has_trial}
                                onChange={handleCheckboxChange}
                                className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <label htmlFor="has_trial" className="ml-2 block text-gray-700 font-medium">
                                Include Free Trial
                            </label>
                        </div>

                        {formData.has_trial && (
                            <div className="mt-3 pl-6">
                                <label htmlFor="trial_days" className="block text-gray-700 text-sm mb-2">Trial Period (Days)</label>
                                <input
                                    type="number"
                                    id="trial_days"
                                    name="trial_days"
                                    value={formData.trial_days}
                                    onChange={handleChange}
                                    min="1"
                                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Users will have full access to all features during the trial period
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-gray-700 font-medium">Features</label>
                            <div className="text-xs text-gray-500">
                                {formData.selectedFeatures.length} features selected
                            </div>
                        </div>

                        <div className="border border-gray-300 rounded-lg overflow-hidden">
                            {FEATURE_CATEGORIES.map(category => (
                                <div key={category} className="border-b border-gray-300 last:border-b-0">
                                    <div
                                        className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                                        onClick={() => toggleCategory(category)}
                                    >
                                        <div className="flex items-center">
                                            <h3 className="font-medium text-gray-700">{CATEGORY_NAMES[category]}</h3>

                                            <div className="ml-4 flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`select-all-${category}`}
                                                    className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                                                    checked={getFeaturesByCategory(category).every(f =>
                                                        formData.selectedFeatures.includes(f.id)
                                                    )}
                                                    onChange={(e) => {
                                                        e.stopPropagation(); // Prevent toggling the category
                                                        selectAllInCategory(category, e.target.checked);
                                                    }}
                                                />
                                                <label
                                                    htmlFor={`select-all-${category}`}
                                                    className="ml-2 text-sm text-gray-600"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    Select all
                                                </label>
                                            </div>
                                        </div>

                                        {expandedCategories[category]
                                            ? <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                                            : <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                                        }
                                    </div>

                                    {expandedCategories[category] && (
                                        <div className="p-3 bg-white">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {getFeaturesByCategory(category).map(feature => (
                                                    <div key={feature.id} className="flex items-start">
                                                        <div className="flex h-5 items-center">
                                                            <input
                                                                type="checkbox"
                                                                id={feature.id}
                                                                checked={formData.selectedFeatures.includes(feature.id)}
                                                                onChange={(e) => handleFeatureChange(feature.id, e.target.checked)}
                                                                className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                                                            />
                                                        </div>
                                                        <label htmlFor={feature.id} className="ml-2 block text-sm text-gray-700 cursor-pointer">
                                                            <div className="font-medium">{feature.name}</div>
                                                            <div className="text-xs text-gray-500">{feature.description}</div>
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="is_active"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleCheckboxChange}
                                className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <label htmlFor="is_active" className="ml-2 block text-gray-700">
                                Active (available for subscription)
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg flex items-center transition-colors shadow-md disabled:opacity-70"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Creating...
                                </>
                            ) : (
                                'Create Package'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 