'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/providers/StackAdminAuth';

interface DashboardCardProps {
    title: string;
    description: string;
    linkText: string;
    linkHref: string;
}

export default function StaffDashboard() {
    const router = useRouter();
    const { user, loading, logout, isAuthenticated } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        // Redirect to login if not authenticated and not loading
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

    const handleLogout = async () => {
        setIsLoggingOut(true);

        try {
            await logout();
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-xl">Loading...</p>
            </div>
        );
    }

    // If not authenticated, show nothing (will be redirected by useEffect)
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-gray-900">Business Management System</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-700">
                            Welcome, <span className="font-medium">{user?.name}</span> ({user?.role})
                        </span>
                        <button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-75"
                        >
                            {isLoggingOut ? 'Logging out...' : 'Logout'}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Dashboard</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <DashboardCard
                            title="Orders"
                            description="Manage customer orders"
                            linkText="View Orders"
                            linkHref="/staff/orders"
                        />
                        <DashboardCard
                            title="Menu"
                            description="Update menu items and categories"
                            linkText="Manage Menu"
                            linkHref="/staff/menu"
                        />
                        <DashboardCard
                            title="Tables"
                            description="Manage business tables and reservations"
                            linkText="Manage Tables"
                            linkHref="/staff/tables"
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

function DashboardCard({ title, description, linkText, linkHref }: DashboardCardProps) {
    return (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-4">{description}</p>
            <Link
                href={linkHref}
                className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
            >
                {linkText}
                <svg className="ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                        fillRule="evenodd"
                        d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                    />
                </svg>
            </Link>
        </div>
    );
}