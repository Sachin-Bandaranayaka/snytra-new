"use client";

import { useState } from 'react';
import { Clock, Calendar, Users, Phone, Mail, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRestaurant } from '@/components/providers/RestaurantProvider';

export default function WaitlistPage() {
    const { restaurant, loading: restaurantLoading } = useRestaurant();
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [partySize, setPartySize] = useState(2);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('');
    const [specialRequests, setSpecialRequests] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<any | null>(null);

    // Get theme colors from restaurant settings
    const primaryColor = restaurant?.primary_color || '#3b82f6';
    const secondaryColor = restaurant?.secondary_color || '#60a5fa';

    // Calculate min and max times (11:00 AM to 10:00 PM)
    const minTime = '11:00';
    const maxTime = '22:00';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!customerName || !customerPhone || !partySize || !date || !time) {
            setError('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/waitlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerName,
                    customerPhone,
                    customerEmail: customerEmail || null,
                    partySize,
                    date,
                    time,
                    specialRequests: specialRequests || null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to add to waitlist');
            }

            setSuccess(data);

            // Reset form after successful submission
            setCustomerName('');
            setCustomerPhone('');
            setCustomerEmail('');
            setPartySize(2);
            setSpecialRequests('');
        } catch (error: any) {
            setError(error.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (restaurantLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: `${primaryColor} transparent transparent transparent` }}></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <Link
                    href="/menu"
                    className="inline-flex items-center hover:underline"
                    style={{ color: primaryColor }}
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Menu
                </Link>
                <h1 className="text-3xl font-bold mt-2">Join Our Waitlist</h1>
                <p className="text-gray-600">
                    Add your name to our waitlist and we'll notify you when your table is ready.
                </p>
            </div>

            {success ? (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="border-l-4 p-6" style={{
                        backgroundColor: `${primaryColor}10`,
                        borderColor: primaryColor
                    }}>
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <CheckCircle className="h-6 w-6" style={{ color: primaryColor }} />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold" style={{ color: primaryColor }}>Added to waitlist!</h3>
                                <p className="mt-2" style={{ color: `${primaryColor}DD` }}>
                                    Thanks for joining our waitlist. We'll notify you when your table is ready.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Waitlist Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 mt-1">
                                        <Users className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-gray-500">Party Size</div>
                                        <div className="font-medium mt-1">{success.waitlistEntry.partySize} {success.waitlistEntry.partySize === 1 ? 'person' : 'people'}</div>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 mt-1">
                                        <Calendar className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-gray-500">Date & Time</div>
                                        <div className="font-medium mt-1">
                                            {new Date(success.waitlistEntry.date).toLocaleDateString(undefined, {
                                                weekday: 'short',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })} at {success.waitlistEntry.time}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 mt-1">
                                        <Clock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-gray-500">Estimated Wait Time</div>
                                        <div className="font-medium mt-1">
                                            {success.estimatedWaitTime} minutes
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 mt-1">
                                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full text-white"
                                            style={{ backgroundColor: primaryColor }}>
                                            #
                                        </span>
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-gray-500">Position</div>
                                        <div className="font-medium mt-1">
                                            #{success.position} in line
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setSuccess(null)}
                                className="flex-1 py-2 px-4 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                                style={{
                                    backgroundColor: primaryColor,
                                    "--tw-ring-color": primaryColor
                                } as React.CSSProperties}
                            >
                                Add Another Person
                            </button>
                            <Link
                                href="/menu"
                                className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-md text-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Return to Menu
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <XCircle className="h-5 w-5 text-red-500" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        There was an error with your submission
                                    </h3>
                                    <div className="mt-1 text-sm text-red-700">
                                        <p>{error}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 sm:text-sm"
                                    style={{
                                        "--tw-ring-color": primaryColor,
                                        borderColor: customerName ? "rgb(209, 213, 219)" : primaryColor
                                    } as React.CSSProperties}
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                    Phone Number *
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        id="phone"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        className="block w-full pl-10 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 sm:text-sm"
                                        style={{
                                            "--tw-ring-color": primaryColor,
                                            borderColor: customerPhone ? "rgb(209, 213, 219)" : primaryColor
                                        } as React.CSSProperties}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email (Optional)
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        id="email"
                                        value={customerEmail}
                                        onChange={(e) => setCustomerEmail(e.target.value)}
                                        className="block w-full pl-10 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 sm:text-sm"
                                        style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="partySize" className="block text-sm font-medium text-gray-700">
                                    Party Size *
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Users className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <select
                                        id="partySize"
                                        value={partySize}
                                        onChange={(e) => setPartySize(Number(e.target.value))}
                                        className="block w-full pl-10 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 sm:text-sm"
                                        style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
                                        required
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((size) => (
                                            <option key={size} value={size}>
                                                {size} {size === 1 ? 'person' : 'people'}
                                            </option>
                                        ))}
                                        <option value={15}>15+ people (large party)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                                    Date *
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="date"
                                        id="date"
                                        value={date}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="block w-full pl-10 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 sm:text-sm"
                                        style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                                    Time *
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="time"
                                        id="time"
                                        value={time}
                                        min={minTime}
                                        max={maxTime}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="block w-full pl-10 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 sm:text-sm"
                                        style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
                                        required
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Operating hours: 11:00 AM - 10:00 PM
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700">
                                    Special Requests (Optional)
                                </label>
                                <textarea
                                    id="specialRequests"
                                    value={specialRequests}
                                    onChange={(e) => setSpecialRequests(e.target.value)}
                                    rows={3}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-1 sm:text-sm"
                                    style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
                                    placeholder="Any special requests or accommodations?"
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70"
                                style={{
                                    backgroundColor: isSubmitting ? `${primaryColor}80` : primaryColor,
                                    "--tw-ring-color": primaryColor
                                } as React.CSSProperties}
                            >
                                {isSubmitting ? 'Processing...' : 'Join Waitlist'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="mt-6 text-center">
                <Link
                    href="/menu/waitlist/check"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                    Check Waitlist Status
                </Link>
            </div>
        </div>
    );
} 