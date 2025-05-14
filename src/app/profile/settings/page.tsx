"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import SEO from "@/components/SEO";
import {
    Bell,
    Shield,
    Smartphone,
    Globe,
    Moon,
    ToggleLeft,
    ToggleRight,
    Check,
    X
} from "lucide-react";

export default function SettingsPage() {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Settings state
    const [settings, setSettings] = useState({
        notifications: {
            email: true,
            browser: true,
            mobile: false,
            marketing: false
        },
        security: {
            twoFactorAuth: false,
            loginNotifications: true,
            sessionTimeout: "30" // minutes
        },
        appearance: {
            darkMode: false,
            compactMode: false,
            language: "en" // english
        }
    });

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

    // Handle toggle changes
    const handleToggle = (category: string, setting: string) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category as keyof typeof prev],
                [setting]: !prev[category as keyof typeof prev][setting as keyof typeof prev[keyof typeof prev]]
            }
        }));
    };

    // Handle select changes
    const handleSelectChange = (category: string, setting: string, value: string) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category as keyof typeof prev],
                [setting]: value
            }
        }));
    };

    // Save settings
    const saveSettings = async () => {
        setIsLoading(true);
        setSuccess(null);
        setError(null);

        try {
            // In a real app, you would make an API call here
            // await fetch('/api/user/settings', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(settings)
            // });

            // For now, we'll just simulate a successful save
            await new Promise(resolve => setTimeout(resolve, 800));
            setSuccess('Your settings have been saved successfully.');

            // After a few seconds, clear the success message
            setTimeout(() => {
                setSuccess(null);
            }, 3000);
        } catch (err) {
            console.error('Error saving settings:', err);
            setError('Failed to save settings. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <>
            <SEO
                title="Settings | Client Portal | Snytra"
                description="Customize your account settings and preferences."
                ogImage="/images/client-portal.jpg"
            />

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-charcoal">Settings</h1>
                <p className="text-charcoal/70 mt-1">Customize your account settings and preferences</p>
            </div>

            {/* Success message */}
            {success && (
                <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 flex items-start">
                    <Check className="h-5 w-5 mr-2 mt-0.5" />
                    <p>{success}</p>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 flex items-start">
                    <X className="h-5 w-5 mr-2 mt-0.5" />
                    <p>{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Notification Settings */}
                <div className="md:col-span-3">
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center">
                                <Bell className="h-5 w-5 text-primary mr-3" />
                                <h2 className="text-xl font-semibold text-charcoal">Notification Settings</h2>
                            </div>
                        </div>

                        <div className="p-6 divide-y divide-gray-100">
                            <div className="py-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-medium text-charcoal">Email Notifications</h3>
                                    <p className="text-sm text-charcoal/70 mt-1">Receive notifications about account activity via email</p>
                                </div>
                                <button
                                    type="button"
                                    className="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none"
                                    aria-pressed={settings.notifications.email}
                                    onClick={() => handleToggle('notifications', 'email')}
                                >
                                    <span className="sr-only">Use setting</span>
                                    {settings.notifications.email ? (
                                        <ToggleRight className="h-6 w-11 text-primary" />
                                    ) : (
                                        <ToggleLeft className="h-6 w-11 text-gray-300" />
                                    )}
                                </button>
                            </div>

                            <div className="py-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-medium text-charcoal">Browser Notifications</h3>
                                    <p className="text-sm text-charcoal/70 mt-1">Show notifications in the browser</p>
                                </div>
                                <button
                                    type="button"
                                    className="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none"
                                    aria-pressed={settings.notifications.browser}
                                    onClick={() => handleToggle('notifications', 'browser')}
                                >
                                    <span className="sr-only">Use setting</span>
                                    {settings.notifications.browser ? (
                                        <ToggleRight className="h-6 w-11 text-primary" />
                                    ) : (
                                        <ToggleLeft className="h-6 w-11 text-gray-300" />
                                    )}
                                </button>
                            </div>

                            <div className="py-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-medium text-charcoal">Mobile Push Notifications</h3>
                                    <p className="text-sm text-charcoal/70 mt-1">Send notifications to your mobile device</p>
                                </div>
                                <button
                                    type="button"
                                    className="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none"
                                    aria-pressed={settings.notifications.mobile}
                                    onClick={() => handleToggle('notifications', 'mobile')}
                                >
                                    <span className="sr-only">Use setting</span>
                                    {settings.notifications.mobile ? (
                                        <ToggleRight className="h-6 w-11 text-primary" />
                                    ) : (
                                        <ToggleLeft className="h-6 w-11 text-gray-300" />
                                    )}
                                </button>
                            </div>

                            <div className="py-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-medium text-charcoal">Marketing Emails</h3>
                                    <p className="text-sm text-charcoal/70 mt-1">Receive emails about new features and promotions</p>
                                </div>
                                <button
                                    type="button"
                                    className="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none"
                                    aria-pressed={settings.notifications.marketing}
                                    onClick={() => handleToggle('notifications', 'marketing')}
                                >
                                    <span className="sr-only">Use setting</span>
                                    {settings.notifications.marketing ? (
                                        <ToggleRight className="h-6 w-11 text-primary" />
                                    ) : (
                                        <ToggleLeft className="h-6 w-11 text-gray-300" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="md:col-span-3">
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center">
                                <Shield className="h-5 w-5 text-primary mr-3" />
                                <h2 className="text-xl font-semibold text-charcoal">Security Settings</h2>
                            </div>
                        </div>

                        <div className="p-6 divide-y divide-gray-100">
                            <div className="py-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-medium text-charcoal">Two-Factor Authentication</h3>
                                    <p className="text-sm text-charcoal/70 mt-1">Add an extra layer of security to your account</p>
                                </div>
                                <button
                                    type="button"
                                    className="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none"
                                    aria-pressed={settings.security.twoFactorAuth}
                                    onClick={() => handleToggle('security', 'twoFactorAuth')}
                                >
                                    <span className="sr-only">Use setting</span>
                                    {settings.security.twoFactorAuth ? (
                                        <ToggleRight className="h-6 w-11 text-primary" />
                                    ) : (
                                        <ToggleLeft className="h-6 w-11 text-gray-300" />
                                    )}
                                </button>
                            </div>

                            <div className="py-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-medium text-charcoal">Login Notifications</h3>
                                    <p className="text-sm text-charcoal/70 mt-1">Get notified about new logins to your account</p>
                                </div>
                                <button
                                    type="button"
                                    className="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none"
                                    aria-pressed={settings.security.loginNotifications}
                                    onClick={() => handleToggle('security', 'loginNotifications')}
                                >
                                    <span className="sr-only">Use setting</span>
                                    {settings.security.loginNotifications ? (
                                        <ToggleRight className="h-6 w-11 text-primary" />
                                    ) : (
                                        <ToggleLeft className="h-6 w-11 text-gray-300" />
                                    )}
                                </button>
                            </div>

                            <div className="py-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-medium text-charcoal">Session Timeout</h3>
                                    <p className="text-sm text-charcoal/70 mt-1">Automatically log out after a period of inactivity</p>
                                </div>
                                <select
                                    value={settings.security.sessionTimeout}
                                    onChange={(e) => handleSelectChange('security', 'sessionTimeout', e.target.value)}
                                    className="rounded-md border-gray-300 text-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                >
                                    <option value="15">15 minutes</option>
                                    <option value="30">30 minutes</option>
                                    <option value="60">1 hour</option>
                                    <option value="120">2 hours</option>
                                    <option value="never">Never</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Appearance Settings */}
                <div className="md:col-span-3">
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center">
                                <Moon className="h-5 w-5 text-primary mr-3" />
                                <h2 className="text-xl font-semibold text-charcoal">Appearance Settings</h2>
                            </div>
                        </div>

                        <div className="p-6 divide-y divide-gray-100">
                            <div className="py-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-medium text-charcoal">Dark Mode</h3>
                                    <p className="text-sm text-charcoal/70 mt-1">Switch between light and dark themes</p>
                                </div>
                                <button
                                    type="button"
                                    className="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none"
                                    aria-pressed={settings.appearance.darkMode}
                                    onClick={() => handleToggle('appearance', 'darkMode')}
                                >
                                    <span className="sr-only">Use setting</span>
                                    {settings.appearance.darkMode ? (
                                        <ToggleRight className="h-6 w-11 text-primary" />
                                    ) : (
                                        <ToggleLeft className="h-6 w-11 text-gray-300" />
                                    )}
                                </button>
                            </div>

                            <div className="py-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-medium text-charcoal">Compact Mode</h3>
                                    <p className="text-sm text-charcoal/70 mt-1">Use a more compact layout to show more information</p>
                                </div>
                                <button
                                    type="button"
                                    className="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none"
                                    aria-pressed={settings.appearance.compactMode}
                                    onClick={() => handleToggle('appearance', 'compactMode')}
                                >
                                    <span className="sr-only">Use setting</span>
                                    {settings.appearance.compactMode ? (
                                        <ToggleRight className="h-6 w-11 text-primary" />
                                    ) : (
                                        <ToggleLeft className="h-6 w-11 text-gray-300" />
                                    )}
                                </button>
                            </div>

                            <div className="py-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-medium text-charcoal">Language</h3>
                                    <p className="text-sm text-charcoal/70 mt-1">Select your preferred language</p>
                                </div>
                                <select
                                    value={settings.appearance.language}
                                    onChange={(e) => handleSelectChange('appearance', 'language', e.target.value)}
                                    className="rounded-md border-gray-300 text-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                >
                                    <option value="en">English</option>
                                    <option value="es">Español</option>
                                    <option value="fr">Français</option>
                                    <option value="de">Deutsch</option>
                                    <option value="ja">日本語</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    onClick={saveSettings}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                            Saving...
                        </>
                    ) : (
                        'Save Settings'
                    )}
                </button>
            </div>
        </>
    );
} 