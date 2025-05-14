"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/StackAdminAuth';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Plus,
    X,
    AlertCircle,
    Save,
    Trash,
    RefreshCw,
    Clock,
    User
} from 'lucide-react';
import Link from 'next/link';

// Define types
interface StaffMember {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Shift {
    id: number;
    staffId: number;
    staffName: string;
    role: string;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string;
}

export default function StaffSchedulePage() {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();

    const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // State for current week
    const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
    const [weekDates, setWeekDates] = useState<Date[]>([]);

    // State for adding/editing shifts
    const [showShiftModal, setShowShiftModal] = useState(false);
    const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Form state for new shift
    const [formData, setFormData] = useState({
        staffId: '',
        date: '',
        startTime: '09:00',
        endTime: '17:00',
        notes: ''
    });

    // Initialize week dates when currentWeek changes
    useEffect(() => {
        const dates = getWeekDates(currentWeek);
        setWeekDates(dates);
    }, [currentWeek]);

    // Check authentication
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

    // Fetch data when authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            fetchStaffMembers();
            fetchShifts();
        }
    }, [user, isAuthenticated, weekDates]);

    // Get array of dates for the week containing the provided date
    const getWeekDates = (date: Date): Date[] => {
        const day = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday

        const monday = new Date(date);
        monday.setDate(diff);
        monday.setHours(0, 0, 0, 0);

        const dates: Date[] = [];
        for (let i = 0; i < 7; i++) {
            const nextDate = new Date(monday);
            nextDate.setDate(monday.getDate() + i);
            dates.push(nextDate);
        }

        return dates;
    };

    // Format date to YYYY-MM-DD
    const formatDate = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    // Format date for display
    const formatDateDisplay = (date: Date): string => {
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    // Navigate to previous week
    const goToPreviousWeek = () => {
        const prevWeek = new Date(currentWeek);
        prevWeek.setDate(prevWeek.getDate() - 7);
        setCurrentWeek(prevWeek);
    };

    // Navigate to next week
    const goToNextWeek = () => {
        const nextWeek = new Date(currentWeek);
        nextWeek.setDate(nextWeek.getDate() + 7);
        setCurrentWeek(nextWeek);
    };

    // Go to today's week
    const goToToday = () => {
        setCurrentWeek(new Date());
    };

    // Fetch staff members
    const fetchStaffMembers = async () => {
        try {
            const response = await fetch('/api/dashboard/staff');

            if (!response.ok) {
                throw new Error('Failed to fetch staff members');
            }

            const data = await response.json();
            setStaffMembers(data.staff);
        } catch (err: any) {
            console.error('Error fetching staff members:', err);
            setError(err.message || 'Failed to load staff data');
        }
    };

    // Fetch shifts for the current week
    const fetchShifts = async () => {
        if (weekDates.length === 0) return;

        try {
            setIsLoading(true);

            const startDate = formatDate(weekDates[0]);
            const endDate = formatDate(weekDates[6]);

            const response = await fetch(`/api/dashboard/staff/shifts?startDate=${startDate}&endDate=${endDate}`);

            if (!response.ok) {
                throw new Error('Failed to fetch shifts');
            }

            const data = await response.json();
            setShifts(data.shifts);
        } catch (err: any) {
            console.error('Error fetching shifts:', err);
            setError(err.message || 'Failed to load schedule data');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle adding a new shift
    const handleAddShift = (date: Date) => {
        setSelectedDate(date);
        setSelectedShift(null);
        setFormData({
            staffId: '',
            date: formatDate(date),
            startTime: '09:00',
            endTime: '17:00',
            notes: ''
        });
        setShowShiftModal(true);
    };

    // Handle editing a shift
    const handleEditShift = (shift: Shift) => {
        setSelectedShift(shift);
        setFormData({
            staffId: shift.staffId.toString(),
            date: shift.date,
            startTime: shift.startTime,
            endTime: shift.endTime,
            notes: shift.notes || ''
        });
        setShowShiftModal(true);
    };

    // Handle deleting a shift
    const handleDeleteShift = async (shiftId: number) => {
        if (!confirm('Are you sure you want to delete this shift?')) {
            return;
        }

        try {
            const response = await fetch(`/api/dashboard/staff/shifts/${shiftId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete shift');
            }

            // Remove shift from state
            setShifts(prevShifts => prevShifts.filter(shift => shift.id !== shiftId));

            setSuccessMessage('Shift deleted successfully');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            console.error('Error deleting shift:', err);
            setError(err.message || 'Failed to delete shift');
        }
    };

    // Handle form input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.staffId) {
            setError('Please select a staff member');
            return;
        }

        try {
            const shiftData = {
                staffId: parseInt(formData.staffId),
                date: formData.date,
                startTime: formData.startTime,
                endTime: formData.endTime,
                notes: formData.notes
            };

            const url = selectedShift
                ? `/api/dashboard/staff/shifts/${selectedShift.id}`
                : '/api/dashboard/staff/shifts';

            const method = selectedShift ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(shiftData)
            });

            if (!response.ok) {
                throw new Error(selectedShift ? 'Failed to update shift' : 'Failed to create shift');
            }

            const data = await response.json();

            // Update shifts in state
            if (selectedShift) {
                setShifts(prevShifts =>
                    prevShifts.map(shift =>
                        shift.id === selectedShift.id ? data.shift : shift
                    )
                );
                setSuccessMessage('Shift updated successfully');
            } else {
                setShifts(prevShifts => [...prevShifts, data.shift]);
                setSuccessMessage('Shift created successfully');
            }

            // Close modal and reset form
            setShowShiftModal(false);
            setSelectedShift(null);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            console.error('Error saving shift:', err);
            setError(err.message || 'Failed to save shift');
        }
    };

    // Get shifts for a specific date
    const getShiftsForDate = (date: Date): Shift[] => {
        const dateString = formatDate(date);
        return shifts.filter(shift => shift.date === dateString);
    };

    // Reset error message
    const clearError = () => {
        setError(null);
    };

    if (loading || (isLoading && shifts.length === 0)) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Staff Schedule</h1>
                <div className="flex space-x-2">
                    <Link
                        href="/dashboard/staff"
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
                    >
                        Back to Staff
                    </Link>
                    <button
                        onClick={fetchShifts}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                        title="Refresh schedule"
                    >
                        <RefreshCw className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start">
                    <AlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="font-medium">Error</h3>
                        <p>{error}</p>
                    </div>
                    <button onClick={clearError} className="ml-auto">
                        <X className="h-5 w-5 text-red-500" />
                    </button>
                </div>
            )}

            {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-start">
                    <div className="flex-1">{successMessage}</div>
                    <button onClick={() => setSuccessMessage(null)} className="ml-4">
                        <X className="h-5 w-5 text-green-500" />
                    </button>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm mb-6">
                <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center">
                        <button
                            onClick={goToPreviousWeek}
                            className="p-2 rounded-lg hover:bg-gray-100"
                            title="Previous week"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <h2 className="text-lg font-medium mx-4">
                            {weekDates.length > 0 ? (
                                <>
                                    {formatDateDisplay(weekDates[0])} - {formatDateDisplay(weekDates[6])}
                                </>
                            ) : 'Loading...'}
                        </h2>
                        <button
                            onClick={goToNextWeek}
                            className="p-2 rounded-lg hover:bg-gray-100"
                            title="Next week"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                    <button
                        onClick={goToToday}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center"
                    >
                        <Calendar className="h-4 w-4 mr-2" />
                        Today
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                        <div className="grid grid-cols-7 border-b">
                            {weekDates.map((date, index) => (
                                <div
                                    key={index}
                                    className={`p-3 text-center border-r last:border-r-0 ${date.toDateString() === new Date().toDateString()
                                        ? 'bg-blue-50 font-medium'
                                        : ''
                                        }`}
                                >
                                    <div className="font-medium">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                    <div className="text-sm text-gray-500">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 min-h-[500px]">
                            {weekDates.map((date, index) => (
                                <div
                                    key={index}
                                    className={`p-3 border-r last:border-r-0 ${date.toDateString() === new Date().toDateString()
                                        ? 'bg-blue-50'
                                        : ''
                                        }`}
                                >
                                    <div className="flex justify-end mb-3">
                                        <button
                                            onClick={() => handleAddShift(date)}
                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                            title="Add shift"
                                        >
                                            <Plus className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {getShiftsForDate(date).map(shift => (
                                            <div
                                                key={shift.id}
                                                className="p-2 rounded-lg bg-blue-100 border border-blue-200 text-blue-800 text-sm cursor-pointer hover:bg-blue-200"
                                                onClick={() => handleEditShift(shift)}
                                            >
                                                <div className="font-medium flex items-center">
                                                    <User className="h-3 w-3 mr-1" />
                                                    {shift.staffName}
                                                </div>
                                                <div className="flex items-center mt-1">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {shift.startTime} - {shift.endTime}
                                                </div>
                                                {shift.notes && (
                                                    <div className="mt-1 text-xs text-blue-700">{shift.notes}</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for adding/editing shifts */}
            {showShiftModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">
                                {selectedShift ? 'Edit Shift' : 'Add New Shift'}
                            </h2>
                            <button onClick={() => setShowShiftModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Staff Member</label>
                                <select
                                    name="staffId"
                                    value={formData.staffId}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select a staff member</option>
                                    {staffMembers.map(staff => (
                                        <option key={staff.id} value={staff.id}>
                                            {staff.name} ({staff.role})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">End Time</label>
                                    <input
                                        type="time"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Add any special instructions or notes..."
                                />
                            </div>

                            <div className="flex justify-between">
                                {selectedShift && (
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteShift(selectedShift.id)}
                                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center"
                                    >
                                        <Trash className="h-4 w-4 mr-2" />
                                        Delete
                                    </button>
                                )}

                                <div className={`${selectedShift ? '' : 'ml-auto'} flex space-x-3`}>
                                    <button
                                        type="button"
                                        onClick={() => setShowShiftModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {selectedShift ? 'Update' : 'Save'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
} 