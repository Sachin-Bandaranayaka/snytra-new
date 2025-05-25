"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SEO from "@/components/SEO";
import Image from "next/image";

export default function StaffLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage("");

        try {
            const response = await fetch("/api/staff/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            // Store token in localStorage
            localStorage.setItem("staff_token", data.token);
            localStorage.setItem("staff_user", JSON.stringify(data.user));

            // Redirect based on staff role
            switch (data.user.role.toLowerCase()) {
                case "manager":
                    router.push("/staff/dashboard/manager");
                    break;
                case "chef":
                case "kitchen":
                    router.push("/staff/dashboard/kitchen");
                    break;
                case "waiter":
                    router.push("/staff/dashboard/waiter");
                    break;
                case "host":
                case "hostess":
                    router.push("/staff/dashboard/host");
                    break;
                default:
                    router.push("/staff/dashboard");
            }
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("An error occurred during login");
            }
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dashboard-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <SEO
                title="Staff Login | Snytra"
                description="Log in to the business staff portal"
                ogImage="/images/staff-login-banner.jpg"
            />
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <Link href="/">
                        <div className="inline-flex items-center justify-center">
                            <Image
                                src="/images/logo.png"
                                alt="Business Logo"
                                width={60}
                                height={60}
                                className="mx-auto"
                            />
                        </div>
                    </Link>
                    <h2 className="mt-6 text-center text-3xl font-bold text-charcoal">
                        Staff Login
                    </h2>
                    <p className="mt-2 text-center text-sm text-darkGray">
                        Access your staff dashboard and tools
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-6 shadow-lg sm:rounded-xl border border-lightGray">
                        {errorMessage && (
                            <div className="rounded-md bg-red-50 p-4 mb-6 border border-red-200">
                                <div className="flex items-center">
                                    <svg className="h-5 w-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <div className="text-sm font-medium text-red-700">
                                        {errorMessage}
                                    </div>
                                </div>
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-darkGray mb-1"
                                >
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full p-3 pl-10 border border-lightGray rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                        placeholder="staff@snytra.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-darkGray mb-1"
                                >
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full p-3 pl-10 border border-lightGray rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Logging in...
                                        </>
                                    ) : (
                                        "Log in"
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-lightGray"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-darkGray">
                                        Restaurant Staff Only
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <div className="flex items-center justify-center space-x-4">
                                    <Link
                                        href="/login"
                                        className="text-sm font-medium text-primary hover:text-primary-dark hover:underline transition-colors duration-300"
                                    >
                                        Business Owner Login
                                    </Link>
                                    <span className="text-darkGray">•</span>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm font-medium text-primary hover:text-primary-dark hover:underline transition-colors duration-300"
                                    >
                                        Forgot Password?
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <div className="flex items-center justify-center space-x-2 text-sm text-darkGray">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>
                                Need help? Contact your manager or administrator
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 