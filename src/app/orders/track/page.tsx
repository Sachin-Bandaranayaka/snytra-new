"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OldTrackOrderPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/menu/orders/track');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8f6f1]">
            <div className="w-16 h-16 border-4 border-[#e75627] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
} 