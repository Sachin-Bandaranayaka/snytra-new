"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CheckoutRedirect() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Redirect to the new checkout URL
        const queryString = searchParams.toString();
        router.replace(`/menu/checkout${queryString ? `?${queryString}` : ''}`);
    }, [router, searchParams]);

    // Show loading state while redirecting
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <CheckoutRedirect />
        </Suspense>
    );
} 