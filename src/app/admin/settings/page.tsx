'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";

interface SettingsFormData {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    supportEmail: string;
    enableRegistration: boolean;
    maintenanceMode: boolean;
    theme: string;
    logo: string | null;
    favicon: string | null;
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [formData, setFormData] = useState<SettingsFormData>({
        siteName: '',
        siteDescription: '',
        contactEmail: '',
        supportEmail: '',
        enableRegistration: true,
        maintenanceMode: false,
        theme: 'default',
        logo: null,
        favicon: null,
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            // Fetch all settings
            const response = await fetch('/api/settings');
            if (!response.ok) throw new Error('Failed to fetch settings');

            const settings = await response.json();

            // Also fetch maintenance status directly to ensure we have the most current state
            const maintenanceResponse = await fetch('/api/maintenance-status');
            const maintenanceData = await maintenanceResponse.json();

            // Update form data with fetched settings
            const newFormData = { ...formData };

            if (settings.general) {
                newFormData.siteName = settings.general.siteName || '';
                newFormData.siteDescription = settings.general.siteDescription || '';
                newFormData.contactEmail = settings.general.contactEmail || '';
            }

            if (settings.appearance) {
                newFormData.theme = settings.appearance.theme || 'default';
                newFormData.logo = settings.appearance.logo;
                newFormData.favicon = settings.appearance.favicon;
            }

            if (settings.email) {
                newFormData.supportEmail = settings.email.supportEmail || '';
            }

            if (settings.advanced) {
                newFormData.enableRegistration = settings.advanced.enableRegistration ?? true;
                // Use the directly fetched maintenance mode status for most up-to-date state
                newFormData.maintenanceMode = maintenanceData.maintenanceMode;
            }

            setFormData(newFormData);
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));

