"use client";

import { useEffect, Suspense } from 'react';
import CheckoutContent from '@/app/checkout/CheckoutContent';
import { useRouter } from 'next/navigation';

function MenuCheckoutContent() {
    const router = useRouter();

    useEffect(() => {
        // When this component mounts, we'll check if there's an old-format URL
        // and redirect users coming from /checkout to the new route
        const path = window.location.pathname;
        if (path === '/checkout') {
            const searchParams = new URLSearchParams(window.location.search);
            router.replace(`/menu/checkout${searchParams.toString() ? '?' + searchParams.toString() : ''}`);
        }
    }, [router]);

    return (
        <CheckoutContent />
    );
}

export default function MenuCheckout() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <MenuCheckoutContent />
        </Suspense>
    );
} 