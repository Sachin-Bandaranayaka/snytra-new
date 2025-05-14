'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TipTapEditor from '@/components/editor/TipTapEditor';

interface PageParams {
    params: {
        id: string;
    };
}

export default function EditPage({ params }: PageParams) {
    const router = useRouter();
    const { id } = params;
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        id: parseInt(id),
        title: '',
        slug: '',
        content: '',
        status: 'draft'
    });

    useEffect(() => {
        const fetchPage = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Normally we would fetch a specific page by ID, but the API route doesn't support that yet
                // So we'll fetch all pages and find the one we need
                const response = await fetch('/api/pages', { credentials: 'include' });

                if (!response.ok) {
                    throw new Error('Failed to fetch page');
                }

                const data = await response.json();
                const pageData = data.pages.find((page: any) => page.id === parseInt(id));

                if (!pageData) {
                    throw new Error('Page not found');
                }

                setFormData({
                    id: pageData.id,
                    title: pageData.title,
                    slug: pageData.slug,
                    content: pageData.content || '',
                    status: pageData.status
                });
            } catch (err) {
                console.error('Error fetching page:', err);
                setError(err instanceof Error ? err.message : 'Failed to load page. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPage();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleContentChange = (html: string) => {
        setFormData(prev => ({ ...prev, content: html }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/pages', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update page');
            }

            router.push('/admin/pages');
        } catch (err) {
            console.error('Error updating page:', err);
            setError(err instanceof Error ? err.message : 'Failed to update page. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading page...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6 max-w-4xl">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p>{error}</p>
                </div>
                <Link
                    href="/admin/pages"
                    className="text-blue-600 hover:text-blue-800 mt-2 inline-flex items-center"
                >
                    Back to Pages
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Edit Page</h1>
                <Link
                    href="/admin/pages"
                    className="text-blue-600 hover:text-blue-800 mt-2 inline-flex items-center"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                    </svg>
                    Back to Pages
                </Link>
            </div>

            {error && (
                <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-orange focus:border-primary-orange sm:text-sm p-2"
                            placeholder="Enter page title"
                        />
                    </div>

                    <div>
                        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                            Slug *
                        </label>
                        <input
                            type="text"
                            id="slug"
                            name="slug"
                            required
                            value={formData.slug}
                            onChange={handleChange}
                            className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-orange focus:border-primary-orange sm:text-sm p-2"
                            placeholder="enter-page-slug"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            URL-friendly version of the title.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                            Content
                        </label>
                        <div className="mt-1">
                            <TipTapEditor
                                content={formData.content}
                                onChange={handleContentChange}
                                placeholder="Add your page content here..."
                                className="min-h-[400px] prose max-w-full p-4"
                            />
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                            Use the toolbar to format your content with headings, lists, links, images, and more.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-orange focus:border-primary-orange sm:text-sm p-2"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 text-right">
                    <Link
                        href="/admin/pages"
                        className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-4 py-2 text-sm font-medium text-white bg-primary-orange border border-transparent rounded-md shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-orange ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
} 