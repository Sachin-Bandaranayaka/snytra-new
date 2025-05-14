"use client";

import { useState, useEffect } from 'react';
import {
    RefreshCw,
    Search,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    Mail
} from 'lucide-react';

interface ContactSubmission {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    message: string;
    created_at: string;
    status: string;
    notes: string | null;
}

export default function ContactSubmissionsManagement() {
    const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
    const [filteredSubmissions, setFilteredSubmissions] = useState<ContactSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalSubmissions, setTotalSubmissions] = useState(0);
    const [pageSize] = useState(10);
    const [editingNotes, setEditingNotes] = useState('');

    // Fetch submissions
    const fetchSubmissions = async () => {
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

            const response = await fetch(`/api/contact/submissions?${searchParams.toString()}`, {
                headers,
                credentials: 'include', // Include cookies
            });

            if (response.status === 403) {
                // Handle unauthorized/authentication error
                window.location.href = '/admin/login?callbackUrl=' + encodeURIComponent(window.location.pathname);
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch submissions');
            }

            const data = await response.json();
            setSubmissions(data.submissions || []);
            setFilteredSubmissions(data.submissions || []);
            setTotalPages(data.pagination.totalPages);
            setTotalSubmissions(data.pagination.total);
            setLoading(false);
        } catch (err) {
            setError('Failed to load submissions. Please try again.');
            setLoading(false);
            console.error('Error fetching submissions:', err);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, [page, statusFilter, searchQuery, pageSize]);

    // View submission details
    const viewSubmissionDetails = (submission: ContactSubmission) => {
        setSelectedSubmission(submission);
        setEditingNotes(submission.notes || '');
        setIsModalOpen(true);
    };

    // Update submission status
    const updateSubmissionStatus = async (id: number, newStatus: string) => {
        try {
            // Get user from localStorage for auth
            const userData = localStorage.getItem('user');
            const headers = {
                'Content-Type': 'application/json',
            };

            // If user data exists, add it to cookies
            if (userData) {
                const user = JSON.parse(userData);
                if (user && user.id) {
                    document.cookie = `user=${encodeURIComponent(userData)}; path=/;`;
                }
            }

            const response = await fetch(`/api/contact/submissions`, {
                method: 'PUT',
                headers,
                credentials: 'include', // Include cookies
                body: JSON.stringify({
                    id,
                    status: newStatus
                }),
            });

            if (response.status === 403) {
                // Handle unauthorized/authentication error
                window.location.href = '/admin/login?callbackUrl=' + encodeURIComponent(window.location.pathname);
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to update submission');
            }

            const { submission } = await response.json();

            // Update in the list
            setSubmissions(prev =>
                prev.map(item => item.id === id ? submission : item)
            );

            // Update selected submission if it's open in the modal
            if (selectedSubmission && selectedSubmission.id === id) {
                setSelectedSubmission(submission);
            }

            // Refresh data
            fetchSubmissions();

        } catch (err) {
            console.error('Error updating submission:', err);
            alert('Failed to update submission. Please try again.');
        }
    };

    // Save notes
    const saveNotes = async () => {
        if (!selectedSubmission) return;

        try {
            // Get user from localStorage for auth
            const userData = localStorage.getItem('user');
            const headers = {
                'Content-Type': 'application/json',
            };

            // If user data exists, add it to cookies
            if (userData) {
                const user = JSON.parse(userData);
                if (user && user.id) {
                    document.cookie = `user=${encodeURIComponent(userData)}; path=/;`;
                }
            }

            const response = await fetch(`/api/contact/submissions`, {
                method: 'PUT',
                headers,
                credentials: 'include', // Include cookies
                body: JSON.stringify({
                    id: selectedSubmission.id,
                    notes: editingNotes
                }),
            });

            if (response.status === 403) {
                // Handle unauthorized/authentication error
                window.location.href = '/admin/login?callbackUrl=' + encodeURIComponent(window.location.pathname);
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to update notes');
            }

            const { submission } = await response.json();

            // Update in list
            setSubmissions(prev =>
                prev.map(item => item.id === selectedSubmission.id ? submission : item)
            );

            // Update selected submission
            setSelectedSubmission(submission);

            alert('Notes saved successfully');

        } catch (err) {
            console.error('Error saving notes:', err);
            alert('Failed to save notes. Please try again.');
        }
    };

    // Get status badge color and icon
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'unread':
                return {
                    color: 'bg-blue-100 text-blue-800 border-blue-200',
                    icon: <Mail className="w-4 h-4 mr-1" />,
                    label: 'Unread'
                };
            case 'in_progress':
                return {
                    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    icon: <Clock className="w-4 h-4 mr-1" />,
                    label: 'In Progress'
                };
            case 'completed':
                return {
                    color: 'bg-green-100 text-green-800 border-green-200',
                    icon: <CheckCircle className="w-4 h-4 mr-1" />,
                    label: 'Completed'
                };
            case 'rejected':
                return {
                    color: 'bg-red-100 text-red-800 border-red-200',
                    icon: <XCircle className="w-4 h-4 mr-1" />,
                    label: 'Rejected'
                };
            default:
                return {
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    icon: null,
                    label: status.replace('_', ' ')
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
                    <h1 className="text-3xl font-bold text-charcoal">Contact Submissions</h1>
                    <p className="text-charcoal/70 mt-1">Manage contact form submissions</p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={fetchSubmissions}
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
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="Search by name, email or message"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            id="status-filter"
                            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="unread">Unread</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Submissions Table */}
            <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-100">
                {loading ? (
                    <div className="p-10 text-center">
                        <p className="text-gray-500">Loading submissions...</p>
                    </div>
                ) : error ? (
                    <div className="p-10 text-center">
                        <p className="text-red-500">{error}</p>
                        <button
                            onClick={fetchSubmissions}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-orange hover:bg-primary-orange/90"
                        >
                            Try Again
                        </button>
                    </div>
                ) : submissions.length === 0 ? (
                    <div className="p-10 text-center">
                        <p className="text-gray-500">No submissions found</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {submissions.map((submission) => {
                                        const statusInfo = getStatusInfo(submission.status);
                                        return (
                                            <tr key={submission.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{submission.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{submission.email}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{submission.message}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                                                        {statusInfo.icon}
                                                        {statusInfo.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(submission.created_at)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => viewSubmissionDetails(submission)}
                                                        className="flex items-center text-primary-orange hover:text-primary-orange/80 mr-3"
                                                    >
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                                    disabled={page === totalPages}
                                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(page * pageSize, totalSubmissions)}</span> of <span className="font-medium">{totalSubmissions}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        <button
                                            onClick={() => setPage(Math.max(1, page - 1))}
                                            disabled={page === 1}
                                            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                                        >
                                            <span className="sr-only">Previous</span>
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>

                                        {/* Page numbers would go here - simplified for brevity */}
                                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium">
                                            Page {page} of {totalPages}
                                        </span>

                                        <button
                                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                                            disabled={page === totalPages}
                                            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                                        >
                                            <span className="sr-only">Next</span>
                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Submission Detail Modal */}
            {isModalOpen && selectedSubmission && (
                <div className="fixed z-50 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsModalOpen(false)}></div>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Contact Submission Details
                                        </h3>
                                        <div className="mt-4 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Name</p>
                                                    <p className="mt-1 text-sm text-gray-900">{selectedSubmission.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Email</p>
                                                    <p className="mt-1 text-sm text-gray-900">{selectedSubmission.email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Phone</p>
                                                    <p className="mt-1 text-sm text-gray-900">{selectedSubmission.phone || 'Not provided'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">Date Submitted</p>
                                                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedSubmission.created_at)}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Status</p>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    <button
                                                        className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm ${selectedSubmission.status === 'unread' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
                                                        onClick={() => updateSubmissionStatus(selectedSubmission.id, 'unread')}
                                                    >
                                                        <Mail className="w-4 h-4 mr-1" />
                                                        Unread
                                                    </button>
                                                    <button
                                                        className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm ${selectedSubmission.status === 'in_progress' ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}
                                                        onClick={() => updateSubmissionStatus(selectedSubmission.id, 'in_progress')}
                                                    >
                                                        <Clock className="w-4 h-4 mr-1" />
                                                        In Progress
                                                    </button>
                                                    <button
                                                        className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm ${selectedSubmission.status === 'completed' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                                                        onClick={() => updateSubmissionStatus(selectedSubmission.id, 'completed')}
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-1" />
                                                        Completed
                                                    </button>
                                                    <button
                                                        className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm ${selectedSubmission.status === 'rejected' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                                                        onClick={() => updateSubmissionStatus(selectedSubmission.id, 'rejected')}
                                                    >
                                                        <XCircle className="w-4 h-4 mr-1" />
                                                        Rejected
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Message</p>
                                                <div className="mt-1 p-4 bg-gray-50 rounded-md text-sm text-gray-900 whitespace-pre-wrap">
                                                    {selectedSubmission.message}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between items-center">
                                                    <p className="text-sm font-medium text-gray-500">Admin Notes</p>
                                                    <button
                                                        onClick={saveNotes}
                                                        className="text-xs text-primary-orange hover:text-primary-orange/80 font-medium"
                                                    >
                                                        Save Notes
                                                    </button>
                                                </div>
                                                <textarea
                                                    rows={4}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                                    placeholder="Add private notes about this submission"
                                                    value={editingNotes}
                                                    onChange={(e) => setEditingNotes(e.target.value)}
                                                ></textarea>
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