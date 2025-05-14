"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/StackAdminAuth';
import { useRouter } from 'next/navigation';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { CalendarIcon, FilterIcon, Download, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import FeatureGuard from '@/components/FeatureGuard';

// Type definitions
interface OrderAnalytics {
    dailySales: {
        date: string;
        total: number;
        orderCount: number;
    }[];
    popularItems: {
        name: string;
        quantity: number;
        revenue: number;
    }[];
    orderStatsByStatus: {
        status: string;
        count: number;
    }[];
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function OrderAnalyticsPage() {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [analytics, setAnalytics] = useState<OrderAnalytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Redirect if not authenticated
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated && user) {
            // Get default date range (last 7 days)
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 7);

            setDateRange({
                start: formatDate(start),
                end: formatDate(end)
            });

            fetchAnalytics(formatDate(start), formatDate(end));
        }
    }, [user, isAuthenticated]);

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const fetchAnalytics = async (startDate: string, endDate: string) => {
        try {
            setIsLoading(true);
            const response = await fetch(
                `/api/dashboard/analytics/orders?startDate=${startDate}&endDate=${endDate}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch analytics data');
            }

            const data = await response.json();
            setAnalytics(data);
        } catch (err: any) {
            console.error('Error fetching analytics:', err);
            setError(err.message || 'An error occurred while fetching analytics');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFilter = () => {
        fetchAnalytics(dateRange.start, dateRange.end);
    };

    const handleExportCSV = () => {
        if (!analytics) return;

        // Prepare data for CSV export
        let csvContent = "data:text/csv;charset=utf-8,";

        // Daily sales
        csvContent += "Daily Sales\n";
        csvContent += "Date,Total Sales,Order Count\n";
        analytics.dailySales.forEach(day => {
            csvContent += `${day.date},${day.total},${day.orderCount}\n`;
        });

        csvContent += "\nPopular Items\n";
        csvContent += "Item Name,Quantity Sold,Revenue\n";
        analytics.popularItems.forEach(item => {
            csvContent += `${item.name},${item.quantity},${item.revenue}\n`;
        });

        csvContent += "\nOrder Status\n";
        csvContent += "Status,Count\n";
        analytics.orderStatsByStatus.forEach(status => {
            csvContent += `${status.status},${status.count}\n`;
        });

        // Create a download link and trigger click
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `order_analytics_${dateRange.start}_to_${dateRange.end}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading || isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-xl font-bold text-red-600 mb-2">Error</h3>
                <p className="text-red-700">{error}</p>
                <button
                    onClick={() => fetchAnalytics(dateRange.start, dateRange.end)}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <FeatureGuard
            requiredFeature="analytics"
            fallback={
                <div className="bg-white shadow rounded-lg p-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Analytics</h2>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 max-w-2xl mx-auto">
                        <h3 className="text-lg font-medium text-indigo-800">Premium Feature</h3>
                        <p className="text-indigo-700 mt-2">
                            Advanced analytics are available in our Standard and higher plans.
                            Upgrade your subscription to access detailed order analytics.
                        </p>
                        <a
                            href="/pricing"
                            className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                        >
                            View Plans
                        </a>
                    </div>
                </div>
            }
        >
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900">Order Analytics</h1>
                    <div className="flex space-x-2">
                        <Link href="/dashboard/orders" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700">
                            Back to Orders
                        </Link>
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                        >
                            <Download size={18} className="mr-2" />
                            Export CSV
                        </button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                    <div className="flex flex-wrap items-end gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="start"
                                    value={dateRange.start}
                                    onChange={handleDateChange}
                                    className="pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                                <CalendarIcon size={18} className="absolute left-3 top-2.5 text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="end"
                                    value={dateRange.end}
                                    onChange={handleDateChange}
                                    className="pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                                <CalendarIcon size={18} className="absolute left-3 top-2.5 text-gray-400" />
                            </div>
                        </div>
                        <button
                            onClick={handleFilter}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <FilterIcon size={18} className="mr-2" />
                            Apply Filter
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                            <RefreshCw size={18} className="mr-2" />
                            Refresh
                        </button>
                    </div>
                </div>

                {analytics && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-lg font-medium text-gray-700 mb-2">Total Revenue</h3>
                            <p className="text-3xl font-bold">${analytics.totalRevenue.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-lg font-medium text-gray-700 mb-2">Total Orders</h3>
                            <p className="text-3xl font-bold">{analytics.totalOrders}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-lg font-medium text-gray-700 mb-2">Average Order Value</h3>
                            <p className="text-3xl font-bold">${analytics.averageOrderValue.toFixed(2)}</p>
                        </div>
                    </div>
                )}

                {analytics && (
                    <>
                        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                            <h3 className="text-xl font-medium text-gray-700 mb-4">Daily Sales</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={analytics.dailySales}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            yAxisId="left"
                                            type="monotone"
                                            dataKey="total"
                                            name="Sales ($)"
                                            stroke="#8884d8"
                                            activeDot={{ r: 8 }}
                                        />
                                        <Line yAxisId="right" type="monotone" dataKey="orderCount" name="Orders" stroke="#82ca9d" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-xl font-medium text-gray-700 mb-4">Popular Items</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={analytics.popularItems.slice(0, 5)}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="quantity" name="Quantity Sold" fill="#8884d8" />
                                            <Bar dataKey="revenue" name="Revenue ($)" fill="#82ca9d" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="text-xl font-medium text-gray-700 mb-4">Order Status</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={analytics.orderStatsByStatus}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="count"
                                                nameKey="status"
                                            >
                                                {analytics.orderStatsByStatus.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value, name, props) => [`${value} orders`, props.payload.status]} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </FeatureGuard>
    );
} 