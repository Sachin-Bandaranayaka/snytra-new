"use client";

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/StackAdminAuth';
import Image from 'next/image';
import {
    LayoutDashboard,
    Package,
    FileText,
    TicketIcon,
    HelpCircle,
    Bell,
    Users,
    Star,
    User,
    FileIcon,
    Mail,
    Settings,
    LogOut,
    Menu,
    X,
    Image as ImageIcon
} from 'lucide-react';

// Navigation items for admin with Lucide icons
const adminNavItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Packages', path: '/admin/packages', icon: <Package size={18} /> },
    { name: 'Blog', path: '/admin/blog', icon: <FileText size={18} /> },
    { name: 'Support Tickets', path: '/admin/support-tickets', icon: <TicketIcon size={18} /> },
    { name: 'Demo Requests', path: '/admin/demo-requests', icon: <HelpCircle size={18} /> },
    { name: 'FAQs', path: '/admin/faqs', icon: <HelpCircle size={18} /> },
    { name: 'Notices', path: '/admin/notices', icon: <Bell size={18} /> },
    { name: 'Jobs', path: '/admin/jobs', icon: <Users size={18} /> },
    { name: 'Reviews', path: '/admin/reviews', icon: <Star size={18} /> },
    { name: 'Users', path: '/admin/users', icon: <User size={18} /> },
    { name: 'Pages', path: '/admin/pages', icon: <FileIcon size={18} /> },
    { name: 'Contact Submissions', path: '/admin/contact-submissions', icon: <Mail size={18} /> },
    { name: 'Slideshow', path: '/admin/slideshow', icon: <ImageIcon size={18} /> },
    { name: 'Dashboard Slides', path: '/admin/dashboard-slides', icon: <ImageIcon size={18} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={18} /> },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { user, isAuthenticated, loading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // If it's the login page, don't check auth
    const isLoginPage = pathname === '/admin/login';

    useEffect(() => {
        if (!loading && !isAuthenticated && !isLoginPage) {
            router.push('/admin/login');
        }
    }, [loading, isAuthenticated, router, isLoginPage]);

    // If we're on the login page or still checking auth, just render children
    if (isLoginPage || loading) {
        return children;
    }

    // If not authenticated and not on the login page, don't render anything
    // (redirection happens in the useEffect)
    if (!isAuthenticated && !isLoginPage) {
        return null;
    }

    const handleLogout = async () => {
        await logout();
        router.push('/admin/login');
    };

    return (
        <div className="flex min-h-screen bg-dashboard-bg">
            {/* Mobile sidebar toggle button */}
            <button
                className="fixed z-50 top-4 left-4 md:hidden bg-primary-orange text-white p-2 rounded-md"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 z-40 
                               ${isSidebarOpen ? 'w-64' : 'w-0 -translate-x-full md:translate-x-0 md:w-20'} 
                               md:relative md:block`}>
                <div className="p-5 border-b border-gray-100">
                    <div className="flex justify-center items-center">
                        <div
                            className={`font-bold text-xl text-primary-orange ${isSidebarOpen ? 'block' : 'hidden md:hidden'}`}
                        >
                            SnytraAdmin
                        </div>
                        <div className={`text-primary-orange font-bold text-2xl ${!isSidebarOpen ? 'block md:block' : 'hidden'}`}>
                            S
                        </div>
                    </div>
                </div>

                <div className={`p-5 border-b border-gray-100 ${isSidebarOpen ? 'block' : 'hidden md:block'}`}>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary-orange text-white flex items-center justify-center text-lg font-semibold">
                            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div className={`${isSidebarOpen ? 'block' : 'hidden'}`}>
                            <div className="font-medium text-charcoal truncate">{user?.name || 'Admin User'}</div>
                            <div className="text-xs text-darkGray truncate">{user?.role || 'Administrator'}</div>
                        </div>
                    </div>
                </div>

                <nav className="p-4">
                    <ul className="space-y-1">
                        {adminNavItems.map((item) => {
                            const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');

                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.path}
                                        className={`flex items-center py-3 px-4 rounded-lg transition-all duration-200
                                                ${isActive
                                                ? 'bg-primary-orange text-white shadow-sm'
                                                : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        <span className={`mr-3 ${isActive ? 'text-white' : 'text-gray-500'}`}>{item.icon}</span>
                                        <span className={`${isSidebarOpen ? 'block' : 'hidden'} font-medium`}>{item.name}</span>
                                    </Link>
                                </li>
                            );
                        })}

                        <li className="pt-2 mt-2 border-t border-gray-100">
                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center py-3 px-4 rounded-lg transition-all duration-200 text-gray-700 hover:bg-gray-50"
                            >
                                <span className="mr-3 text-gray-500"><LogOut size={18} /></span>
                                <span className={`${isSidebarOpen ? 'block' : 'hidden'} font-medium`}>Logout</span>
                            </button>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* Main content */}
            <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-0' : 'ml-0'}`}>
                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
} 