"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function TestWebhookPage() {
    const [userId, setUserId] = useState('');
    const [planId, setPlanId] = useState('basic');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await fetch('/api/payment/test-webhook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    planId
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to process test webhook');
            }

            setResult(data);
        } catch (err: any) {
            setError(err.message || 'An error occurred');
            console.error('Test webhook error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Webhook Test Tool</h1>
            <p className="mb-6 text-gray-600">
                Use this tool to test your Stripe webhook integration without having to make actual payments.
                This will simulate a successful subscription event.
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <p className="text-yellow-700">
                    <strong>Note:</strong> This is for testing purposes only. This will update the user's subscription
                    in the database and send a test email.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <div className="mb-4">
                    <label htmlFor="userId" className="block text-gray-700 font-medium mb-2">
                        User ID
                    </label>
                    <input
                        type="text"
                        id="userId"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Enter user ID from database"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        This should be the numeric ID from the users table in your database.
                    </p>
                </div>

                <div className="mb-6">
                    <label htmlFor="planId" className="block text-gray-700 font-medium mb-2">
                        Plan
                    </label>
                    <select
                        id="planId"
                        value={planId}
                        onChange={(e) => setPlanId(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                    >
                        <option value="basic">Basic Plan</option>
                        <option value="premium">Premium Plan</option>
                        <option value="enterprise">Enterprise Plan</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    disabled={loading}
                >
                    {loading ? 'Processing...' : 'Test Webhook'}
                </button>
            </form>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {result && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                    <h2 className="text-xl font-semibold mb-2 text-green-700">Success!</h2>
                    <p className="mb-2">The test webhook was processed successfully.</p>

                    <div className="bg-white p-4 rounded mt-4">
                        <h3 className="font-medium text-gray-700 mb-2">Response:</h3>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>

                    <p className="mt-4">
                        Check your email inbox for the test confirmation email.
                    </p>
                </div>
            )}

            <div className="mt-8">
                <Link href="/dashboard" className="text-blue-600 hover:underline">
                    &larr; Back to Dashboard
                </Link>
            </div>
        </div>
    );
} 