"use client";

import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// Helper function to force session refresh
function triggerSessionRefresh() {
    // Create and dispatch a visibility change event to force session refresh
    const event = new Event('visibilitychange');
    document.dispatchEvent(event);
}

export default function Login() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";
    const error = searchParams.get("error");
    const { update } = useSession();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setLoginError("");

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (!result?.error) {
                // Refresh session after successful login
                await update();

                // Force session refresh across components
                triggerSessionRefresh();

                // Add a small delay to ensure session update is processed
                setTimeout(() => {
                    router.push(callbackUrl);
                }, 100);
            } else {
                setLoginError("Invalid email or password");
            }
        } catch (error) {
            setLoginError("An error occurred during login. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentYear = new Date().getFullYear();

    return (
        <div className="flex min-h-screen bg-dashboard-bg">
            {/* Left Column - Information */}
            <div className="hidden md:flex md:w-1/2 bg-primary p-12 flex-col text-white">
                <div className="flex items-center mb-12">
                    <div className="w-12 h-12 relative flex items-center justify-center">
                        <Image
                            src="/images/logo.png"
                            alt="Snytra Logo"
                            width={48}
                            height={48}
                            className="object-contain"
                        />
                    </div>
                    <div className="ml-3">
                        <span className="text-white text-2xl font-bold block">Snytra</span>
                    </div>
                </div>

                <div className="flex-grow flex flex-col justify-center">
                    <h2 className="text-4xl font-bold mb-6">Welcome Back!</h2>
                    <p className="text-xl mb-8">
                        Log in to access your restaurant management dashboard, view reports, and manage your operations.
                    </p>

                    <div className="space-y-8">
                        <div className="flex items-start">
                            <div className="bg-white/10 p-3 rounded-full mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-xl mb-2">Comprehensive Dashboard</h3>
                                <p className="text-white/80">View all your restaurant metrics in one place</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="bg-white/10 p-3 rounded-full mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-xl mb-2">Real-time Updates</h3>
                                <p className="text-white/80">Get instant notifications on orders and reservations</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="bg-white/10 p-3 rounded-full mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-xl mb-2">Performance Analytics</h3>
                                <p className="text-white/80">Track your business growth and customer trends</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-sm text-white/70">
                    <p>For administrative access, please use the Admin Login option below.</p>
                </div>
            </div>

            {/* Right Column - Login Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-charcoal mb-2">Sign in to your account</h2>
                        <p className="text-darkGray">Enter your credentials below to access your account</p>
                    </div>

                    {(error || loginError) && (
                        <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
                            <div className="flex items-center">
                                <svg className="h-5 w-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div className="text-sm font-medium text-red-700">
                                    {error === "CredentialsSignin" ? "Invalid email or password" : loginError}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-lg p-8 border border-lightGray">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-darkGray mb-1">
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
                                        placeholder="admin@snytra.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-darkGray mb-1">
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

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="h-5 w-5 text-primary focus:ring-primary border-lightGray rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-darkGray">
                                        Remember me
                                    </label>
                                </div>
                                <div className="text-sm">
                                    <Link href="/forgot-password" className="font-medium text-primary hover:text-primary-dark">
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Signing in...
                                        </>
                                    ) : (
                                        "Sign in"
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-lightGray" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-darkGray">Or continue with</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <button
                                    onClick={() => signIn("google", { callbackUrl })}
                                    className="w-full flex justify-center items-center py-3 px-4 border border-lightGray rounded-md shadow-sm bg-white text-sm font-medium text-darkGray hover:bg-beige transition-colors duration-300"
                                >
                                    <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                                    </svg>
                                    Sign in with Google
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col items-center space-y-4">
                        <p className="text-sm text-darkGray">
                            Don&apos;t have an account?{" "}
                            <Link href="/register" className="font-medium text-primary hover:text-primary-dark hover:underline">
                                Create account
                            </Link>
                        </p>
                        <Link href="/admin/login" className="flex items-center text-sm text-darkGray hover:text-primary transition-colors duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Admin Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
} 