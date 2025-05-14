"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Utensils,
    ClipboardList,
    Settings,
    Users,
    Table2,
    LogOut,
    ShoppingCart,
    Package,
    Clock,
    Menu as MenuIcon,
    X,
    CircleUserRound,
    LayoutGrid,
    Box,
    Briefcase,
    Bell,
    AlarmClock
} from 'lucide-react';

interface SidebarProps {
    onLogout: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);

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

    const handleMobileMenuToggle = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const navItems = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: <LayoutDashboard size={20} />,
        },
        {
            name: 'Menu',
            href: '/dashboard/menu',
            icon: <LayoutGrid size={20} />,
        },
        {
            name: 'Orders',
            href: '/dashboard/orders',
            icon: <ClipboardList size={20} />,
        },
        {
            name: 'Waitlist',
            href: '/dashboard/waitlist',
            icon: <AlarmClock size={20} />,
        },
        {
            name: 'Tables',
            href: '/dashboard/tables',
            icon: <Table2 size={20} />,
        },
        {
            name: 'Inventory',
            href: '/dashboard/inventory',
            icon: <Box size={20} />,
        },
        {
            name: 'Staff',
            href: '/dashboard/staff',
            icon: <Users size={20} />,
        },
    ];

    const bottomNavItems = [
        {
            name: 'Notifications',
            href: '/dashboard/notifications',
            icon: <Bell size={20} />,
        },
        {
            name: 'Settings',
            href: '/dashboard/settings',
            icon: <Settings size={20} />,
        },
    ];

    const isActive = (path: string) => {
        if (path === '/dashboard') {
            return pathname === '/dashboard';
        }
        return pathname?.startsWith(path);
    };

    return (
        <>
            {/* Mobile menu button */}
            <div className="fixed top-0 left-0 z-40 w-full bg-white border-b border-gray-200 lg:hidden">
                <div className="px-4 py-3 flex justify-between items-center">
                    <div className="font-semibold text-lg text-primary-orange">Snytra</div>
                    <button
                        onClick={handleMobileMenuToggle}
                        className="text-gray-600 hover:text-primary-orange focus:outline-none focus:ring-2 focus:ring-primary-orange focus:ring-offset-2 rounded-md p-1"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
                    </button>
                </div>
            </div>

            {/* Sidebar - desktop version - visible on larger screens */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-16 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white lg:pt-5 lg:pb-4 sidebar-desktop">
                <div className="flex flex-col h-full justify-between">
                    {/* Logo at top */}
                    <div>
                        <div className="flex items-center justify-center h-16">
                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="white" />
                                </svg>
                            </div>
                        </div>

                        {/* Main navigation icons */}
                        <div className="mt-6 flex flex-col items-center space-y-3">
                            {navItems.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center justify-center w-10 h-10 rounded-md transition-colors duration-200 ${active
                                            ? 'text-orange-500 bg-orange-50'
                                            : 'text-gray-500 hover:text-orange-500 hover:bg-gray-50'
                                            }`}
                                        title={item.name}
                                    >
                                        {item.icon}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bottom icons (settings, etc) */}
                    <div className="flex flex-col items-center space-y-3">
                        {bottomNavItems.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center justify-center w-10 h-10 rounded-md transition-colors duration-200 ${active
                                        ? 'text-orange-500 bg-orange-50'
                                        : 'text-gray-500 hover:text-orange-500 hover:bg-gray-50'
                                        }`}
                                    title={item.name}
                                >
                                    {item.icon}
                                </Link>
                            );
                        })}
                        <button
                            onClick={onLogout}
                            className="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-red-500 hover:bg-gray-50 rounded-md transition-colors duration-200"
                            title="Log Out"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebar - mobile version (slide-over) */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 flex lg:hidden">
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
                    <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition-transform">
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            >
                                <span className="sr-only">Close sidebar</span>
                                <X size={24} className="text-white" />
                            </button>
                        </div>
                        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                            <div className="flex-shrink-0 flex items-center px-4">
                                <div className="font-bold text-xl text-primary-orange">Snytra</div>
                            </div>
                            <nav className="mt-8 px-4 space-y-2">
                                {navItems.map((item) => {
                                    const active = isActive(item.href);
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${active
                                                ? 'bg-primary-orange text-white'
                                                : 'text-gray-700 hover:bg-orange-50 hover:text-primary-orange'
                                                }`}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <div className={`mr-4 ${active ? 'text-white' : 'text-gray-500'}`}>
                                                {item.icon}
                                            </div>
                                            {item.name}
                                        </Link>
                                    );
                                })}
                                {bottomNavItems.map((item) => {
                                    const active = isActive(item.href);
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${active
                                                ? 'bg-primary-orange text-white'
                                                : 'text-gray-700 hover:bg-orange-50 hover:text-primary-orange'
                                                }`}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <div className={`mr-4 ${active ? 'text-white' : 'text-gray-500'}`}>
                                                {item.icon}
                                            </div>
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
} 