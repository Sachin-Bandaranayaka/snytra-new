"use client";

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface InventoryItem {
    id?: number;
    name: string;
    quantity: number;
    unit: string;
    status: 'Low' | 'Plenty';
    image_url: string;
}

interface InventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    item?: InventoryItem;
    onSave: (item: InventoryItem) => Promise<void>;
    mode: 'add' | 'update';
}

export default function InventoryModal({
    isOpen,
    onClose,
    item,
    onSave,
    mode,
}: InventoryModalProps) {
    const [formData, setFormData] = useState<InventoryItem>({
        name: '',
        quantity: 0,
        unit: 'Units',
        status: 'Low',
        image_url: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (item && mode === 'update') {
            setFormData({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                unit: item.unit,
                status: item.status,
                image_url: item.image_url,
            });
        } else {
            // Reset form for add mode
            setFormData({
                name: '',
                quantity: 0,
                unit: 'Units',
                status: 'Low',
                image_url: '',
            });
        }
    }, [item, mode, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'quantity') {
            // Handle numeric input
            const numValue = parseInt(value);
            setFormData({
                ...formData,
                [name]: isNaN(numValue) ? 0 : numValue,
                // Automatically set status based on quantity
                status: isNaN(numValue) ? formData.status : numValue < 20 ? 'Low' : 'Plenty',
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await onSave(formData);
            onClose();
        } catch (err) {
            console.error('Error saving inventory item:', err);
            setError('Failed to save inventory item. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    onClick={onClose}
                ></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="flex justify-between items-center px-6 py-4 bg-orange-50 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-orange-600">
                            {mode === 'add' ? 'Add New Stock Item' : 'Update Stock Item'}
                        </h3>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 focus:outline-none"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="px-6 py-4">
                            {error && (
                                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                    <p>{error}</p>
                                </div>
                            )}

                            <div className="mb-4">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Item Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        id="quantity"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                                        Unit
                                    </label>
                                    <select
                                        id="unit"
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                    >
                                        <option value="Units">Units</option>
                                        <option value="Kg">Kg</option>
                                        <option value="g">g</option>
                                        <option value="L">L</option>
                                        <option value="ml">ml</option>
                                        <option value="Boxes">Boxes</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                >
                                    <option value="Low">Low</option>
                                    <option value="Plenty">Plenty</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
                                    Image URL
                                </label>
                                <input
                                    type="text"
                                    id="image_url"
                                    name="image_url"
                                    value={formData.image_url}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Saving...' : mode === 'add' ? 'Add Item' : 'Update Item'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 