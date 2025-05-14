"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/StackAdminAuth';
import { useRouter } from 'next/navigation';
import {
    Calendar,
    Filter,
    Search,
    User,
    Users,
    Phone,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Plus,
    ChevronDown,
    Trash2,
    Edit,
    RefreshCw,
    ListPlus,
    Table,
    QrCode
} from 'lucide-react';
import Link from 'next/link';
import AddToWaitlistModal from '@/components/AddToWaitlistModal';

interface Reservation {
    id: number;
    name: string;
    email: string;
    phone_number: string;
    party_size: number;
    date: string;
    time: string;
    special_instructions?: string;
    status: string;
    table_id?: number;
    table_number?: string;
    seats?: number;
    qr_code_url?: string;
}

export default function ReservationsPage() {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        date: new Date().toISOString().split('T')[0],
        status: '',
        search: ''
    });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
    const [showWaitlistModal, setShowWaitlistModal] = useState(false);
    const [showQrModal, setShowQrModal] = useState(false);
    const [activeQrCode, setActiveQrCode] = useState<string | null>(null);

    useEffect(() => {
        // Redirect if not authenticated
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchReservations();
        }
    }, [isAuthenticated, user, filters]);

    const fetchReservations = async () => {
        try {
            setIsLoading(true);
            let url = `/api/dashboard/reservations?date=${filters.date}`;

            if (filters.status) {
                url += `&status=${filters.status}`;
            }

            if (filters.search) {
                url += `&search=${filters.search}`;
            }

            console.log('Fetching reservations from:', url);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch reservations');
            }

            const data = await response.json();
            console.log("Fetched reservations:", data);

            if (data.success) {
                setReservations(data.reservations || []);
            } else {
                throw new Error(data.error || 'Failed to fetch reservations');
            }
        } catch (err: any) {
            console.error('Error fetching reservations:', err);
            setError(err.message || 'An error occurred while fetching reservations');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleViewDetails = (reservation: Reservation) => {
        setSelectedReservation(reservation);
        setShowDetailsModal(true);
    };

    const handleStatusChange = async (id: number, newStatus: string) => {
        try {
            const response = await fetch(`/api/dashboard/reservations`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update reservation status');
            }

            // Update the local state
            setReservations(prev =>
                prev.map(res =>
                    res.id === id ? { ...res, status: newStatus } : res
                )
            );

            // If we're viewing details of this reservation, update it there too
            if (selectedReservation && selectedReservation.id === id) {
                setSelectedReservation({ ...selectedReservation, status: newStatus });
            }

            // Refresh reservations to get the latest data
            fetchReservations();
        } catch (err: any) {
            console.error('Error updating reservation status:', err);
            alert(err.message || 'An error occurred');
        }
    };

    const handleDeleteReservation = async (id: number) => {
        if (!confirm('Are you sure you want to delete this reservation?')) {
            return;
        }

        try {
            const response = await fetch(`/api/dashboard/reservations?id=${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete reservation');
            }

            // Remove from local state
            setReservations(prev => prev.filter(res => res.id !== id));

            // Close modal if we're viewing details of this reservation
            if (selectedReservation && selectedReservation.id === id) {
                setShowDetailsModal(false);
                setSelectedReservation(null);
            }
        } catch (err: any) {
            console.error('Error deleting reservation:', err);
            alert(err.message || 'An error occurred');
        }
    };

    const handleViewQrCode = (qrCodeUrl: string) => {
        setActiveQrCode(qrCodeUrl);
        setShowQrModal(true);
    };

    const handlePrintQrCode = () => {
        if (!activeQrCode) return;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Table QR Code</title>
                    <style>
                        body { 
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            margin: 0;
                        }
                        img {
                            max-width: 100%;
                            max-height: 100%;
                        }
                        @media print {
                            body {
                                height: auto;
                            }
                        }
                    </style>
                </head>
                <body>
                    <img src="${activeQrCode}" alt="Table QR Code" />
                    <script>
                        setTimeout(() => {
                            window.print();
                            window.close();
                        }, 500);
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'canceled':
                return 'bg-red-100 text-red-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            case 'no-show':
                return 'bg-gray-100 text-gray-800';
            case 'waitlist':
                return 'bg-orange-100 text-orange-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Format time for display
    const formatTime = (timeString: string) => {
        try {
            // Convert from 24-hour format to 12-hour format
            const [hours, minutes] = timeString.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour % 12 || 12;
            return `${hour12}:${minutes} ${ampm}`;
        } catch (err) {
            return timeString;
        }
    };

    // Handle successful waitlist addition
    const handleWaitlistSuccess = () => {
        setShowWaitlistModal(false);
        fetchReservations();
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Reservations</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowWaitlistModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition duration-200"
                        >
                            <ListPlus size={16} />
                            <span>Add to Waitlist</span>
                        </button>
                        <Link
                            href="/dashboard/tables"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                        >
                            <Table size={16} />
                            <span>Manage Tables</span>
                        </Link>
                        <button
                            onClick={fetchReservations}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-200"
                        >
                            <RefreshCw size={16} />
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="w-full md:w-1/3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="date"
                                    value={filters.date}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="w-full md:w-1/3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Statuses</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="pending">Pending</option>
                                <option value="canceled">Canceled</option>
                                <option value="completed">Completed</option>
                                <option value="no-show">No Show</option>
                                <option value="waitlist">Waitlist</option>
                            </select>
                        </div>

                        <div className="w-full md:w-1/3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="search"
                                    placeholder="Search by name or phone"
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Guest
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date & Time
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Party Size
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Table
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {reservations.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                            No reservations found
                                        </td>
                                    </tr>
                                ) : (
                                    reservations.map((reservation) => (
                                        <tr key={reservation.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{reservation.name}</div>
                                                <div className="text-sm text-gray-500">{reservation.email}</div>
                                                <div className="text-sm text-gray-500">{reservation.phone_number}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{formatDate(reservation.date)}</div>
                                                <div className="text-sm text-gray-500">{formatTime(reservation.time)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Users size={16} className="mr-2 text-gray-400" />
                                                    <span className="text-sm text-gray-900">{reservation.party_size}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {reservation.table_number ? (
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            Table {reservation.table_number}
                                                        </div>
                                                        {reservation.seats && (
                                                            <div className="text-sm text-gray-500">
                                                                {reservation.seats} seats
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-500">Not assigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(reservation.status)}`}>
                                                    {reservation.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleViewDetails(reservation)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        title="View details"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteReservation(reservation.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                        title="Delete reservation"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                    {reservation.status === 'confirmed' && (
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleStatusChange(reservation.id, 'completed')}
                                                                className="text-green-600 hover:text-green-800"
                                                                title="Mark as completed"
                                                            >
                                                                <CheckCircle size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusChange(reservation.id, 'no-show')}
                                                                className="text-gray-600 hover:text-gray-800"
                                                                title="Mark as no-show"
                                                            >
                                                                <XCircle size={18} />
                                                            </button>
                                                        </div>
                                                    )}
                                                    {reservation.status === 'waitlist' && (
                                                        <button
                                                            onClick={() => handleStatusChange(reservation.id, 'confirmed')}
                                                            className="text-orange-600 hover:text-orange-800"
                                                            title="Confirm from waitlist"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                    )}
                                                    {reservation.table_id && (
                                                        <button
                                                            onClick={() => reservation.qr_code_url && handleViewQrCode(reservation.qr_code_url)}
                                                            className="text-purple-600 hover:text-purple-800"
                                                            title="View QR Code"
                                                            disabled={!reservation.qr_code_url}
                                                        >
                                                            <QrCode size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* QR Code Modal */}
            {showQrModal && activeQrCode && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-semibold mb-4">Table QR Code</h3>
                        <div className="mb-4">
                            <img src={activeQrCode} alt="Table QR Code" className="w-full" />
                        </div>
                        <div className="flex justify-between">
                            <button
                                onClick={() => setShowQrModal(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                            >
                                Close
                            </button>
                            <button
                                onClick={handlePrintQrCode}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Print
                            </button>
                            <a
                                href={activeQrCode}
                                download="table_qr_code.png"
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                Download
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Reservation Details Modal */}
            {showDetailsModal && selectedReservation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                        <h3 className="text-xl font-semibold mb-4">Reservation Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Guest Information</h4>
                                <p className="text-gray-900 font-medium">{selectedReservation.name}</p>
                                <p className="text-gray-700">{selectedReservation.email}</p>
                                <p className="text-gray-700">{selectedReservation.phone_number}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-500">Reservation Details</h4>
                                <p className="text-gray-900">Date: {formatDate(selectedReservation.date)}</p>
                                <p className="text-gray-900">Time: {formatTime(selectedReservation.time)}</p>
                                <p className="text-gray-900">
                                    Party Size: {selectedReservation.party_size} {selectedReservation.party_size === 1 ? 'person' : 'people'}
                                </p>
                                <p className="text-gray-900">
                                    Table: {selectedReservation.table_number ? `#${selectedReservation.table_number}` : 'Not assigned'}
                                </p>
                                <p className="text-gray-900">
                                    Status: <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedReservation.status)}`}>
                                        {selectedReservation.status}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {selectedReservation.special_instructions && (
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-500 mb-1">Special Instructions</h4>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{selectedReservation.special_instructions}</p>
                            </div>
                        )}

                        <div className="flex justify-between">
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                            >
                                Close
                            </button>
                            <div className="flex space-x-2">
                                {selectedReservation.status === 'confirmed' && (
                                    <>
                                        <button
                                            onClick={() => {
                                                handleStatusChange(selectedReservation.id, 'completed');
                                                setShowDetailsModal(false);
                                            }}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                        >
                                            Mark Completed
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleStatusChange(selectedReservation.id, 'no-show');
                                                setShowDetailsModal(false);
                                            }}
                                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                                        >
                                            Mark No-Show
                                        </button>
                                    </>
                                )}
                                {selectedReservation.status === 'waitlist' && (
                                    <button
                                        onClick={() => {
                                            handleStatusChange(selectedReservation.id, 'confirmed');
                                            setShowDetailsModal(false);
                                        }}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Confirm Reservation
                                    </button>
                                )}
                                {selectedReservation.status !== 'canceled' && (
                                    <button
                                        onClick={() => {
                                            handleStatusChange(selectedReservation.id, 'canceled');
                                            setShowDetailsModal(false);
                                        }}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add to Waitlist Modal */}
            {showWaitlistModal && (
                <AddToWaitlistModal
                    onClose={() => setShowWaitlistModal(false)}
                    onSuccess={handleWaitlistSuccess}
                />
            )}
        </div>
    );
} 