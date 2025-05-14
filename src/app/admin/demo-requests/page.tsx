"use client";

import { useState, useEffect } from 'react';
import {
    RefreshCw,
    Search,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    Mail,
    Calendar,
    User,
    Briefcase
} from 'lucide-react';

interface DemoRequest {
    id: number;
    name: string;
    email: string;
    phone: string;
    company: string;
    position: string | null;
    business_type: string;
    employee_count: string | null;
    preferred_date: string;
    preferred_time: string;
    message: string | null;
    status: string;
    notes: string | null;
    created_at: string;
}

export default function DemoRequestsManagement() {
    const [requests, setRequests] = useState<DemoRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<DemoRequest | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRequests, setTotalRequests] = useState(0);
    const [pageSize] = useState(10);
    const [editingNotes, setEditingNotes] = useState('');

    // Fetch requests
    const fetchRequests = async () => {
        try {
            setLoading(true);
            const searchParams = new URLSearchParams();
            searchParams.append('page', page.toString());
            searchParams.append('pageSize', pageSize.toString());

            if (statusFilter !== 'all') {
                searchParams.append('status', statusFilter);
            }

            if (searchQuery) {
                searchParams.append('search', searchQuery);
            }

            // Get user from localStorage for auth
            const userData = localStorage.getItem('user');
            const headers = new Headers({
                'Content-Type': 'application/json',
            });

            // If user data exists, add it to request headers
            if (userData) {
                const user = JSON.parse(userData);
                if (user && user.id) {
                    document.cookie = `user=${encodeURIComponent(userData)}; path=/;`;
                }
            }

            const response = await fetch(`/api/demo-request/submissions?${searchParams.toString()}`, {
                headers,
                credentials: 'include', // Include cookies
            });

            if (response.status === 403) {
                // Handle unauthorized/authentication error
                window.location.href = '/admin/login?callbackUrl=' + encodeURIComponent(window.location.pathname);
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch demo requests');
            }

            const data = await response.json();
            setRequests(data.requests || []);
            setTotalPages(data.pagination.totalPages);
            setTotalRequests(data.pagination.total);
            setLoading(false);
        } catch (err) {
            setError('Error fetching demo requests. Please try again.');
            setLoading(false);
            console.error(err);
        }
    };

    // Handle search
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchRequests();
    };

    // Handle status filter change
    const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value);
        setPage(1);
        setTimeout(() => {
            fetchRequests();
        }, 0);
    };

    // Handle pagination
    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    // Open modal with request details
    const openRequestDetails = (request: DemoRequest) => {
        setSelectedRequest(request);
        setEditingNotes(request.notes || '');
        setIsModalOpen(true);
    };

    // Handle status change
    const updateRequestStatus = async (id: number, status: string) => {
        try {
            const response = await fetch('/api/demo-request/submissions', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                    status,
                }),
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to update request status');
            }

            // Update the local state with the new status
            setRequests(prevRequests =>
                prevRequests.map(request =>
                    request.id === id ? { ...request, status } : request
                )
            );

            // If we're updating the currently selected request, update that too
            if (selectedRequest && selectedRequest.id === id) {
                setSelectedRequest(prev => prev ? { ...prev, status } : null);
            }

        } catch (err) {
            console.error(err);
            setError('Error updating request status');
        }
    };

    // Handle notes update
    const updateRequestNotes = async () => {
        if (!selectedRequest) return;

        try {
            const response = await fetch('/api/demo-request/submissions', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: selectedRequest.id,
                    notes: editingNotes,
                }),
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to update notes');
            }

            // Update the local state with the new notes
            setRequests(prevRequests =>
                prevRequests.map(request =>
                    request.id === selectedRequest.id ? { ...request, notes: editingNotes } : request
                )
            );

            // Update the selected request
            setSelectedRequest(prev => prev ? { ...prev, notes: editingNotes } : null);

        } catch (err) {
            console.error(err);
            setError('Error updating notes');
        }
    };

    // Get status info for display
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending':
                return {
                    label: 'Pending',
                    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                    icon: <Clock className="h-3 w-3 mr-1" />,
                };
            case 'contacted':
                return {
                    label: 'Contacted',
                    color: 'bg-blue-100 text-blue-800 border-blue-300',
                    icon: <Mail className="h-3 w-3 mr-1" />,
                };
            case 'scheduled':
                return {
                    label: 'Demo Scheduled',
                    color: 'bg-purple-100 text-purple-800 border-purple-300',
                    icon: <Calendar className="h-3 w-3 mr-1" />,
                };
            case 'completed':
                return {
                    label: 'Completed',
                    color: 'bg-green-100 text-green-800 border-green-300',
                    icon: <CheckCircle className="h-3 w-3 mr-1" />,
                };
            case 'cancelled':
                return {
                    label: 'Cancelled',
                    color: 'bg-red-100 text-red-800 border-red-300',
                    icon: <XCircle className="h-3 w-3 mr-1" />,
                };
            default:
                return {
                    label: status.charAt(0).toUpperCase() + status.slice(1),
                    color: 'bg-gray-100 text-gray-800 border-gray-300',
                    icon: null,
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

    // Load requests on component mount and when page or filters change
    useEffect(() => {
        fetchRequests();
    }, [page]);

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-charcoal">Demo Requests</h1>
                    <p className="text-charcoal/70 mt-1">Manage demo requests and schedule demos</p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={fetchRequests}
                        className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-end gap-4">
                    <div className="flex-1">
                        <form onSubmit={handleSearch}>
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                                Search
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by name, email, or company..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                        </form>
                    </div>
                    <div className="w-full md:w-48">
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            id="status"
                            value={statusFilter}
                            onChange={handleStatusFilterChange}
                            className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="contacted">Contacted</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div className="md:ml-2">
                        <button
                            onClick={handleSearch}
                            className="w-full md:w-auto px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Error display */}
            {error && (
                <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
                    <p>{error}</p>
                </div>
            )}

            {/* Loading state */}
            {loading ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <p className="text-gray-500">Loading demo requests...</p>
                </div>
            ) : requests.length === 0 ? (
                <div className="p-10 text-center">
                    <p className="text-gray-500">No demo requests found</p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Type</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preferred Date/Time</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested On</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {requests.map((request) => {
                                    const statusInfo = getStatusInfo(request.status);
                                    return (
                                        <tr key={request.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.company}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.business_type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {request.preferred_date.split('T')[0]} <br />
                                                {request.preferred_time}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                                                    {statusInfo.icon}
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(request.created_at)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => openRequestDetails(request)}
                                                        className="text-primary hover:text-primary/80"
                                                        title="View Details"
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => updateRequestStatus(request.id, 'completed')}
                                                        className="text-green-600 hover:text-green-800"
                                                        title="Mark as Completed"
                                                    >
                                                        <CheckCircle className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-6">
                        <div className="text-sm text-gray-700">
                            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalRequests)} of {totalRequests} demo requests
                        </div>

                        <div className="flex space-x-2">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className={`px-3 py-1 border rounded-md ${page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                Previous
                            </button>

                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const pageNumber = page > 3 ? page - 3 + i + 1 : i + 1;
                                if (pageNumber <= totalPages) {
                                    return (
                                        <button
                                            key={pageNumber}
                                            onClick={() => handlePageChange(pageNumber)}
                                            className={`px-3 py-1 border rounded-md ${pageNumber === page ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                }
                                return null;
                            })}

                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages}
                                className={`px-3 py-1 border rounded-md ${page === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Modal for viewing request details */}
            {isModalOpen && selectedRequest && (
                <div className="fixed z-50 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsModalOpen(false)}></div>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Demo Request Details
                                        </h3>

                                        <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center mb-1">
                                                    <User className="h-4 w-4 mr-2 text-primary" />
                                                    <p className="text-sm font-medium text-gray-500">Contact Information</p>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <p className="text-sm text-gray-900"><strong>Name:</strong> {selectedRequest.name}</p>
                                                    <p className="text-sm text-gray-900"><strong>Email:</strong> {selectedRequest.email}</p>
                                                    <p className="text-sm text-gray-900"><strong>Phone:</strong> {selectedRequest.phone}</p>
                                                    <p className="text-sm text-gray-900"><strong>Position:</strong> {selectedRequest.position || 'Not provided'}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col">
                                                <div className="flex items-center mb-1">
                                                    <Briefcase className="h-4 w-4 mr-2 text-primary" />
                                                    <p className="text-sm font-medium text-gray-500">Business Information</p>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <p className="text-sm text-gray-900"><strong>Company:</strong> {selectedRequest.company}</p>
                                                    <p className="text-sm text-gray-900"><strong>Business Type:</strong> {selectedRequest.business_type}</p>
                                                    <p className="text-sm text-gray-900"><strong>Employees:</strong> {selectedRequest.employee_count || 'Not provided'}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col">
                                                <div className="flex items-center mb-1">
                                                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                                                    <p className="text-sm font-medium text-gray-500">Demo Preferences</p>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-lg">
                                                    <p className="text-sm text-gray-900"><strong>Preferred Date:</strong> {selectedRequest.preferred_date.split('T')[0]}</p>
                                                    <p className="text-sm text-gray-900"><strong>Preferred Time:</strong> {selectedRequest.preferred_time}</p>
                                                    <p className="text-sm text-gray-900"><strong>Requested:</strong> {formatDate(selectedRequest.created_at)}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col">
                                                <div className="flex items-center mb-1">
                                                    <Clock className="h-4 w-4 mr-2 text-primary" />
                                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                                </div>
                                                <div className="p-3">
                                                    <select
                                                        value={selectedRequest.status}
                                                        onChange={(e) => updateRequestStatus(selectedRequest.id, e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="contacted">Contacted</option>
                                                        <option value="scheduled">Scheduled</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                                Message from Client
                                            </label>
                                            <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
                                                <p className="text-sm text-gray-900">{selectedRequest.message || 'No message provided.'}</p>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                                                Internal Notes
                                            </label>
                                            <textarea
                                                id="notes"
                                                value={editingNotes}
                                                onChange={(e) => setEditingNotes(e.target.value)}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                                placeholder="Add notes about this demo request..."
                                            ></textarea>
                                            <div className="mt-2 flex justify-end">
                                                <button
                                                    onClick={updateRequestNotes}
                                                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                                                >
                                                    Save Notes
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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