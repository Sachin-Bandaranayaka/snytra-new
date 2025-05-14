"use client";

import { useEffect, useState } from "react";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import AuthContext from "@/context/AuthContext";

export default function AppWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mounted, setMounted] = useState(false);

    // Only run client-side
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null; // Return null on server-side to avoid hydration issues
    }

    return (
        <AuthContext>
            <Suspense fallback={<div>Loading...</div>}>
                {children}
            </Suspense>
            <Toaster position="top-right" />
        </AuthContext>
    );
} 