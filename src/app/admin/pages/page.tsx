'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Page {
    id: number;
    title: string;
    slug: string;
    status: 'published' | 'draft';
    updated_at: string;
    parent_id: number | null;
    menu_order: number;
    show_in_menu: boolean;
    show_in_footer: boolean;
    page_template: string;
    children?: Page[];
}

export default function PagesManagement() {
    const [pages, setPages] = useState<Page[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [debugInfo, setDebugInfo] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'list' | 'sitemap'>('list');

    useEffect(() => {
        const fetchPages = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/pages', {
                    credentials: 'include',
                    headers: {
                        'Cache-Control': 'no-cache'
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to fetch pages: ${response.status} - ${errorText || response.statusText}`);
                }

                const data = await response.json();
                setDebugInfo(`Found ${data.pages?.length || 0} pages`);

                if (!data.pages || !Array.isArray(data.pages)) {
                    setPages([]);
                    setDebugInfo(`Pages data is not an array or is missing: ${JSON.stringify(data)}`);
                    return;
                }

                // Create a hierarchical structure for the sitemap view
                const structuredPages = createPageHierarchy(data.pages);
                setPages(structuredPages);
            } catch (err) {
                console.error('Error loading pages:', err);
                setError(`Error loading pages: ${err instanceof Error ? err.message : String(err)}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPages();
    }, []);

    // Function to create a hierarchical structure for pages
    const createPageHierarchy = (flatPages: Page[]): Page[] => {
        // First, create a map of pages by ID
        const pagesMap = new Map<number, Page>();
        flatPages.forEach(page => {
            pagesMap.set(page.id, { ...page, children: [] });
        });

        // Then create the hierarchy by adding children to their parents
        const rootPages: Page[] = [];
        pagesMap.forEach(page => {
            if (page.parent_id === null) {
                rootPages.push(page);
            } else {
                const parent = pagesMap.get(page.parent_id);
                if (parent) {
                    if (!parent.children) {
                        parent.children = [];
                    }
                    parent.children.push(page);
                } else {
                    // If parent doesn't exist, treat as root page
                    rootPages.push(page);
                }
            }
        });

        // Sort pages by menu_order
        const sortByOrder = (pages: Page[]) => {
            pages.sort((a, b) => a.menu_order - b.menu_order);
            pages.forEach(page => {
                if (page.children && page.children.length > 0) {
                    sortByOrder(page.children);
                }
            });
        };

        sortByOrder(rootPages);
        return rootPages;
    };

    const handleDeletePage = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this page?')) {
            try {
                const response = await fetch('/api/pages', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id }),
                    credentials: 'include'
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to delete page: ${response.status} - ${errorText || response.statusText}`);
                }

                // Remove the deleted page from state
                const updatePages = (pages: Page[]): Page[] => {
                    return pages.filter(page => {
                        if (page.id === id) return false;
                        if (page.children && page.children.length > 0) {
                            page.children = updatePages(page.children);
                        }
                        return true;
                    });
                };

                setPages(updatePages([...pages]));
            } catch (err) {
                console.error('Error deleting page:', err);
                setError(`Failed to delete page: ${err instanceof Error ? err.message : String(err)}`);
            }
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            }).format(date);
        } catch (err) {
            return 'Invalid date';
        }
    };

    // Render a sitemap tree node
    const renderSitemapNode = (page: Page, depth = 0) => {
        return (
            <div key={page.id} className={`mb-2 ${depth > 0 ? 'ml-6' : ''}`}>
                <div
                    className={`flex items-center p-3 rounded-md ${page.status === 'published' ? 'bg-white' : 'bg-gray-50'
                        } border border-gray-200 hover:shadow-sm transition-shadow`}
                >
                    <div className="flex-grow">
                        <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900">{page.title}</h3>
                            <span className={`px-2 text-xs leading-5 font-semibold rounded-full ${page.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {page.status}
                            </span>
                            {page.show_in_menu && (
                                <span className="px-2 text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    Menu
                                </span>
                            )}
                            {page.show_in_footer && (
                                <span className="px-2 text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                    Footer
                                </span>
                            )}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                            <span className="mr-3">/{page.slug}</span>
                            <span>Template: {page.page_template || 'default'}</span>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link
                            href={`/admin/pages/edit/${page.id}`}
                            className="text-blue-600 hover:text-blue-900 p-1"
                        >
                            Edit
                        </Link>
                        <button
                            onClick={() => handleDeletePage(page.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                        >
                            Delete
                        </button>
                    </div>
                </div>
                {page.children && page.children.length > 0 && (
                    <div className="mt-2 border-l-2 border-gray-200 pl-2">
                        {page.children.map(childPage => renderSitemapNode(childPage, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading pages...</p>
                </div>
            </div>
        );
    }

    // Flatten the hierarchical pages for list view
    const flattenPages = (pages: Page[]): Page[] => {
        let result: Page[] = [];
        pages.forEach(page => {
            result.push(page);
            if (page.children && page.children.length > 0) {
                result = [...result, ...flattenPages(page.children)];
            }
        });
        return result;
    };

    const flatPages = flattenPages(pages);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Pages</h1>
                <Link
                    href="/admin/pages/new"
                    className="bg-primary-orange text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                    Add New Page
                </Link>
            </div>

            {debugInfo && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
                    <p className="text-sm">Debug info: {debugInfo}</p>
                </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p>{error}</p>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="flex space-x-8">
                    <button
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'list'
                            ? 'border-primary-orange text-primary-orange'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        onClick={() => setActiveTab('list')}
                    >
                        List View
                    </button>
                    <button
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'sitemap'
                            ? 'border-primary-orange text-primary-orange'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        onClick={() => setActiveTab('sitemap')}
                    >
                        Site Map
                    </button>
                </nav>
            </div>

            {activeTab === 'list' ? (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Title
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Slug
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Placement
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Last Updated
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {flatPages.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">No pages found. <Link href="/admin/pages/new" className="text-primary-orange hover:underline">Create your first page</Link></td>
                                </tr>
                            ) : (
                                flatPages.map((page) => (
                                    <tr key={page.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{page.title}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">/{page.slug}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${page.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {page.status === 'published' ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500 flex flex-col space-y-1">
                                                {page.show_in_menu && (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        Main Menu
                                                    </span>
                                                )}
                                                {page.show_in_footer && (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                                        Footer
                                                    </span>
                                                )}
                                                {!page.show_in_menu && !page.show_in_footer && (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                        Not Displayed
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(page.updated_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link
                                                href={`/admin/pages/edit/${page.id}`}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDeletePage(page.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-medium mb-4">Site Structure</h2>
                    {pages.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No pages found. <Link href="/admin/pages/new" className="text-primary-orange hover:underline">Create your first page</Link>
                        </div>
                    ) : (
                        <div className="space-y-4 mt-6">
                            {pages.map(page => renderSitemapNode(page))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
} 