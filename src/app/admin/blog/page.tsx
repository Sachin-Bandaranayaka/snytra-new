'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    category_id: string;
    category_name: string;
    featured: boolean;
    published: boolean;
    created_at: string;
    updated_at: string;
}

export default function BlogPostsManagement() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [publishedFilter, setPublishedFilter] = useState<string>('all');
    const [featuredFilter, setFeaturedFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('/api/blog/posts?admin=true');

                if (!response.ok) {
                    throw new Error('Failed to fetch blog posts');
                }

                const data = await response.json();
                setPosts(data.posts);
                setFilteredPosts(data.posts);
            } catch (err) {
                console.error('Error fetching blog posts:', err);
                setError('Failed to load blog posts. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPosts();
    }, []);

    useEffect(() => {
        // Apply filters
        let result = [...posts];

        // Apply published filter
        if (publishedFilter !== 'all') {
            const isPublished = publishedFilter === 'published';
            result = result.filter(post => post.published === isPublished);
        }

        // Apply featured filter
        if (featuredFilter !== 'all') {
            const isFeatured = featuredFilter === 'featured';
            result = result.filter(post => post.featured === isFeatured);
        }

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                post =>
                    post.title.toLowerCase().includes(query) ||
                    post.excerpt.toLowerCase().includes(query) ||
                    post.category_name.toLowerCase().includes(query)
            );
        }

        setFilteredPosts(result);
    }, [posts, publishedFilter, featuredFilter, searchQuery]);

    const handleDeletePost = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this blog post?')) {
            try {
                const response = await fetch(`/api/blog/posts/${id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error('Failed to delete blog post');
                }

                // Remove the deleted post from state
                setPosts(posts.filter(post => post.id !== id));
            } catch (err) {
                console.error('Error deleting blog post:', err);
                setError('Failed to delete blog post. Please try again later.');
            }
        }
    };

    const handleTogglePublish = async (id: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/blog/posts/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ published: !currentStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update blog post');
            }

            // Update the post's published status in state
            setPosts(posts.map(post =>
                post.id === id ? { ...post, published: !currentStatus } : post
            ));
        } catch (err) {
            console.error('Error updating blog post:', err);
            setError('Failed to update blog post. Please try again later.');
        }
    };

    const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/blog/posts/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ featured: !currentStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update blog post');
            }

            // Update the post's featured status in state
            setPosts(posts.map(post =>
                post.id === id ? { ...post, featured: !currentStatus } : post
            ));
        } catch (err) {
            console.error('Error updating blog post:', err);
            setError('Failed to update blog post. Please try again later.');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Blog Posts Management</h1>
                <div className="space-x-2">
                    <Link
                        href="/admin/blog/new"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                        Add New Post
                    </Link>
                    <Link
                        href="/admin/blog/categories"
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                        Manage Categories
                    </Link>
                </div>
            </div>

            <div className="mb-6 bg-white p-4 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                            Search Posts
                        </label>
                        <input
                            type="text"
                            id="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by title, excerpt, or category"
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="publishedFilter" className="block text-sm font-medium text-gray-700 mb-1">
                            Publish Status
                        </label>
                        <select
                            id="publishedFilter"
                            value={publishedFilter}
                            onChange={(e) => setPublishedFilter(e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="all">All Posts</option>
                            <option value="published">Published</option>
                            <option value="draft">Drafts</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="featuredFilter" className="block text-sm font-medium text-gray-700 mb-1">
                            Featured Status
                        </label>
                        <select
                            id="featuredFilter"
                            value={featuredFilter}
                            onChange={(e) => setFeaturedFilter(e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="all">All Posts</option>
                            <option value="featured">Featured</option>
                            <option value="not-featured">Not Featured</option>
                        </select>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center min-h-[300px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                </div>
            ) : filteredPosts.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow text-center">
                    <p className="text-gray-500">No blog posts found</p>
                </div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Title
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPosts.map(post => (
                                <tr key={post.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {post.title}
                                                    {post.featured && (
                                                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                            Featured
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                                    {post.excerpt}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{post.category_name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{formatDate(post.created_at)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${post.published
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'}`
                                        }>
                                            {post.published ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <Link
                                                href={`/admin/blog/edit/${post.id}`}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleTogglePublish(post.id, post.published)}
                                                className={`${post.published ? 'text-gray-600 hover:text-gray-900' : 'text-green-600 hover:text-green-900'
                                                    }`}
                                            >
                                                {post.published ? 'Unpublish' : 'Publish'}
                                            </button>
                                            <button
                                                onClick={() => handleToggleFeatured(post.id, post.featured)}
                                                className={`${post.featured ? 'text-gray-600 hover:text-gray-900' : 'text-yellow-600 hover:text-yellow-900'
                                                    }`}
                                            >
                                                {post.featured ? 'Unfeature' : 'Feature'}
                                            </button>
                                            <button
                                                onClick={() => handleDeletePost(post.id)}
                                                className="text-red-600 hover:text-red-900"
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
            )}
        </div>
    );
} 