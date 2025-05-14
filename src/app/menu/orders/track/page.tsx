"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';

export default function TrackOrderPage() {
    const [orderNumber, setOrderNumber] = useState('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Simple validation
        if (!orderNumber.trim()) {
            setError('Please enter an order number');
            return;
        }

        // Check if the order number is numeric
        if (!/^\d+$/.test(orderNumber.trim())) {
            setError('Please enter a valid order number (numbers only)');
            return;
        }

        // Redirect to the order tracking page
        router.push(`/orders/${orderNumber}/tracking`);
    };

    return (
        <div className="min-h-screen bg-[#f8f6f1]">
            {/* Header */}
            <header className="bg-[#e75627] text-white p-4 shadow-md">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex items-center justify-between">
                        <Link href="/menu" className="flex items-center text-white hover:text-gray-100 transition-colors">
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            <span className="font-medium">Back to Menu</span>
                        </Link>
                        <h1 className="text-xl font-bold">Track Your Order</h1>
                    </div>
                </div>
            </header>

            <div className="container mx-auto max-w-lg px-4 py-12">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-[#e75627]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="h-10 w-10 text-[#e75627]" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Track Your Order</h2>
                        <p className="text-gray-600">Enter your order number to check its status</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                Order Number
                            </label>
                            <input
                                type="text"
                                id="orderNumber"
                                value={orderNumber}
                                onChange={(e) => {
                                    setOrderNumber(e.target.value);
                                    setError(null); // Clear error when typing
                                }}
                                placeholder="Enter order number (e.g. 12345)"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-[#e75627] focus:border-[#e75627]"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 bg-[#e75627] text-white font-medium rounded-lg hover:bg-[#d24a1f] transition-colors"
                        >
                            Track Order
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                        <p className="text-gray-600 mb-4">Recently placed an order?</p>
                        <Link
                            href="/orders/recent"
                            className="text-[#e75627] font-medium hover:underline"
                        >
                            View your recent orders
                        </Link>
                    </div>
                </div>

                <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">How to track your order</h3>
                    <ul className="space-y-3 text-gray-600">
                        <li className="flex items-start">
                            <span className="flex-shrink-0 w-6 h-6 bg-[#e75627] text-white rounded-full flex items-center justify-center mr-3 mt-0.5">1</span>
                            <span>Enter your order number from your receipt or confirmation email</span>
                        </li>
                        <li className="flex items-start">
                            <span className="flex-shrink-0 w-6 h-6 bg-[#e75627] text-white rounded-full flex items-center justify-center mr-3 mt-0.5">2</span>
                            <span>Click the "Track Order" button</span>
                        </li>
                        <li className="flex items-start">
                            <span className="flex-shrink-0 w-6 h-6 bg-[#e75627] text-white rounded-full flex items-center justify-center mr-3 mt-0.5">3</span>
                            <span>View real-time updates on your order's status</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
} 