"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    subscription_plan: string;
}

interface Restaurant {
    id: number;
    name: string;
    description: string | null;
    address: string | null;
}

interface Order {
    id: number;
    customer_name: string;
    status: string;
    total_amount: string;
    created_at: string;
}

interface DashboardStats {
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
}

interface DashboardData {
    restaurants: Restaurant[];
    recentOrders: Order[];
    stats: DashboardStats;
}

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Check if user is logged in
        const userData = localStorage.getItem('user');
        if (!userData) {
            router.push('/login');
            return;
        }

        try {
            setUser(JSON.parse(userData));
        } catch (err) {
            console.error('Failed to parse user data:', err);
            localStorage.removeItem('user');
            router.push('/login');
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        async function fetchDashboardData() {
            if (!user) return;

            setDataLoading(true);
            try {
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
                setError(err.message || 'Failed to fetch dashboard data');
            } finally {
                setDataLoading(false);
            }
        }

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        router.push('/login');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="rounded-md bg-red-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
                    >
                        Log Out
                    </button>
                </div>
            </header>
            <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
                {user && (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">User Information</h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and account information.</p>
                        </div>
                        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                            <dl className="sm:divide-y sm:divide-gray-200">
                                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.name}</dd>
                                </div>
                                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Email address</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
                                </div>
                                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Subscription plan</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 capitalize">
                                        {user.subscription_plan || 'Free'}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                )}

                {/* Display error if any */}
                {error && (
                    <div className="my-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                )}

                {/* Display loading indicator while fetching dashboard data */}
                {dataLoading ? (
                    <div className="text-center py-10">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading dashboard data...</p>
                    </div>
                ) : dashboardData ? (
                    <div className="space-y-6">
                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                                        {dashboardData.stats.totalOrders}
                                    </dd>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                                        {formatCurrency(Number(dashboardData.stats.totalRevenue))}
                                    </dd>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="px-4 py-5 sm:p-6">
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Customers</dt>
                                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                                        {dashboardData.stats.totalCustomers}
                                    </dd>
                                </div>
                            </div>
                        </div>

                        {/* Restaurants Section */}
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Your Restaurants</h3>
                                <Link
                                    href="/dashboard/restaurants/new"
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Add Restaurant
                                </Link>
                            </div>
                            <div className="border-t border-gray-200">
                                {dashboardData.restaurants.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">No restaurants yet</p>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-gray-200">
                                        {dashboardData.restaurants.map((restaurant) => (
                                            <li key={restaurant.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="text-lg font-medium text-gray-900">{restaurant.name}</h4>
                                                        {restaurant.address && (
                                                            <p className="text-sm text-gray-500">{restaurant.address}</p>
                                                        )}
                                                    </div>
                                                    <Link
                                                        href={`/dashboard/restaurants/${restaurant.id}`}
                                                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                                    >
                                                        Manage
                                                    </Link>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* Recent Orders Section */}
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Orders</h3>
                                <Link
                                    href="/dashboard/orders"
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    View All
                                </Link>
                            </div>
                            <div className="border-t border-gray-200">
                                {dashboardData.recentOrders.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">No recent orders</p>
                                    </div>
                                ) : (
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Customer
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Amount
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {dashboardData.recentOrders.map((order) => (
                                                <tr key={order.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-gray-100 text-gray-800'}`}>
                                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        ${order.total_amount}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(order.created_at)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-600">No dashboard data available</p>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <Link
                        href="/test-integration"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                        Run Integration Tests
                    </Link>
                </div>
            </div>
        </main>
    );
} 