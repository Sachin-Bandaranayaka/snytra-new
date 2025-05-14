'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';

interface Category {
    id: string;
    name: string;
}

interface FAQ {
    id: string;
    question: string;
    answer: string;
    category_id: string;
    display_order: number;
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

export default function EditFAQ({ params }: { params: { id: string } }) {
    const router = useRouter();
    // Unwrap params using React.use
    const unwrappedParams = use(params);
    const id = unwrappedParams.id;

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

    const [formData, setFormData] = useState<FAQ>({
        id: '',
        question: '',
        answer: '',
        category_id: '',
        display_order: 0,
        is_published: false,
        created_at: '',
        updated_at: ''
    });

    // Fetch FAQ data
    useEffect(() => {
        const fetchFAQ = async () => {
            try {
                const response = await fetch(`/api/faqs/${id}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch FAQ');
                }

                const data = await response.json();
                setFormData(data.faq);
            } catch (err) {
                console.error('Error fetching FAQ:', err);
                setError('Failed to load FAQ. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchFAQ();
    }, [id]);

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
                setError('Failed to load FAQ categories. Please try again later.');
            } finally {
                setIsLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`/api/faqs/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update FAQ');
            }

            router.push('/admin/faqs');
        } catch (err) {
            console.error('Error updating FAQ:', err);
            setError(err instanceof Error ? err.message : 'Failed to update FAQ. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Edit FAQ</h1>
                <Link
                    href="/admin/faqs"
                    className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
                >
                    &larr; Back to FAQs
                </Link>
            </div>

            {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
                <div className="mb-4">
                    <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                    </label>
                    {isLoadingCategories ? (
                        <div className="text-sm text-gray-500">Loading categories...</div>
                    ) : categories.length > 0 ? (
                        <select
                            id="category_id"
                            name="category_id"
                            required
                            value={formData.category_id}
                            onChange={handleChange}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="">Select a category</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <div className="flex flex-col">
                            <div className="text-sm text-red-500 mb-2">No categories found. Please create a category first.</div>
                            <Link
                                href="/admin/faqs/categories"
                                className="text-blue-600 hover:text-blue-800 underline text-sm"
                            >
                                Create a category
                            </Link>
                        </div>
                    )}
                </div>

                <div className="mb-4">
                    <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
                        Question *
                    </label>
                    <input
                        type="text"
                        id="question"
                        name="question"
                        required
                        value={formData.question}
                        onChange={handleChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter the question"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">
                        Answer *
                    </label>
                    <textarea
                        id="answer"
                        name="answer"
                        required
                        value={formData.answer}
                        onChange={handleChange}
                        rows={5}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter the answer"
                    ></textarea>
                </div>

                <div className="mb-4">
                    <label htmlFor="display_order" className="block text-sm font-medium text-gray-700 mb-1">
                        Display Order
                    </label>
                    <input
                        type="number"
                        id="display_order"
                        name="display_order"
                        value={formData.display_order}
                        onChange={handleChange}
                        min="0"
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="0"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                        FAQs are displayed in ascending order (lower numbers first)
                    </p>
                </div>

                <div className="mb-6">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="is_published"
                            name="is_published"
                            checked={formData.is_published}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_published" className="ml-2 block text-sm text-gray-900">
                            Published
                        </label>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                        Only published FAQs are visible to customers
                    </p>
                </div>

                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        <p>Created: {new Date(formData.created_at).toLocaleString()}</p>
                        <p>Last Updated: {new Date(formData.updated_at).toLocaleString()}</p>
                    </div>

                    <div className="flex space-x-3">
                        <Link
                            href="/admin/faqs"
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                        >
                            {isSubmitting ? 'Updating...' : 'Update FAQ'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
} 