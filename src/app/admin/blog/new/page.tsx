'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/providers/StackAdminAuth';
import TipTapEditor from '@/components/editor/TipTapEditor';
import FeaturedImageModal from '@/components/editor/FeaturedImageModal';

interface Category {
    id: string;
    name: string;
}

export default function CreateBlogPost() {
    const router = useRouter();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [showImageModal, setShowImageModal] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        featured_image: '',
        category_id: '',
        featured: false,
        published: false,
    });

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

        // Auto-generate slug from title if the slug field hasn't been manually edited
        if (name === 'title') {
            setFormData(prev => ({
                ...prev,
                slug: value.toLowerCase()
                    .replace(/[^\w\s-]/g, '') // Remove special characters except whitespace and dash
                    .replace(/\s+/g, '-') // Replace spaces with dashes
                    .replace(/-+/g, '-') // Replace multiple dashes with a single dash
            }));
        }
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleContentChange = (html: string) => {
        setFormData(prev => ({ ...prev, content: html }));
    };

    const handleFeaturedImageSelect = (imageUrl: string) => {
        setFormData(prev => ({ ...prev, featured_image: imageUrl }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        if (!user?.id) {
            setError('User authentication required');
            setIsSubmitting(false);
            return;
        }

        try {
            // Transform form data to match API requirements
            const postData = {
                title: formData.title,
                slug: formData.slug,
                content: formData.content,
                excerpt: formData.excerpt,
                featured_image: formData.featured_image,
                authorId: user?.id ? 1 : 1, // Hardcode to admin user (ID 1) to ensure a valid user ID
                status: formData.published ? 'published' : 'draft',
                categories: formData.category_id ? [formData.category_id] : []
            };

            const response = await fetch('/api/blog/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create blog post');
            }

            router.push('/admin/blog');
        } catch (err) {
            console.error('Error creating blog post:', err);
            setError(err instanceof Error ? err.message : 'Failed to create blog post. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-primary">Create New Blog Post</h1>
                <Link
                    href="/admin/blog"
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
                    Back to Blog Posts
                </Link>
            </div>

            {error && (
                <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
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
                                    className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2"
                                    placeholder="Enter post title"
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
                                    className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2"
                                    placeholder="enter-post-slug"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    URL-friendly version of the title. Auto-generated but can be edited.
                                </p>
                            </div>

                            <div>
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
                                        className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2"
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

                            <div>
                                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                                    Excerpt *
                                </label>
                                <textarea
                                    id="excerpt"
                                    name="excerpt"
                                    required
                                    value={formData.excerpt}
                                    onChange={handleChange}
                                    rows={3}
                                    className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm p-2"
                                    placeholder="Brief summary of the post"
                                ></textarea>
                                <p className="mt-1 text-sm text-gray-500">
                                    A short description that appears in blog listings and search results.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Featured Image
                                </label>

                                {formData.featured_image ? (
                                    <div className="mb-3">
                                        <div className="relative aspect-video rounded-md overflow-hidden shadow-sm">
                                            <Image
                                                src={formData.featured_image}
                                                alt="Featured image"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowImageModal(true)}
                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                            >
                                                Change image
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, featured_image: '' }))}
                                                className="text-red-600 hover:text-red-800 text-sm"
                                            >
                                                Remove image
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setShowImageModal(true)}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                    >
                                        <svg
                                            className="-ml-1 mr-2 h-5 w-5 text-gray-500"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        Add Featured Image
                                    </button>
                                )}
                            </div>

                            <div className="flex space-x-6">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="featured"
                                        name="featured"
                                        checked={formData.featured}
                                        onChange={handleCheckboxChange}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
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
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
                                        Publish Immediately
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                            Content *
                        </label>
                        <TipTapEditor
                            content={formData.content}
                            onChange={handleContentChange}
                            placeholder="Write your blog post content here..."
                            className="min-h-[400px] mb-4"
                        />
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                    <Link
                        href="/admin/blog"
                        className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Creating...' : 'Create Post'}
                    </button>
                </div>
            </form>

            <FeaturedImageModal
                isOpen={showImageModal}
                onClose={() => setShowImageModal(false)}
                onSelectImage={handleFeaturedImageSelect}
                currentImage={formData.featured_image}
            />
        </div>
    );
} 