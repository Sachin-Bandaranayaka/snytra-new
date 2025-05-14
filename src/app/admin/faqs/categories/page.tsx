'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';

interface FAQCategory {
    id: string;
    name: string;
    order: number;
    faq_count?: number;
    created_at: string;
    updated_at: string;
}

export default function FAQCategoriesManagement() {
    const [categories, setCategories] = useState<FAQCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // For the quick create/edit form
    const [isEditing, setIsEditing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<FAQCategory | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        order: 0
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/faqs/categories');

            if (!response.ok) {
                throw new Error('Failed to fetch FAQ categories');
            }

            const data = await response.json();
            setCategories(data.categories);
        } catch (err) {
            console.error('Error fetching FAQ categories:', err);
            setError('Failed to load categories. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'order' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const method = isEditing ? 'PUT' : 'POST';
            const url = isEditing
                ? `/api/faqs/categories/${selectedCategory?.id}`
                : '/api/faqs/categories';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save category');
            }

            // Reset form and refresh categories
            resetForm();
            fetchCategories();

        } catch (err) {
            console.error('Error saving category:', err);
            setError(err instanceof Error ? err.message : 'Failed to save category. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (category: FAQCategory) => {
        setIsEditing(true);
        setSelectedCategory(category);
        setFormData({
            name: category.name,
            order: category.order
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category? Any FAQs assigned to this category will need to be reassigned.')) {
            return;
        }

        try {
            const response = await fetch(`/api/faqs/categories/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete category');
            }

            // Refresh categories
            fetchCategories();
        } catch (err) {
            console.error('Error deleting category:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete category. Please try again later.');
        }
    };

    const handleOrderChange = async (id: string, direction: 'up' | 'down') => {
        // Find the current category and its index
        const currentIndex = categories.findIndex(category => category.id === id);
        if (currentIndex === -1) return;

        const currentCategory = categories[currentIndex];
        let targetIndex: number;

        // Determine the target index based on direction
        if (direction === 'up' && currentIndex > 0) {
            targetIndex = currentIndex - 1;
        } else if (direction === 'down' && currentIndex < categories.length - 1) {
            targetIndex = currentIndex + 1;
        } else {
            return; // Can't move further in that direction
        }

        // Get the target category
        const targetCategory = categories[targetIndex];

        // Swap the order values
        try {
            const response = await fetch(`/api/faqs/categories/${id}/reorder`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    newOrder: targetCategory.order,
                    swapWithId: targetCategory.id,
                    swapWithOrder: currentCategory.order
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update category order');
            }

            // Update the category order in the state
            const updatedCategories = [...categories];
            updatedCategories[currentIndex] = { ...currentCategory, order: targetCategory.order };
            updatedCategories[targetIndex] = { ...targetCategory, order: currentCategory.order };

            // Sort by order
            updatedCategories.sort((a, b) => a.order - b.order);

            setCategories(updatedCategories);
        } catch (err) {
            console.error('Error updating category order:', err);
            setError('Failed to update category order. Please try again later.');
        }
    };

    const resetForm = () => {
        setIsEditing(false);
        setSelectedCategory(null);
        setFormData({
            name: '',
            order: Math.max(0, ...categories.map(cat => cat.order)) + 1
        });
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">FAQ Categories</h1>
                <Link
                    href="/admin/faqs"
                    className="text-blue-600 hover:text-blue-800"
                >
                    &larr; Back to FAQs
                </Link>
            </div>

            {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Categories List */}
                <div className="lg:col-span-2">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64 bg-white p-6 rounded-lg shadow">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="bg-white p-6 rounded-lg shadow text-center">
                            <p className="text-gray-500">No categories found. Create your first category!</p>
                        </div>
                    ) : (
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Order
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                FAQs
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {categories.map((category) => (
                                            <tr key={category.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-1">
                                                        <button
                                                            onClick={() => handleOrderChange(category.id, 'up')}
                                                            className="text-gray-500 hover:text-gray-700"
                                                            title="Move up"
                                                        >
                                                            ↑
                                                        </button>
                                                        <span className="text-sm text-gray-500">{category.order}</span>
                                                        <button
                                                            onClick={() => handleOrderChange(category.id, 'down')}
                                                            className="text-gray-500 hover:text-gray-700"
                                                            title="Move down"
                                                        >
                                                            ↓
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {category.faq_count || 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleEdit(category)}
                                                        className="text-blue-600 hover:text-blue-900 px-2 py-1"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(category.id)}
                                                        className="text-red-600 hover:text-red-900 px-2 py-1"
                                                        disabled={category.faq_count && category.faq_count > 0}
                                                        title={category.faq_count && category.faq_count > 0 ? 'Cannot delete category with FAQs' : ''}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Create/Edit Form */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-medium mb-4">
                        {isEditing ? 'Edit Category' : 'Create New Category'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Category name"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                                Display Order
                            </label>
                            <input
                                type="number"
                                id="order"
                                name="order"
                                value={formData.order}
                                onChange={handleChange}
                                min="0"
                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="0"
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Categories are displayed in ascending order (lower numbers first)
                            </p>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                            >
                                {isSubmitting
                                    ? (isEditing ? 'Updating...' : 'Creating...')
                                    : (isEditing ? 'Update Category' : 'Create Category')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 