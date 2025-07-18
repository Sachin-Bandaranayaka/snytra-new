"use client";

import { usePathname } from "next/navigation";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import CartProvider from "@/components/providers/CartProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import NoticesBanner from "@/components/NoticesBanner";
import { Suspense } from "react";
import InitMaintenanceMode from "./InitMaintenanceMode";

export default function RootLayoutClient({
    children,
    siteName,
    logoUrl,
}: Readonly<{
    children: React.ReactNode;
    siteName: string;
    logoUrl: string;
}>) {
    const pathname = usePathname();
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