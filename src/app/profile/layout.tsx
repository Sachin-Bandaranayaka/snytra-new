import React from "react";
import Link from "next/link";
import {
    User,
    CreditCard,
    LifeBuoy,
    Bell,
    Settings,
    Home,
    FileText,
    LogOut
} from "lucide-react";
import { PortalNav } from "@/components/portal/PortalNav";

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-beige flex">
            {/* Sidebar navigation */}
            <PortalNav />

            {/* Main content */}
            <div className="flex-1 min-w-0">
                <div className="p-6 max-w-7xl mx-auto">
                    {children}
                </div>
            </div>
        </div>
    );
} 