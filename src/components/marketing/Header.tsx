"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { toast } from "react-hot-toast";

export default function MarketingHeader() {
    const { data: session, status } = useSession();
    const isAuthenticated = !!session;
    const user = session?.user;
    const loading = status === "loading";

    // Log authentication status changes
    useEffect(() => {
        console.log("Auth status:", status);
        console.log("Session:", session);
        console.log("isAuthenticated:", isAuthenticated);

        if (status === "authenticated") {
            console.log("User authenticated:", session?.user);
            toast.success("Logged in successfully");
        } else if (status === "unauthenticated") {
            console.log("User not authenticated");
        }
    }, [status, session, isAuthenticated]);

    // Force refresh when session changes
    useEffect(() => {
        if (status === "authenticated") {
            // Re-render component when session is authenticated
            console.log("Setting authenticated state in header");
        }
    }, [status, session]);

    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const userDropdownRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const router = useRouter();

    // Handle scroll event to change header appearance
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
                setUserDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const isActive = (path: string) => pathname === path;

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Features", href: "/#features" },
        { name: "Pricing", href: "/pricing" },
        { name: "Contact", href: "/contact" },
    ];

    const toggleUserDropdown = () => {
        setUserDropdownOpen(!userDropdownOpen);
    };

    const handleLogout = async () => {
        await signOut({ redirect: false });
        refreshSession();
        router.push('/login');
        setUserDropdownOpen(false);
    };

    // Function to manually refresh session
    const refreshSession = () => {
        const event = new Event('visibilitychange');
        document.dispatchEvent(event);
    };

    return (
        <header
            className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled
                ? "bg-white shadow-md py-3"
                : "bg-transparent py-5"
                }`}
        >
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between">
                    {/* Logo */}
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
                        <span className={`text-2xl font-bold ${isScrolled ? "text-blue-700" : "text-white"}`}>
                            Snytra
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`font-medium transition-colors ${isActive(link.href)
                                    ? isScrolled
                                        ? "text-blue-700"
                                        : "text-white border-b-2 border-white"
                                    : isScrolled
                                        ? "text-gray-700 hover:text-blue-700"
                                        : "text-gray-100 hover:text-white"
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* CTA Buttons or User Profile */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <div className="relative" ref={userDropdownRef}>
                                <button
                                    onClick={toggleUserDropdown}
                                    className="flex items-center focus:outline-none"
                                    aria-label="User menu"
                                >
                                    <div className={`h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center ${isScrolled ? "text-white" : "text-primary"} ${isScrolled ? "bg-primary" : "bg-white"}`}>
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
                                    className={`font-medium px-4 py-2 rounded-lg transition-colors ${isScrolled
                                        ? "text-gray-700 hover:text-blue-700"
                                        : "text-white hover:bg-white hover:bg-opacity-10"
                                        }`}
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/register"
                                    className={`font-medium px-5 py-2 rounded-lg transition-colors ${isScrolled
                                        ? "bg-blue-700 text-white hover:bg-blue-800"
                                        : "bg-white text-blue-700 hover:bg-opacity-90"
                                        }`}
                                >
                                    Sign up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        type="button"
                        className="md:hidden text-gray-200"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            {mobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                <div
                    className={`md:hidden transition-all duration-300 overflow-hidden ${mobileMenuOpen ? "max-h-96 pt-4" : "max-h-0"
                        }`}
                >
                    <nav className="flex flex-col space-y-3 pb-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`font-medium py-2 ${isActive(link.href)
                                    ? isScrolled
                                        ? "text-blue-700"
                                        : "text-white"
                                    : isScrolled
                                        ? "text-gray-700"
                                        : "text-gray-100"
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <hr className={`${isScrolled ? "border-gray-200" : "border-blue-700"}`} />
                        <div className="flex flex-col space-y-2 pt-2">
                            {isAuthenticated ? (
                                <>
                                    <div className="flex items-center py-2">
                                        <div className={`h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center ${isScrolled ? "text-white" : "text-primary"} ${isScrolled ? "bg-primary" : "bg-white"} mr-2`}>
                                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <span className={`font-medium ${isScrolled ? "text-gray-700" : "text-white"}`}>
                                            {user?.name || user?.email}
                                        </span>
                                    </div>
                                    <Link
                                        href="/profile"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`font-medium py-2 ${isScrolled ? "text-gray-700" : "text-white"}`}
                                    >
                                        Profile
                                    </Link>
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`font-medium py-2 ${isScrolled ? "text-gray-700" : "text-white"}`}
                                    >
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className={`font-medium py-2 text-left ${isScrolled ? "text-gray-700" : "text-white"}`}
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`font-medium py-2 ${isScrolled ? "text-gray-700" : "text-white"}`}
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href="/register"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`font-medium py-2 px-4 rounded-lg ${isScrolled
                                            ? "bg-blue-700 text-white"
                                            : "bg-white text-blue-700"
                                            }`}
                                    >
                                        Sign up
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
} 