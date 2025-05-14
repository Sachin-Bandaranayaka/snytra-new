"use client";

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { planHasFeature } from '@/lib/subscription-utils';

interface FeatureGuardProps {
    children: ReactNode;
    requiredFeature: string;
    fallback?: ReactNode;
}

/**
 * FeatureGuard component restricts access to features based on the user's subscription plan.
 * 
 * @param children - The content to render if the user has access to the feature
 * @param requiredFeature - The feature key required to access this component
 * @param fallback - Optional content to render if the user doesn't have access
 */
export default function FeatureGuard({ children, requiredFeature, fallback }: FeatureGuardProps) {
    const [hasAccess, setHasAccess] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        async function checkAccess() {
            try {
                // Get user data from localStorage
                const userDataStr = localStorage.getItem('user');
                if (!userDataStr) {
                    setLoading(false);
                    setHasAccess(false);
                    return;
                }

                const userData = JSON.parse(userDataStr);

                // Check if user has admin role (admin has access to all features)
                if (userData.role === 'admin' || userData.role === 'developer') {
                    setHasAccess(true);
                    setLoading(false);
                    return;
                }

                // If no plan specified, deny access
                if (!userData.subscription_plan && !userData.id) {
                    setHasAccess(false);
                    setLoading(false);
                    return;
                }

                // Check with server API if the user has access to this feature
                const response = await fetch(`/api/feature-access?feature=${requiredFeature}`, {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                const data = await response.json();

                if (data.success) {
                    setHasAccess(data.hasAccess);
                } else {
                    // Fallback to client-side check if server check fails
                    const hasFeature = planHasFeature(userData.subscription_plan, requiredFeature);
                    setHasAccess(hasFeature);
                }
            } catch (error) {
                console.error('Error checking feature access:', error);
                setHasAccess(false);
            } finally {
                setLoading(false);
            }
        }

        checkAccess();
    }, [requiredFeature, router]);

    if (loading) {
        return <div className="p-4 animate-pulse">Loading...</div>;
    }

    if (!hasAccess) {
        // If fallback is provided, show it instead of the restricted content
        if (fallback) {
            return <>{fallback}</>;
        }

        // Default fallback message
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <h3 className="text-lg font-medium text-red-800">Feature Unavailable</h3>
                <p className="text-sm text-red-600 mt-2">
                    This feature requires a higher subscription plan.
                </p>
                <button
                    onClick={() => router.push('/pricing')}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
                >
                    Upgrade Plan
                </button>
            </div>
        );
    }

    return <>{children}</>;
} 