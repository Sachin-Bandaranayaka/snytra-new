"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Category {
    id: number;
    name: string;
    is_active: boolean;
}

export default function NewMenuItem() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [menuItem, setMenuItem] = useState({
        name: '',
        description: '',
        price: '',
        category_id: '',
        image_url: '',
        is_available: true
    });

    useEffect(() => {
        // Fetch categories from API
        async function fetchCategories() {
            try {
                const response = await fetch('/api/dashboard/menu/categories');
                if (!response.ok) {
                    throw new Error(`Failed to fetch categories: ${response.status}`);
                }
                const data = await response.json();

                if (data.success) {
                    setCategories(data.categories);
                    if (data.categories.length > 0) {
                        setMenuItem(prev => ({
                            ...prev,
                            category_id: String(data.categories[0].id)
                        }));
                    }
                } else {
                    throw new Error(data.error || 'Failed to fetch categories');
                }
            } catch (err: any) {
                console.error('Error fetching categories:', err);
                setError(err.message || 'Failed to fetch categories');
            } finally {
                setLoading(false);
            }
        }

        fetchCategories();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setMenuItem(prev => ({ ...prev, [name]: checked }));
        } else if (name === 'price') {
            // Allow only numbers and decimal point
            const regex = /^\d*\.?\d{0,2}$/;
            if (regex.test(value) || value === '') {
                setMenuItem(prev => ({ ...prev, [name]: value }));
            }
        } else {
            setMenuItem(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            // Validate form
            if (!menuItem.name.trim()) {
                throw new Error('Menu item name is required');
            }

            if (!menuItem.category_id) {
                throw new Error('Please select a category');
            }

            if (!menuItem.price || parseFloat(menuItem.price) <= 0) {
                throw new Error('Please enter a valid price');
            }

            // Prepare data for API
            const formData = {
                ...menuItem,
                price: parseFloat(menuItem.price),
                category_id: parseInt(menuItem.category_id, 10)
            };

            // Submit to API
            const response = await fetch('/api/dashboard/menu/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create menu item');
            }

            if (!data.success) {
                throw new Error(data.error || 'Failed to create menu item');
            }

            // Redirect back to menu page on success
            router.push('/dashboard/menu');
        } catch (err: any) {
            console.error('Error creating menu item:', err);
            setError(err.message || 'Failed to create menu item');
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-charcoal">Add New Menu Item</h1>
                <Button
                    variant="outline"
                    asChild
                >
                    <Link
                        href="/dashboard/menu"
                        className="inline-flex items-center"
                    >
                        <ArrowLeft size={16} className="mr-1" />
                        Back to Menu
                    </Link>
                </Button>
            </div>

            {error && (
                <div className="my-4 bg-beige border-l-4 border-primary text-primary p-4">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}

            <div className="bg-white rounded-lg border border-lightGray shadow-sm overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-charcoal">
                                        Item Name <span className="text-primary">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={menuItem.name}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-lightGray rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-charcoal">
                                        Price <span className="text-primary">*</span>
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-darkGray sm:text-sm">$</span>
                                        </div>
                                        <input
                                            type="text"
                                            id="price"
                                            name="price"
                                            value={menuItem.price}
                                            onChange={handleInputChange}
                                            className="block w-full pl-7 pr-12 border border-lightGray rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="category_id" className="block text-sm font-medium text-charcoal">
                                        Category <span className="text-primary">*</span>
                                    </label>
                                    <select
                                        id="category_id"
                                        name="category_id"
                                        value={menuItem.category_id}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full bg-white border border-lightGray rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                        required
                                    >
                                        <option value="" disabled>Select a category</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="image_url" className="block text-sm font-medium text-charcoal">
                                        Image URL
                                    </label>
                                    <input
                                        type="text"
                                        id="image_url"
                                        name="image_url"
                                        value={menuItem.image_url}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border border-lightGray rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-charcoal">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={menuItem.description}
                                        onChange={handleInputChange}
                                        rows={5}
                                        className="mt-1 block w-full border border-lightGray rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        id="is_available"
                                        name="is_available"
                                        type="checkbox"
                                        checked={menuItem.is_available}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-primary focus:ring-primary border-lightGray rounded"
                                    />
                                    <label htmlFor="is_available" className="ml-2 block text-sm text-darkGray">
                                        Item is available for order
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push('/dashboard/menu')}
                                className="mr-3"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} className="mr-1" />
                                        Save Item
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 