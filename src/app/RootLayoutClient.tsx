"use client";

import { usePathname } from "next/navigation";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import CartProvider from "@/components/providers/CartProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import NoticesBanner from "@/components/NoticesBanner";
import { Suspense, useEffect, useState } from "react";
import InitMaintenanceMode from "./InitMaintenanceMode";

export default function RootLayoutClient({
    children,
    siteName: initialSiteName,
    logoUrl: initialLogoUrl,
}: Readonly<{
    children: React.ReactNode;
    siteName: string;
    logoUrl: string;
}>) {
    const [siteName, setSiteName] = useState(initialSiteName);
    const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
    const pathname = usePathname();
    
    // Fetch current settings dynamically
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/settings');
                if (response.ok) {
                    const settings = await response.json();
                    
                    if (settings.general?.siteName) {
                        setSiteName(settings.general.siteName);
                    }
                    
                    if (settings.appearance?.logo) {
                        setLogoUrl(settings.appearance.logo);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch settings:', error);
            }
        };

        fetchSettings();

        // Listen for settings update events
        const handleSettingsUpdate = () => {
            fetchSettings();
        };

        window.addEventListener('settingsUpdated', handleSettingsUpdate);

        // Set up an interval to periodically check for updates (fallback)
        const interval = setInterval(fetchSettings, 30000); // Check every 30 seconds

        return () => {
            window.removeEventListener('settingsUpdated', handleSettingsUpdate);
            clearInterval(interval);
        };
    }, []);

    const isMenuRoute = pathname.startsWith('/menu');
    const isStaffRoute = pathname.startsWith('/staff');
    const isAdminRoute = pathname.startsWith('/admin');
    const isDashboardRoute = pathname.startsWith('/dashboard');

    // Force-render the navigation if we're on the home page
    const shouldShowNavigation = !isMenuRoute && !isStaffRoute && !isDashboardRoute && !pathname.startsWith('/login');
    const shouldShowNotices = !isMenuRoute && !isStaffRoute && !isAdminRoute && !isDashboardRoute && pathname !== '/login' && pathname !== '/signup';

    return (
        <AuthProvider>
            <CartProvider>
                {/* Initialize maintenance mode */}
                <InitMaintenanceMode />

                <div className="flex flex-col min-h-screen">
                    {shouldShowNotices && <NoticesBanner />}

                    {/* Force-render the navigation */}
                    {shouldShowNavigation && (
                        <div className="navigation-wrapper w-full">
                            <Suspense fallback={<div className="h-16 bg-[#131600]">Loading...</div>}>
                                <Navigation siteName={siteName} logoUrl={logoUrl} />
                            </Suspense>
                        </div>
                    )}

                    <main className="flex-grow">
                        {children}
                    </main>

                    {shouldShowNavigation && <Footer siteName={siteName} logoUrl={logoUrl} />}
                </div>
            </CartProvider>
        </AuthProvider>
    );
}