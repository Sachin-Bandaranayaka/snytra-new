"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Search,
    Filter,
    Eye,
    Clock,
    Calendar,
    User,
    CreditCard,
    CheckCircle,
    XCircle,
    AlertCircle,
    Clock4
} from 'lucide-react';

interface Order {
    id: number;
    customer_name: string;
    customer_email: string;
    status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
    total_amount: number;
    items_count: number;
    created_at: string;
}

// Mock data for initial UI rendering
const mockOrders: Order[] = [
    {
        id: 1001,
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        status: 'completed',
        payment_status: 'paid',
        total_amount: 45.90,
        items_count: 3,
        created_at: '2023-06-15T14:30:00Z'
    },
    {
        id: 1002,
        customer_name: 'Jane Smith',
        customer_email: 'jane@example.com',
        status: 'pending',
        payment_status: 'pending',
        total_amount: 32.50,
        items_count: 2,
        created_at: '2023-06-15T15:45:00Z'
    },
    {
        id: 1003,
        customer_name: 'Alice Johnson',
        customer_email: 'alice@example.com',
        status: 'preparing',
        payment_status: 'paid',
        total_amount: 28.75,
        items_count: 2,
        created_at: '2023-06-15T16:20:00Z'
    },
    {
        id: 1004,
        customer_name: 'Bob Williams',
        customer_email: 'bob@example.com',
        status: 'ready',
        payment_status: 'paid',
        total_amount: 52.30,
        items_count: 4,
        created_at: '2023-06-15T17:10:00Z'
    },
    {
        id: 1005,
        customer_name: 'Charlie Brown',
        customer_email: 'charlie@example.com',
        status: 'cancelled',
        payment_status: 'refunded',
        total_amount: 18.20,
        items_count: 1,
        created_at: '2023-06-15T12:05:00Z'
    }
];

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch real data from API
        async function fetchOrders() {
            try {
                const response = await fetch('/api/dashboard/orders');
                if (!response.ok) {
                    throw new Error(`Failed to fetch orders: ${response.status}`);
                }
                const data = await response.json();

                if (data.success) {
                    setOrders(data.orders);
                } else {
                    throw new Error(data.error || 'Failed to fetch orders');
                }
            } catch (err: any) {
                console.error('Error fetching orders:', err);
                setError(err.message || 'Failed to fetch orders');

                // Fallback to mock data if API fails
                setOrders(mockOrders);
            } finally {
                setLoading(false);
            }
        }

        fetchOrders();
    }, []);

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

    const filteredOrders = orders.filter(order => {
        // Apply search query filter
        const matchesSearch =
            searchQuery === '' ||
            order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.id.toString().includes(searchQuery);

        // Apply status filter
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        // Apply payment filter
        const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter;

        return matchesSearch && matchesStatus && matchesPayment;
    });

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

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                    <Filter size={16} className="mr-2" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
            </div>

            {error && (
                <div className="my-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}

            {/* Search and Filters */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search Box */}
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={16} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Search by name, email or order #"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Filters */}
                    {showFilters && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                                    Order Status
                                </label>
                                <select
                                    id="status-filter"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="preparing">Preparing</option>
                                    <option value="ready">Ready</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="payment-filter" className="block text-sm font-medium text-gray-700 mb-1">
                                    Payment Status
                                </label>
                                <select
                                    id="payment-filter"
                                    value={paymentFilter}
                                    onChange={(e) => setPaymentFilter(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                >
                                    <option value="all">All Payments</option>
                                    <option value="paid">Paid</option>
                                    <option value="pending">Pending</option>
                                    <option value="refunded">Refunded</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
                    <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
                    <p className="text-gray-500">
                        {orders.length === 0
                            ? 'No orders have been placed yet'
                            : 'No orders match your current filters'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Payment
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{order.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <User size={16} className="text-gray-500" />
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                                                    <div className="text-sm text-gray-500">{order.customer_email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(order.status)}`}>
                                                <span className="mr-1.5">{getStatusIcon(order.status)}</span>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentBadgeClasses(order.payment_status)}`}>
                                                {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatCurrency(order.total_amount)}
                                            <div className="text-xs text-gray-500">{order.items_count} item{order.items_count !== 1 ? 's' : ''}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <Calendar size={14} className="mr-1" />
                                                {formatDate(order.created_at)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link href={`/dashboard/orders/${order.id}`} className="text-blue-600 hover:text-blue-900 flex items-center">
                                                <Eye size={16} className="mr-1" />
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
} 