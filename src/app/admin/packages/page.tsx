'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusIcon, PencilIcon, TrashIcon, EyeSlashIcon, EyeIcon } from '@heroicons/react/24/outline';

interface Package {
    id: number;
    name: string;
    description: string;
    price: string | number;
    features: string[] | Record<string, any>;
    is_active: boolean;
    billing_interval: string;
}

export default function PackagesPage() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const response = await fetch('/api/subscription-plans');
                if (!response.ok) {
                    throw new Error(`Error fetching packages: ${response.status}`);
                }

                const data = await response.json();

                if (data.success && data.plans) {
                    setPackages(data.plans);
                } else {
                    throw new Error('Failed to fetch packages data');
                }

                setIsLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
                setIsLoading(false);
            }
        };

        fetchPackages();
    }, []);

    // Function to format features for display, handling both array and object types
    const formatFeatures = (features: string[] | Record<string, any>): string[] => {
        if (Array.isArray(features)) {
            return features;
        } else if (typeof features === 'object' && features !== null) {
            return Object.entries(features).map(([key, value]) => {
                if (typeof value === 'boolean') {
                    return `${key}: ${value ? 'Yes' : 'No'}`;
                } else {
                    return `${key}: ${value}`;
                }
            });
        }
        return [];
    };

    const handleAddPackage = () => {
        router.push('/admin/packages/new');
    };

    const handleEditPackage = (id: number) => {
        router.push(`/admin/packages/${id}/edit`);
    };

    const togglePackageStatus = async (id: number, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/subscription-plans/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ is_active: !currentStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update package status');
            }

            // Update local state to reflect the change
            setPackages(packages.map(pkg =>
                pkg.id === id ? { ...pkg, is_active: !currentStatus } : pkg
            ));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        }
    };

    const handleDeletePackage = async (id: number, name: string) => {
        // Confirm deletion with the user
        if (!window.confirm(`Are you sure you want to delete the "${name}" package? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/subscription-plans/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete package');
            }

            // Remove the deleted package from state
            setPackages(packages.filter(pkg => pkg.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading packages...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Subscription Packages</h1>
                    <button
                        onClick={handleAddPackage}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-md"
                    >
                        <PlusIcon className="h-5 w-5" />
                        Add New Package
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Package Details
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Billing
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Features
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {packages.map(pkg => {
                                    const formattedFeatures = formatFeatures(pkg.features);

                                    return (
                                        <tr key={pkg.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <div className="text-sm font-semibold text-gray-900">{pkg.name}</div>
                                                    <div className="text-sm text-gray-500 mt-1">{pkg.description}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">${Number(pkg.price).toFixed(2)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 capitalize">{pkg.billing_interval}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${pkg.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {pkg.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <ul className="text-sm text-gray-600 list-disc pl-5">
                                                    {formattedFeatures.slice(0, 2).map((feature, idx) => (
                                                        <li key={idx} className="mb-1">{feature}</li>
                                                    ))}
                                                    {formattedFeatures.length > 2 && (
                                                        <li className="text-orange-500 font-medium cursor-pointer hover:text-orange-600">
                                                            +{formattedFeatures.length - 2} more
                                                        </li>
                                                    )}
                                                </ul>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleEditPackage(pkg.id)}
                                                    className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-full mr-2 transition-colors"
                                                    title="Edit package"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>

                                                <button
                                                    onClick={() => togglePackageStatus(pkg.id, pkg.is_active)}
                                                    className={`${pkg.is_active ? 'text-amber-600 hover:text-amber-900 bg-amber-50 hover:bg-amber-100' : 'text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100'} p-2 rounded-full mr-2 transition-colors`}
                                                    title={pkg.is_active ? "Deactivate package" : "Activate package"}
                                                >
                                                    {pkg.is_active ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                                </button>

                                                <button
                                                    onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                                                    className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-full transition-colors"
                                                    title="Delete package"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
} 