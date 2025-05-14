"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/StackAdminAuth';

// Statistical data for the dashboard
interface DashboardStats {
    newUsers: number;
    totalRevenue: number;
    pendingTickets: number;
    recentActivities: Array<{
        id: number;
        activity: string;
        user: string;
        time: string;
        status: 'completed' | 'pending' | 'failed';
    }>;
}

export default function AdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        newUsers: 0,
        totalRevenue: 0,
        pendingTickets: 0,
        recentActivities: []
    });

    const [loading, setLoading] = useState(true);
    const [setupStatus, setSetupStatus] = useState<string | null>(null);

    // Fetch dashboard stats from the database
    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);

            // Fetch users count (registered in the last 30 days)
            const usersResponse = await fetch('/api/admin/stats/users', {
                credentials: 'include'
            });
            const usersData = await usersResponse.json();

            // Fetch orders revenue
            const revenueResponse = await fetch('/api/admin/stats/revenue', {
                credentials: 'include'
            });
            const revenueData = await revenueResponse.json();

            // Fetch open contact form submissions
            const contactResponse = await fetch('/api/admin/stats/contacts', {
                credentials: 'include'
            });
            const contactData = await contactResponse.json();

            // Fetch recent activities
            const activitiesResponse = await fetch('/api/admin/stats/activities', {
                credentials: 'include'
            });
            const activitiesData = await activitiesResponse.json();

            // Combine all stats
            setStats({
                newUsers: usersData.count || 0,
                totalRevenue: revenueData.total || 0,
                pendingTickets: contactData.count || 0,
                recentActivities: activitiesData.activities || []
            });
        } catch (error) {
            console.error('Error fetching stats:', error);

            // Fallback to default data if API fails
            setStats({
                newUsers: 0,
                totalRevenue: 0,
                pendingTickets: 0,
                recentActivities: []
            });
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial data load
    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Function to set up the activity logs table
    const setupActivityLogs = async () => {
        try {
            setSetupStatus('loading');
            const response = await fetch('/api/admin/migrations/create-activity-logs', {
                method: 'POST',
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                setSetupStatus('success');
                // Refresh stats to show the activities
                fetchStats();
            } else {
                setSetupStatus('error');
                console.error('Error setting up activity logs:', data.error);
            }

            // Clear status after 3 seconds
            setTimeout(() => {
                setSetupStatus(null);
            }, 3000);
        } catch (error) {
            setSetupStatus('error');
            console.error('Error setting up activity logs:', error);

            // Clear status after 3 seconds
            setTimeout(() => {
                setSetupStatus(null);
            }, 3000);
        }
    };

    return (
        <>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
                <p className="text-darkGray mt-2">Welcome back, {user?.name || 'Admin'}!</p>
            </div>

            {/* Stats Cards */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
                            <div className="h-4 bg-beige rounded w-1/3 mb-2"></div>
                            <div className="h-8 bg-beige rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-skyBlue">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-darkGray font-medium">New Users</h3>
                            <span className="text-white bg-skyBlue p-2 rounded-full w-10 h-10 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9 6a3 3 0 100 6 3 3 0 000-6zM11 12a5 5 0 00-10 0v1.1A2.9 2.9 0 003 16h6a2.9 2.9 0 002-2.9V12z" />
                                    <path d="M17 6a3 3 0 012 2.9V12a5 5 0 01-10 0v-1.1A2.9 2.9 0 0111 8h6z" />
                                </svg>
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-charcoal">{stats.newUsers}</p>
                        <p className="text-darkGray text-sm mt-1">Last 30 days</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-darkGray font-medium">Total Revenue</h3>
                            <span className="text-white bg-primary p-2 rounded-full w-10 h-10 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698c-.236-.087-.414-.178-.567-.267-.226-.133-.393-.292-.418-.492.025-.2.192-.36.418-.492z" />
                                    <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM5.616 8.124c.112.645.632 1.047 1.312 1.299.434.148.864.24 1.339.273v.727c0 .418-.18.623-.533.623-.28 0-.529-.134-.782-.386l-.915.701c.306.385.762.645 1.338.775.161.037.335.065.523.083v.97h1.101v-.96c.978-.138 1.686-.572 1.686-1.431 0-.858-.686-1.334-1.69-1.629-.214-.066-.438-.14-.669-.226-.413-.158-.707-.312-.707-.614 0-.286.269-.491.679-.491.385 0 .66.154.839.385l.87-.689c-.328-.385-.749-.693-1.481-.8V5.5h-1.101v.8c-.947.19-1.436.623-1.436 1.335 0 .856.583 1.275 1.437 1.489zm4.103 1.434c0 .395-.223.748-.65.748-.428 0-.651-.353-.651-.747s.223-.689.65-.689c.428 0 .651.294.651.689z" clipRule="evenodd" />
                                </svg>
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-charcoal">${stats.totalRevenue.toLocaleString()}</p>
                        <p className="text-darkGray text-sm mt-1">This month</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-olive">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-darkGray font-medium">Support Tickets</h3>
                            <span className="text-white bg-olive p-2 rounded-full w-10 h-10 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                </svg>
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-charcoal">{stats.pendingTickets}</p>
                        <p className="text-darkGray text-sm mt-1">Pending resolution</p>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold text-charcoal mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Link
                        href="/admin/support-tickets"
                        className="bg-white hover:bg-beige p-5 rounded-lg shadow-md text-center transition duration-200"
                    >
                        <span className="inline-block text-2xl mb-2 w-12 h-12 rounded-full bg-skyBlue/10 text-skyBlue flex items-center justify-center">🎫</span>
                        <h3 className="font-medium text-charcoal">Manage Support Tickets</h3>
                    </Link>

                    <Link
                        href="/admin/blog/new"
                        className="bg-white hover:bg-beige p-5 rounded-lg shadow-md text-center transition duration-200"
                    >
                        <span className="inline-block text-2xl mb-2 w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">📝</span>
                        <h3 className="font-medium text-charcoal">Write New Blog Post</h3>
                    </Link>

                    <Link
                        href="/admin/notices/new"
                        className="bg-white hover:bg-beige p-5 rounded-lg shadow-md text-center transition duration-200"
                    >
                        <span className="inline-block text-2xl mb-2 w-12 h-12 rounded-full bg-yellow/10 text-yellow flex items-center justify-center">📢</span>
                        <h3 className="font-medium text-charcoal">Create New Notice</h3>
                    </Link>

                    <Link
                        href="/admin/jobs"
                        className="bg-white hover:bg-beige p-5 rounded-lg shadow-md text-center transition duration-200"
                    >
                        <span className="inline-block text-2xl mb-2 w-12 h-12 rounded-full bg-olive/10 text-olive flex items-center justify-center">👥</span>
                        <h3 className="font-medium text-charcoal">Manage Job Listings</h3>
                    </Link>
                </div>
            </div>

            {/* Recent Activities */}
            <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-charcoal">Recent Activities</h2>

                    {stats.recentActivities && stats.recentActivities.length === 0 && (
                        <button
                            onClick={setupActivityLogs}
                            disabled={setupStatus === 'loading'}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                ${setupStatus === 'loading' ? 'bg-gray-300 text-gray-600 cursor-not-allowed' :
                                    setupStatus === 'success' ? 'bg-green-500 text-white' :
                                        setupStatus === 'error' ? 'bg-red-500 text-white' :
                                            'bg-primary text-white hover:bg-primary/90'}`}
                        >
                            {setupStatus === 'loading' ? 'Setting up...' :
                                setupStatus === 'success' ? 'Setup Complete!' :
                                    setupStatus === 'error' ? 'Setup Failed' :
                                        'Setup Activity Logs'}
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-beige">
                            <thead className="bg-beige">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-darkGray uppercase tracking-wider">
                                        Activity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-darkGray uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-darkGray uppercase tracking-wider">
                                        Time
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-darkGray uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-beige">
                                {stats.recentActivities && stats.recentActivities.length > 0 ? (
                                    stats.recentActivities.map((activity) => (
                                        <tr key={activity.id} className="hover:bg-beige/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-charcoal">{activity.activity}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-charcoal">{activity.user}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-darkGray">
                                                {activity.time}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                        activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'}`}>
                                                    {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                            No recent activities found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
} 