'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    image_url: string;
}

export default function EditBlogPost({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { id } = params;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    const [formData, setFormData] = useState<BlogPost>({
        id: '',
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category_id: '',
        featured: false,
        published: false,
        image_url: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Fetch blog post
                const postResponse = await fetch(`/api/blog/posts/${id}`);

                if (!postResponse.ok) {
                    throw new Error('Failed to fetch blog post');
                }

                const postData = await postResponse.json();
                setFormData(postData.post);

                // Fetch categories
                const categoriesResponse = await fetch('/api/blog/categories');

                if (!categoriesResponse.ok) {
                    throw new Error('Failed to fetch categories');
                }

                const categoriesData = await categoriesResponse.json();
                setCategories(categoriesData.categories);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load data. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const generateSlug = () => {
        if (formData.title) {
            const slug = formData.title
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();

            setFormData(prev => ({
                ...prev,
                slug
            }));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.content || !formData.category_id) {
            setError('Please fill in all required fields');
            return;
        }

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
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
            console.error('Error updating blog post:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
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
                    className="text-blue-600 hover:text-blue-800"
                >
                    ← Back to Blog Posts
                </Link>
            </div>

            {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                            Slug <span className="text-red-500">*</span>
                        </label>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                id="slug"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            />
                            <button
                                type="button"
                                onClick={generateSlug}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm"
                            >
                                Generate
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                        Excerpt <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="excerpt"
                        name="excerpt"
                        value={formData.excerpt}
                        onChange={handleChange}
                        rows={2}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                        Content <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        rows={10}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="category_id"
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
                            Image URL
                        </label>
                        <input
                            type="text"
                            id="image_url"
                            name="image_url"
                            value={formData.image_url}
                            onChange={handleChange}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                </div>

                <div className="flex space-x-6">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="featured"
                            name="featured"
                            checked={formData.featured}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                            Mark as featured
                        </label>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="published"
                            name="published"
                            checked={formData.published}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
                            Published
                        </label>
                    </div>
                </div>

                <div className="flex justify-end space-x-3">
                    <Link
                        href="/admin/blog"
                        className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                        {isSubmitting ? 'Updating...' : 'Update Post'}
                    </button>
                </div>
            </form>
        </div>
    );
} 