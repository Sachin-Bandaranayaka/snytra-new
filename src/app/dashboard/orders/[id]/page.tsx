"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Clock,
    User,
    Phone,
    Mail,
    CreditCard,
    Calendar,
    XCircle,
    CheckCircle,
    AlertCircle,
    Clock4,
    ChefHat,
    Printer
} from 'lucide-react';

interface OrderItem {
    id: number;
    name: string;
    quantity: number;
    price: number;
    notes?: string;
}

interface Order {
    id: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
    payment_method: string;
    total_amount: number;
    preparation_time_minutes?: number;
    special_instructions?: string;
    created_at: string;
    updated_at: string;
    items: OrderItem[];
}

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updateStatusLoading, setUpdateStatusLoading] = useState(false);

    useEffect(() => {
        if (!orderId) return;

        async function fetchOrderDetails() {
            try {
                const response = await fetch(`/api/orders/${orderId}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch order: ${response.status}`);
                }
                const data = await response.json();

                if (data.success) {
                    setOrder(data.order);
                } else {
                    throw new Error(data.error || 'Failed to fetch order details');
                }
            } catch (err: any) {
                console.error('Error fetching order details:', err);
                setError(err.message || 'Failed to fetch order details');
            } finally {
                setLoading(false);
            }
        }

        fetchOrderDetails();
    }, [orderId]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadgeClasses = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'preparing':
                return 'bg-blue-100 text-blue-800';
            case 'ready':
                return 'bg-green-100 text-green-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="text-yellow-500" size={18} />;
            case 'preparing':
                return <Clock4 className="text-blue-500" size={18} />;
            case 'ready':
                return <CheckCircle className="text-green-500" size={18} />;
            case 'completed':
                return <CheckCircle className="text-green-700" size={18} />;
            case 'cancelled':
                return <XCircle className="text-red-500" size={18} />;
            default:
                return <AlertCircle className="text-gray-500" size={18} />;
        }
    };

    const getPaymentBadgeClasses = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'refunded':
                return 'bg-blue-100 text-blue-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    async function updateOrderStatus(newStatus: string) {
        if (!order) return;

        setUpdateStatusLoading(true);
        try {
            const response = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await response.json();

            if (data.success) {
                setOrder({ ...order, status: newStatus as any });
            } else {
                throw new Error(data.error || 'Failed to update order status');
            }
        } catch (err: any) {
            console.error('Error updating order status:', err);
            setError(err.message || 'Failed to update order status');
        } finally {
            setUpdateStatusLoading(false);
        }
    }

    const handlePrintReceipt = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex items-center mb-6">
                    <button onClick={() => router.back()} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                </div>

                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="space-y-6">
                <div className="flex items-center mb-6">
                    <button onClick={() => router.back()} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                </div>

                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
                    <p>Order not found</p>
                    <Link
                        href="/dashboard/orders"
                        className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <button onClick={() => router.back()} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={handlePrintReceipt}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                        <Printer size={16} className="mr-2" />
                        Print Receipt
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Order Status Card */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Order Status</h3>
                    </div>
                    <div className="px-6 py-5">
                        <div className="flex items-center mb-4">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusBadgeClasses(order.status)}`}>
                                <span className="mr-1.5">{getStatusIcon(order.status)}</span>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                        </div>

                        {order.status !== 'completed' && order.status !== 'cancelled' && (
                            <div className="space-y-3 mt-4">
                                <h4 className="text-sm font-medium text-gray-700">Update Status</h4>
                                <div className="flex flex-wrap gap-2">
                                    {order.status !== 'preparing' && (
                                        <button
                                            onClick={() => updateOrderStatus('preparing')}
                                            disabled={updateStatusLoading}
                                            className="inline-flex items-center px-3 py-1.5 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none"
                                        >
                                            <ChefHat size={16} className="mr-1.5" />
                                            Preparing
                                        </button>
                                    )}

                                    {order.status !== 'ready' && order.status !== 'pending' && (
                                        <button
                                            onClick={() => updateOrderStatus('ready')}
                                            disabled={updateStatusLoading}
                                            className="inline-flex items-center px-3 py-1.5 border border-green-300 shadow-sm text-sm leading-4 font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none"
                                        >
                                            <CheckCircle size={16} className="mr-1.5" />
                                            Ready
                                        </button>
                                    )}

                                    {order.status !== 'completed' && (
                                        <button
                                            onClick={() => updateOrderStatus('completed')}
                                            disabled={updateStatusLoading}
                                            className="inline-flex items-center px-3 py-1.5 border border-green-300 shadow-sm text-sm leading-4 font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none"
                                        >
                                            <CheckCircle size={16} className="mr-1.5" />
                                            Complete
                                        </button>
                                    )}

                                    {order.status !== 'cancelled' && (
                                        <button
                                            onClick={() => updateOrderStatus('cancelled')}
                                            disabled={updateStatusLoading}
                                            className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none"
                                        >
                                            <XCircle size={16} className="mr-1.5" />
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Customer Details Card */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Customer Details</h3>
                    </div>
                    <div className="px-6 py-5">
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <User size={18} className="text-gray-400 mr-3" />
                                <div>
                                    <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                                    <div className="text-xs text-gray-500">Customer Name</div>
                                </div>
                            </div>

                            {order.customer_email && (
                                <div className="flex items-center">
                                    <Mail size={18} className="text-gray-400 mr-3" />
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{order.customer_email}</div>
                                        <div className="text-xs text-gray-500">Email Address</div>
                                    </div>
                                </div>
                            )}

                            {order.customer_phone && (
                                <div className="flex items-center">
                                    <Phone size={18} className="text-gray-400 mr-3" />
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{order.customer_phone}</div>
                                        <div className="text-xs text-gray-500">Phone Number</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Order Details Card */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Order Information</h3>
                    </div>
                    <div className="px-6 py-5">
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <Calendar size={18} className="text-gray-400 mr-3" />
                                <div>
                                    <div className="text-sm font-medium text-gray-900">{formatDate(order.created_at)}</div>
                                    <div className="text-xs text-gray-500">Order Date</div>
                                </div>
                            </div>

                            {order.preparation_time_minutes && (
                                <div className="flex items-center">
                                    <Clock size={18} className="text-gray-400 mr-3" />
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{order.preparation_time_minutes} minutes</div>
                                        <div className="text-xs text-gray-500">Preparation Time</div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center">
                                <CreditCard size={18} className="text-gray-400 mr-3" />
                                <div>
                                    <div className="flex items-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentBadgeClasses(order.payment_status)}`}>
                                            {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                        </span>
                                        {order.payment_method && (
                                            <span className="ml-2 text-sm text-gray-500">
                                                via {order.payment_method}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500">Payment Status</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Items Card */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Item
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quantity
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {order.items && order.items.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                        {item.notes && <div className="text-xs text-gray-500">{item.notes}</div>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.quantity}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatCurrency(item.price)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(item.price * item.quantity)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50">
                            <tr>
                                <th scope="row" colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                                    Total
                                </th>
                                <td className="px-6 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                                    {formatCurrency(order.total_amount)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {order.special_instructions && (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Special Instructions</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{order.special_instructions}</p>
                    </div>
                )}
            </div>
        </div>
    );
} 