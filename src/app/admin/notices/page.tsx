"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, AlertTriangle, Check, X, Edit, Trash2, EyeOff, Eye } from 'lucide-react';

interface Notice {
    id: number;
    title: string;
    content: string;
    important: boolean;
    published: boolean;
    created_at: string;
    updated_at: string;
    expires_at: string | null;
}

export default function NoticesManagement() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch notices
    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const response = await fetch('/api/notices');
                if (!response.ok) {
                    throw new Error('Failed to fetch notices');
                }

                const data = await response.json();
                setNotices(data.notices || []);
                setLoading(false);
            } catch (err) {
                setError('Failed to load notices. Please try again.');
                setLoading(false);
                console.error('Error fetching notices:', err);
            }
        };

        fetchNotices();
    }, []);

    // Handle delete notice
    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this notice?')) {
            return;
        }

        try {
            const response = await fetch(`/api/notices/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete notice');
            }

            // Remove from UI
            setNotices(notices.filter(notice => notice.id !== id));
        } catch (err) {
            console.error('Error deleting notice:', err);
            alert('Failed to delete notice. Please try again.');
        }
    };

    // Handle toggle publish
    const handleTogglePublish = async (id: number, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/notices/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    published: !currentStatus
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update notice');
            }

            // Update in UI
            setNotices(notices.map(notice =>
                notice.id === id
                    ? { ...notice, published: !currentStatus }
                    : notice
            ));
        } catch (err) {
            console.error('Error updating notice:', err);
            alert('Failed to update notice. Please try again.');
        }
    };

    return (
        <div className="p-6 bg-dashboard-bg rounded-lg">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Bell className="text-primary-orange" size={24} />
                        <h1 className="text-2xl font-bold text-charcoal">Notices Management</h1>
                    </div>
                    <p className="text-darkGray mt-1">Manage system notices and announcements</p>
                </div>
                <Link
                    href="/admin/notices/new"
                    className="bg-primary-orange hover:bg-primary text-white py-2 px-4 rounded-md transition-colors duration-200 flex items-center gap-2 shadow-sm"
                >
                    <span className="font-medium">Create New Notice</span>
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-orange"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded shadow mb-6">
                    <div className="flex items-center">
                        <AlertTriangle className="text-red-500 mr-2" size={18} />
                        <span className="text-red-700">{error}</span>
                    </div>
                </div>
            ) : notices.length === 0 ? (
                <div className="text-center p-8 bg-white rounded-lg shadow">
                    <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-charcoal mb-2">No notices found</h3>
                    <p className="text-darkGray mb-6">Create your first notice to get started</p>
                    <Link
                        href="/admin/notices/new"
                        className="bg-primary-orange hover:bg-primary text-white py-2 px-6 rounded-md inline-flex items-center gap-2 transition-colors duration-200"
                    >
                        <span>Create Notice</span>
                    </Link>
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Notice Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {notices.map((notice) => (
                                    <tr key={notice.id} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {notice.important && (
                                                    <span className="flex-shrink-0 inline-block mr-2 h-2 w-2 rounded-full bg-red-500" title="Important"></span>
                                                )}
                                                <div className="text-sm font-medium text-charcoal">
                                                    {notice.title}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${notice.published
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {notice.published ?
                                                    <span className="flex items-center gap-1"><Check size={12} /> Published</span> :
                                                    <span className="flex items-center gap-1"><X size={12} /> Draft</span>}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-darkGray">
                                            {new Date(notice.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                            <div className="flex justify-center space-x-3">
                                                <Link
                                                    href={`/admin/notices/${notice.id}`}
                                                    className="text-blue-600 hover:text-blue-900 transition-colors duration-150 flex items-center gap-1"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                    <span className="hidden sm:inline">Edit</span>
                                                </Link>
                                                <button
                                                    onClick={() => handleTogglePublish(notice.id, notice.published)}
                                                    className={`${notice.published
                                                        ? 'text-amber-600 hover:text-amber-900'
                                                        : 'text-green-600 hover:text-green-900'
                                                        } transition-colors duration-150 flex items-center gap-1`}
                                                    title={notice.published ? "Unpublish" : "Publish"}
                                                >
                                                    {notice.published ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    <span className="hidden sm:inline">{notice.published ? 'Unpublish' : 'Publish'}</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(notice.id)}
                                                    className="text-red-600 hover:text-red-900 transition-colors duration-150 flex items-center gap-1"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                    <span className="hidden sm:inline">Delete</span>
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