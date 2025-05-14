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
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Staff Login
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Login with your staff account credentials
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        {errorMessage && (
                            <div className="rounded-md bg-red-50 p-4 mb-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg
                                            className="h-5 w-5 text-red-400"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">
                                            {errorMessage}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Email address
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {isLoading ? "Logging in..." : "Log in"}
                                </button>
                            </div>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">
                                        Business Staff Only
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <div className="flex items-center justify-center">
                                    <Link
                                        href="/login"
                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                    >
                                        Business Owner Login
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 