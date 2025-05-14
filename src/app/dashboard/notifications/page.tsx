"use client";

import { useState, useEffect } from 'react';
import {
    Bell,
    Search,
    RefreshCw,
    AlertCircle,
    Filter,
    Calendar,
    Check,
    X,
    ChevronLeft,
    ChevronRight,
    RotateCw,
    Mail,
    MessageSquare,
    Clock,
    Info
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface NotificationLog {
    id: number;
    type: string;
    recipient_id: string;
    recipient_type: string;
    recipient_name?: string;
    recipient_contact?: string;
    sent_by: string;
    status: string;
    message: string;
    metadata?: any;
    created_at: string;
    updated_at: string;
}

interface PaginationInfo {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
}

export default function NotificationLogsPage() {
    const [logs, setLogs] = useState<NotificationLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationInfo>({
        total: 0,
        limit: 25,
        offset: 0,
        hasMore: false
    });

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [recipientTypeFilter, setRecipientTypeFilter] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Resend state
    const [resendingId, setResendingId] = useState<number | null>(null);
    const [resendSuccess, setResendSuccess] = useState<{ id: number, message: string } | null>(null);
    const [resendError, setResendError] = useState<{ id: number, message: string } | null>(null);

    // Load notification logs
    const fetchLogs = async (resetOffset = false) => {
        setLoading(true);
        setError(null);

        try {
            const offset = resetOffset ? 0 : pagination.offset;

            // Build query parameters
            const params = new URLSearchParams();
            params.append('limit', pagination.limit.toString());
            params.append('offset', offset.toString());

            if (statusFilter) params.append('status', statusFilter);
            if (typeFilter) params.append('type', typeFilter);
            if (recipientTypeFilter) params.append('recipientType', recipientTypeFilter);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await fetch(`/api/notifications/logs?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to fetch notification logs');
            }

            const data = await response.json();
            setLogs(data.logs);
            setPagination(data.pagination);

            if (resetOffset) {
                setPagination(prev => ({
                    ...prev,
                    offset: 0
                }));
            }
        } catch (error: any) {
            setError(error.message || 'Failed to load notification logs');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchLogs();
    }, []);

    // Handle filter changes
    const handleFilterChange = () => {
        fetchLogs(true);
    };

    // Handle pagination
    const handlePrevPage = () => {
        if (pagination.offset === 0) return;

        setPagination(prev => ({
            ...prev,
            offset: Math.max(0, prev.offset - prev.limit)
        }));
    };

    const handleNextPage = () => {
        if (!pagination.hasMore) return;

        setPagination(prev => ({
            ...prev,
            offset: prev.offset + prev.limit
        }));
    };

    // Effect to refetch when pagination changes
    useEffect(() => {
        fetchLogs();
    }, [pagination.offset]);

    // Handle resending a notification
    const handleResendNotification = async (id: number) => {
        setResendingId(id);
        setResendSuccess(null);
        setResendError(null);

        try {
            const response = await fetch('/api/notifications/logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to resend notification');
            }

            setResendSuccess({
                id,
                message: data.message || 'Notification resent successfully'
            });

            // Refresh the logs
            fetchLogs();
        } catch (error: any) {
            setResendError({
                id,
                message: error.message || 'Failed to resend notification'
            });
        } finally {
            setResendingId(null);
        }
    };

    // Format dates for display
    const formatDate = (dateString: string) => {
        try {
            return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
        } catch (e) {
            return dateString;
        }
    };

    // Render status badge
    const renderStatusBadge = (status: string) => {
        let bgColor = 'bg-gray-100';
        let textColor = 'text-gray-800';
        let icon = null;

        switch (status.toLowerCase()) {
            case 'sent':
                bgColor = 'bg-green-100';
                textColor = 'text-green-800';
                icon = <Check className="h-3 w-3 mr-1" />;
                break;
            case 'failed':
                bgColor = 'bg-red-100';
                textColor = 'text-red-800';
                icon = <X className="h-3 w-3 mr-1" />;
                break;
            case 'pending':
            case 'prepared':
                bgColor = 'bg-yellow-100';
                textColor = 'text-yellow-800';
                icon = <Clock className="h-3 w-3 mr-1" />;
                break;
            default:
                icon = <Info className="h-3 w-3 mr-1" />;
        }

        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${bgColor} ${textColor}`}>
                {icon}
                {status}
            </span>
        );
    };

    // Render notification type badge
    const renderTypeBadge = (type: string) => {
        let bgColor = 'bg-blue-100';
        let textColor = 'text-blue-800';
        let icon = <Bell className="h-3 w-3 mr-1" />;

        if (type.includes('waitlist')) {
            bgColor = 'bg-purple-100';
            textColor = 'text-purple-800';
        } else if (type.includes('reservation')) {
            bgColor = 'bg-indigo-100';
            textColor = 'text-indigo-800';
        } else if (type.includes('order')) {
            bgColor = 'bg-blue-100';
            textColor = 'text-blue-800';
        }

        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${bgColor} ${textColor}`}>
                {icon}
                {type}
            </span>
        );
    };

    // Render notification channel icon
    const renderChannelIcon = (log: NotificationLog) => {
        // Determine the channel based on the notification type or metadata
        let channel = 'unknown';

        if (log.metadata && log.metadata.channel) {
            channel = log.metadata.channel;
        } else if (log.type.includes('email')) {
            channel = 'email';
        } else if (log.type.includes('whatsapp')) {
            channel = 'whatsapp';
        } else if (log.type.includes('sms')) {
            channel = 'sms';
        }

        switch (channel) {
            case 'email':
                return <Mail className="h-4 w-4 text-blue-500" title="Email" />;
            case 'whatsapp':
                return <MessageSquare className="h-4 w-4 text-green-500" title="WhatsApp" />;
            case 'sms':
                return <MessageSquare className="h-4 w-4 text-purple-500" title="SMS" />;
            default:
                return <Bell className="h-4 w-4 text-gray-500" title="Notification" />;
        }
    };

    return (
        <div className="container px-6 py-8 mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notification Logs</h1>
                    <p className="text-gray-600 mt-1">
                        View and manage all system notifications
                    </p>
                </div>
                <div className="flex mt-4 md:mt-0">
                    <button
                        onClick={() => fetchLogs()}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Refresh
                    </button>
                </div>
            </header>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="w-full md:w-1/5">
                        <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            id="status-filter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="sent">Sent</option>
                            <option value="failed">Failed</option>
                            <option value="pending">Pending</option>
                            <option value="prepared">Prepared</option>
                        </select>
                    </div>

                    <div className="w-full md:w-1/5">
                        <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">
                            Type
                        </label>
                        <select
                            id="type-filter"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Types</option>
                            <option value="waitlist_notification">Waitlist Notification</option>
                            <option value="reservation_confirmation">Reservation Confirmation</option>
                            <option value="order_confirmation">Order Confirmation</option>
                        </select>
                    </div>

                    <div className="w-full md:w-1/5">
                        <label htmlFor="recipient-filter" className="block text-sm font-medium text-gray-700 mb-1">
                            Recipient Type
                        </label>
                        <select
                            id="recipient-filter"
                            value={recipientTypeFilter}
                            onChange={(e) => setRecipientTypeFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Recipients</option>
                            <option value="waitlist">Waitlist</option>
                            <option value="reservation">Reservation</option>
                            <option value="order">Order</option>
                            <option value="user">User</option>
                        </select>
                    </div>

                    <div className="mt-4 md:mt-0 w-full md:w-auto">
                        <button
                            onClick={handleFilterChange}
                            className="w-full md:w-auto flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            <Filter className="h-4 w-4 mr-1" />
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                    <div className="flex">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading state */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                    <span className="ml-2 text-gray-600">Loading notification logs...</span>
                </div>
            )}

            {/* Notification logs list */}
            {!loading && logs.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No notifications found</h3>
                    <p className="mt-2 text-sm text-gray-500">
                        No notification logs match your current filters.
                    </p>
                </div>
            )}

            {!loading && logs.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type & Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Recipient
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Message
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Timestamp
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {logs.map((log) => (
                                    <tr key={log.id} className={log.status === 'failed' ? 'bg-red-50' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {log.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <div className="mb-1">{renderTypeBadge(log.type)}</div>
                                                <div>{renderStatusBadge(log.status)}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-start">
                                                <div className="mr-2 mt-1">{renderChannelIcon(log)}</div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {`${log.recipient_type} #${log.recipient_id}`}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 line-clamp-2">
                                                {log.message}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(log.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {log.status === 'failed' || log.status === 'prepared' ? (
                                                <div>
                                                    <button
                                                        onClick={() => handleResendNotification(log.id)}
                                                        disabled={resendingId === log.id}
                                                        className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        {resendingId === log.id ? (
                                                            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                                                        ) : (
                                                            <RotateCw className="h-4 w-4 mr-1" />
                                                        )}
                                                        Resend
                                                    </button>

                                                    {resendSuccess && resendSuccess.id === log.id && (
                                                        <div className="mt-1 text-xs text-green-600">
                                                            {resendSuccess.message}
                                                        </div>
                                                    )}

                                                    {resendError && resendError.id === log.id && (
                                                        <div className="mt-1 text-xs text-red-600">
                                                            {resendError.message}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {!loading && logs.length > 0 && (
                <div className="mt-6 flex items-center justify-between">
                    <div className="flex-1 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{pagination.offset + 1}</span> to{' '}
                                <span className="font-medium">
                                    {Math.min(pagination.offset + logs.length, pagination.total)}
                                </span>{' '}
                                of <span className="font-medium">{pagination.total}</span> results
                            </p>
                        </div>
                        <div className="space-x-2">
                            <button
                                onClick={handlePrevPage}
                                disabled={pagination.offset === 0}
                                className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium ${pagination.offset === 0
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </button>
                            <button
                                onClick={handleNextPage}
                                disabled={!pagination.hasMore}
                                className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium ${!pagination.hasMore
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 