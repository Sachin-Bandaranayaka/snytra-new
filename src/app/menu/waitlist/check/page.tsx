"use client";

import { useState } from 'react';
import { Phone, Check, Clock, Calendar, Users, ArrowLeft, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useRestaurant } from '@/components/providers/RestaurantProvider';

interface WaitlistEntry {
    id: number;
    customerName: string;
    partySize: number;
    date: string;
    time: string;
    estimatedWaitTime: number;
    position: number;
    createdAt: string;
}

export default function CheckWaitlistPage() {
    const { restaurant, loading: restaurantLoading } = useRestaurant();
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [entries, setEntries] = useState<WaitlistEntry[] | null>(null);
    const [searched, setSearched] = useState(false);

    // Get theme colors from restaurant settings
    const primaryColor = restaurant?.primary_color || '#3b82f6';
    const secondaryColor = restaurant?.secondary_color || '#60a5fa';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!phone) {
            setError('Please enter your phone number');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`/api/waitlist/check?phone=${encodeURIComponent(phone)}`);
            const data = await response.json();

            setSearched(true);

            if (response.status === 404) {
                setEntries(null);
                setError('No waitlist entries found for this phone number');
                return;
            }

            if (!response.ok) {
                throw new Error(data.error || 'Failed to check waitlist status');
            }

            setEntries(data.entries);
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
                    href="/menu/waitlist"
                    className="inline-flex items-center hover:underline"
                    style={{ color: primaryColor }}
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Waitlist
                </Link>
                <h1 className="text-3xl font-bold mt-2">Check Waitlist Status</h1>
                <p className="text-gray-600">
                    Enter the phone number you used to join the waitlist to check your current position.
                </p>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="(123) 456-7890"
                                    className="block w-full pl-10 py-3 pr-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1"
                                    style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70"
                                style={{
                                    backgroundColor: isSubmitting ? `${primaryColor}80` : primaryColor,
                                    "--tw-ring-color": primaryColor
                                } as React.CSSProperties}
                            >
                                {isSubmitting ? (
                                    <span className="inline-flex items-center">
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                        Checking...
                                    </span>
                                ) : (
                                    'Check Status'
                                )}
                            </button>
                        </div>
                    </form>

                    {error && (
                        <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <span className="text-red-400">
                                        ⚠️
                                    </span>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {searched && !error && entries && entries.length > 0 && (
                        <div className="mt-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Waitlist Status</h2>

                            <div className="space-y-6">
                                {entries.map(entry => (
                                    <div key={entry.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="px-4 py-2 border-b"
                                            style={{
                                                backgroundColor: `${primaryColor}10`,
                                                borderColor: `${primaryColor}30`
                                            }}>
                                            <div className="flex justify-between items-center">
                                                <h3 className="font-medium" style={{ color: primaryColor }}>
                                                    Party of {entry.partySize}
                                                </h3>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                                                    style={{ backgroundColor: primaryColor }}>
                                                    Position #{entry.position}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="flex items-start">
                                                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                                                    <div className="ml-3">
                                                        <p className="text-xs text-gray-500">Estimated Wait</p>
                                                        <p className="font-medium">{entry.estimatedWaitTime} minutes</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start">
                                                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                                    <div className="ml-3">
                                                        <p className="text-xs text-gray-500">Requested Time</p>
                                                        <p className="font-medium">{entry.time}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start">
                                                    <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                                                    <div className="ml-3">
                                                        <p className="text-xs text-gray-500">Party Size</p>
                                                        <p className="font-medium">{entry.partySize} {entry.partySize === 1 ? 'person' : 'people'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                                                <p>Added to waitlist {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}</p>
                                                <p className="mt-2">We'll notify you when your table is ready. You can also check with the host for updates.</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {searched && !error && (!entries || entries.length === 0) && (
                        <div className="mt-6 border-l-4 p-4" style={{
                            backgroundColor: `${primaryColor}10`,
                            borderColor: primaryColor
                        }}>
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <span style={{ color: primaryColor }}>
                                        ℹ️
                                    </span>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm" style={{ color: `${primaryColor}DD` }}>
                                        No active waitlist entries were found for this phone number.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 text-center">
                <Link
                    href="/menu/waitlist"
                    className="inline-flex items-center hover:underline font-medium"
                    style={{ color: primaryColor }}
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Join the Waitlist
                </Link>
            </div>
        </div>
    );
} 