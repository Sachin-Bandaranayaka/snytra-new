"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface SubscriptionCheckoutProps {
    initialPlan?: string | null;
}

export default function SubscriptionCheckout({ initialPlan }: SubscriptionCheckoutProps) {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Set the initially selected plan if provided
    useEffect(() => {
        if (initialPlan && ['basic', 'premium', 'enterprise'].includes(initialPlan)) {
            setSelectedPlan(initialPlan);
        }
    }, [initialPlan]);

    const planDetails = {
        basic: { name: 'Basic', price: 29, id: 'price_basic' },
        premium: { name: 'Premium', price: 59, id: 'price_premium' },
        enterprise: { name: 'Enterprise', price: 99, id: 'price_enterprise' }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPlan) return;

        setIsProcessing(true);
        setError(null);

        try {
            // Get user info from localStorage
            const userJson = localStorage.getItem('user');
            if (!userJson) {
                throw new Error('User not logged in');
            }

            const user = JSON.parse(userJson);

            // Create a checkout session with Stripe
            const response = await fetch('/api/payment/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    planId: planDetails[selectedPlan as keyof typeof planDetails].id,
                    customerId: user.id.toString(),
                    userEmail: user.email
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout session');
            }

            // Redirect to Stripe Checkout
            window.location.href = data.url;

        } catch (err: any) {
            console.error('Error processing subscription:', err);
            setError(err.message || 'An error occurred. Please try again.');
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Choose Your Subscription Plan</h1>

            {error && (
                <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Basic Plan */}
                    <div
                        className={`border rounded-lg p-6 cursor-pointer hover:shadow-md transition-all ${selectedPlan === 'basic' ? 'border-blue-500 ring-2 ring-blue-200' : ''
                            }`}
                        onClick={() => setSelectedPlan('basic')}
                    >
                        <h3 className="text-xl font-bold mb-2">Basic</h3>
                        <p className="text-3xl font-bold mb-4">$29<span className="text-sm font-normal">/month</span></p>
                        <ul className="space-y-2 mb-6">
                            <li>Order Management</li>
                            <li>Table Management</li>
                            <li>Basic Analytics</li>
                        </ul>
                        <input
                            type="radio"
                            name="plan"
                            value="basic"
                            checked={selectedPlan === 'basic'}
                            onChange={() => setSelectedPlan('basic')}
                            className="hidden"
                        />
                    </div>

                    {/* Premium Plan */}
                    <div
                        className={`border rounded-lg p-6 cursor-pointer hover:shadow-md transition-all ${selectedPlan === 'premium' ? 'border-blue-500 ring-2 ring-blue-200' : ''
                            }`}
                        onClick={() => setSelectedPlan('premium')}
                    >
                        <h3 className="text-xl font-bold mb-2">Premium</h3>
                        <p className="text-3xl font-bold mb-4">$59<span className="text-sm font-normal">/month</span></p>
                        <ul className="space-y-2 mb-6">
                            <li>All Basic Features</li>
                            <li>Staff Management</li>
                            <li>Advanced Analytics</li>
                            <li>Loyalty Program</li>
                        </ul>
                        <input
                            type="radio"
                            name="plan"
                            value="premium"
                            checked={selectedPlan === 'premium'}
                            onChange={() => setSelectedPlan('premium')}
                            className="hidden"
                        />
                    </div>

                    {/* Enterprise Plan */}
                    <div
                        className={`border rounded-lg p-6 cursor-pointer hover:shadow-md transition-all ${selectedPlan === 'enterprise' ? 'border-blue-500 ring-2 ring-blue-200' : ''
                            }`}
                        onClick={() => setSelectedPlan('enterprise')}
                    >
                        <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                        <p className="text-3xl font-bold mb-4">$99<span className="text-sm font-normal">/month</span></p>
                        <ul className="space-y-2 mb-6">
                            <li>All Premium Features</li>
                            <li>Multi-location Support</li>
                            <li>API Access</li>
                            <li>24/7 Support</li>
                            <li>Custom Integrations</li>
                        </ul>
                        <input
                            type="radio"
                            name="plan"
                            value="enterprise"
                            checked={selectedPlan === 'enterprise'}
                            onChange={() => setSelectedPlan('enterprise')}
                            className="hidden"
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center mt-8">
                    <Link href="/pricing" className="text-blue-600 hover:underline">
                        Back to Plans
                    </Link>

                    <button
                        type="submit"
                        disabled={!selectedPlan || isProcessing}
                        className={`px-6 py-3 rounded-lg font-bold ${!selectedPlan
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : isProcessing
                                ? 'bg-blue-400 text-white cursor-wait'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        {isProcessing ? 'Processing...' : 'Subscribe Now'}
                    </button>
                </div>
            </form>
        </div>
    );
} 