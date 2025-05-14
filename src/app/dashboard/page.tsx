"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    CreditCard,
    Users,
    ShoppingCart,
    ArrowRight,
    Plus,
    Clock,
    CheckCircle,
    CircleDashed,
    XCircle,
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp,
    BarChart3,
    DollarSign
} from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    subscription_plan: string;
    subscription_status?: string;
    subscription_current_period_end?: string;
}

interface Restaurant {
    id: number;
    name: string;
    description: string | null;
    address: string | null;
}

interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: string;
    category: string;
    image_url?: string;
    is_best_seller?: boolean;
    options?: string[];
}

interface Order {
    id: number;
    customer_name: string;
    status: string;
    total_amount: string;
    created_at: string;
    table?: string;
    items?: {
        name: string;
        quantity: number;
        price: string;
    }[];
}

interface DashboardStats {
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    pendingOrders?: number;
    ordersThisWeek?: number;
    previousWeekOrders?: number;
    revenueThisWeek?: number;
    previousWeekRevenue?: number;
    averageOrderValue?: number;
    completedOrders?: number;
    cancelledOrders?: number;
    inProgressOrders?: number;
    lastSixMonthsSales?: { month: string; sales: number }[];
}

interface DashboardData {
    restaurants: Restaurant[];
    recentOrders: Order[];
    menuItems?: MenuItem[];
    stats: DashboardStats;
}

