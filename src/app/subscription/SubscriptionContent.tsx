"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import SubscriptionCheckout from '@/components/SubscriptionCheckout';

export default function SubscriptionContent() {
    const [isLoading, setIsLoading] = useState(true);
    const searchParams = useSearchParams();
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

    useEffect(() => {
        // Check if user is logged in
        const user = localStorage.getItem('user');
        if (!user) {
            router.push('/login');
            return;
        }

        // Get the plan from URL parameters
        const planParam = searchParams.get('plan');
        if (planParam) {
            setSelectedPlan(planParam);
        }

        setIsLoading(false);
    }, [router, searchParams]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            </div>
        );
    }

    return (
        <div className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                    <div className="p-6">
                        {/* Pass the selected plan to the checkout component */}
                        <SubscriptionCheckout initialPlan={selectedPlan} />
                    </div>
                </div>
            </div>
        </div>
    );
} 