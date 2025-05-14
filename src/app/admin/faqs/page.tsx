'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FAQ {
    id: string;
    question: string;
    answer: string;
    category_id: string;
    category_name: string;
    display_order: number;
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

export default function FAQsManagement() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [publishedFilter, setPublishedFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);

    // Fetch FAQs
    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const response = await fetch('/api/faqs');

                if (!response.ok) {
                    throw new Error('Failed to fetch FAQs');
                }

                const data = await response.json();
                setFaqs(data.faqs);
                setFilteredFaqs(data.faqs);
            } catch (err) {
                console.error('Error fetching FAQs:', err);
                setError('Failed to load FAQs. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchFaqs();
    }, []);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/faqs/categories');

                if (!response.ok) {
                    throw new Error('Failed to fetch FAQ categories');
                }

                const data = await response.json();
                setCategories(data.categories);
            } catch (err) {
                console.error('Error fetching FAQ categories:', err);
                // Don't set error state here as it's not critical
            }
        };

        fetchCategories();
    }, []);

    // Apply filters
    useEffect(() => {
        let results = [...faqs];

        // Filter by category
        if (categoryFilter !== 'all') {
            results = results.filter(faq => faq.category_id === categoryFilter);
        }

        // Filter by published status
        if (publishedFilter !== 'all') {
            const isPublished = publishedFilter === 'published';
            results = results.filter(faq => faq.is_published === isPublished);
        }

        // Filter by search query
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            results = results.filter(
                faq =>
                    faq.question.toLowerCase().includes(query) ||
                    faq.answer.toLowerCase().includes(query)
            );
        }

        setFilteredFaqs(results);
    }, [faqs, categoryFilter, publishedFilter, searchQuery]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this FAQ? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/faqs/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete FAQ');
            }

            // Remove the deleted FAQ from the state
            setFaqs(currentFaqs => currentFaqs.filter(faq => faq.id !== id));
        } catch (err) {
            console.error('Error deleting FAQ:', err);
            setError('Failed to delete FAQ. Please try again later.');
        }
    };

    const handleTogglePublish = async (id: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/faqs/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ is_published: !currentStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update FAQ');
            }

            // Update the FAQ status in the state
            setFaqs(currentFaqs =>
                currentFaqs.map(faq =>
                    faq.id === id ? { ...faq, is_published: !currentStatus } : faq
                )
            );
        } catch (err) {
            console.error('Error updating FAQ:', err);
            setError('Failed to update FAQ. Please try again later.');
        }
    };

    const handleOrderChange = async (id: string, direction: 'up' | 'down') => {
        // Find the current FAQ and its index
        const currentIndex = faqs.findIndex(faq => faq.id === id);
        if (currentIndex === -1) return;

        const currentFaq = faqs[currentIndex];
        let targetIndex: number;

        // Determine the target index based on direction
        if (direction === 'up' && currentIndex > 0) {
            targetIndex = currentIndex - 1;
        } else if (direction === 'down' && currentIndex < faqs.length - 1) {
            targetIndex = currentIndex + 1;
        } else {
            return; // Can't move further in that direction
        }

        // Get the target FAQ
        const targetFaq = faqs[targetIndex];

        // Swap the order values
        try {
            const response = await fetch(`/api/faqs/${id}/reorder`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    newOrder: targetFaq.display_order,
                    swapWithId: targetFaq.id,
                    swapWithOrder: currentFaq.display_order
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update FAQ order');
            }

            // Update the FAQ order in the state
            const updatedFaqs = [...faqs];
            updatedFaqs[currentIndex] = { ...currentFaq, display_order: targetFaq.display_order };
            updatedFaqs[targetIndex] = { ...targetFaq, display_order: currentFaq.display_order };

            // Sort by order
            updatedFaqs.sort((a, b) => a.display_order - b.display_order);

            setFaqs(updatedFaqs);
        } catch (err) {
            console.error('Error updating FAQ order:', err);
            setError('Failed to update FAQ order. Please try again later.');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Frequently Asked Questions</h1>
                <div className="space-x-2">
                    <Link
                        href="/admin/faqs/new"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                        Add New FAQ
                    </Link>
                    <Link
                        href="/admin/faqs/categories"
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                        Manage Categories
                    </Link>
                </div>
            </div>

            {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div className="mb-6 bg-white p-4 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                            Search
                        </label>
                        <input
                            type="text"
                            id="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search FAQs..."
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                        </label>
                        <select
                            id="categoryFilter"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="publishedFilter" className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            id="publishedFilter"
                            value={publishedFilter}
                            onChange={(e) => setPublishedFilter(e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="all">All</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : filteredFaqs.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow text-center">
                    <p className="text-gray-500">
                        {faqs.length === 0
                            ? 'No FAQs found. Create your first FAQ!'
                            : 'No FAQs match your filters.'}
                    </p>
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
                                        Question
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredFaqs.map((faq) => (
                                    <tr key={faq.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-1">
                                                <button
                                                    onClick={() => handleOrderChange(faq.id, 'up')}
                                                    className="text-gray-500 hover:text-gray-700"
                                                    title="Move up"
                                                >
                                                    ↑
                                                </button>
                                                <span className="text-sm text-gray-500">{faq.display_order}</span>
                                                <button
                                                    onClick={() => handleOrderChange(faq.id, 'down')}
                                                    className="text-gray-500 hover:text-gray-700"
                                                    title="Move down"
                                                >
                                                    ↓
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="text-sm font-medium text-gray-900">{faq.question}</div>
                                                <div className="text-sm text-gray-500 truncate max-w-xs">{faq.answer}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{faq.category_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${faq.is_published
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {faq.is_published ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleTogglePublish(faq.id, faq.is_published)}
                                                    className={`px-2 py-1 rounded text-xs font-medium ${faq.is_published
                                                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        }`}
                                                >
                                                    {faq.is_published ? 'Unpublish' : 'Publish'}
                                                </button>
                                                <Link
                                                    href={`/admin/faqs/${faq.id}/edit`}
                                                    className="text-blue-600 hover:text-blue-900 px-2 py-1"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(faq.id)}
                                                    className="text-red-600 hover:text-red-900 px-2 py-1"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
} 