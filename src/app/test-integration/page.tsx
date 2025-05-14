"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TestResult {
    status: 'pending' | 'success' | 'error';
    message: string;
}

interface TestResults {
    database: TestResult;
    email: TestResult;
    serverless: TestResult;
    [key: string]: TestResult;
}

export default function TestIntegrationPage() {
    const [results, setResults] = useState<TestResults | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function runTests() {
            try {
                const response = await fetch('/api/test-integration');
                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}`);
                }
                const data = await response.json();
                setResults(data);
            } catch (err: any) {
                setError(err.message || 'Failed to run integration tests');
            } finally {
                setLoading(false);
            }
        }

        runTests();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'success':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'error':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            default:
                return '⏳';
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
            <div className="w-full max-w-4xl p-8 bg-white rounded-xl shadow-md">
                <h1 className="text-3xl font-bold text-center mb-8">Integration Tests</h1>

                {loading && (
                    <div className="text-center py-10">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                        <p className="mt-4 text-gray-600">Running integration tests...</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {results && (
                    <div className="space-y-6">
                        {Object.entries(results).map(([key, result]) => (
                            <div
                                key={key}
                                className={`p-4 border rounded-lg ${getStatusColor(result.status)}`}
                            >
                                <h2 className="text-xl font-semibold capitalize flex items-center">
                                    {getStatusIcon(result.status)} &nbsp; {key}
                                </h2>
                                <p className="mt-2">{result.message}</p>
                            </div>
                        ))}

                        <div className="mt-8 flex flex-wrap justify-center gap-4">
                            <Link
                                href="/register"
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Test Registration
                            </Link>
                            <Link
                                href="/login"
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                            >
                                Test Login
                            </Link>
                            <Link
                                href="/checkout"
                                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                            >
                                Test Checkout
                            </Link>
                            <Link
                                href="/test-stripe"
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                            >
                                Test Stripe Integration
                            </Link>
                            <Link
                                href="/db-test"
                                className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
                            >
                                Test Database Connection
                            </Link>
                            <Link
                                href="/dashboard-new"
                                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                            >
                                Test Dashboard Integration
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
} 