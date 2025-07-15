// src/app/admin/pages/edit/[id]/page.tsx

'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TipTapEditor from '@/components/editor/TipTapEditor';
import AboutUsEditor from '@/components/editor/AboutUsEditor'; // 1. Import the new editor
import ContactUsEditor from '@/components/editor/ContactUsEditor'; // <-- ADD THIS LINE
import OnlineOrderingEditor from '@/components/editor/OnlineOrderingEditor'; // <-- ADD THIS
import AiCallingEditor from '@/components/editor/AiCallingEditor'; // <-- IMPORT NEW EDITOR
import AiWhatsappEditor from '@/components/editor/AiWhatsappEditor'; // <-- IMPORT NEW EDITOR
import AiSmsEditor from '@/components/editor/AiSmsEditor'; // <-- IMPORT NEW EDITOR
import LeadGenerationEditor from '@/components/editor/LeadGenerationEditor'; // <-- IMPORT NEW EDITOR

import { use } from 'react';

interface PageParams {
    params: {
        id: string;
    };
}

interface Page {
    id: number;
    title: string;
    slug: string;
    parent_id: number | null;
}

export default function EditPage({ params }: PageParams) {
    const router = useRouter();
    const unwrappedParams = use(params);
    const { id } = unwrappedParams;
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pages, setPages] = useState<Page[]>([]);

    const [formData, setFormData] = useState({
        id: parseInt(id),
        title: '',
        slug: '',
        content: '' as string | object, // 2. Allow content to be a string OR an object
        status: 'draft',
        parent_id: null as number | null,
        menu_order: 0,
        page_template: 'default',
        show_in_menu: false,
        show_in_footer: false,
        meta_title: '',
        meta_description: ''
    });

    useEffect(() => {
        const fetchPage = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/pages', { credentials: 'include' });
                if (!response.ok) throw new Error('Failed to fetch pages');

                const data = await response.json();
                const pageData = data.pages.find((page: any) => page.id === parseInt(id));

                if (!pageData) throw new Error('Page not found');

                setPages(data.pages.filter((page: any) => page.id !== parseInt(id)) || []);

                setFormData({
                    id: pageData.id,
                    title: pageData.title,
                    slug: pageData.slug,
                    // 3. Set content correctly based on template
                    content: pageData.content || (pageData.page_template === 'about-us-template' ? {} : ''),
                    status: pageData.status,
                    parent_id: pageData.parent_id || null,
                    menu_order: pageData.menu_order || 0,
                    page_template: pageData.page_template || 'default',
                    show_in_menu: pageData.show_in_menu || false,
                    show_in_footer: pageData.show_in_footer || false,
                    meta_title: pageData.meta_title || '',
                    meta_description: pageData.meta_description || ''
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
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checkbox = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
            return;
        }
        if (name === 'parent_id') {
            setFormData(prev => ({ ...prev, [name]: value === '' ? null : parseInt(value, 10) }));
            return;
        }
        if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) }));
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 4. Update handler to accept string or object
    const handleContentChange = (newContent: string | object) => {
        setFormData(prev => ({ ...prev, content: newContent }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await fetch('/api/pages', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
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

    if (isLoading) return <div>Loading page...</div>;
    if (error) return <div>Error: {error}</div>;

    /**
     * 5. This new function chooses which editor to show based on the page template.
     */
    const renderContentEditor = () => {
        switch (formData.page_template) {
            case 'about-us-template':
                const aboutUsContent = (typeof formData.content === 'object' && formData.content && 'AboutUs' in formData.content)
                    ? (formData.content as any).AboutUs
                    : {};
                const handleAboutUsChange = (newAboutUsData: any) => {
                    handleContentChange({ AboutUs: newAboutUsData });
                };
                return (
                    <AboutUsEditor
                        initialContent={aboutUsContent}
                        onChange={handleAboutUsChange}
                    />
                );

            case 'contact-us-template':
                const contactUsContent = (typeof formData.content === 'object' && formData.content && 'ContactUs' in formData.content)
                    ? (formData.content as any).ContactUs
                    : {};
                const handleContactUsChange = (newContactUsData: any) => {
                    handleContentChange({ ContactUs: newContactUsData });
                };
                return (
                    <ContactUsEditor
                        initialContent={contactUsContent}
                        onChange={handleContactUsChange}
                    />
                );

            case 'online-ordering-template':
                const onlineOrderingContent = (typeof formData.content === 'object' && formData.content && 'OnlineOrderingSystem' in formData.content)
                    ? (formData.content as any).OnlineOrderingSystem
                    : {};
                const handleOnlineOrderingChange = (newOnlineOrderingData: any) => {
                    handleContentChange({ OnlineOrderingSystem: newOnlineOrderingData });
                };
                return (
                    <OnlineOrderingEditor
                        initialContent={onlineOrderingContent}
                        onChange={handleOnlineOrderingChange}
                    />
                );

            case 'ai-calling-template': // <-- ADD NEW CASE
                return <AiCallingEditor initialContent={(formData.content as any)?.AICallingSystem || {}} onChange={(data) => handleContentChange({ AICallingSystem: data })} />;

            case 'ai-whatsapp-template': // <-- ADD NEW CASE
                return <AiWhatsappEditor initialContent={(formData.content as any)?.AIWhatsAppMessaging || {}} onChange={(data) => handleContentChange({ AIWhatsAppMessaging: data })} />;

            case 'ai-sms-template': // <-- ADD NEW CASE
                return <AiSmsEditor initialContent={(formData.content as any)?.AISMSMessaging || {}} onChange={(data) => handleContentChange({ AISMSMessaging: data })} />;

            case 'lead-generation-template': // <-- ADD NEW CASE
                return <LeadGenerationEditor initialContent={(formData.content as any)?.LeadGeneration || {}} onChange={(data) => handleContentChange({ LeadGeneration: data })} />;

            // You could add more custom templates here in the future
            // case 'contact-page-template':
            //     return <ContactEditor ... />;

            default:
                return (
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                            Content
                        </label>
                        <div className="mt-1">
                            <TipTapEditor
                                content={typeof formData.content === 'string' ? formData.content : ''}
                                onChange={handleContentChange}
                                placeholder="Add your page content here..."
                            />
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                            Use the toolbar to format your content.
                        </p>
                    </div>
                );
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            {/* The top part of your form is unchanged */}
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

            {/* The form structure is unchanged */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 space-y-6">
                    {/* Basic Information section is unchanged */}
                    <div className="border-b border-gray-200 pb-6">
                        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    URL-friendly version of the title.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* This is the only section that has been replaced */}
                    <div className="border-b border-gray-200 pb-6">
                        <h2 className="text-lg font-semibold mb-4">Page Content</h2>
                        {renderContentEditor()} {/* 6. Call the new render function here */}
                    </div>

                    {/* Site Structure section is unchanged */}
                    <div className="border-b border-gray-200 pb-6">
                        <h2 className="text-lg font-semibold mb-4">Site Structure</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="parent_id" className="block text-sm font-medium text-gray-700 mb-1">
                                    Parent Page
                                </label>
                                <select
                                    id="parent_id"
                                    name="parent_id"
                                    value={formData.parent_id === null ? '' : formData.parent_id}
                                    onChange={handleChange}
                                    className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-orange focus:border-primary-orange sm:text-sm p-2"
                                >
                                    <option value="">None (Top Level)</option>
                                    {pages.map((page) => (
                                        <option key={page.id} value={page.id}>{page.title}</option>
                                    ))}
                                </select>
                                <p className="mt-1 text-sm text-gray-500">
                                    Select a parent page if this is a subpage.
                                </p>
                            </div>

                            <div>
                                <label htmlFor="menu_order" className="block text-sm font-medium text-gray-700 mb-1">
                                    Menu Order
                                </label>
                                <input
                                    type="number"
                                    id="menu_order"
                                    name="menu_order"
                                    min="0"
                                    value={formData.menu_order}
                                    onChange={handleChange}
                                    className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-orange focus:border-primary-orange sm:text-sm p-2"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Controls the order in menus (lower numbers appear first).
                                </p>
                            </div>

                            <div>
                                <label htmlFor="page_template" className="block text-sm font-medium text-gray-700 mb-1">
                                    Page Template
                                </label>
                                <select
                                    id="page_template"
                                    name="page_template"
                                    value={formData.page_template}
                                    onChange={handleChange}
                                    className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-orange focus:border-primary-orange sm:text-sm p-2"
                                >
                                    <option value="default">Default</option>
                                    <option value="full-width">Full Width</option>
                                    <option value="sidebar">With Sidebar</option>
                                    <option value="landing-page">Landing Page</option>
                                </select>
                                <p className="mt-1 text-sm text-gray-500">
                                    Template affects the page layout.
                                </p>
                            </div>

                            <div className="flex items-center space-x-6">
                                <div className="flex items-center h-5">
                                    <input
                                        id="show_in_menu"
                                        name="show_in_menu"
                                        type="checkbox"
                                        checked={formData.show_in_menu}
                                        onChange={handleChange}
                                        className="focus:ring-primary-orange h-4 w-4 text-primary-orange border-gray-300 rounded"
                                    />
                                    <label htmlFor="show_in_menu" className="ml-2 text-sm font-medium text-gray-700">
                                        Show in Main Menu
                                    </label>
                                </div>

                                <div className="flex items-center h-5">
                                    <input
                                        id="show_in_footer"
                                        name="show_in_footer"
                                        type="checkbox"
                                        checked={formData.show_in_footer}
                                        onChange={handleChange}
                                        className="focus:ring-primary-orange h-4 w-4 text-primary-orange border-gray-300 rounded"
                                    />
                                    <label htmlFor="show_in_footer" className="ml-2 text-sm font-medium text-gray-700">
                                        Show in Footer
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SEO section is unchanged */}
                    <div className="border-b border-gray-200 pb-6">
                        <h2 className="text-lg font-semibold mb-4">SEO Settings</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 mb-1">
                                    Meta Title
                                </label>
                                <input
                                    type="text"
                                    id="meta_title"
                                    name="meta_title"
                                    value={formData.meta_title}
                                    onChange={handleChange}
                                    className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-orange focus:border-primary-orange sm:text-sm p-2"
                                    placeholder="Optional custom title for search engines"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Leave empty to use page title.
                                </p>
                            </div>

                            <div>
                                <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Meta Description
                                </label>
                                <textarea
                                    id="meta_description"
                                    name="meta_description"
                                    rows={3}
                                    value={formData.meta_description}
                                    onChange={handleChange}
                                    className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-orange focus:border-primary-orange sm:text-sm p-2"
                                    placeholder="Brief description for search engines"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Keep under 160 characters for best SEO results.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Publishing Settings section is unchanged */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Publishing</h2>
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
                </div>

                {/* The footer with buttons is unchanged */}
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