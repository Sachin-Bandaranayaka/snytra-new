"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TestResult {
    success: boolean;
    poolConnectionTime?: string;
    serverlessConnectionTime?: string;
    message: string;
    error?: string;
}

interface SeedResult {
    success: boolean;
    message: string;
    error?: string;
}

export default function DbTestPage() {
    const [result, setResult] = useState<TestResult | null>(null);
    const [seedResult, setSeedResult] = useState<SeedResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);

    useEffect(() => {
        async function testConnection() {
            try {
                const response = await fetch('/api/db-test');
                const data = await response.json();
                setResult(data);
            } catch (error: any) {
                setResult({
                    success: false,
                    message: 'Error testing database connection',
                    error: error.message
                });
            } finally {
                setLoading(false);
            }
        }

        testConnection();
    }, []);

    const handleSeedDatabase = async () => {
        if (seeding) return;

        setSeeding(true);
        setSeedResult(null);

        try {
            const response = await fetch('/api/seed-db', {
                method: 'POST',
            });
            const data = await response.json();
            setSeedResult(data);
        } catch (error: any) {
            setSeedResult({
                success: false,
                message: 'Error seeding database',
                error: error.message
            });
        } finally {
            setSeeding(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
            <div className="w-full max-w-3xl p-8 bg-white rounded-xl shadow-md">
                <h1 className="text-3xl font-bold text-center mb-8">Database Connection Test</h1>

                {loading && (
                    <div className="text-center py-10">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                        <p className="mt-4 text-gray-600">Testing database connection...</p>
                    </div>
                )}

                {!loading && result && (
                    <div className={`p-6 rounded-lg border ${result.success ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            {result.success ? '✅ ' : '❌ '}
                            <span className={result.success ? 'text-green-700' : 'text-red-700'}>
                                {result.message}
                            </span>
                        </h2>

                        {result.success ? (
                            <div className="space-y-4">
                                <div className="bg-white p-4 rounded border border-gray-200">
                                    <p className="text-sm font-medium text-gray-500">Pool Connection Time:</p>
                                    <p className="font-mono">{result.poolConnectionTime}</p>
                                </div>
                                <div className="bg-white p-4 rounded border border-gray-200">
                                    <p className="text-sm font-medium text-gray-500">Serverless Connection Time:</p>
                                    <p className="font-mono">{result.serverlessConnectionTime}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-4 rounded border border-red-200">
                                <p className="text-sm font-medium text-red-500">Error:</p>
                                <p className="font-mono text-red-700">{result.error}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Seed Database Section */}
                <div className="mt-8">
                    <div className="text-center">
                        <button
                            onClick={handleSeedDatabase}
                            disabled={seeding}
                            className={`px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition ${seeding ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {seeding ? (
                                <>
                                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent align-[-0.125em] mr-2"></span>
                                    Seeding Database...
                                </>
                            ) : 'Seed Database with Test Data'}
                        </button>
                    </div>

                    {seedResult && (
                        <div className={`mt-4 p-4 rounded-lg ${seedResult.success ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
                            <p className={`font-medium ${seedResult.success ? 'text-green-700' : 'text-red-700'}`}>
                                {seedResult.success ? '✅ ' : '❌ '} {seedResult.message}
                            </p>
                            {seedResult.error && (
                                <p className="mt-2 text-red-600 text-sm">{seedResult.error}</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <Link
                        href="/dashboard-new"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Go to New Dashboard
                    </Link>
                    <Link
                        href="/test-integration"
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        Run Integration Tests
                    </Link>
                </div>
            </div>
        </main>
    );
} 