'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';

interface Category {
    id: string;
    name: string;
}

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category_id: string;
    featured: boolean;
    published: boolean;
    created_at: string;
    updated_at: string;
}

interface EditBlogPostParams {
    params: {
        id: string;
    };
}

export default function EditBlogPost({ params }: EditBlogPostParams) {
    const router = useRouter();
    const unwrappedParams = use(params);
    const { id } = unwrappedParams;

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

    const [formData, setFormData] = useState<BlogPost>({
        id: '',
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category_id: '',
        featured: false,
        published: false,
        created_at: '',
        updated_at: ''
    });

    // Fetch blog post data
    useEffect(() => {
        const fetchBlogPost = async () => {
            try {
                const response = await fetch(`/api/blog/posts/${id}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch blog post');
                }

                const data = await response.json();
                setFormData(data.post);
            } catch (err) {
                console.error('Error fetching blog post:', err);
                setError('Failed to load blog post. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBlogPost();
    }, [id]);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/blog/categories');

                if (!response.ok) {
                    throw new Error('Failed to fetch blog categories');
                }

                const data = await response.json();
                setCategories(data.categories);
            } catch (err) {
                console.error('Error fetching blog categories:', err);
                setError('Failed to load blog categories. Please try again later.');
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
            const response = await fetch(`/api/blog/posts/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update blog post');
            }

            router.push('/admin/blog');
        } catch (err) {
            console.error('Error updating blog post:', err);
            setError(err instanceof Error ? err.message : 'Failed to update blog post. Please try again later.');
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
                <h1 className="text-2xl font-bold">Edit Blog Post</h1>
                <Link
                    href="/admin/blog"
                    className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
                >
                    &larr; Back to Blog Posts
                </Link>
            </div>

            {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
                <div className="mb-4">
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
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter post title"
                    />
                </div>

                <div className="mb-4">
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
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="enter-post-slug"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                        URL-friendly version of the title
                    </p>
                </div>

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
                                href="/admin/blog/categories/new"
                                className="text-blue-600 hover:text-blue-800 underline text-sm"
                            >
                                Create a category
                            </Link>
                        </div>
                    )}
                </div>

                <div className="mb-4">
                    <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                        Excerpt *
                    </label>
                    <textarea
                        id="excerpt"
                        name="excerpt"
                        required
                        value={formData.excerpt}
                        onChange={handleChange}
                        rows={2}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Brief summary of the post"
                    ></textarea>
                </div>

                <div className="mb-4">
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                        Content *
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        required
                        value={formData.content}
                        onChange={handleChange}
                        rows={10}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Write your blog post content here..."
                    ></textarea>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="featured"
                            name="featured"
                            checked={formData.featured}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                            Featured Post
                        </label>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="published"
                            name="published"
                            checked={formData.published}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
                            Published
                        </label>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        <p>Created: {new Date(formData.created_at).toLocaleString()}</p>
                        <p>Last Updated: {new Date(formData.updated_at).toLocaleString()}</p>
                    </div>

                    <div className="flex space-x-3">
                        <Link
                            href="/admin/blog"
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                        >
                            {isSubmitting ? 'Updating...' : 'Update Post'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
} 