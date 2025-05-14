"use client";

import { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Check, Loader2, AlertCircle } from 'lucide-react';

interface NotificationPreferencesProps {
    userId?: string;
    initialPreferences?: UserNotificationPreferences;
    onSave?: (preferences: UserNotificationPreferences) => Promise<void>;
}

export interface UserNotificationPreferences {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
    notifications: {
        order_updates: boolean;
        reservation_updates: boolean;
        waitlist_notifications: boolean;
        promotional: boolean;
    };
}

export default function NotificationPreferences({
    userId,
    initialPreferences,
    onSave
}: NotificationPreferencesProps) {
    const defaultPreferences: UserNotificationPreferences = {
        email: true,
        sms: false,
        whatsapp: false,
        notifications: {
            order_updates: true,
            reservation_updates: true,
            waitlist_notifications: true,
            promotional: false
        }
    };

    const [preferences, setPreferences] = useState<UserNotificationPreferences>(
        initialPreferences || defaultPreferences
    );
    const [loading, setLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Handle channel preference change
    const handleChannelChange = (channel: keyof Omit<UserNotificationPreferences, 'notifications'>) => {
        setPreferences(prev => ({
            ...prev,
            [channel]: !prev[channel]
        }));
        setSaveStatus('idle');
    };

    // Handle notification type preference change
    const handleNotificationTypeChange = (type: keyof UserNotificationPreferences['notifications']) => {
        setPreferences(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [type]: !prev.notifications[type]
            }
        }));
        setSaveStatus('idle');
    };

    // Save preferences
    const handleSave = async () => {
        if (!onSave) return;

        setLoading(true);
        setSaveStatus('idle');
        setErrorMessage(null);

        try {
            await onSave(preferences);
            setSaveStatus('success');
            setTimeout(() => {
                setSaveStatus('idle');
            }, 3000);
        } catch (error) {
            console.error('Failed to save preferences:', error);
            setSaveStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'Failed to save preferences');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
                <p className="mt-1 text-sm text-gray-600">
                    Choose how you want to receive notifications from us
                </p>
            </div>

            <div className="px-6 py-4">
                <div className="space-y-6">
                    {/* Notification Channels */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Notification Channels</h4>
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <button
                                    type="button"
                                    onClick={() => handleChannelChange('email')}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${preferences.email ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${preferences.email ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                                <div className="ml-3 flex items-center">
                                    <Mail className="h-5 w-5 text-gray-400 mr-2" />
                                    <span className="text-sm font-medium text-gray-900">Email Notifications</span>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <button
                                    type="button"
                                    onClick={() => handleChannelChange('sms')}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${preferences.sms ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${preferences.sms ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                                <div className="ml-3 flex items-center">
                                    <MessageSquare className="h-5 w-5 text-gray-400 mr-2" />
                                    <span className="text-sm font-medium text-gray-900">SMS Notifications</span>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <button
                                    type="button"
                                    onClick={() => handleChannelChange('whatsapp')}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${preferences.whatsapp ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${preferences.whatsapp ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                                <div className="ml-3 flex items-center">
                                    <MessageSquare className="h-5 w-5 text-green-500 mr-2" />
                                    <span className="text-sm font-medium text-gray-900">WhatsApp Notifications</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notification Types */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Notification Types</h4>
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <button
                                    type="button"
                                    onClick={() => handleNotificationTypeChange('order_updates')}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${preferences.notifications.order_updates ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${preferences.notifications.order_updates ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                                <div className="ml-3">
                                    <span className="text-sm font-medium text-gray-900">Order Updates</span>
                                    <p className="text-xs text-gray-500">Get notified about your order status</p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <button
                                    type="button"
                                    onClick={() => handleNotificationTypeChange('reservation_updates')}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${preferences.notifications.reservation_updates ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${preferences.notifications.reservation_updates ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                                <div className="ml-3">
                                    <span className="text-sm font-medium text-gray-900">Reservation Updates</span>
                                    <p className="text-xs text-gray-500">Get notified about your reservations</p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <button
                                    type="button"
                                    onClick={() => handleNotificationTypeChange('waitlist_notifications')}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${preferences.notifications.waitlist_notifications ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${preferences.notifications.waitlist_notifications ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                                <div className="ml-3">
                                    <span className="text-sm font-medium text-gray-900">Waitlist Notifications</span>
                                    <p className="text-xs text-gray-500">Get notified when your table is ready</p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <button
                                    type="button"
                                    onClick={() => handleNotificationTypeChange('promotional')}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${preferences.notifications.promotional ? 'bg-blue-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span
                                        className={`translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${preferences.notifications.promotional ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                                <div className="ml-3">
                                    <span className="text-sm font-medium text-gray-900">Promotional Messages</span>
                                    <p className="text-xs text-gray-500">Get special offers and promotions</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {onSave && (
                <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                    {saveStatus === 'success' && (
                        <div className="flex items-center text-green-600 text-sm">
                            <Check className="h-4 w-4 mr-1" />
                            Preferences saved successfully
                        </div>
                    )}

                    {saveStatus === 'error' && (
                        <div className="flex items-center text-red-600 text-sm">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errorMessage || 'Failed to save preferences'}
                        </div>
                    )}

                    {saveStatus === 'idle' && <div></div>}

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-blue-300"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Preferences'
                        )}
                    </button>
                </div>
            )}
        </div>
    );
} 