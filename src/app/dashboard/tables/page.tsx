"use client";

import { useState, useEffect } from 'react';
import {
    Plus,
    QrCode,
    Edit,
    Trash2,
    Users,
    Check,
    X,
    Download,
    Printer,
    Coffee,
    Book
} from 'lucide-react';
import Link from 'next/link';

interface Table {
    id: number;
    table_number: string;
    seats: number;
    qr_code_url: string | null;
    is_smoking: boolean;
    status: 'available' | 'occupied' | 'reserved' | 'maintenance';
    restaurant_name?: string;
}

// Mock data for initial UI rendering
const mockTables: Table[] = [
    { id: 1, table_number: '1A', seats: 2, qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://your-restaurant-domain.com/menu?table=1A')}`, is_smoking: false, status: 'available' },
    { id: 2, table_number: '2A', seats: 4, qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://your-restaurant-domain.com/menu?table=2A')}`, is_smoking: false, status: 'occupied' },
    { id: 3, table_number: '3A', seats: 6, qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://your-restaurant-domain.com/menu?table=3A')}`, is_smoking: false, status: 'reserved' },
    { id: 4, table_number: '4A', seats: 2, qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://your-restaurant-domain.com/menu?table=4A')}`, is_smoking: true, status: 'available' },
    { id: 5, table_number: '5A', seats: 8, qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://your-restaurant-domain.com/menu?table=5A')}`, is_smoking: false, status: 'maintenance' },
];

export default function TablesPage() {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddTableModal, setShowAddTableModal] = useState(false);
    const [qrModalTable, setQrModalTable] = useState<Table | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Form state for adding new table
    const [newTable, setNewTable] = useState({
        table_number: '',
        seats: 2,
        is_smoking: false
    });

    // Filter states
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [smokingFilter, setSmokingFilter] = useState<string>('all');

    useEffect(() => {
        // Fetch real data from API
        async function fetchTables() {
            try {
                const response = await fetch('/api/dashboard/tables');
                if (!response.ok) {
                    throw new Error(`Failed to fetch tables: ${response.status}`);
                }
                const data = await response.json();

                if (data.success) {
                    setTables(data.tables);
                } else {
                    throw new Error(data.error || 'Failed to fetch tables');
                }
            } catch (err: any) {
                console.error('Error fetching tables:', err);
                setError(err.message || 'Failed to fetch tables');

                // Fallback to mock data if API fails
                setTables(mockTables);
            } finally {
                setLoading(false);
            }
        }

        fetchTables();
    }, []);

    const handleAddTable = async () => {
        if (!newTable.table_number.trim()) {
            setError('Table number cannot be empty');
            return;
        }

        // Form validation handled on the client side first
        if (!newTable.seats || newTable.seats < 1) {
            setError('Number of seats must be at least 1');
            return;
        }

        try {
            // Call the API to create a new table
            const response = await fetch('/api/dashboard/tables', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    table_number: newTable.table_number,
                    seats: newTable.seats,
                    is_smoking: newTable.is_smoking
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to add table');
            }

            if (data.success) {
                // Add the new table to the state
                setTables([...tables, data.table]);

                // Reset form state
                setNewTable({
                    table_number: '',
                    seats: 2,
                    is_smoking: false
                });

                // Close modal and clear errors
                setShowAddTableModal(false);
                setError(null);
            } else {
                throw new Error(data.error || 'Failed to add table');
            }
        } catch (err: any) {
            console.error('Error adding table:', err);
            setError(err.message || 'An error occurred while adding the table');
        }
    };

    const handleDeleteTable = async (tableId: number) => {
        if (window.confirm('Are you sure you want to delete this table?')) {
            try {
                const response = await fetch(`/api/dashboard/tables?id=${tableId}`, {
                    method: 'DELETE'
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to delete table');
                }

                if (data.success) {
                    // Remove the table from the state
                    setTables(tables.filter(table => table.id !== tableId));
                } else {
                    throw new Error(data.error || 'Failed to delete table');
                }
            } catch (err: any) {
                console.error('Error deleting table:', err);
                setError(err.message || 'An error occurred while deleting the table');
            }
        }
    };

    const filteredTables = tables.filter(table => {
        // Apply status filter
        if (statusFilter !== 'all' && table.status !== statusFilter) {
            return false;
        }

        // Apply smoking filter
        if (smokingFilter === 'smoking' && !table.is_smoking) {
            return false;
        }
        if (smokingFilter === 'non-smoking' && table.is_smoking) {
            return false;
        }

        return true;
    });

    const getStatusBadgeClasses = (status: string) => {
        switch (status) {
            case 'available':
                return 'bg-green-100 text-green-800';
            case 'occupied':
                return 'bg-red-100 text-red-800';
            case 'reserved':
                return 'bg-blue-100 text-blue-800';
            case 'maintenance':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const generateQRCode = async (table: Table) => {
        try {
            // Fetch the restaurant information to get the domain and branding colors
            const response = await fetch('/api/restaurant');
            if (!response.ok) {
                throw new Error('Failed to fetch restaurant information');
            }

            const data = await response.json();
            const restaurant = data.restaurant;

            // Create an absolute URL with the actual domain from Next.js env or fallback
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
            const menuUrl = `${baseUrl}/menu/browse?table=${table.id}&tableNumber=${encodeURIComponent(table.table_number)}`;

            // Generate QR code with restaurant branding colors if available
            const primaryColor = restaurant.primary_color?.replace('#', '') || '000000';

            // Generate a fresh QR code URL with restaurant branding
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(menuUrl)}&color=${primaryColor}&bgcolor=FFFFFF&margin=10`;

            // Update the table with the new QR code URL and restaurant info
            const updatedTable = {
                ...table,
                qr_code_url: qrCodeUrl,
                restaurant_name: restaurant.name
            };

            // Save the QR code URL to the database for this table
            await fetch(`/api/tables/${table.id}/qrcode`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ qr_code_url: qrCodeUrl }),
            });

            setQrModalTable(updatedTable);
        } catch (err) {
            console.error('Error generating QR code:', err);
            // Fallback to basic QR code if API fails
            const baseUrl = window.location.origin;
            const menuUrl = `${baseUrl}/menu/browse?table=${table.id}`;
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(menuUrl)}`;

            const updatedTable = {
                ...table,
                qr_code_url: qrCodeUrl
            };
            setQrModalTable(updatedTable);
        }
    };

    const handleQRCodeDownload = () => {
        if (!qrModalTable) return;

        // Use the stored QR code URL if available, or generate a new one
        const qrCodeUrl = qrModalTable.qr_code_url ||
            `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${window.location.origin}/menu/browse?table=${qrModalTable.id}`)}`;

        // Create a temporary link element
        const a = document.createElement('a');
        a.href = qrCodeUrl;
        a.download = `qrcode-table-${qrModalTable.table_number}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleQRCodePrint = () => {
        if (!qrModalTable) return;

        // Use the stored QR code URL if available, or generate a new one
        const qrCodeUrl = qrModalTable.qr_code_url ||
            `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${window.location.origin}/menu/browse?table=${qrModalTable.id}`)}`;

        // Get the restaurant name from the table or use a default
        const restaurantName = qrModalTable.restaurant_name || 'Our Restaurant';

        // Open a new window with just the QR code image
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>QR Code - Table ${qrModalTable.table_number}</title>
                    <style>
                        body { 
                            display: flex; 
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            padding: 20px;
                            font-family: Arial, sans-serif;
                        }
                        .qr-container {
                            border: 1px solid #ddd;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                            max-width: 350px;
                            text-align: center;
                        }
                        img { max-width: 300px; margin-bottom: 20px; }
                        h2 { margin-bottom: 5px; color: #333; }
                        h3 { margin-top: 0; color: #666; font-weight: normal; }
                        p { font-size: 14px; color: #666; text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="qr-container">
                        <h2>${restaurantName}</h2>
                        <h3>Table ${qrModalTable.table_number}</h3>
                        <img src="${qrCodeUrl}" alt="QR Code" />
                        <p>Scan this QR code to view the menu and place your order.</p>
                    </div>
                </body>
            </html>
        `);

        // Trigger print dialog
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                <h1 className="text-2xl font-bold mb-4 md:mb-0">Table Management</h1>
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                    <Link
                        href="/dashboard/reservations"
                        className="flex items-center justify-center px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                        <Book size={18} className="mr-2" />
                        View Reservations
                    </Link>
                    <button
                        onClick={() => setShowAddTableModal(true)}
                        className="flex items-center justify-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                    >
                        <Plus size={18} className="mr-2" />
                        Add New Table
                    </button>
                </div>
            </div>

            {/* Reservation Info Box */}
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-6 rounded-md">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <Book className="h-5 w-5 text-indigo-500" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-indigo-700">
                            <Link href="/dashboard/reservations" className="font-medium underline">
                                Visit the Reservations page
                            </Link> to see all upcoming reservations. Tables with active reservations will show as "Reserved" here.
                        </p>
                    </div>
                </div>
            </div>

            {/* QR Code Explanation Box */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-md">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <QrCode className="h-5 w-5 text-blue-500" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-700">
                            Each table has a unique QR code that customers can scan to access the menu and place orders.
                            When a customer makes a reservation, they will receive the QR code for their assigned table.
                            Tables with reservations will appear as "Reserved" in the status column.
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                    <div className="md:w-1/3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Filter by Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Tables</option>
                            <option value="available">Available</option>
                            <option value="occupied">Occupied</option>
                            <option value="reserved">Reserved</option>
                            <option value="maintenance">Maintenance</option>
                        </select>
                    </div>

                    <div className="md:w-1/3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Filter by Smoking Area
                        </label>
                        <select
                            value={smokingFilter}
                            onChange={(e) => setSmokingFilter(e.target.value)}
                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Areas</option>
                            <option value="smoking">Smoking</option>
                            <option value="non-smoking">Non-Smoking</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <X className="h-5 w-5 text-red-500" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tables Grid */}
            {filteredTables.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
                    <Coffee size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No tables found</h3>
                    <p className="text-gray-500">
                        {tables.length === 0
                            ? 'Add your first table to get started'
                            : 'No tables match your current filters'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTables.map((table) => (
                        <div key={table.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-4 flex justify-between items-center border-b border-gray-200">
                                <div className="flex items-center">
                                    <span className="font-semibold text-xl text-gray-900">Table {table.table_number}</span>
                                    <span
                                        className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(
                                            table.status
                                        )}`}
                                    >
                                        {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                                    </span>
                                </div>
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => generateQRCode(table)}
                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                                        title="View QR Code"
                                    >
                                        <QrCode size={18} />
                                    </button>
                                    <button
                                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full"
                                        title="Edit table"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTable(table.id)}
                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                                        title="Delete table"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="px-4 py-4">
                                <div className="flex justify-between mb-2">
                                    <div className="flex items-center">
                                        <Users size={18} className="text-gray-500 mr-2" />
                                        <span className="text-gray-700">{table.seats} seats</span>
                                    </div>
                                    <div className="flex items-center">
                                        {table.is_smoking ? (
                                            <span className="text-gray-700 flex items-center">
                                                Smoking <Check size={16} className="ml-1 text-green-600" />
                                            </span>
                                        ) : (
                                            <span className="text-gray-700 flex items-center">
                                                Non-smoking <X size={16} className="ml-1 text-red-600" />
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Table Modal - Completely fixed version */}
            {showAddTableModal && (
                <div className="fixed inset-0 overflow-y-auto z-[9999]">
                    <div
                        className="flex items-center justify-center min-h-screen p-4 text-center sm:block sm:p-0"
                    >
                        {/* Backdrop with click handler */}
                        <div
                            className="fixed inset-0 transition-opacity"
                            onClick={() => setShowAddTableModal(false)}
                            aria-hidden="true"
                        >
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        {/* Modal container */}
                        <div
                            className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 relative z-[10000]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal header */}
                            <div className="absolute top-0 right-0 pt-4 pr-4">
                                <button
                                    type="button"
                                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                                    onClick={() => setShowAddTableModal(false)}
                                >
                                    <span className="sr-only">Close</span>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="sm:flex sm:items-start">
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        Add New Table
                                    </h3>

                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        handleAddTable();
                                    }} className="mt-4 space-y-4">
                                        <div>
                                            <label htmlFor="table-number" className="block text-sm font-medium text-gray-700">
                                                Table Number
                                            </label>
                                            <input
                                                type="text"
                                                name="table-number"
                                                id="table-number"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                value={newTable.table_number}
                                                onChange={(e) => setNewTable({ ...newTable, table_number: e.target.value })}
                                                placeholder="e.g. 1A, 2B, etc."
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="seats" className="block text-sm font-medium text-gray-700">
                                                Number of Seats
                                            </label>
                                            <input
                                                type="number"
                                                name="seats"
                                                id="seats"
                                                min="1"
                                                max="20"
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                value={newTable.seats}
                                                onChange={(e) => setNewTable({ ...newTable, seats: parseInt(e.target.value) })}
                                                required
                                            />
                                        </div>

                                        <div className="flex items-center mt-3">
                                            <input
                                                id="is-smoking"
                                                name="is-smoking"
                                                type="checkbox"
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                checked={newTable.is_smoking}
                                                onChange={(e) => setNewTable({ ...newTable, is_smoking: e.target.checked })}
                                            />
                                            <label htmlFor="is-smoking" className="ml-2 block text-sm text-gray-900">
                                                Smoking Area
                                            </label>
                                        </div>

                                        <div className="mt-6 flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
                                                onClick={() => setShowAddTableModal(false)}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none"
                                            >
                                                Add Table
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* QR Code Modal - Update to match fixed pattern */}
            {qrModalTable && (
                <div className="fixed inset-0 overflow-y-auto z-[9999]">
                    <div
                        className="flex items-center justify-center min-h-screen p-4 text-center sm:block sm:p-0"
                    >
                        {/* Backdrop with click handler */}
                        <div
                            className="fixed inset-0 transition-opacity"
                            onClick={() => setQrModalTable(null)}
                            aria-hidden="true"
                        >
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        {/* Modal container */}
                        <div
                            className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 relative z-[10000]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal header */}
                            <div className="absolute top-0 right-0 pt-4 pr-4">
                                <button
                                    type="button"
                                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                                    onClick={() => setQrModalTable(null)}
                                >
                                    <span className="sr-only">Close</span>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="sm:flex sm:items-start">
                                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        QR Code for Table {qrModalTable.table_number}
                                    </h3>

                                    <div className="mt-4 flex flex-col items-center">
                                        {qrModalTable.qr_code_url ? (
                                            <>
                                                {/* Force re-fetch of QR code with unique URL to avoid caching issues */}
                                                <img
                                                    src={qrModalTable.qr_code_url}
                                                    alt={`QR Code for Table ${qrModalTable.table_number}`}
                                                    className="w-64 h-64 mb-4"
                                                />
                                                <p className="text-sm text-gray-500 mb-6">
                                                    Scan this QR code to access the table's menu and ordering system.
                                                </p>
                                                <div className="flex space-x-4">
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                                        onClick={handleQRCodeDownload}
                                                    >
                                                        <Download size={16} className="mr-2" />
                                                        Download
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                                        onClick={handleQRCodePrint}
                                                    >
                                                        <Printer size={16} className="mr-2" />
                                                        Print
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-gray-500">No QR code available for this table.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 