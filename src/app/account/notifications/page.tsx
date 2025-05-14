"use client";

import { useState, useEffect } from 'react';
import { ArrowLeft, Bell, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import NotificationPreferences, { UserNotificationPreferences } from '@/components/NotificationPreferences';

export default function NotificationPreferencesPage() {
    const [preferences, setPreferences] = useState<UserNotificationPreferences | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch user notification preferences
    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch('/api/user/notification-preferences');

                if (!response.ok) {
                    throw new Error('Failed to fetch notification preferences');
                }

                const data = await response.json();
                setPreferences(data.preferences);
            } catch (error: any) {
                console.error('Error fetching preferences:', error);
                setError(error.message || 'Failed to load notification preferences');
            } finally {
                setLoading(false);
            }
        };

        fetchPreferences();
    }, []);

    // Save notification preferences
    const handleSavePreferences = async (newPreferences: UserNotificationPreferences) => {
        try {
            const response = await fetch('/api/user/notification-preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ preferences: newPreferences })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to save preferences');
            }

            // Update the local state with the new preferences
            setPreferences(newPreferences);
            return Promise.resolve();
        } catch (error: any) {
            console.error('Error saving preferences:', error);
            return Promise.reject(error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <Link
                    href="/account"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Account
                </Link>
                <h1 className="text-3xl font-bold mt-2">Notification Preferences</h1>
                <p className="text-gray-600 mt-1">
                    Manage how you receive notifications from us
                </p>
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
            {loading ? (
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/4 mt-6"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                </div>
            ) : (
                preferences && (
                    <NotificationPreferences
                        initialPreferences={preferences}
                        onSave={handleSavePreferences}
                    />
                )
            )}

            <div className="mt-8 space-y-6">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">About Notifications</h3>
                    </div>
                    <div className="px-6 py-4">
                        <div className="space-y-4 text-sm text-gray-600">
                            <p>
                                We send notifications to keep you updated about your orders, reservations,
                                and when your table is ready if you've joined our waitlist.
                            </p>
                            <p>
                                <strong>Email notifications</strong> will be sent to the email address associated with your account.
                            </p>
                            <p>
                                <strong>SMS and WhatsApp notifications</strong> will be sent to the phone number you provide
                                when placing an order, making a reservation, or joining the waitlist.
                            </p>
                            <p>
                                You can change your notification preferences at any time. Please note that some
                                critical notifications may still be sent for important updates about your account or orders.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
