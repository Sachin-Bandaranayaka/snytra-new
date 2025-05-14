"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, RefreshCcw } from 'lucide-react';
import OrderTracker from '@/components/ui/OrderTracker';

interface Order {
    id: number;
    customer_name: string;
    status: string;
    total_amount: number;
    created_at: string;
    items: Array<{
        id: number;
        name: string;
        quantity: number;
        price: number;
    }>;
}

export default function OrderTrackingPage() {
    const params = useParams();
    const orderId = params?.id ? parseInt(params.id as string) : 0;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orderId) {
            setError('Invalid order ID');
            setLoading(false);
            return;
        }

        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/orders/${orderId}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch order: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setOrder(data.order);
                setError(null);
            } else {
                setError(data.error || 'Failed to fetch order details');
            }
        } catch (err: any) {
            console.error('Error fetching order:', err);
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f6f1]">
                <div className="w-16 h-16 border-4 border-[#e75627] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen p-4 flex flex-col items-center justify-center bg-[#f8f6f1]">
                <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                    <p className="text-gray-700 mb-6">{error}</p>
                    <Link
                        href="/menu"
                        className="inline-flex items-center px-4 py-2 bg-[#e75627] text-white text-sm font-medium rounded-md hover:bg-[#d24a1f]"
                    >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Menu
                    </Link>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen p-4 flex flex-col items-center justify-center bg-[#f8f6f1]">
                <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h1>
                    <p className="text-gray-600 mb-6">The order you are looking for could not be found.</p>
                    <Link
                        href="/menu"
                        className="inline-flex items-center px-4 py-2 bg-[#e75627] text-white text-sm font-medium rounded-md hover:bg-[#d24a1f]"
                    >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Menu
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f6f1]">
            {/* Header */}
            <header className="bg-[#e75627] shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <Link href="/menu" className="mr-4 text-white hover:text-white/80">
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                            <h1 className="text-xl font-semibold text-white">Order Tracking</h1>
                        </div>
                        <button
                            onClick={fetchOrderDetails}
                            className="inline-flex items-center px-3 py-1.5 bg-white/10 text-sm font-medium rounded-md text-white hover:bg-white/20"
                        >
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Refresh
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
                    {/* Order tracking section */}
                    <div className="lg:col-span-4">
                        <OrderTracker orderId={order.id} initialStatus={order.status} />
                    </div>

                    {/* Order summary section */}
                    <div className="lg:col-span-3">
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <h2 className="text-lg font-semibold text-[#e75627] mb-4">Order Summary</h2>

                            <div className="flex justify-between text-sm mb-3">
                                <span className="text-gray-500">Order #:</span>
                                <span className="font-medium text-[#e75627]">{order.id}</span>
                            </div>

                            <div className="flex justify-between text-sm mb-3">
                                <span className="text-gray-500">Date:</span>
                                <span className="font-medium">
                                    {new Date(order.created_at).toLocaleString()}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm mb-5">
                                <span className="text-gray-500">Customer:</span>
                                <span className="font-medium">{order.customer_name}</span>
                            </div>

                            <div className="border-t border-gray-200 pt-4 mt-4">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Items</h3>
                                <ul className="divide-y divide-gray-200">
                                    {order.items && order.items.map(item => (
                                        <li key={item.id} className="py-3 flex justify-between">
                                            <div>
                                                <span className="text-sm font-medium text-gray-800">
                                                    {item.quantity}x {item.name}
                                                </span>
                                            </div>
                                            <span className="text-sm text-gray-600">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="border-t border-gray-200 pt-4 mt-4">
                                <div className="flex justify-between items-center font-medium">
                                    <span className="text-gray-900">Total</span>
                                    <span className="text-[#e75627]">${Number(order.total_amount).toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 gap-4">
                                <Link
                                    href="/menu"
                                    className="block w-full text-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Return to Menu
                                </Link>
                                <Link
                                    href="/menu/orders/track"
                                    className="block w-full text-center px-4 py-2 bg-[#e75627] shadow-sm text-sm font-medium rounded-md text-white hover:bg-[#d24a1f]"
                                >
                                    Track Another Order
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 