        // If changing maintenance mode, update it immediately
        if (name === 'maintenanceMode') {
            updateMaintenanceMode(checked);
        }
    };

    // Function to update maintenance mode specifically
    const updateMaintenanceMode = async (enabled: boolean) => {
        try {
            const response = await fetch('/api/maintenance-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ maintenanceMode: enabled }),
            });

            if (!response.ok) {
                throw new Error('Failed to update maintenance mode');
            }

            toast.success(`Maintenance mode ${enabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error('Error updating maintenance mode:', error);
            toast.error('Failed to update maintenance mode');
            // Revert the UI state if the API call failed
            setFormData(prev => ({ ...prev, maintenanceMode: !enabled }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveMessage(null);

        try {
            // Prepare the data based on the active tab
            let key: string;
            let value: any = {};

            switch (activeTab) {
                case 'general':
                    key = 'general';
                    value = {
                        siteName: formData.siteName,
                        siteDescription: formData.siteDescription,
                        contactEmail: formData.contactEmail,
                    };
                    break;
                case 'appearance':
                    key = 'appearance';
                    value = {
                        theme: formData.theme,
                        logo: formData.logo,
                        favicon: formData.favicon,
                    };
                    break;
                case 'email':
                    key = 'email';
                    value = {
                        supportEmail: formData.supportEmail,
                    };
                    break;
                case 'advanced':
                    key = 'advanced';
                    value = {
                        enableRegistration: formData.enableRegistration,
                        maintenanceMode: formData.maintenanceMode,
                    };
                    break;
                default:
                    throw new Error('Invalid tab');
            }

            // Update the settings
            const response = await fetch('/api/settings', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ key, value }),
            });

            if (!response.ok) {
                throw new Error('Failed to save settings');
            }

            setSaveMessage({ type: 'success', text: 'Settings saved successfully' });
        } catch (error) {
            console.error('Error saving settings:', error);
            setSaveMessage({ type: 'error', text: 'Failed to save settings' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">System Settings</h1>

            {saveMessage && (
                <div className={`mb-4 px-4 py-3 rounded ${saveMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {saveMessage.text}
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="flex border-b">
                    <button
                        className={`px-4 py-3 text-sm font-medium ${activeTab === 'general' ? 'text-primary-orange border-b-2 border-primary-orange' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('general')}
                    >
                        General
                    </button>
                    <button
                        className={`px-4 py-3 text-sm font-medium ${activeTab === 'appearance' ? 'text-primary-orange border-b-2 border-primary-orange' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('appearance')}
                    >
                        Appearance
                    </button>
                    <button
                        className={`px-4 py-3 text-sm font-medium ${activeTab === 'email' ? 'text-primary-orange border-b-2 border-primary-orange' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('email')}
                    >
                        Email
                    </button>
                    <button
                        className={`px-4 py-3 text-sm font-medium ${activeTab === 'advanced' ? 'text-primary-orange border-b-2 border-primary-orange' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('advanced')}
                    >
                        Advanced
                    </button>
                </div>

                {isLoading ? (
                    <div className="p-6 flex justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary-orange"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6">
                        {/* General Settings */}
                        {activeTab === 'general' && (
                            <div>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">
                                            Site Name
                                        </label>
                                        <input
                                            type="text"
                                            id="siteName"
                                            name="siteName"
                                            value={formData.siteName}
                                            onChange={handleChange}
                                            className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                            Contact Email
                                        </label>
                                        <input
                                            type="email"
                                            id="contactEmail"
                                            name="contactEmail"
                                            value={formData.contactEmail}
                                            onChange={handleChange}
                                            className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-1">
                                            Site Description
                                        </label>
                                        <textarea
                                            id="siteDescription"
                                            name="siteDescription"
                                            rows={3}
                                            value={formData.siteDescription || ''}
                                            onChange={handleChange}
                                            className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Appearance Settings */}
                        {activeTab === 'appearance' && (
                            <div>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
                                            Theme
                                        </label>
                                        <select
                                            id="theme"
                                            name="theme"
                                            value={formData.theme}
                                            onChange={handleChange}
                                            className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        >
                                            <option value="default">Default</option>
                                            <option value="dark">Dark</option>
                                            <option value="light">Light</option>
                                        </select>
                                    </div>

                                    <div>
                                        {/* Logo Upload Section */}
                                        <div className="mb-4">
                                          <label className="block text-sm font-medium mb-1">Logo</label>
                                          <UploadButton<OurFileRouter, any>
                                            endpoint="imageUploader"
                                            onClientUploadComplete={(res) => {
                                              if (res && res[0]) {
                                                setFormData(prev => ({ ...prev, logo: res[0].serverData.url }));
                                                toast.success('Logo uploaded successfully');
                                              }
                                            }}
                                            onUploadError={(error: Error) => {
                                              toast.error(`Upload failed: ${error.message}`);
                                            }}
                                          />
                                          {formData.logo && <p className="text-sm text-green-600">Logo uploaded: {formData.logo}</p>}
                                        </div>
                                        
                                        {/* Favicon upload can be added here if needed */}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Email Settings */}
                        {activeTab === 'email' && (
                            <div>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="supportEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                            Support Email
                                        </label>
                                        <input
                                            type="email"
                                            id="supportEmail"
                                            name="supportEmail"
                                            value={formData.supportEmail}
                                            onChange={handleChange}
                                            className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Advanced Settings */}
                        {activeTab === 'advanced' && (
                            <div>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="enableRegistration"
                                            name="enableRegistration"
                                            checked={formData.enableRegistration}
                                            onChange={handleCheckboxChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="enableRegistration" className="ml-2 block text-sm text-gray-700">
                                            Enable user registration
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="maintenanceMode"
                                            name="maintenanceMode"
                                            checked={formData.maintenanceMode}
                                            onChange={handleCheckboxChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="maintenanceMode" className="ml-2 block text-sm text-gray-700">
                                            Enable maintenance mode
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                            >
                                {isSaving ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}