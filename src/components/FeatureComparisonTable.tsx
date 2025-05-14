"use client";

import { useEffect, useState } from 'react';
import { SYSTEM_FEATURES, FEATURE_CATEGORIES, CATEGORY_NAMES } from '@/lib/system-features';

interface SubscriptionPlan {
    id: number;
    name: string;
    description: string;
    price: number;
    billing_cycle: string;
    features: string[];
    is_active: boolean;
}

export default function FeatureComparisonTable({
    billingCycle = 'monthly'
}: {
    billingCycle: 'monthly' | 'yearly'
}) {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [featuredCategories, setFeaturedCategories] = useState<string[]>([]);

    // Fetch plans from database
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/subscription-plans');
                if (!response.ok) {
                    throw new Error('Failed to fetch plans');
                }

                const data = await response.json();
                if (data.success && data.plans && data.plans.length > 0) {
                    const filteredPlans = data.plans.filter((plan: SubscriptionPlan) =>
                        plan.billing_cycle === billingCycle && plan.is_active
                    );

                    // Debug: Log plans and their features
                    console.log('Filtered Plans for comparison table:',
                        filteredPlans.map(p => ({
                            name: p.name,
                            features: p.features
                        }))
                    );

                    // Sort plans by price
                    const sortedPlans = [...filteredPlans].sort((a, b) =>
                        parseFloat(a.price.toString()) - parseFloat(b.price.toString())
                    );

                    setPlans(sortedPlans);

                    // Calculate which categories to display based on plan features
                    if (sortedPlans.length > 0) {
                        const allFeatures = sortedPlans.flatMap(plan => plan.features);

                        // Find matching categories for these features
                        const matchedFeatures = SYSTEM_FEATURES.filter(feature =>
                            allFeatures.some(f => f === feature.id || f.toLowerCase() === feature.name.toLowerCase())
                        );

                        // Get unique categories from matched features
                        const categories = Array.from(new Set(matchedFeatures.map(feature => feature.category)));

                        // If no matches found, show all core categories to start
                        setFeaturedCategories(categories.length > 0
                            ? categories
                            : ['core', 'menu_management', 'order_management']);
                    }
                } else {
                    // Use fallback plans if API returns empty data
                    setPlans([]);
                }
            } catch (err) {
                console.error('Error fetching plans:', err);
                setPlans([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, [billingCycle]);

    // Helper function to check if a plan includes a feature
    const planHasFeature = (plan: SubscriptionPlan, featureId: string): boolean => {
        // Check if feature exists in the plan's features array
        if (!plan.features || !Array.isArray(plan.features)) return false;

        // Check for direct match with feature ID
        if (plan.features.includes(featureId)) return true;

        // Check for case-insensitive match with feature name
        const featureName = SYSTEM_FEATURES.find(f => f.id === featureId)?.name;
        if (featureName && plan.features.some(f =>
            typeof f === 'string' && f.toLowerCase() === featureName.toLowerCase()
        )) return true;

        return false;
    };

    // Group all features by category
    const renderFeatureRows = () => {
        // Array to store JSX elements for each category and its features
        const featureRows: JSX.Element[] = [];

        // Use the filtered categories or fallback to all categories if empty
        const categoriesToShow = featuredCategories.length > 0
            ? featuredCategories
            : FEATURE_CATEGORIES;

        // Group by category
        categoriesToShow.forEach((category) => {
            // Get features for this category
            const categoryFeatures = SYSTEM_FEATURES.filter(
                (feature) => feature.category === category
            );

            if (categoryFeatures.length === 0) return;

            // Only show a category if at least one plan has at least one feature in this category
            const hasFeatureInCategory = categoryFeatures.some(feature =>
                plans.some(plan => planHasFeature(plan, feature.id))
            );

            if (!hasFeatureInCategory) return;

            // Add category header
            featureRows.push(
                <tr key={`category-${category}`} className="bg-orange-50 border-t border-b border-beige">
                    <th className="text-left px-4 py-2 text-primary font-bold" colSpan={plans.length + 1}>
                        {CATEGORY_NAMES[category]}
                    </th>
                </tr>
            );

            // Add feature rows, but only for features that at least one plan has
            categoryFeatures.forEach((feature) => {
                // Check if at least one plan has this feature
                const hasFeature = plans.some(plan => planHasFeature(plan, feature.id));

                // Skip features that no plan has
                if (!hasFeature) return;

                featureRows.push(
                    <tr key={feature.id} className="border-b border-gray-200">
                        <td className="px-4 py-2 font-medium text-charcoal">
                            <div className="flex flex-col">
                                <span>{feature.name}</span>
                                <span className="text-xs text-gray-500">{feature.description}</span>
                            </div>
                        </td>
                        {plans.map((plan) => (
                            <td key={`${plan.id}-${feature.id}`} className="px-4 py-2 text-center">
                                {planHasFeature(plan, feature.id) ? (
                                    <svg className="h-5 w-5 text-olive mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5 text-gray-300 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </td>
                        ))}
                    </tr>
                );
            });
        });

        return featureRows;
    };

    if (loading) {
        return (
            <div className="flex justify-center my-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (plans.length === 0) {
        return (
            <div className="text-center my-8">
                <p className="text-charcoal">No plans available for comparison at this time.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-lightGray overflow-hidden">
                <thead className="bg-white">
                    <tr className="border-b border-lightGray">
                        <th scope="col" className="py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                            FEATURES
                        </th>
                        {plans.map((plan) => (
                            <th
                                key={plan.id}
                                scope="col"
                                className="py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                <div className="text-center">
                                    <span className="block text-sm font-bold text-primary uppercase">
                                        {plan.name}
                                    </span>
                                    <span className="text-lg font-bold text-primary">${plan.price}
                                        <span className="text-xs text-gray-500">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                                    </span>
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {renderFeatureRows()}
                </tbody>
            </table>
        </div>
    );
} 