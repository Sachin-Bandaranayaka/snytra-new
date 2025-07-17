// src/app/RootLayoutClient.tsx

"use client";

import { usePathname } from "next/navigation";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import CartProvider from "@/components/providers/CartProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import NoticesBanner from "@/components/NoticesBanner";
import { Suspense } from "react";
import InitMaintenanceMode from "./InitMaintenanceMode";

// Define the structure of the Contact Us JSON data
// Duplicated here for type safety, but ideally in a shared types file.
interface ContactUsData {
    title: string;
    description: string;
    contactInfo: {
        phone: string;
        email: string;
        address?: string;
    };
}

export default function RootLayoutClient({
    children,
    siteName,
    logoUrl,
    contactInfo, // New prop: contactInfo
}: Readonly<{
    children: React.ReactNode;
    siteName: string;
    logoUrl: string;
    contactInfo?: ContactUsData['contactInfo']; // Type for the new prop
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

                    {/* Pass contactInfo to the Footer */}
                    {shouldShowNavigation && <Footer siteName={siteName} logoUrl={logoUrl} contactInfo={contactInfo} />}
                </div>
            </CartProvider>
        </AuthProvider>
    );
}