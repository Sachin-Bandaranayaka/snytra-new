"use client";

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ReservationRedirectContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Preserve any query parameters in the redirect
        const queryString = searchParams.toString();
        const redirectPath = queryString ? `/menu/reservations?${queryString}` : '/menu/reservations';

        router.replace(redirectPath);
    }, [router, searchParams]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h1 className="text-2xl font-semibold mb-2">Redirecting...</h1>
                <p className="text-gray-600">Please wait while we redirect you to our reservations page.</p>
            </div>
        </div>
    );
}

export default function ReservationRedirect() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold mb-2">Loading...</h1>
                    <p className="text-gray-600">Please wait...</p>
                </div>
            </div>
        }>
            <ReservationRedirectContent />
        </Suspense>
    );
} 