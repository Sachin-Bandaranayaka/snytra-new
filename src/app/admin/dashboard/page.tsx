"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/StackAdminAuth';

// Statistical data for the dashboard
interface DashboardStats {
    newUsers: number;
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
                pendingTickets: contactData.count || 0,
                recentActivities: activitiesData.activities || []
            });
        } catch (error) {
            console.error('Error fetching stats:', error);

            // Fallback to default data if API fails
            setStats({
                newUsers: 0,
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
                    {[1, 2].map((i) => (
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
                        <span className="inline-block text-2xl mb-2 w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">✍️</span>
                        <h3 className="font-medium text-charcoal">Create Blog Post</h3>
                    </Link>

                    <Link
                        href="/admin/users"
                        className="bg-white hover:bg-beige p-5 rounded-lg shadow-md text-center transition duration-200"
                    >
                        <span className="inline-block text-2xl mb-2 w-12 h-12 rounded-full bg-olive/10 text-olive flex items-center justify-center">👥</span>
                        <h3 className="font-medium text-charcoal">Manage Users</h3>
                    </Link>

                    <Link
                        href="/admin/system-settings"
                        className="bg-white hover:bg-beige p-5 rounded-lg shadow-md text-center transition duration-200"
                    >
                        <span className="inline-block text-2xl mb-2 w-12 h-12 rounded-full bg-charcoal/10 text-charcoal flex items-center justify-center">⚙️</span>
                        <h3 className="font-medium text-charcoal">System Settings</h3>
                    </Link>
                </div>
            </div>

            {/* Recent Activities */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold text-charcoal mb-4">Recent Activities</h2>
                {loading ? (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                        <table className="min-w-full">
                            <thead className="bg-beige">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-darkGray">Activity</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-darkGray">User</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-darkGray">Time</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-darkGray">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2, 3].map((i) => (
                                    <tr key={i} className="border-b">
                                        <td className="px-6 py-4"><div className="h-4 bg-beige rounded w-3/4"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-beige rounded w-1/2"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-beige rounded w-1/4"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-beige rounded w-1/3"></div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : stats.recentActivities.length > 0 ? (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="min-w-full">
                            <thead className="bg-beige">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-darkGray">Activity</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-darkGray">User</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-darkGray">Time</th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-darkGray">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentActivities.map((activity) => (
                                    <tr key={activity.id} className="border-b hover:bg-beige/50">
                                        <td className="px-6 py-4 text-charcoal">{activity.activity}</td>
                                        <td className="px-6 py-4 text-charcoal">{activity.user}</td>
                                        <td className="px-6 py-4 text-darkGray">{activity.time}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                activity.status === 'completed' ? 'bg-olive/10 text-olive' :
                                                activity.status === 'pending' ? 'bg-skyBlue/10 text-skyBlue' :
                                                'bg-primary/10 text-primary'
                                            }`}>
                                                {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md p-6 text-center">
                        <p className="text-darkGray mb-4">No recent activities found. Would you like to set up the activity logs table?</p>
                        <button
                            onClick={setupActivityLogs}
                            disabled={setupStatus === 'loading'}
                            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition duration-200 disabled:opacity-50"
                        >
                            {setupStatus === 'loading' ? 'Setting up...' : 'Set Up Activity Logs'}
                        </button>
                        {setupStatus === 'success' && <p className="mt-4 text-olive">Activity logs table created successfully!</p>}
                        {setupStatus === 'error' && <p className="mt-4 text-primary">Error creating activity logs table. Please try again.</p>}
                    </div>
                )}
            </div>
        </>
    );
}