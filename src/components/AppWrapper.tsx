"use client";

import { useEffect, useState } from "react";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import AuthContext from "@/context/AuthContext";
import { useSession } from "next-auth/react";

// SessionRefresh component to ensure session state is current
function SessionRefresh() {
    const { status, update } = useSession();
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (status === 'authenticated' && !isInitialized) {
            // Refresh session when component mounts
            update();
            setIsInitialized(true);
        }

        // Add a listener for visibility changes to keep session in sync
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                console.log("Refreshing session on visibility change");
                update();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [status, isInitialized, update]);

    return null;
}

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
            <SessionRefresh />
            <Toaster position="top-right" />
        </AuthContext>
    );
} 