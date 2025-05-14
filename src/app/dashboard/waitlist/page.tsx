"use client";

import { useState, useEffect } from 'react';
import {
    Clock,
    Search,
    Users,
    Check,
    X,
    Bell,
    RefreshCw,
    Calendar,
    Phone,
    Mail,
    AlertCircle,
    ChevronDown,
    Info,
    ListFilter,
    CalendarRange
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface WaitlistEntry {
    id: number;
    customerName: string;
    customerEmail: string | null;
    customerPhone: string;
    partySize: number;
    date: string;
    time: string;
    specialRequests: string | null;
    status: 'waiting' | 'seated' | 'canceled' | 'no-show';
    estimatedWaitTime: number;
    notified: boolean;
    createdAt: string;
}

export default function WaitlistPage() {
    const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('waiting');
    const [dateFilter, setDateFilter] = useState<string>(new Date().toISOString().split('T')[0]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [actionInProgress, setActionInProgress] = useState<number | null>(null);
    const [expandedEntry, setExpandedEntry] = useState<number | null>(null);
    const [notificationStatus, setNotificationStatus] = useState<{ id: number, status: 'success' | 'error', message: string } | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Fetch waitlist data
    useEffect(() => {
        const fetchWaitlist = async () => {
            setLoading(true);
            setError(null);
            try {
                const queryParams = new URLSearchParams();
                if (dateFilter) queryParams.append('date', dateFilter);
                if (statusFilter) queryParams.append('status', statusFilter);
                if (searchTerm) queryParams.append('search', searchTerm);

                const response = await fetch(`/api/waitlist?${queryParams.toString()}`, {
                    credentials: 'include',
                    headers: {
                        'Cache-Control': 'no-cache'
                    }
                });

                if (response.status === 401) {
                    // Auth error - handle gracefully
                    console.warn('Authentication issue with waitlist API. Showing empty waitlist.');
                    setWaitlist([]);
                    return;
                }

                if (!response.ok) {
                    throw new Error('Failed to fetch waitlist');
                }

                const data = await response.json();
                setWaitlist(data.waitlist || []);
            } catch (error) {
                console.error('Error fetching waitlist:', error);
                setError('Failed to load waitlist data');
                // Don't break the UI - show empty state
                setWaitlist([]);
            } finally {
                setLoading(false);
            }
        };

        fetchWaitlist();
    }, [dateFilter, statusFilter, searchTerm, refreshKey]);

    // Handle marking customer as seated
    const handleSeatCustomer = async (id: number) => {
        if (!confirm('Are you sure you want to mark this customer as seated?')) return;

        setActionInProgress(id);
        try {
            const response = await fetch('/api/waitlist', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: 'seated' }),
                credentials: 'include'
            });

            if (response.status === 401) {
                // Auth error - handle gracefully
                setError('Authentication required. Please try again after refreshing the page.');
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to update waitlist');
            }

            // Refresh the waitlist
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            setError('Failed to update status');
            console.error(error);
        } finally {
            setActionInProgress(null);
        }
    };

    // Handle removing customer from waitlist
    const handleRemoveCustomer = async (id: number, reason: 'canceled' | 'no-show') => {
        if (!confirm(`Are you sure you want to mark this customer as ${reason}?`)) return;

        setActionInProgress(id);
        try {
            const response = await fetch('/api/waitlist', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: reason }),
                credentials: 'include'
            });

            if (response.status === 401) {
                // Auth error - handle gracefully
                setError('Authentication required. Please try again after refreshing the page.');
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to update waitlist');
            }

            // Refresh the waitlist
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            setError('Failed to update status');
            console.error(error);
        } finally {
            setActionInProgress(null);
        }
    };

    // Handle sending notification to customer
    const handleNotifyCustomer = async (id: number, customerName: string) => {
        if (!confirm(`Are you sure you want to notify ${customerName} that their table is ready?`)) return;

        setActionInProgress(id);
        setNotificationStatus(null);

        try {
            const response = await fetch(`/api/waitlist/${id}/notify`, {
                method: 'POST',
                credentials: 'include'
            });

            if (response.status === 401) {
                // Auth error - handle gracefully
                setNotificationStatus({
                    id,
                    status: 'error',
                    message: 'Authentication required. Please try again after refreshing the page.'
                });
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to notify customer');
            }

            // Show success message
            setNotificationStatus({
                id,
                status: 'success',
                message: `${customerName} has been notified that their table is ready`
            });

            // Refresh the waitlist
            setRefreshKey(prev => prev + 1);
        } catch (error: any) {
            // Show error message
            setNotificationStatus({
                id,
                status: 'error',
                message: error.message || 'Failed to send notification'
            });
            console.error(error);
        } finally {
            setActionInProgress(null);
        }
    };

    // Toggle expanded view for an entry
    const toggleExpand = (id: number) => {
        setExpandedEntry(expandedEntry === id ? null : id);
    };

    // Render notification status message
    const renderNotificationStatus = (id: number) => {
        if (notificationStatus && notificationStatus.id === id) {
            const isSuccess = notificationStatus.status === 'success';
            return (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-2 p-3 rounded-md text-sm ${isSuccess ? 'bg-olive/10 text-olive' : 'bg-red-50 text-red-700'}`}
                >
                    <p className="flex items-center">
                        {isSuccess ? (
                            <Check className="h-4 w-4 mr-2" />
                        ) : (
                            <AlertCircle className="h-4 w-4 mr-2" />
                        )}
                        {notificationStatus.message}
                    </p>
                </motion.div>
            );
        }
        return null;
    };

    // Filter summary
    const getFilterSummary = () => {
        const filters = [];
        if (statusFilter) filters.push(`Status: ${statusFilter}`);
        if (searchTerm) filters.push(`Search: ${searchTerm}`);
        return filters.length > 0 ? filters.join(' • ') : 'No filters applied';
    };

    // Get status badge color based on wait time
    const getWaitTimeBadgeColor = (time: number) => {
        if (time <= 15) return 'bg-olive/20 text-olive';
        if (time <= 30) return 'bg-yellow/20 text-yellow-700';
        return 'bg-primary/20 text-primary';
    };

    return (
        <div className="container p-6 mx-auto bg-dashboard-bg min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
            >
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-charcoal">Waitlist Management</h1>
                        <p className="text-darkGray mt-1">
                            Manage customers waiting for tables
                        </p>
                    </div>
                    <div className="flex mt-4 md:mt-0 space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="transition-all duration-200"
                        >
                            <ListFilter className={`h-4 w-4 mr-1 ${showFilters ? 'text-primary' : 'text-darkGray'}`} />
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </Button>
                        <Link
                            href="/dashboard/reservations"
                            className="inline-flex items-center px-4 py-2 border border-lightGray rounded-md shadow-sm text-sm font-medium text-charcoal bg-white hover:bg-beige transition-colors duration-200"
                        >
                            <CalendarRange className="h-4 w-4 mr-1" />
                            Reservations
                        </Link>
                        <Button
                            variant="default"
                            onClick={() => setRefreshKey(prev => prev + 1)}
                            className="transition-all duration-300 hover:shadow-md"
                        >
                            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </header>

                {/* Active filters summary */}
                <div className="text-sm text-darkGray italic mb-2 flex items-center">
                    <span className="mr-2 font-medium">Active filters:</span>
                    <span>{getFilterSummary()}</span>
                </div>

                {/* Filter and search */}
                <motion.div
                    initial={{ height: showFilters ? 'auto' : 0, opacity: showFilters ? 1 : 0 }}
                    animate={{ height: showFilters ? 'auto' : 0, opacity: showFilters ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`overflow-hidden transition-all duration-300 ${showFilters ? 'mb-6' : 'mb-0'}`}
                >
                    <div className="bg-white rounded-lg shadow-sm p-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div>
                            <label htmlFor="date-filter" className="block text-sm font-medium text-darkGray mb-1">
                                Date
                            </label>
                            <input
                                type="date"
                                id="date-filter"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-lightGray rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary transition duration-200"
                            />
                        </div>
                        <div>
                            <label htmlFor="status-filter" className="block text-sm font-medium text-darkGray mb-1">
                                Status
                            </label>
                            <select
                                id="status-filter"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-lightGray rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary transition duration-200"
                            >
                                <option value="waiting">Waiting</option>
                                <option value="seated">Seated</option>
                                <option value="canceled">Canceled</option>
                                <option value="no-show">No-show</option>
                                <option value="">All</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="search" className="block text-sm font-medium text-darkGray mb-1">
                                Search
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="search"
                                    placeholder="Search by name or phone..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 pl-10 border border-lightGray rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary transition duration-200"
                                />
                                <Search className="h-5 w-5 text-darkGray absolute left-3 top-1/2 transform -translate-y-1/2" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Error state */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-md shadow-sm"
                >
                    <div className="flex">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Loading state */}
            {loading ? (
                <div className="flex flex-col justify-center items-center py-16 rounded-lg bg-white shadow-sm">
                    <RefreshCw className="h-10 w-10 text-primary animate-spin mb-3" />
                    <span className="text-darkGray">Loading waitlist...</span>
                </div>
            ) : (
                <>
                    {/* Waitlist table */}
                    {waitlist.length > 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white shadow-sm rounded-lg overflow-hidden"
                        >
                            <div className="min-w-full divide-y divide-lightGray">
                                <div className="bg-beige sticky top-0 z-10">
                                    <div className="grid grid-cols-12 gap-3 px-6 py-3 text-left text-xs font-medium text-darkGray uppercase tracking-wider">
                                        <div className="col-span-3">Customer</div>
                                        <div className="col-span-2">Requested Time</div>
                                        <div className="col-span-1 text-center">Party Size</div>
                                        <div className="col-span-2">Wait Time</div>
                                        <div className="col-span-1 text-center">Notified</div>
                                        <div className="col-span-3 text-right">Actions</div>
                                    </div>
                                </div>
                                <div className="bg-white divide-y divide-lightGray">
                                    {waitlist.map((entry) => (
                                        <motion.div
                                            key={entry.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                            whileHover={{ backgroundColor: "rgba(245, 240, 230, 0.5)" }}
                                            className="hover:bg-beige transition-colors duration-200"
                                        >
                                            <div className="grid grid-cols-12 gap-3 px-6 py-4">
                                                {/* Customer info */}
                                                <div className="col-span-3">
                                                    <div className="flex items-center">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium text-charcoal flex items-center truncate">
                                                                <span className="truncate">{entry.customerName}</span>
                                                                <button
                                                                    onClick={() => toggleExpand(entry.id)}
                                                                    className="ml-2 flex-shrink-0 text-darkGray hover:text-primary transition-colors duration-200"
                                                                >
                                                                    <ChevronDown className={`h-4 w-4 transform transition-transform duration-200 ${expandedEntry === entry.id ? 'rotate-180' : ''}`} />
                                                                </button>
                                                            </div>
                                                            <div className="text-sm text-darkGray flex items-center truncate">
                                                                <Phone className="h-3 w-3 mr-1 flex-shrink-0" />
                                                                <span className="truncate">{entry.customerPhone}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Time info */}
                                                <div className="col-span-2">
                                                    <div className="text-sm text-charcoal flex items-center">
                                                        <Clock className="h-4 w-4 mr-1 text-darkGray flex-shrink-0" />
                                                        {entry.time}
                                                    </div>
                                                    <div className="text-xs text-darkGray flex items-center mt-1">
                                                        <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                                                        {format(new Date(entry.date), 'MMM d, yyyy')}
                                                    </div>
                                                </div>

                                                {/* Party size */}
                                                <div className="col-span-1 text-center">
                                                    <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-olive text-white shadow-sm">
                                                        <Users className="h-3 w-3 mr-1" />
                                                        {entry.partySize}
                                                    </div>
                                                </div>

                                                {/* Wait time */}
                                                <div className="col-span-2">
                                                    <div className={`text-sm inline-flex items-center px-2 py-0.5 rounded-md ${getWaitTimeBadgeColor(entry.estimatedWaitTime)}`}>
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {entry.estimatedWaitTime} min est.
                                                    </div>
                                                    <div className="text-xs text-darkGray mt-1">
                                                        Added {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                                                    </div>
                                                </div>

                                                {/* Notified status */}
                                                <div className="col-span-1 text-center">
                                                    {entry.notified ? (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-olive/20 text-olive shadow-sm">
                                                            <Check className="h-3 w-3 mr-1" />
                                                            Yes
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-lightGray text-darkGray shadow-sm">
                                                            <X className="h-3 w-3 mr-1" />
                                                            No
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="col-span-3 text-right space-x-2">
                                                    <Button
                                                        variant="accent"
                                                        size="sm"
                                                        onClick={() => handleNotifyCustomer(entry.id, entry.customerName)}
                                                        disabled={actionInProgress === entry.id || entry.notified}
                                                        className={`transition-all duration-200 hover:shadow-md ${entry.notified ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        <Bell className="h-3 w-3 mr-1" />
                                                        Notify
                                                    </Button>
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => handleSeatCustomer(entry.id)}
                                                        disabled={actionInProgress === entry.id}
                                                        className="transition-all duration-200 hover:shadow-md"
                                                    >
                                                        <Check className="h-3 w-3 mr-1" />
                                                        Seat
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleRemoveCustomer(entry.id, 'canceled')}
                                                        disabled={actionInProgress === entry.id}
                                                        className="transition-all duration-200 hover:shadow-md"
                                                    >
                                                        <X className="h-3 w-3 mr-1" />
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Notification status message */}
                                            {renderNotificationStatus(entry.id)}

                                            {/* Expanded view */}
                                            {expandedEntry === entry.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="px-6 py-4 bg-beige text-sm border-t border-lightGray"
                                                >
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <h4 className="font-medium text-charcoal mb-3 flex items-center">
                                                                <Info className="h-4 w-4 mr-2 text-primary" />
                                                                Contact Information
                                                            </h4>
                                                            <div className="space-y-2">
                                                                <div className="flex items-start p-2 bg-white rounded-md shadow-sm">
                                                                    <Phone className="h-4 w-4 text-darkGray mr-2 mt-0.5" />
                                                                    <span>{entry.customerPhone}</span>
                                                                </div>
                                                                {entry.customerEmail && (
                                                                    <div className="flex items-start p-2 bg-white rounded-md shadow-sm">
                                                                        <Mail className="h-4 w-4 text-darkGray mr-2 mt-0.5" />
                                                                        <span>{entry.customerEmail}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            {entry.specialRequests ? (
                                                                <div>
                                                                    <h4 className="font-medium text-charcoal mb-3">Special Requests</h4>
                                                                    <div className="p-3 bg-white rounded-md shadow-sm border-l-2 border-primary">
                                                                        <p className="text-darkGray italic">"{entry.specialRequests}"</p>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <h4 className="font-medium text-charcoal mb-3">Special Requests</h4>
                                                                    <div className="p-3 bg-white rounded-md shadow-sm border-l-2 border-lightGray">
                                                                        <p className="text-darkGray italic">No special requests</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white rounded-lg shadow-sm p-8 text-center"
                        >
                            <div className="text-darkGray mb-5">
                                <Users className="h-16 w-16 mx-auto text-primary opacity-70" />
                            </div>
                            <h3 className="text-xl font-medium text-charcoal mb-2">No waitlist entries found</h3>
                            <p className="text-darkGray max-w-md mx-auto">
                                {searchTerm || statusFilter !== 'waiting' || dateFilter
                                    ? 'Try changing your filters or search term'
                                    : 'The waitlist is currently empty'}
                            </p>
                            {(searchTerm || statusFilter !== 'waiting') && (
                                <div className="mt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setStatusFilter('waiting');
                                        }}
                                        className="transition-all duration-200"
                                    >
                                        Reset Filters
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </>
            )}
        </div>
    );
} 