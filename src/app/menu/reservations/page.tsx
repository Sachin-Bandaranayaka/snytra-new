"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Users, Check } from 'lucide-react';
import { useRestaurant } from '@/components/providers/RestaurantProvider';

function ReservationLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}

function ReservationContent() {
    const searchParams = useSearchParams();
    const tableId = searchParams.get('table');
    const { restaurant, loading: restaurantLoading, error: restaurantError } = useRestaurant();

    // Get theme colors from restaurant settings
    const primaryColor = restaurant?.primary_color || '#3b82f6';
    const secondaryColor = restaurant?.secondary_color || '#60a5fa';

    const [date, setDate] = useState<string>('');
    const [time, setTime] = useState<string>('');
    const [guests, setGuests] = useState<number>(2);
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [specialRequests, setSpecialRequests] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [availableTables, setAvailableTables] = useState<any[]>([]);
    const [selectedTable, setSelectedTable] = useState<number | null>(tableId ? parseInt(tableId) : null);
    const [showTableSelector, setShowTableSelector] = useState<boolean>(false);

    // Generate available times (12:00 PM to 9:00 PM in 30-minute intervals) in the exact format shown in the reference
    useEffect(() => {
        const times = [];
        // Create times: 12:00, 12:30, 1:00, 1:30, etc. up to 9:00 PM
        const hoursList = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        const minutesList = ['00', '30'];

        for (const hour of hoursList) {
            for (const minute of minutesList) {
                // Skip 9:30 PM
                if (hour === 9 && minute === '30') continue;

                times.push(`${hour}:${minute}\nPM`);
            }
        }

        setAvailableTimes(times);
        // Default to the first available time
        if (times.length > 0 && !time) {
            setTime(times[0]);
        }
    }, [time]);

    // Set current date as default
    useEffect(() => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        setDate(`${yyyy}-${mm}-${dd}`);
    }, []);

    // Fetch available tables when date and time change
    useEffect(() => {
        if (date && time) {
            fetchAvailableTables();
        }
    }, [date, time, guests]);

    const fetchAvailableTables = async () => {
        if (!date || !time) return;

        try {
            // Parse the time to convert from "12:00\nPM" format to 24-hour format for the API
            let displayTime = time.replace('\n', ' ');
            const [timePart, periodPart] = displayTime.split(' ');
            const [hours, minutes] = timePart.split(':');
            let hour24 = parseInt(hours);

            if (periodPart === 'PM' && hour24 < 12) {
                hour24 += 12;
            } else if (periodPart === 'AM' && hour24 === 12) {
                hour24 = 0;
            }

            const formattedTime = `${hour24.toString().padStart(2, '0')}:${minutes}`;

            const response = await fetch(`/api/reservations/available-tables?date=${date}&time=${formattedTime}&party_size=${guests}`);

            if (!response.ok) {
                throw new Error('Failed to fetch available tables');
            }

            const data = await response.json();
            console.log('Available tables:', data);

            if (data.success) {
                setAvailableTables(data.tables || []);
                setShowTableSelector(true);
            }
        } catch (err) {
            console.error('Error fetching available tables:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Add debug logging to see what values are missing
        console.log({
            date,
            time,
            guests,
            name,
            email,
            phone,
            specialRequests,
            selectedTable
        });

        if (!date) {
            setError('Please select a date');
            return;
        }

        if (!time) {
            setError('Please select a time');
            return;
        }

        if (!name) {
            setError('Please enter your name');
            return;
        }

        if (!email) {
            setError('Please enter your email');
            return;
        }

        if (!phone) {
            setError('Please enter your phone number');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Parse the time to convert from "12:00\nPM" format to "12:00 PM"
            let displayTime = time.replace('\n', ' ');

            // Convert from "12:00 PM" format to 24-hour format for the API
            const [timePart, periodPart] = displayTime.split(' ');
            const [hours, minutes] = timePart.split(':');
            let hour24 = parseInt(hours);

            if (periodPart === 'PM' && hour24 < 12) {
                hour24 += 12;
            } else if (periodPart === 'AM' && hour24 === 12) {
                hour24 = 0;
            }

            const formattedTime = `${hour24.toString().padStart(2, '0')}:${minutes}`;

            // Combine date and time
            const reservationDateTime = `${date}T${formattedTime}:00`;
            console.log('Submitting reservation with:', { reservationDateTime, selectedTable });

            const response = await fetch('/api/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerName: name,
                    customerEmail: email,
                    customerPhone: phone,
                    partySize: guests,
                    date,
                    time: formattedTime,
                    specialRequests,
                    tableId: selectedTable || tableId || null
                }),
            });

            const data = await response.json();
            console.log('API response:', data);

            if (response.ok) {
                setSuccess(true);
                // Store QR code URL if provided
                if (data.table_qr_code) {
                    setQrCodeUrl(data.table_qr_code);
                }
                // Reset form
                setGuests(2);
                setName('');
                setEmail('');
                setPhone('');
                setSpecialRequests('');
                setSelectedTable(null);
            } else {
                throw new Error(data.error || 'Failed to create reservation');
            }
        } catch (err: any) {
            console.error('Error creating reservation:', err);
            setError(err.message || 'An error occurred while creating your reservation');
        } finally {
            setLoading(false);
        }
    };

    if (loading || restaurantLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: primaryColor }}></div>
            </div>
        );
    }

    if (restaurantError) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2"
                        style={{ color: primaryColor }}>Error</h2>
                    <p className="text-gray-700 mb-4">{restaurantError}</p>
                    <p className="text-gray-500">Please try again or contact the restaurant.</p>
                </div>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-charcoal mb-2">Restaurant Not Found</h2>
                    <p className="text-darkGray">The restaurant information could not be loaded.</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen max-w-4xl mx-auto p-4 md:p-8">
                <div className="bg-white rounded-lg shadow-md p-6 md:p-8 text-center">
                    <div className="mx-auto w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
                        <Check className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4"
                        style={{ color: primaryColor }}>
                        Reservation Confirmed!
                    </h2>
                    <p className="text-gray-700 text-lg mb-6">
                        Thank you for your reservation. We look forward to serving you!
                    </p>

                    {qrCodeUrl && (
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-3">Your Table QR Code</h3>
                            <div className="mx-auto mb-3 max-w-[200px]">
                                <img src={qrCodeUrl} alt="Table QR Code" className="w-full" />
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Please save this QR code or take a screenshot. You'll need to scan this when you arrive at the restaurant.
                            </p>
                            <div className="mb-6">
                                <a
                                    href={qrCodeUrl}
                                    download="your_table_qr_code.png"
                                    className="inline-block px-6 py-2 rounded-md text-white"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    Download QR Code
                                </a>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
                        <Link
                            href="/menu"
                            className="px-6 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors"
                        >
                            View Menu
                        </Link>
                        <button
                            onClick={() => { setSuccess(false); setQrCodeUrl(null); }}
                            className="px-6 py-2 rounded-md text-white"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Make Another Reservation
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#f9f5ed]">
            {/* Header */}
            <header className="sticky top-0 z-10 p-4 text-white shadow-md bg-black">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center">
                        <Link href={`/menu${tableId ? `?table=${tableId}` : ''}`} className="flex items-center">
                            <ArrowLeft className="h-6 w-6 mr-2" />
                            <h1 className="text-xl font-bold">Reservations</h1>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link href={`/menu/browse${tableId ? `?table=${tableId}` : ''}`} className="text-white hover:text-white/80">
                            Browse Menu
                        </Link>
                        <Link href={`/menu/orders/track${tableId ? `?table=${tableId}` : ''}`} className="text-white hover:text-white/80">
                            Track Orders
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm">
                        <h2 className="text-2xl font-bold mb-6 text-center">Make a Reservation</h2>

                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                                <div className="flex">
                                    <div className="ml-0">
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <Calendar className="w-4 h-4 inline mr-1" />
                                        Date <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                                            style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
                                            required
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <Calendar className="h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <Clock className="w-4 h-4 inline mr-1" />
                                        Time <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {availableTimes.map((t) => {
                                            const [timePart, periodPart] = t.split('\n');
                                            return (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    onClick={() => setTime(t)}
                                                    className={`px-1 py-2 text-sm border ${time === t
                                                        ? 'text-white'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                        } rounded-md flex flex-col items-center justify-center`}
                                                    style={time === t ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                                                >
                                                    <span>{timePart}</span>
                                                    <span>{periodPart}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Users className="w-4 h-4 inline mr-1" />
                                    Number of Guests <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-5 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setGuests(2)}
                                        className={`px-1 py-2 text-sm border ${guests === 2
                                            ? 'text-white'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            } rounded-md text-center`}
                                        style={guests === 2 ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                                    >
                                        2 Guests
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setGuests(4)}
                                        className={`px-1 py-2 text-sm border ${guests === 4
                                            ? 'text-white'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            } rounded-md text-center`}
                                        style={guests === 4 ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                                    >
                                        4 Guests
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setGuests(6)}
                                        className={`px-1 py-2 text-sm border ${guests === 6
                                            ? 'text-white'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            } rounded-md text-center`}
                                        style={guests === 6 ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                                    >
                                        6 Guests
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setGuests(8)}
                                        className={`px-1 py-2 text-sm border ${guests === 8
                                            ? 'text-white'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            } rounded-md text-center`}
                                        style={guests === 8 ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                                    >
                                        8 Guests
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setGuests(12)}
                                        className={`px-1 py-2 text-sm border ${guests === 12
                                            ? 'text-white'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            } rounded-md text-center`}
                                        style={guests === 12 ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                                    >
                                        8+
                                    </button>
                                </div>
                            </div>

                            {/* Table selection section */}
                            {showTableSelector && availableTables.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">Available Tables</h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Select a table for your reservation:
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {availableTables.map(table => (
                                            <div
                                                key={`table-${table.id}`}
                                                onClick={() => setSelectedTable(table.id)}
                                                className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedTable === table.id
                                                    ? 'ring-2'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                style={selectedTable === table.id ? { borderColor: primaryColor, "--tw-ring-color": primaryColor } as React.CSSProperties : {}}
                                            >
                                                <div className="flex items-center mb-2">
                                                    <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${selectedTable === table.id ? 'text-white' : 'bg-gray-100'
                                                        }`}
                                                        style={selectedTable === table.id ? { backgroundColor: primaryColor } : {}}>
                                                        <span className="text-lg font-bold">{table.table_number}</span>
                                                    </div>
                                                    <div className="ml-4">
                                                        <h4 className="font-medium">Table {table.table_number}</h4>
                                                        <p className="text-sm text-gray-500">{table.seats} seats</p>
                                                        {table.is_smoking && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                                Smoking Area
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="w-full h-24 bg-gray-50 rounded flex items-center justify-center mb-2">
                                                    <div className="relative w-20 h-20 bg-white border-2 border-gray-300 rounded-md flex items-center justify-center">
                                                        {Array.from({ length: Math.min(table.seats, 6) }).map((_, i) => (
                                                            <div
                                                                key={`table-${table.id}-seat-${i}`}
                                                                className="absolute w-4 h-4 bg-gray-500 rounded-full"
                                                                style={{
                                                                    top: i % 2 === 0 ? '15%' : '75%',
                                                                    left: ((i % 3) * 33 + 16) + '%'
                                                                }}
                                                            ></div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {showTableSelector && availableTables.length === 0 && (
                                <div className="mt-6 p-4 border border-yellow-300 bg-yellow-50 rounded-md">
                                    <p className="text-yellow-800">
                                        No tables available for the selected time and party size.
                                        Please try a different time or reduce the party size.
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Your Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                                    style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                                    style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                                    style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Special Requests
                                </label>
                                <textarea
                                    value={specialRequests}
                                    onChange={(e) => setSpecialRequests(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                                    style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
                                    placeholder="Allergies, accessibility needs, special occasions, etc."
                                ></textarea>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 text-white font-medium rounded-md hover:opacity-90 transition-colors"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {loading ? (
                                        <>
                                            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2 align-[-0.125em]"></span>
                                            Processing...
                                        </>
                                    ) : (
                                        <>Make Reservation</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ReservationsPage() {
    return (
        <Suspense fallback={<ReservationLoading />}>
            <ReservationContent />
        </Suspense>
    );
} 