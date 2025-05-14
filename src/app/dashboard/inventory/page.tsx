"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import InventoryModal from './components/InventoryModal';
import FeatureGuard from '@/components/FeatureGuard';
import { useAuth } from '@/components/providers/StackAdminAuth';

// Define the inventory item type
interface InventoryItem {
    id: number;
    name: string;
    quantity: number;
    unit: string;
    status: 'Low' | 'Plenty';
    image_url: string;
}

export default function InventoryManagementPage() {
    const { user, loading, isAuthenticated } = useAuth();
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'update'>('add');
    const [selectedItem, setSelectedItem] = useState<InventoryItem | undefined>(undefined);

    const fetchInventory = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('/api/inventory');

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            setInventoryItems(data);
        } catch (err) {
            console.error('Failed to fetch inventory:', err);
            setError('Failed to load inventory data. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleOrderStock = (itemId: number) => {
        // Implement order stock functionality
        console.log(`Ordering stock for item ${itemId}`);
    };

    const handleAddItem = () => {
        setModalMode('add');
        setSelectedItem(undefined);
        setIsModalOpen(true);
    };

    const handleUpdateItem = (item: InventoryItem) => {
        setModalMode('update');
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleSaveItem = async (item: InventoryItem) => {
        try {
            if (modalMode === 'add') {
                // Add new item
                const response = await fetch('/api/inventory', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(item),
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
            } else {
                // Update existing item
                const response = await fetch('/api/inventory', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(item),
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
            }

            // Refresh inventory data
            await fetchInventory();
        } catch (error) {
            console.error('Error saving inventory item:', error);
            throw error;
        }
    };

    return (
        <FeatureGuard
            requiredFeature="inventory"
            fallback={
                <div className="bg-white shadow rounded-lg p-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Inventory Management</h2>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-2xl mx-auto">
                        <h3 className="text-lg font-medium text-amber-800">Feature Unavailable</h3>
                        <p className="text-amber-700 mt-2">
                            Inventory management is available in our Standard and higher plans.
                            Upgrade your subscription to access this feature.
                        </p>
                        <a
                            href="/pricing"
                            className="mt-4 inline-block px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                        >
                            View Plans
                        </a>
                    </div>
                </div>
            }
        >
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-orange-600">Inventory Management</h1>

                        <div className="mt-6">
                            <h2 className="text-xl font-bold">Stock Items</h2>
                            <p className="text-gray-600">View the current stocks levels of items</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => fetchInventory()}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                            Update Stock
                        </button>
                        <button
                            onClick={handleAddItem}
                            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center gap-2">
                            <span>+</span> New Stock
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {inventoryItems.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="p-4 flex items-center gap-4">
                                    <div className="w-20 h-20 relative overflow-hidden rounded-md">
                                        <Image
                                            src={item.image_url || '/placeholder-image.jpg'}
                                            alt={item.name}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-medium">{item.name}</h3>
                                        <p className="text-sm text-gray-500">{item.quantity} {item.unit}</p>
                                    </div>

                                    <div className={`px-2 py-1 text-xs rounded-full ${item.status === 'Low' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                        {item.status}
                                    </div>
                                </div>

                                <div className="p-3 border-t">
                                    <button
                                        onClick={() => handleOrderStock(item.id)}
                                        className="w-full py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                                    >
                                        Order Stock
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                <InventoryModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    item={selectedItem}
                    onSave={handleSaveItem}
                    mode={modalMode}
                />
            </div>
        </FeatureGuard>
    );
} 