"use client";

import { useState, useEffect } from 'react';
import {
    MoreHorizontal,
    RefreshCw,
    CheckCircle,
    AlertCircle,
    Clock,
    BarChart3,
    Filter,
    Search,
    Calendar,
    MessageSquare,
    X
} from 'lucide-react';

interface SupportTicket {
    id: number;
    user_id: number;
    user_name: string;
    title: string;
    description: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: string;
    created_at: string;
    updated_at: string;
    resolved_at: string | null;
    assigned_to: number | null;
    assigned_name: string | null;
}

export default function SupportTicketsManagement() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Filter states
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');

    // Fetch tickets
    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await fetch('/api/support-tickets');
                if (!response.ok) {
                    throw new Error('Failed to fetch tickets');
                }

                const data = await response.json();
                setTickets(data.tickets || []);
                setFilteredTickets(data.tickets || []);
                setLoading(false);
            } catch (err) {
                setError('Failed to load tickets. Please try again.');
                setLoading(false);
                console.error('Error fetching tickets:', err);
            }
        };

        fetchTickets();
    }, []);

    // Apply filters and search
    useEffect(() => {
        let result = [...tickets];

        // Apply status filter
        if (statusFilter !== 'all') {
            result = result.filter(ticket => ticket.status === statusFilter);
        }

        // Apply priority filter
        if (priorityFilter !== 'all') {
            result = result.filter(ticket => ticket.priority === priorityFilter);
        }

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(ticket =>
                ticket.title.toLowerCase().includes(query) ||
                ticket.description.toLowerCase().includes(query) ||
                ticket.user_name?.toLowerCase().includes(query) ||
                ticket.category?.toLowerCase().includes(query)
            );
        }

        setFilteredTickets(result);
    }, [tickets, statusFilter, priorityFilter, searchQuery]);

    // View ticket details
    const viewTicketDetails = (ticket: SupportTicket) => {
        setSelectedTicket(ticket);
        setIsModalOpen(true);
    };

    // Update ticket status
    const handleStatusChange = async (id: number, newStatus: string) => {
        try {
            const response = await fetch(`/api/support-tickets/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: newStatus,
                    ...(newStatus === 'resolved' ? { resolved_at: new Date().toISOString() } : {})
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update ticket');
            }

            // Update in UI
            const updatedTickets = tickets.map(ticket =>
                ticket.id === id
                    ? { ...ticket, status: newStatus as any, ...(newStatus === 'resolved' ? { resolved_at: new Date().toISOString() } : {}) }
                    : ticket
            );

            setTickets(updatedTickets);

            // Also update selected ticket if it's open in the modal
            if (selectedTicket && selectedTicket.id === id) {
                setSelectedTicket({
                    ...selectedTicket,
                    status: newStatus as any,
                    ...(newStatus === 'resolved' ? { resolved_at: new Date().toISOString() } : {})
                });
            }
        } catch (err) {
            console.error('Error updating ticket:', err);
            alert('Failed to update ticket. Please try again.');
        }
    };

    // Get status badge color and icon
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'open':
                return {
                    color: 'bg-blue-100 text-blue-800 border-blue-200',
                    icon: <AlertCircle className="w-4 h-4 mr-1" />,
                    label: 'Open'
                };
            case 'in_progress':
                return {
                    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    icon: <Clock className="w-4 h-4 mr-1" />,
                    label: 'In Progress'
                };
            case 'resolved':
                return {
                    color: 'bg-green-100 text-green-800 border-green-200',
                    icon: <CheckCircle className="w-4 h-4 mr-1" />,
                    label: 'Resolved'
                };
            case 'closed':
                return {
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    icon: <X className="w-4 h-4 mr-1" />,
                    label: 'Closed'
                };
            default:
                return {
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    icon: null,
                    label: status.replace('_', ' ')
                };
        }
    };

    // Get priority badge color and icon
    const getPriorityInfo = (priority: string) => {
        switch (priority) {
            case 'low':
                return {
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    icon: <BarChart3 className="w-4 h-4 mr-1" />,
                    label: 'Low'
                };
            case 'medium':
                return {
                    color: 'bg-blue-100 text-blue-800 border-blue-200',
                    icon: <BarChart3 className="w-4 h-4 mr-1" />,
                    label: 'Medium'
                };
            case 'high':
                return {
                    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    icon: <BarChart3 className="w-4 h-4 mr-1" />,
                    label: 'High'
                };
            case 'urgent':
                return {
                    color: 'bg-red-100 text-red-800 border-red-200',
                    icon: <AlertCircle className="w-4 h-4 mr-1" />,
                    label: 'Urgent'
                };
            default:
                return {
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    icon: null,
                    label: priority
                };
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(date);
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-charcoal">Support Tickets</h1>
                    <p className="text-charcoal/70 mt-1">Manage customer support requests</p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-5 rounded-lg shadow-sm mb-6 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                                placeholder="Search tickets..."
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                            <Filter className="h-4 w-4 text-gray-500" />
                            <select
                                id="statusFilter"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                            >
                                <option value="all">All Statuses</option>
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                            <BarChart3 className="h-4 w-4 text-gray-500" />
                            <select
                                id="priorityFilter"
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                            >
                                <option value="all">All Priorities</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tickets counter */}
            <div className="flex mb-4 text-sm text-gray-600">
                <div className="flex items-center">
                    <span className="font-medium">{filteredTickets.length}</span>
                    <span className="ml-1">tickets found</span>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative">
                    {error}
                </div>
            ) : filteredTickets.length === 0 ? (
                <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
                    <p className="text-gray-500">Try adjusting your filters or check back later</p>
                </div>
            ) : (
                <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ticket
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Priority
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredTickets.map((ticket) => {
                                    const statusInfo = getStatusInfo(ticket.status);
                                    const priorityInfo = getPriorityInfo(ticket.priority);

                                    return (
                                        <tr key={ticket.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {ticket.title}
                                                </div>
                                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                                    {ticket.description.substring(0, 60)}
                                                    {ticket.description.length > 60 ? '...' : ''}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{ticket.user_name}</div>
                                                <div className="text-sm text-gray-500">ID: {ticket.user_id}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-md border ${statusInfo.color}`}>
                                                    {statusInfo.icon}
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-md border ${priorityInfo.color}`}>
                                                    {priorityInfo.icon}
                                                    {priorityInfo.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    {new Date(ticket.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                                <div className="flex justify-center space-x-3">
                                                    <button
                                                        onClick={() => viewTicketDetails(ticket)}
                                                        className="inline-flex items-center text-blue-600 hover:text-blue-900"
                                                    >
                                                        <MessageSquare className="w-4 h-4 mr-1" />
                                                        View
                                                    </button>

                                                    <div className="relative inline-block text-left">
                                                        <select
                                                            value={ticket.status}
                                                            onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                                                            className="text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                                        >
                                                            <option value="open">Open</option>
                                                            <option value="in_progress">In Progress</option>
                                                            <option value="resolved">Resolved</option>
                                                            <option value="closed">Closed</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Ticket Detail Modal */}
            {isModalOpen && selectedTicket && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsModalOpen(false)}></div>
                        </div>

                        <div
                            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="modal-headline"
                        >
                            {/* Modal header */}
                            <div className="bg-white p-6 border-b border-gray-200">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                                        Ticket #{selectedTicket.id}
                                    </h3>
                                    <button
                                        type="button"
                                        className="text-gray-400 hover:text-gray-500"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal body */}
                            <div className="bg-white p-6">
                                <div className="mb-6">
                                    <h2 className="text-xl font-semibold mb-2">{selectedTicket.title}</h2>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusInfo(selectedTicket.status).color}`}>
                                            {getStatusInfo(selectedTicket.status).icon}
                                            {getStatusInfo(selectedTicket.status).label}
                                        </div>
                                        <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getPriorityInfo(selectedTicket.priority).color}`}>
                                            {getPriorityInfo(selectedTicket.priority).icon}
                                            {getPriorityInfo(selectedTicket.priority).label}
                                        </div>
                                        {selectedTicket.category && (
                                            <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border bg-purple-100 text-purple-800 border-purple-200">
                                                {selectedTicket.category}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Customer</p>
                                        <p className="text-sm font-normal text-gray-900">{selectedTicket.user_name}</p>
                                        <p className="text-xs text-gray-500">ID: {selectedTicket.user_id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Created at</p>
                                        <p className="text-sm font-normal text-gray-900">{formatDate(selectedTicket.created_at)}</p>
                                    </div>
                                    {selectedTicket.assigned_name && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Assigned to</p>
                                            <p className="text-sm font-normal text-gray-900">{selectedTicket.assigned_name}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                                    <div className="text-sm text-gray-900 bg-gray-50 p-4 rounded-md border border-gray-200 whitespace-pre-wrap">
                                        {selectedTicket.description}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">Update Status</h3>
                                    <select
                                        value={selectedTicket.status}
                                        onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                                        className="text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary w-full"
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                            </div>

                            {/* Modal footer */}
                            <div className="bg-gray-50 px-6 py-3 flex flex-row-reverse">
                                <button
                                    type="button"
                                    className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:text-sm"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
} 