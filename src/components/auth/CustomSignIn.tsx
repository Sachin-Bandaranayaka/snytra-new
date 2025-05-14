"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CustomSignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [authMethod, setAuthMethod] = useState<'credentials' | 'magic-link'>('credentials');
    const router = useRouter();

    const handleCredentialSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setLoginError("Email and password are required");
            return;
        }

        setIsSubmitting(true);
        setLoginError("");

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                setLoginError(result.error || "Invalid email or password");
            } else {
                router.push("/");
            }
        } catch (error) {
            setLoginError("An error occurred during sign in");
            console.error("Sign in error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMagicLinkSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setLoginError("Email is required");
            return;
        }

        setIsSubmitting(true);
        setLoginError("");

        try {
            // For now, just show a message since NextAuth doesn't have built-in magic link support
            // You would need to implement this separately
            setLoginError("Magic link feature is not implemented yet");
        } catch (error) {
            setLoginError("An error occurred");
            console.error("Magic link error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSignIn = async () => {
        await signIn("google", { callbackUrl: "/" });
    };

    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto p-8 bg-white rounded-lg shadow-md">
            <div className="mb-6 w-full">
                <h1 className="text-2xl font-bold text-center text-charcoal mb-2">Sign in to your account</h1>
                <p className="text-darkGray text-center mb-6">Welcome back! Please sign in to access your account.</p>

                {/* OAuth buttons */}
                <div className="mb-6">
                    <button
                        onClick={handleGoogleSignIn}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                        </svg>
                        Sign in with Google
                    </button>
                </div>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-lightGray"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-darkGray">Or continue with</span>
                    </div>
                </div>

                {/* Method selector */}
                <div className="flex mb-6 border border-lightGray rounded-md">
                    <button
                        className={`flex-1 py-2 text-center ${authMethod === 'credentials' ? 'bg-primary text-white' : 'bg-white text-darkGray hover:bg-beige'}`}
                        onClick={() => setAuthMethod('credentials')}
                    >
                        Password
                    </button>
                    <button
                        className={`flex-1 py-2 text-center ${authMethod === 'magic-link' ? 'bg-primary text-white' : 'bg-white text-darkGray hover:bg-beige'}`}
                        onClick={() => setAuthMethod('magic-link')}
                    >
                        Magic Link
                    </button>
                </div>

                {/* Authentication forms */}
                <div className="space-y-4">
                    {loginError && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
                            {loginError}
                        </div>
                    )}

                    {authMethod === 'credentials' ? (
                        <form onSubmit={handleCredentialSignIn} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border"
                                    placeholder="Enter your email"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border"
                                    placeholder="Enter your password"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="text-sm">
                                    <Link href="/forgot-password" className="font-medium text-primary hover:text-primary-dark">
                                        Forgot your password?
                                    </Link>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                                {isSubmitting ? "Signing in..." : "Sign in"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleMagicLinkSignIn} className="space-y-4">
                            <div>
                                <label htmlFor="magic-email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    id="magic-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm px-3 py-2 border"
                                    placeholder="Enter your email"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                                {isSubmitting ? "Sending..." : "Send Magic Link"}
                            </button>
                        </form>
                    )}
                </div>

                <div className="mt-6 text-center">
                    <p className="text-darkGray">
                        Don't have an account?{" "}
                        <Link href="/register" className="text-primary hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
} 