"use client";

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the RegisterForm component with no SSR
const RegisterForm = dynamic(() => import('./RegisterForm'), { ssr: false });

export default function RegisterPageClient() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <RegisterForm />
        </Suspense>
    );
} 