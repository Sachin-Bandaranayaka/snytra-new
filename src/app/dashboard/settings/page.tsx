"use client";

import { useState, useEffect } from 'react';
import {
    Save,
    Upload,
    Camera,
    Info,
    MapPin,
    Phone,
    Mail,
    Globe
} from 'lucide-react';
import { createCssVariables } from '@/utils/cssUtils';

interface Restaurant {
    id: number;
    name: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    logo_url: string | null;
    primary_color: string;
    secondary_color: string;
}

// Mock data for initial UI rendering
const mockRestaurant: Restaurant = {
    id: 1,
    name: 'Pizza Palace',
    description: 'Best pizza in town',
    address: '123 Main St',
    phone: '+1 (555) 123-4567',
    email: 'info@pizzapalace.com',
    website: 'www.pizzapalace.com',
    logo_url: null,
    primary_color: '#D94E1F',
    secondary_color: '#8D9B6B'
};

export default function SettingsPage() {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('general');
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    useEffect(() => {
        // Fetch real data from API
        async function fetchRestaurantData() {
            try {
                const response = await fetch('/api/dashboard/restaurant', {
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch restaurant data: ${response.status}`);
                }
                const data = await response.json();

                if (data.success) {
                    setRestaurant(data.restaurant);

                    // Apply the loaded color settings immediately
                    if (data.restaurant) {
                        createCssVariables(data.restaurant.primary_color, data.restaurant.secondary_color);
                    }
                } else {
                    throw new Error(data.error || 'Failed to fetch restaurant data');
                }
            } catch (err: any) {
                console.error('Error fetching restaurant data:', err);
                setError(err.message || 'Failed to fetch restaurant data');

                // Fallback to mock data if API fails
                setRestaurant(mockRestaurant);
            } finally {
                setLoading(false);
            }
        }

        fetchRestaurantData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (restaurant) {
            setRestaurant({ ...restaurant, [name]: value });
        }
    };

    const handleSave = async () => {
        if (!restaurant) return;

        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            const response = await fetch('/api/dashboard/restaurant', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                },
                body: JSON.stringify(restaurant),
            });

            if (!response.ok) {
                throw new Error(`Failed to save restaurant data: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setSuccess(data.message || 'Restaurant settings saved successfully!');

                // Update restaurant data with the returned data
                if (data.restaurant) {
                    setRestaurant(data.restaurant);
                }

                // Apply the color changes immediately
                createCssVariables(restaurant.primary_color, restaurant.secondary_color);

                // No need to try clearing cache, just use an immediate approach
                // to ensure CSS variables are properly applied
                document.documentElement.style.setProperty('--restaurant-primary-color', restaurant.primary_color);
                document.documentElement.style.setProperty('--restaurant-secondary-color', restaurant.secondary_color);
            } else {
                throw new Error(data.error || 'Failed to save restaurant data');
            }

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccess(null);
            }, 3000);
        } catch (err: any) {
            console.error('Error saving restaurant data:', err);
            setError(err.message || 'Failed to save restaurant data');
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = () => {
        // Open a file dialog
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                // Create a preview
                const reader = new FileReader();
                reader.onload = (event) => {
                    const preview = event.target?.result as string;
                    setLogoPreview(preview);
                    // In a real app, this would upload the file to a server
                    // For now, we'll just update the local state
                    if (restaurant) {
                        setRestaurant({
                            ...restaurant,
                            logo_url: preview
                        });
                    }
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    const handleColorChange = (field: 'primary_color' | 'secondary_color', value: string) => {
        if (restaurant) {
            // Update the restaurant state
            const updatedRestaurant = { ...restaurant, [field]: value };
            setRestaurant(updatedRestaurant);

            // Apply the color changes immediately for the preview
            createCssVariables(
                field === 'primary_color' ? value : restaurant.primary_color,
                field === 'secondary_color' ? value : restaurant.secondary_color
            );
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-orange border-r-transparent"></div>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-800">No Restaurant Found</h2>
                    <p className="mt-2 text-gray-600">Unable to load restaurant settings.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Restaurant Settings</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white ${saving ? 'bg-orange-400 cursor-not-allowed' : 'bg-primary-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors'
                        }`}
                >
                    {saving ? (
                        <>
                            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent align-[-0.125em] mr-2"></div>
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save size={16} className="mr-2" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>

            {/* Error/Success Alerts */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <Info className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <Info className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-green-700">{success}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                    <button
                        className={`py-3 px-6 border-b-2 font-medium text-sm ${activeTab === 'general'
                            ? 'border-primary-orange text-primary-orange'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        onClick={() => setActiveTab('general')}
                    >
                        General
                    </button>
                    <button
                        className={`py-3 px-6 border-b-2 font-medium text-sm ${activeTab === 'branding'
                            ? 'border-primary-orange text-primary-orange'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        onClick={() => setActiveTab('branding')}
                    >
                        Branding
                    </button>
                    <button
                        className={`py-3 px-6 border-b-2 font-medium text-sm ${activeTab === 'contact'
                            ? 'border-primary-orange text-primary-orange'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        onClick={() => setActiveTab('contact')}
                    >
                        Contact Info
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'general' && (
                <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
                    <div className="p-6 space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Restaurant Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                value={restaurant.name}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-orange focus:border-primary-orange sm:text-sm"
                                placeholder="Restaurant Name"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                id="description"
                                rows={3}
                                value={restaurant?.description || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-orange focus:border-primary-orange sm:text-sm"
                                placeholder="A brief description of your restaurant"
                            />
                        </div>

                        <div>
                            <label htmlFor="address" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                <MapPin size={16} className="mr-1 text-primary-orange" />
                                Address
                            </label>
                            <textarea
                                name="address"
                                id="address"
                                rows={2}
                                value={restaurant?.address || ''}
                                onChange={handleInputChange}
                                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-orange focus:border-primary-orange sm:text-sm"
                                placeholder="Restaurant Address"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Branding Tab */}
            {activeTab === 'branding' && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Branding Settings */}
                    <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
                        <div className="p-6 space-y-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Brand Settings</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Logo
                                </label>
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-lg overflow-hidden">
                                        {(restaurant?.logo_url || logoPreview) ? (
                                            <img
                                                src={logoPreview || restaurant?.logo_url || ''}
                                                alt="Restaurant logo"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-gray-200">
                                                <Camera size={24} className="text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleLogoUpload}
                                        className="ml-5 bg-white border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-orange transition-colors"
                                    >
                                        <Upload size={16} className="inline-block mr-1" />
                                        Upload Logo
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Primary Color
                                </label>
                                <div className="flex items-center">
                                    <div
                                        className="h-10 w-10 rounded-lg border border-gray-300 mr-3"
                                        style={{ backgroundColor: restaurant?.primary_color || '#D94E1F' }}
                                    ></div>
                                    <input
                                        type="text"
                                        name="primary_color"
                                        value={restaurant?.primary_color || '#D94E1F'}
                                        onChange={handleInputChange}
                                        className="block border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-orange focus:border-primary-orange sm:text-sm"
                                        placeholder="#D94E1F"
                                    />
                                    <input
                                        type="color"
                                        value={restaurant?.primary_color || '#D94E1F'}
                                        onChange={(e) => handleColorChange('primary_color', e.target.value)}
                                        className="ml-2 h-10 w-10 p-0 border-0 rounded-md cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Secondary Color
                                </label>
                                <div className="flex items-center">
                                    <div
                                        className="h-10 w-10 rounded-lg border border-gray-300 mr-3"
                                        style={{ backgroundColor: restaurant?.secondary_color || '#8D9B6B' }}
                                    ></div>
                                    <input
                                        type="text"
                                        name="secondary_color"
                                        value={restaurant?.secondary_color || '#8D9B6B'}
                                        onChange={handleInputChange}
                                        className="block border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-orange focus:border-primary-orange sm:text-sm"
                                        placeholder="#8D9B6B"
                                    />
                                    <input
                                        type="color"
                                        value={restaurant?.secondary_color || '#8D9B6B'}
                                        onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                                        className="ml-2 h-10 w-10 p-0 border-0 rounded-md cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Brand Preview */}
                    <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
                        <div className="p-6 space-y-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Brand Preview</h3>
                            {/* Header Preview */}
                            <div
                                className="p-4 rounded-lg"
                                style={{ backgroundColor: restaurant?.primary_color || '#D94E1F' }}
                            >
                                <div className="flex items-center">
                                    {(restaurant?.logo_url || logoPreview) ? (
                                        <img
                                            src={logoPreview || restaurant?.logo_url || ''}
                                            alt="Restaurant logo"
                                            className="h-10 w-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center">
                                            <Camera size={16} className="text-gray-500" />
                                        </div>
                                    )}
                                    <h3 className="ml-2 text-white font-medium">{restaurant?.name || 'Restaurant Name'}</h3>
                                </div>
                            </div>

                            {/* Menu Item Preview */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="p-4 bg-gray-50 border-b">
                                    <h4 className="font-medium text-gray-900">Menu Preview</h4>
                                </div>
                                <div className="p-4">
                                    {/* Menu Category */}
                                    <h5
                                        className="font-medium mb-3"
                                        style={{ color: restaurant?.primary_color || '#D94E1F' }}
                                    >
                                        Popular Items
                                    </h5>
                                    {/* Menu Item */}
                                    <div className="border border-gray-200 rounded-lg p-3 mb-3">
                                        <div className="flex justify-between">
                                            <h6 className="font-medium text-gray-900">Sample Menu Item</h6>
                                            <span className="font-medium text-gray-900">$12.99</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            A delicious menu item with a description.
                                        </p>
                                        <button
                                            className="mt-2 px-3 py-1 text-xs rounded-md text-white"
                                            style={{ backgroundColor: restaurant?.secondary_color || '#8D9B6B' }}
                                        >
                                            Add to Order
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Order Button Preview */}
                            <div className="flex justify-center">
                                <button
                                    className="px-4 py-2 rounded-lg text-white font-medium transition-opacity hover:opacity-90"
                                    style={{ backgroundColor: restaurant?.primary_color || '#D94E1F' }}
                                >
                                    Place Order
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Contact Info Tab */}
            {activeTab === 'contact' && (
                <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="phone" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                    <Phone size={16} className="mr-1 text-primary-orange" />
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    id="phone"
                                    value={restaurant?.phone || ''}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-orange focus:border-primary-orange sm:text-sm"
                                    placeholder="+1 (123) 456-7890"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                    <Mail size={16} className="mr-1 text-primary-orange" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={restaurant?.email || ''}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-orange focus:border-primary-orange sm:text-sm"
                                    placeholder="contact@restaurant.com"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="website" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                    <Globe size={16} className="mr-1 text-primary-orange" />
                                    Website
                                </label>
                                <input
                                    type="url"
                                    name="website"
                                    id="website"
                                    value={restaurant?.website || ''}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-orange focus:border-primary-orange sm:text-sm"
                                    placeholder="www.restaurant.com"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 