"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

    useEffect(() => {
        const checkSubscription = async () => {
            // Check if user is logged in
            const userData = localStorage.getItem('user');
            if (!userData) {
                router.push('/login');
                return;
            }

            try {
                // Parse user data to make sure it's valid
                const user = JSON.parse(userData);

                // First check local storage data
                if (hasValidSubscription(user)) {
                    setLoading(false);
                    return;
                }

                // If local check fails, verify with server (could be updated)
                try {
                    const response = await fetch('/api/auth/me');
                    if (response.ok) {
                        const data = await response.json();
                        if (data.user && hasValidSubscription(data.user)) {
                            // Update localStorage with latest user data
                            localStorage.setItem('user', JSON.stringify(data.user));
                            setLoading(false);
                            return;
                        }
                    }
                } catch (err) {
                    console.error('Failed to fetch user data from server:', err);
                }

                // If all checks fail, show subscription error
                setSubscriptionError('Your subscription is not active or has expired.');

                // Auto-redirect to pricing page after 3 seconds
                const timeout = setTimeout(() => {
                    router.push('/pricing?subscription=required');
                }, 3000);

                return () => clearTimeout(timeout);
            } catch (err) {
                console.error('Failed to parse user data:', err);
                localStorage.removeItem('user');
                router.push('/login');
            }
        };

        checkSubscription();
    }, [router]);

    // Helper function to check if user has a valid subscription
    const hasValidSubscription = (user: any) => {
        // Special roles bypass subscription check
        if (user.role === 'admin' || user.role === 'developer') {
            return true;
        }

        // Check if user has an active subscription
        if (user.subscription_status === 'active') {
            // Check if subscription period is valid (if available)
            if (user.subscription_current_period_end) {
                const endDate = new Date(user.subscription_current_period_end);
                const now = new Date();
                return endDate > now;
            }

            // If no end date but status is active, consider it valid
            return true;
        }

        return false;
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (loading && !subscriptionError) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent"></div>
            </div>
        );
    }

    if (subscriptionError) {
        return (
            <div className="flex min-h-screen items-center justify-center flex-col p-4 text-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-xl font-bold text-red-700 mb-2">Subscription Required</h2>
                    <p className="text-red-600 mb-4">{subscriptionError}</p>
                    <p className="text-gray-600 mb-4">You'll be redirected to the pricing page in a moment.</p>
                    <div className="animate-pulse text-orange-600">Redirecting...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar onLogout={handleLogout} />

            {/* Main content - adjusted for sidebar */}
            <div className="lg:pl-16 min-h-screen">
                {/* Top padding for mobile menu */}
                <div className="h-14 lg:h-0 block lg:hidden"></div>

                <main className="flex-1 max-w-7xl mx-auto">
                    <div className="py-6 px-4 sm:px-6 lg:px-8">
                        {/* Content will be rendered here */}
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
} 