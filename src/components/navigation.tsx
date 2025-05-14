"use client";

import Link from "next/link"
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import CartDisplay from "@/components/ui/CartDisplay";
import Image from "next/image";
import { useAuth } from "@/components/providers/AuthProvider";
import { signOut } from "next-auth/react";

// Define interface for global Stack Auth
declare global {
    interface Window {
        __STACK_AUTH_USER?: {
            user: any;
            isLoaded: boolean;
        };
    }
}

// Default export for standard imports
export default function Navigation() {
    const { user, isAuthenticated, loading } = useAuth();

    const [menuOpen, setMenuOpen] = useState(false);
    const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const productsDropdownRef = useRef<HTMLDivElement>(null);
    const userDropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        // Close dropdowns when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (productsDropdownRef.current && !productsDropdownRef.current.contains(event.target as Node)) {
                setProductsDropdownOpen(false);
            }
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
                setUserDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        // Update to use NextAuth's signOut function
        await signOut({ redirect: false });
        router.push('/login');
        setUserDropdownOpen(false);
    };

    const toggleProductsDropdown = () => {
        setProductsDropdownOpen(!productsDropdownOpen);
    };

    const toggleUserDropdown = () => {
        setUserDropdownOpen(!userDropdownOpen);
    };

    return (
        <header className="bg-[#131600]">
            <nav className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center">
                            <div className="h-10 w-auto relative mr-2">
                                <Image
                                    src="/images/logo.png"
                                    alt="Snytra Logo"
                                    width={40}
                                    height={40}
                                    className="w-auto h-full"
                                />
                            </div>
                            <span className="text-white text-xl font-bold">Snytra</span>
                        </Link>
                    </div>
                    <div className="hidden md:flex md:justify-center md:flex-1">
                        <div className="flex items-center space-x-8">
                            <Link href="/" className="text-white hover:text-primary text-base font-medium">
                                Home
                            </Link>
                            <Link href="/about-us" className="text-white hover:text-primary text-base font-medium">
                                About Us
                            </Link>
                            <Link href="/what-we-offer" className="text-white hover:text-primary text-base font-medium">
                                What We Offer
                            </Link>

                            <div className="relative" ref={productsDropdownRef}>
                                <button
                                    onClick={toggleProductsDropdown}
                                    className="text-white hover:text-primary text-base font-medium flex items-center"
                                >
                                    Products
                                </button>

                                {productsDropdownOpen && (
                                    <div className="absolute mt-2 w-64 bg-white rounded-md shadow-md py-1 z-10 border border-gray-300 left-1/2 transform -translate-x-1/2">
                                        <Link
                                            href="/products/online-ordering-system"
                                            className="block px-4 py-2 text-base text-gray-900 hover:text-primary font-medium"
                                            onClick={() => setProductsDropdownOpen(false)}
                                        >
                                            Online Ordering System
                                        </Link>
                                        <Link
                                            href="/products/ai-calling"
                                            className="block px-4 py-2 text-base text-gray-900 hover:text-primary font-medium"
                                            onClick={() => setProductsDropdownOpen(false)}
                                        >
                                            AI Calling
                                        </Link>
                                        <Link
                                            href="/products/ai-whatsapp-messaging"
                                            className="block px-4 py-2 text-base text-gray-900 hover:text-primary font-medium"
                                            onClick={() => setProductsDropdownOpen(false)}
                                        >
                                            AI WhatsApp Messaging
                                        </Link>
                                        <Link
                                            href="/products/ai-sms-messaging"
                                            className="block px-4 py-2 text-base text-gray-900 hover:text-primary font-medium"
                                            onClick={() => setProductsDropdownOpen(false)}
                                        >
                                            AI SMS Messaging
                                        </Link>
                                        <Link
                                            href="/products/lead-generation"
                                            className="block px-4 py-2 text-base text-gray-900 hover:text-primary font-medium"
                                            onClick={() => setProductsDropdownOpen(false)}
                                        >
                                            Lead Generation
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <Link href="/blog" className="text-white hover:text-primary text-base font-medium">
                                Blog
                            </Link>

                            <Link href="/pricing" className="text-white hover:text-primary text-base font-medium">
                                Pricing
                            </Link>
                            <Link href="/contact-us" className="text-white hover:text-primary text-base font-medium">
                                Contact Us
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <div className="relative" ref={userDropdownRef}>
                                <button
                                    onClick={toggleUserDropdown}
                                    className="flex items-center text-white hover:text-primary focus:outline-none"
                                >
                                    <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                </button>

                                {userDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                        <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                                            <p className="font-medium">{user?.name}</p>
                                            <p className="text-xs text-gray-500">{user?.email}</p>
                                        </div>
                                        <Link
                                            href="/profile/account"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setUserDropdownOpen(false)}
                                        >
                                            Profile
                                        </Link>
                                        <Link
                                            href="/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setUserDropdownOpen(false)}
                                        >
                                            Client Dashboard
                                        </Link>
                                        <Link
                                            href="/dashboard"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setUserDropdownOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-white hover:text-primary font-medium"
                                >
                                    Login
                                </Link>
                                <Link href="/register"
                                    className="inline-block px-6 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    )
}

// Named export for destructured imports
export { Navigation }; 