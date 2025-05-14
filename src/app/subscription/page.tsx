"use client";

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the SubscriptionContent component with no SSR
const SubscriptionContent = dynamic(() => import('./SubscriptionContent'), { ssr: false });

export default function SubscriptionPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            </div>
        }>
            <SubscriptionContent />
        </Suspense>
    );
} 