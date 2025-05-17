"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, AlertTriangle, ArrowLeft, CalendarClock, Flag, Globe, Loader2 } from 'lucide-react';
import { use } from 'react';

interface NoticeParams {
    params: {
        id: string;
    };
}

export default function EditNotice({ params }: NoticeParams) {
    const unwrappedParams = use(params);
    const noticeId = unwrappedParams.id;
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        important: false,
        published: true,
        expiresAt: ''
    });

    // Fetch notice data
    useEffect(() => {
        const fetchNotice = async () => {
            try {
                const response = await fetch(`/api/notices/${noticeId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch notice');
                }

                const data = await response.json();
                const notice = data.notice;

                setFormData({
                    title: notice.title,
                    content: notice.content,
                    important: notice.important,
                    published: notice.published,
                    expiresAt: notice.expires_at ? new Date(notice.expires_at).toISOString().slice(0, 16) : ''
                });

                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching notice:', err);
                setError('Failed to load notice. Please try again.');
                setIsLoading(false);
            }
        };

        fetchNotice();
    }, [noticeId]);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle checkbox changes
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    // Handle form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`/api/notices/${noticeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: formData.title,
                    content: formData.content,
                    important: formData.important,
                    published: formData.published,
                    expiresAt: formData.expiresAt || null
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update notice');
            }

            // Redirect to notices list
            router.push('/admin/notices');
            router.refresh();
        } catch (err) {
            console.error('Error updating notice:', err);
            setError('Failed to update notice. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-dashboard-bg rounded-lg">
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Bell className="text-primary-orange" size={24} />
                            <h1 className="text-2xl font-bold text-charcoal">Edit Notice</h1>
                        </div>
                        <p className="text-darkGray mt-1">Update system notice or announcement</p>
                    </div>
                    <Link
                        href="/admin/notices"
                        className="text-primary-orange hover:text-primary transition-colors duration-200 flex items-center gap-1"
                    >
                        <ArrowLeft size={16} />
                        <span>Back to Notices</span>
                    </Link>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded shadow mb-6">
                    <div className="flex items-center">
                        <AlertTriangle className="text-red-500 mr-2" size={18} />
                        <span className="text-red-700">{error}</span>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow">
                    <div className="flex flex-col items-center">
                        <Loader2 className="h-12 w-12 text-primary-orange animate-spin" />
                        <span className="mt-4 text-darkGray">Loading notice...</span>
                    </div>
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="title" className="block text-sm font-medium text-charcoal mb-1">
                                Notice Title *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-orange focus:border-primary-orange"
                                placeholder="Enter notice title"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="content" className="block text-sm font-medium text-charcoal mb-1">
                                Content *
                            </label>
                            <textarea
                                id="content"
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                required
                                rows={5}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-orange focus:border-primary-orange"
                                placeholder="Enter notice content"
                            ></textarea>
                        </div>

                        <div className="mb-5">
                            <label htmlFor="expiresAt" className="block text-sm font-medium text-charcoal mb-1 flex items-center gap-1">
                                <CalendarClock size={16} />
                                <span>Expiration Date (Optional)</span>
                            </label>
                            <input
                                type="datetime-local"
                                id="expiresAt"
                                name="expiresAt"
                                value={formData.expiresAt}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-orange focus:border-primary-orange"
                            />
                        </div>

                        <div className="mb-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="important"
                                    name="important"
                                    checked={formData.important}
                                    onChange={handleCheckboxChange}
                                    className="h-4 w-4 text-primary-orange focus:ring-primary-orange border-gray-300 rounded"
                                />
                                <label htmlFor="important" className="ml-2 flex items-center gap-1 text-sm text-charcoal">
                                    <Flag size={16} className="text-amber-600" />
                                    <span>Mark as Important</span>
                                </label>
                            </div>
                            <p className="text-xs text-darkGray ml-6 mt-1">Important notices will be highlighted to users with priority</p>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="published"
                                    name="published"
                                    checked={formData.published}
                                    onChange={handleCheckboxChange}
                                    className="h-4 w-4 text-primary-orange focus:ring-primary-orange border-gray-300 rounded"
                                />
                                <label htmlFor="published" className="ml-2 flex items-center gap-1 text-sm text-charcoal">
                                    <Globe size={16} className="text-green-600" />
                                    <span>Publish Notice</span>
                                </label>
                            </div>
                            <p className="text-xs text-darkGray ml-6 mt-1">If unchecked, the notice will be saved as a draft</p>
                        </div>

                        <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                            <Link
                                href="/admin/notices"
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-charcoal hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-orange mr-3 transition-colors duration-200"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-orange hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isSubmitting ? 'Updating...' : 'Update Notice'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
} 