// Mock data for initial UI rendering
const mockData: DashboardData = {
    restaurants: [
        { id: 1, name: 'My First Restaurant', description: 'A great place to eat', address: '123 Main St, City' }
    ],
    recentOrders: [
        {
            id: 123,
            customer_name: 'John Doe',
            status: 'completed',
            total_amount: '45.90',
            created_at: new Date().toISOString(),
            table: 'Table 5',
            items: [
                { name: 'Burger', quantity: 1, price: '8.99' },
                { name: 'Fish and Chips', quantity: 3, price: '28.99' },
                { name: 'French Fries', quantity: 2, price: '5.99' }
            ]
        },
        {
            id: 123,
            customer_name: 'John Doe',
            status: 'pending',
            total_amount: '45.90',
            created_at: new Date().toISOString(),
            table: 'Table 5',
            items: [
                { name: 'Burger', quantity: 1, price: '8.99' },
                { name: 'Fish and Chips', quantity: 3, price: '28.99' },
                { name: 'French Fries', quantity: 2, price: '5.99' }
            ]
        },
        {
            id: 123,
            customer_name: 'John Doe',
            status: 'in-progress',
            total_amount: '45.90',
            created_at: new Date().toISOString(),
            table: 'Table 5',
            items: [
                { name: 'Burger', quantity: 1, price: '8.99' },
                { name: 'Fish and Chips', quantity: 3, price: '28.99' },
                { name: 'French Fries', quantity: 2, price: '5.99' }
            ]
        },
        {
            id: 123,
            customer_name: 'John Doe',
            status: 'cancelled',
            total_amount: '45.90',
            created_at: new Date().toISOString(),
            table: 'Table 5',
            items: [
                { name: 'Burger', quantity: 1, price: '8.99' },
                { name: 'Fish and Chips', quantity: 3, price: '28.99' },
                { name: 'French Fries', quantity: 2, price: '5.99' }
            ]
        }
    ],
    menuItems: [
        {
            id: 1,
            name: 'Margherita Pizza',
            description: 'Classic tomato sauce, mozzarella cheese, and fresh basil.',
            price: '12.99 - 18.99',
            category: 'Pizza',
            image_url: '/images/margherita-pizza.jpg',
            is_best_seller: true,
            options: ['S/M/L']
        },
        {
            id: 2,
            name: 'Caesar Salad',
            description: 'Crisp romaine lettuce, croutons, and Caesar dressing.',
            price: '8.99',
            category: 'Salad',
            image_url: '/images/caesar-salad.jpg'
        },
        {
            id: 3,
            name: 'Macaroni',
            description: 'Creamy sauce with pancetta, eggs, and Parmesan cheese.',
            price: '15.99',
            category: 'Pasta',
            image_url: '/images/macaroni.jpg',
            is_best_seller: true
        },
        {
            id: 4,
            name: 'New York Cheesecake',
            description: 'Rich and creamy cheesecake with a graham cracker crust.',
            price: '6.99',
            category: 'Dessert',
            image_url: '/images/cheesecake.jpg'
        }
    ],
    stats: {
        totalOrders: 239,
        totalRevenue: 5890.5,
        totalCustomers: 98,
        pendingOrders: 12,
        ordersThisWeek: 32,
        previousWeekOrders: 28,
        revenueThisWeek: 1290.75,
        previousWeekRevenue: 1100.25,
        averageOrderValue: 40.62,
        completedOrders: 110,
        cancelledOrders: 110,
        inProgressOrders: 7,
        lastSixMonthsSales: [
            { month: 'Nov', sales: 3200 },
            { month: 'Dec', sales: 4100 },
            { month: 'Jan', sales: 3800 },
            { month: 'Feb', sales: 3600 },
            { month: 'Mar', sales: 4800 },
            { month: 'Apr', sales: 5100 }
        ]
    }
};

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Get user data from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (err) {
                console.error('Failed to parse user data:', err);
            }
        }
    }, []);

    useEffect(() => {
        async function fetchDashboardData() {
            setLoading(true);
            setError(null);
            try {
                // Fetch real data from API
                const response = await fetch('/api/dashboard/data');
                if (!response.ok) {
                    throw new Error(`Failed to fetch dashboard data: ${response.status}`);
                }
                const data = await response.json();
                if (!data.success) {
                    throw new Error(data.error || 'Failed to fetch dashboard data');
                }

                setDashboardData(data);
            } catch (err: any) {
                console.error('Error fetching dashboard data:', err);
                setError(err.message || 'Failed to load dashboard data');
                // If we don't have any data yet, set mock data as fallback
                if (!dashboardData) {
                    setDashboardData(mockData);
                }
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, []);

    const formatCurrency = (amount: number | string) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(numAmount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return <CheckCircle className="text-green-500" size={20} />;
            case 'pending':
                return <Clock className="text-yellow-500" size={20} />;
            case 'in-progress':
                return <CircleDashed className="text-blue-500" size={20} />;
            case 'cancelled':
                return <XCircle className="text-red-500" size={20} />;
            default:
                return <CircleDashed className="text-gray-500" size={20} />;
        }
    };

    const getStatusClass = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'in-progress':
                return 'bg-blue-100 text-blue-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent"></div>
            </div>
        );
    }

    const data = dashboardData || mockData;

    // Calculate order change percentage
    const orderChangePercent = data.stats.previousWeekOrders
        ? Math.round(((data.stats.ordersThisWeek || 0) - data.stats.previousWeekOrders) / data.stats.previousWeekOrders * 100)
        : 0;

    // Calculate revenue change percentage
    const revenueChangePercent = data.stats.previousWeekRevenue
        ? Math.round(((data.stats.revenueThisWeek || 0) - data.stats.previousWeekRevenue) / data.stats.previousWeekRevenue * 100)
        : 0;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Welcome back to your restaurant dashboard</p>
                </div>

                <div className="flex gap-3">
                    <Link
                        href="/dashboard/orders/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                    >
                        <Plus size={18} className="mr-2" />
                        New Order
                    </Link>
                    <Link
                        href="/dashboard/menu/new"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                    >
                        <Plus size={18} className="mr-2" />
                        Add Menu Item
                    </Link>
                </div>
            </div>

            {error && (
                <div className="my-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Orders */}
                <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex-shrink-0 rounded-full p-3 bg-blue-50">
                                <ShoppingCart className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                                <span className={`flex items-center ${orderChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {orderChangePercent >= 0 ? (
                                        <ArrowUpRight className="h-4 w-4 mr-1" />
                                    ) : (
                                        <ArrowDownRight className="h-4 w-4 mr-1" />
                                    )}
                                    {Math.abs(orderChangePercent)}%
                                </span>
                                <span className="mx-2">from last week</span>
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-lg font-medium text-gray-500">Total Orders</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{data.stats.totalOrders}</p>
                        </div>
                    </div>
                </div>

                {/* Total Revenue */}
                <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex-shrink-0 rounded-full p-3 bg-green-50">
                                <DollarSign className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                                <span className={`flex items-center ${revenueChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {revenueChangePercent >= 0 ? (
                                        <ArrowUpRight className="h-4 w-4 mr-1" />
                                    ) : (
                                        <ArrowDownRight className="h-4 w-4 mr-1" />
                                    )}
                                    {Math.abs(revenueChangePercent)}%
                                </span>
                                <span className="mx-2">from last week</span>
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-lg font-medium text-gray-500">Total Revenue</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(data.stats.totalRevenue)}</p>
                        </div>
                    </div>
                </div>

                {/* Average Order Value */}
                <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex-shrink-0 rounded-full p-3 bg-purple-50">
                                <TrendingUp className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-lg font-medium text-gray-500">Average Order</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(data.stats.averageOrderValue || 0)}</p>
                        </div>
                    </div>
                </div>

                {/* Total Customers */}
                <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex-shrink-0 rounded-full p-3 bg-amber-50">
                                <Users className="h-6 w-6 text-amber-600" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-lg font-medium text-gray-500">Total Customers</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{data.stats.totalCustomers}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Metrics */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Order Metrics</h2>
                            <p className="text-sm text-gray-500">Overview of orders for today</p>
                        </div>
                        <Link
                            href="/dashboard/orders/new"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                        >
                            <Plus size={16} className="mr-2" />
                            New Order
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Completed Orders Card */}
                        <div className="bg-white overflow-hidden rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 p-3 rounded-full bg-green-100 text-green-600">
                                        <CheckCircle size={24} />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <div className="text-sm font-medium text-gray-500">Completed Orders</div>
                                        <div className="mt-1 text-3xl font-semibold text-gray-900">{data.stats.completedOrders || 110}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* In Progress Orders Card */}
                        <div className="bg-white overflow-hidden rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 p-3 rounded-full bg-blue-100 text-blue-600">
                                        <CircleDashed size={24} />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <div className="text-sm font-medium text-gray-500">In Progress Orders</div>
                                        <div className="mt-1 text-3xl font-semibold text-gray-900">{data.stats.inProgressOrders || 7}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pending Orders Card */}
                        <div className="bg-white overflow-hidden rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 p-3 rounded-full bg-yellow-100 text-yellow-600">
                                        <Clock size={24} />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <div className="text-sm font-medium text-gray-500">Pending Orders</div>
                                        <div className="mt-1 text-3xl font-semibold text-gray-900">{data.stats.pendingOrders || 2}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cancelled Orders Card */}
                        <div className="bg-white overflow-hidden rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 p-3 rounded-full bg-red-100 text-red-600">
                                        <XCircle size={24} />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <div className="text-sm font-medium text-gray-500">Cancelled Orders</div>
                                        <div className="mt-1 text-3xl font-semibold text-gray-900">{data.stats.cancelledOrders || 110}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                            <p className="text-sm text-gray-500">Today's active orders</p>
                        </div>
                        <Link
                            href="/dashboard/orders"
                            className="inline-flex items-center text-sm text-primary-orange hover:text-orange-700 font-medium"
                        >
                            View all
                            <ArrowRight size={16} className="ml-1" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {data.recentOrders.map((order, index) => (
                            <div key={index} className="bg-white overflow-hidden rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            {order.status === 'pending' && (
                                                <span className="inline-flex items-center p-1.5 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
                                                    <Clock size={16} className="mr-1" />
                                                    Incoming
                                                </span>
                                            )}
                                            {order.status === 'completed' && (
                                                <span className="inline-flex items-center p-1.5 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                                                    <CheckCircle size={16} className="mr-1" />
                                                    Completed
                                                </span>
                                            )}
                                            {order.status === 'in-progress' && (
                                                <span className="inline-flex items-center p-1.5 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                                                    <CircleDashed size={16} className="mr-1" />
                                                    In Progress
                                                </span>
                                            )}
                                            {order.status === 'cancelled' && (
                                                <span className="inline-flex items-center p-1.5 text-xs font-medium text-red-800 bg-red-100 rounded-full">
                                                    <XCircle size={16} className="mr-1" />
                                                    Cancelled
                                                </span>
                                            )}
                                        </div>
                                        <Link href={`/dashboard/orders/${order.id}`}>
                                            <button className="text-gray-400 hover:text-primary-orange transition-colors">
                                                <ArrowRight size={20} />
                                            </button>
                                        </Link>
                                    </div>
                                    <div className="mb-2">
                                        <div className="font-medium text-gray-900">Order #{order.id}</div>
                                        <div className="text-sm text-gray-500 mt-1">{order.table || 'Table 5'}</div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="space-y-2 mt-3 border-t border-gray-100 pt-3">
                                        {order.items && order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <div className="flex items-center">
                                                    <span className="text-gray-700 mr-2">{item.quantity}x</span>
                                                    <span className="font-medium text-gray-900">{item.name}</span>
                                                </div>
                                                <div className="text-gray-700">${item.price}</div>
                                            </div>
                                        ))}
                                        <div className="flex justify-between pt-2 border-t border-gray-100 mt-2">
                                            <span className="font-medium">Total</span>
                                            <span className="font-bold text-primary-orange">${order.total_amount}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Menu Management */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Menu Items</h2>
                            <p className="text-sm text-gray-500">Manage your restaurant menu</p>
                        </div>

                        <div className="flex gap-3">
                            <Link
                                href="/dashboard/menu/category/new"
                                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                            >
                                Add Category
                            </Link>
                            <Link
                                href="/dashboard/menu/new"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                            >
                                <Plus size={16} className="mr-2" />
                                New Menu
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {data.menuItems && data.menuItems.map((item, index) => (
                            <div key={index} className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div className="aspect-w-3 aspect-h-2 bg-gray-100 relative">
                                    {item.image_url ? (
                                        <img
                                            src={item.image_url}
                                            alt={item.name}
                                            className="w-full h-48 object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.onerror = null;
                                                target.src = "/images/placeholders/food-placeholder.svg";
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                                            <img src="/images/placeholders/food-placeholder.svg" alt="Food placeholder" className="w-full h-full object-contain p-4" />
                                        </div>
                                    )}
                                    {item.is_best_seller && (
                                        <div className="absolute top-2 left-2">
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800">
                                                Best Seller
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link href={`/dashboard/menu/edit/${item.id}`}>
                                            <button className="p-2 bg-white rounded-full shadow-md text-gray-700 hover:text-primary-orange transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.description}</p>
                                    <div className="mt-2 flex justify-between items-center">
                                        <p className="text-sm font-semibold text-gray-900">{item.price}</p>
                                        <span className="text-xs font-medium text-gray-500">{item.category}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-center">
                        <Link
                            href="/dashboard/menu"
                            className="inline-flex items-center text-sm text-primary-orange hover:text-orange-700 font-medium"
                        >
                            View all menu items
                            <ArrowRight size={16} className="ml-1" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Subscription plan display section */}
            {user && (
                <div className="mb-6 bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    Subscription Status
                                </h3>
                                <div className="mt-1 flex items-center">
                                    <p className="text-sm text-gray-500 mr-2">
                                        Current plan: <span className="font-medium">{user.subscription_plan ? `Plan #${user.subscription_plan}` : 'Free'}</span>
                                    </p>
                                    <span className={`px-2 py-1 text-xs rounded-full ${user.subscription_status === 'active'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {user.subscription_status || 'inactive'}
                                    </span>
                                </div>
                            </div>
                            <a
                                href="/pricing"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {user.subscription_status === 'active' ? 'Manage Plan' : 'Upgrade Plan'}
                            </a>
                        </div>
                        {user.subscription_current_period_end && (
                            <p className="mt-3 text-sm text-gray-500">
                                Your subscription is active until {new Date(user.subscription_current_period_end).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 