"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardStats {
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
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

interface DashboardData {
    restaurants: Restaurant[];
    recentOrders: Order[];
    stats: DashboardStats;
}

export default function DashboardWithData() {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchDashboardData() {
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
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, []);

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
            <div className="flex justify-center py-10">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                <p className="font-bold">Error</p>
                <p>{error}</p>
            </div>
        );
    }

    if (!dashboardData) {
        return <div className="text-center py-10">No dashboard data available</div>;
    }

    const { restaurants, recentOrders, stats } = dashboardData;

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                            {stats.totalOrders}
                        </dd>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                            {formatCurrency(Number(stats.totalRevenue))}
                        </dd>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Customers</dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                            {stats.totalCustomers}
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
                    {restaurants.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No restaurants yet</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {restaurants.map((restaurant) => (
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
                    {recentOrders.length === 0 ? (
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
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'}`}>
                                                {order.status}
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
    );
} 