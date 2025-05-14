"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    User,
    CreditCard,
    LifeBuoy,
    Bell,
    Settings,
    Home,
    FileText,
    LogOut,
    ChevronRight,
    Menu,
    X
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import Image from "next/image";

// Navigation items for the sidebar
const navItems = [
    {
        name: "Dashboard",
        href: "/profile",
        icon: Home,
    },
    {
        name: "My Account",
        href: "/profile/account",
        icon: User,
    },
    {
        name: "Billing & Invoices",
        href: "/profile/billing",
        icon: CreditCard,
    },
    {
        name: "Support Tickets",
        href: "/profile/support",
        icon: LifeBuoy,
    },
    {
        name: "Notices",
        href: "/profile/notices",
        icon: Bell,
    },
    {
        name: "Subscription",
        href: "/profile/subscription",
        icon: FileText,
    },
    {
        name: "Settings",
        href: "/profile/settings",
        icon: Settings,
    },
];

export function PortalNav() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    // Check if the given path is the current path
    const isActiveLink = (path: string) => {
        if (path === "/profile" && pathname === "/profile") {
            return true;
        }
        return path !== "/profile" && pathname.startsWith(path);
    };

    return (
        <>
            {/* Mobile nav toggle */}
            <div className="fixed top-4 left-4 z-40 md:hidden">
                <button
                    onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                    className="p-2 bg-white rounded-md shadow-md text-charcoal hover:text-primary transition-colors focus:outline-none"
                >
                    {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Sidebar - changes to modal on mobile */}
            <div
                className={`fixed inset-0 z-30 md:relative md:z-0 transition-opacity duration-300 ease-in-out 
                ${isMobileNavOpen ? "opacity-100" : "opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto"}`}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/20 md:hidden"
                    onClick={() => setIsMobileNavOpen(false)}
                />

                {/* Sidebar content */}
                <aside className={`fixed md:sticky top-0 left-0 w-64 h-screen max-h-screen overflow-y-auto bg-white shadow-md z-10 transform transition-transform duration-300 ease-in-out
                    md:translate-x-0 md:transition-none flex flex-col
                    md:z-0
                    pt-6
                    pb-6
                    border-r border-gray-200
                    md:overflow-y-auto
                    md:scrollbar-thin
                    md:scrollbar-thumb-gray-300
                    md:scrollbar-track-transparent
                    ${isMobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}>
                    {/* Logo & Branding */}
                    <div className="px-6 mb-6 flex items-center">
                        <div className="h-8 w-auto relative mr-2">
                            <Image
                                src="/images/logo.png"
                                alt="Snytra Logo"
                                width={32}
                                height={32}
                                className="w-auto h-full"
                            />
                        </div>
                        <span className="text-charcoal text-xl font-bold">Client Portal</span>
                    </div>

                    {/* User info */}
                    {user && (
                        <div className="px-6 py-4 mb-6 border-y border-gray-100">
                            <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-medium text-charcoal truncate">{user.name}</p>
                                    <p className="text-sm text-charcoal/70 truncate">{user.email}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Items */}
                    <nav className="px-4 flex-1">
                        <ul className="space-y-1">
                            {navItems.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={`flex items-center px-2 py-2 text-sm font-medium rounded-md group transition-colors ${isActiveLink(item.href)
                                                ? "bg-primary/10 text-primary"
                                                : "text-charcoal hover:bg-beige/50 hover:text-primary"
                                            }`}
                                        onClick={() => setIsMobileNavOpen(false)}
                                    >
                                        <item.icon
                                            className={`mr-3 h-5 w-5 flex-shrink-0 ${isActiveLink(item.href)
                                                    ? "text-primary"
                                                    : "text-charcoal/70 group-hover:text-primary"
                                                }`}
                                            aria-hidden="true"
                                        />
                                        <span className="truncate">{item.name}</span>
                                        {isActiveLink(item.href) && (
                                            <ChevronRight className="ml-auto h-4 w-4 text-primary" />
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Logout button */}
                    <div className="px-4 mt-auto">
                        <button
                            onClick={logout}
                            className="w-full flex items-center px-2 py-2 text-sm font-medium text-charcoal rounded-md hover:bg-red-50 hover:text-red-600 group transition-colors"
                        >
                            <LogOut className="mr-3 h-5 w-5 text-charcoal/70 group-hover:text-red-600" />
                            <span>Log out</span>
                        </button>
                    </div>
                </aside>
            </div>
        </>
    );
} 