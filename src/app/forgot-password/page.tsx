"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/StackAdminAuth';
import SEO from '@/components/SEO';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { forgotPassword } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            const result = await forgotPassword(email);

            if (!result.success) {
                throw new Error(result.error || 'Failed to process request');
            }

            setMessage(result.message || 'Password reset instructions have been sent to your email');
            setIsSubmitted(true);
        } catch (err: any) {
            setError(err.message || 'An error occurred while processing your request');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <SEO
                title="Forgot Password | Snytra"
                description="Reset your password for your restaurant management system account."
                ogImage="/images/login-banner.jpg"
            />

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex justify-center">
                    <h1 className="text-primary text-3xl font-bold">Snytra</h1>
                </Link>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Forgot your password?
                </h2>
                <p className="mt-2 text-center text-gray-600">
                    Enter your email address and we'll send you instructions to reset your password.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {isSubmitted ? (
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                                <Send className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="mt-3 text-lg font-medium text-gray-900">Check your email</h3>
                            <p className="mt-2 text-sm text-gray-500">
                                {message}
                            </p>
                            <div className="mt-6">
                                <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
                                    Back to login
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
                                    <span className="block sm:inline">{error}</span>
                                </div>
                            )}

                            {message && (
                                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg" role="alert">
                                    <span className="block sm:inline">{message}</span>
                                </div>
                            )}

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email address
                                    </label>
                                    <div className="mt-1 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10 focus:ring-primary focus:border-primary block w-full px-4 py-3 border border-gray-300 rounded-md"
                                            placeholder="name@company.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Processing...
                                            </>
                                        ) : (
                                            'Send Reset Instructions'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or</span>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-center">
                            <Link
                                href="/login"
                                className="flex items-center text-sm font-medium text-primary hover:text-primary/80"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 