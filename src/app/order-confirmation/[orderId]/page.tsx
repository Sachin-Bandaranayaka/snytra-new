"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    CheckCircle,
    Clock,
    ArrowLeft,
    ChefHat,
    Truck,
    AlertCircle
} from 'lucide-react';
import CallWaiter from '@/components/ui/CallWaiter';

interface OrderItem {
    id: number;
    menuItemId: number;
    menuItemName: string;
    quantity: number;
    price: number;
    subtotal: number;
    notes: string | null;
}

interface Order {
    id: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    tableId: number | null;
    status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
    totalAmount: number;
    paymentStatus: string;
    paymentMethod: string;
    specialInstructions: string | null;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
}

export default function OrderConfirmationPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.orderId as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchOrderDetails() {
            try {
                const response = await fetch(`/api/orders?orderId=${orderId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch order details');
                }

                const data = await response.json();
                setOrder(data.order);
            } catch (err: any) {
                console.error('Error fetching order:', err);
                setError(err.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        }

        fetchOrderDetails();

        // Poll for order status updates every 30 seconds
        const interval = setInterval(fetchOrderDetails, 30000);

        return () => clearInterval(interval);
    }, [orderId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f6f1]">
                <div className="w-16 h-16 border-4 border-[#e75627] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-[#f8f6f1]">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
                    <p className="text-gray-700 mb-4">{error || 'Order not found'}</p>
                    <Link href="/menu" className="text-[#e75627] hover:underline">
                        Return to Menu
                    </Link>
                </div>
            </div>
        );
    }

    // Calculate order status percentage
    const getStatusPercentage = () => {
        switch (order.status) {
            case 'pending': return 25;
            case 'preparing': return 50;
            case 'ready': return 75;
            case 'delivered': return 100;
            case 'cancelled': return 0;
            default: return 0;
        }
    };

    // Get estimated time based on status
    const getEstimatedTime = () => {
        switch (order.status) {
            case 'pending': return '10-15 min';
            case 'preparing': return '5-10 min';
            case 'ready': return 'Ready now';
            case 'delivered': return 'Completed';
            case 'cancelled': return 'Cancelled';
            default: return 'Unknown';
        }
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
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
                        <h1 className="text-xl font-bold">Order Confirmation</h1>
                    </div>
                </div>
            </header>

            {/* Success Message */}
            <div className="container mx-auto max-w-4xl px-4 py-8">
                <div className="bg-white p-8 rounded-lg shadow-md text-center mb-6">
                    <div className="w-20 h-20 bg-[#e75627]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-12 w-12 text-[#e75627]" />
                    </div>
                    <h2 className="text-3xl font-bold text-[#e75627] mb-2">Thank You for Your Order!</h2>
                    <p className="text-gray-600 text-lg mb-8">
                        Your order #{order.id} has been received and is being processed.
                    </p>

                    <div className="bg-[#f8f6f1] p-6 rounded-lg mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-gray-700 font-medium">Order Status: </span>
                            <span className="font-bold text-[#e75627] capitalize">{order.status}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                            <div
                                className="bg-[#e75627] h-3 rounded-full transition-all duration-500"
                                style={{ width: `${getStatusPercentage()}%` }}
                            ></div>
                        </div>
                        <div className="grid grid-cols-4 text-xs text-gray-500">
                            <div className="text-center">
                                <div className={`w-4 h-4 rounded-full mx-auto mb-1 ${order.status !== 'cancelled' ? 'bg-[#e75627]' : 'bg-gray-300'}`}></div>
                                <span>Received</span>
                            </div>
                            <div className="text-center">
                                <div className={`w-4 h-4 rounded-full mx-auto mb-1 ${getStatusPercentage() >= 50 ? 'bg-[#e75627]' : 'bg-gray-300'}`}></div>
                                <span>Preparing</span>
                            </div>
                            <div className="text-center">
                                <div className={`w-4 h-4 rounded-full mx-auto mb-1 ${getStatusPercentage() >= 75 ? 'bg-[#e75627]' : 'bg-gray-300'}`}></div>
                                <span>Ready</span>
                            </div>
                            <div className="text-center">
                                <div className={`w-4 h-4 rounded-full mx-auto mb-1 ${getStatusPercentage() >= 100 ? 'bg-[#e75627]' : 'bg-gray-300'}`}></div>
                                <span>Delivered</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center mb-6 p-4 bg-[#f8f6f1] rounded-lg">
                        <Clock className="text-[#e75627] mr-3" size={24} />
                        <span className="text-gray-700 font-medium text-lg">
                            Estimated {order.status === 'ready' ? 'Ready' : 'Time'}: {getEstimatedTime()}
                        </span>
                    </div>

                    {order.tableId && (
                        <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-md mb-6">
                            <p className="text-lg font-medium">Please go to <span className="font-bold">Table #{order.tableId}</span></p>
                            <p>Your order will be served to your table when ready.</p>
                        </div>
                    )}

                    <div className="flex mt-6 space-x-4">
                        <Link
                            href={`/orders/${order.id}/tracking`}
                            className="flex-1 py-3 px-4 bg-[#e75627] text-white text-center rounded-md hover:bg-[#d24a1f] transition-colors font-medium"
                        >
                            Track Order
                        </Link>
                        <button
                            className="flex-1 py-3 px-4 border border-gray-300 bg-white text-gray-700 text-center rounded-md hover:bg-gray-50 transition-colors font-medium"
                            onClick={() => window.print()}
                        >
                            Print Receipt
                        </button>
                    </div>
                </div>

                {/* Order Details */}
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-200 pb-4">Order Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-[#f8f6f1] p-4 rounded-lg">
                            <h4 className="font-medium text-gray-500 mb-2">Order ID</h4>
                            <p className="font-bold text-[#e75627]">#{order.id}</p>
                        </div>
                        <div className="bg-[#f8f6f1] p-4 rounded-lg">
                            <h4 className="font-medium text-gray-500 mb-2">Date</h4>
                            <p className="font-bold text-gray-800">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="bg-[#f8f6f1] p-4 rounded-lg">
                            <h4 className="font-medium text-gray-500 mb-2">Payment</h4>
                            <p className="font-bold text-gray-800 capitalize">{order.paymentMethod}</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6 mb-6">
                        <h4 className="font-medium text-gray-800 mb-4">Items</h4>
                        <div className="space-y-4">
                            {order.items.map(item => (
                                <div key={item.id} className="flex justify-between items-center p-3 bg-[#f8f6f1] rounded-lg">
                                    <div>
                                        <span className="text-[#e75627] font-medium">{item.quantity}x </span>
                                        <span className="text-gray-800 font-medium">{item.menuItemName}</span>
                                        {item.notes && (
                                            <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                                        )}
                                    </div>
                                    <span className="text-gray-800 font-bold">${item.subtotal.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#f8f6f1] p-6 rounded-lg">
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="text-gray-800">${(order.totalAmount / 1.07).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Tax (7%)</span>
                            <span className="text-gray-800">${(order.totalAmount - (order.totalAmount / 1.07)).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-3 mt-3 border-t border-gray-300">
                            <span>Total</span>
                            <span className="text-[#e75627]">${order.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    {order.specialInstructions && (
                        <div className="mt-6 p-4 bg-[#f8f6f1] rounded-lg">
                            <h4 className="font-medium text-gray-800 mb-2">Special Instructions</h4>
                            <p className="text-gray-600">{order.specialInstructions}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add CallWaiter component if there's a table ID */}
            {order.tableId && <CallWaiter tableId={order.tableId} />}
        </div>
    );
} 