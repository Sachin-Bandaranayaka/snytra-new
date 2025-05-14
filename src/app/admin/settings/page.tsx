'use client';

import { useState } from 'react';

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
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [formData, setFormData] = useState<SettingsFormData>({
        siteName: 'Snytra',
        siteDescription: 'Restaurant Management System',
        contactEmail: 'contact@snytra.com',
        supportEmail: 'support@snytra.com',
        enableRegistration: true,
        maintenanceMode: false,
        theme: 'default',
        logo: null,
        favicon: null,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveMessage(null);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSaveMessage({ type: 'success', text: 'Settings saved successfully' });
        } catch (error) {
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Logo
                                    </label>
                                    <div className="flex items-center">
                                        <button
                                            type="button"
                                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Upload Logo
                                        </button>
                                        <span className="ml-2 text-sm text-gray-500">No file selected</span>
                                    </div>
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
            </div>
        </div>
    );
} 