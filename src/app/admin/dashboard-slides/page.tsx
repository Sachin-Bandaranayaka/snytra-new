"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface DashboardSlide {
    id: string;
    title: string;
    description: string;
    image_url: string;
    features: string[];
    color: string;
    order: number;
    is_active: boolean;
}

export default function DashboardSlidesAdminPage() {
    const [slides, setSlides] = useState<DashboardSlide[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchSlides();
    }, []);

    async function fetchSlides() {
        try {
            setLoading(true);
            const response = await fetch('/api/dashboard-slides');
            if (!response.ok) {
                throw new Error('Failed to fetch dashboard slides data');
            }
            const data = await response.json();
            setSlides(data.slides || []);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load dashboard slides');
        } finally {
            setLoading(false);
        }
    }

    async function toggleSlideStatus(id: string, currentStatus: boolean) {
        try {
            const slideToUpdate = slides.find(slide => slide.id === id);
            if (!slideToUpdate) return;

            const response = await fetch('/api/dashboard-slides', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    slide: {
                        ...slideToUpdate,
                        is_active: !currentStatus
                    }
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update slide status');
            }

            toast.success('Slide status updated');
            fetchSlides();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to update slide status');
        }
    }

    async function deleteSlide(id: string) {
        if (!confirm('Are you sure you want to delete this slide?')) {
            return;
        }

        try {
            const response = await fetch(`/api/dashboard-slides?id=${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete slide');
            }

            toast.success('Slide deleted successfully');
            fetchSlides();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to delete slide');
        }
    }

    return (
        <div className="container px-6 py-8 mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-primary">Dashboard Slides Management</h1>
                <Link
                    href="/admin/dashboard-slides/new"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                    Add New Slide
                </Link>
            </div>

            <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                            These slides are shown in the Online Ordering System page's dashboard carousel.
                        </p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : slides.length === 0 ? (
                <div className="bg-beige/30 border border-beige rounded-lg p-8 text-center">
                    <h3 className="text-lg font-medium text-charcoal mb-2">No dashboard slides found</h3>
                    <p className="text-gray-600 mb-4">Create your first dashboard slide to display on the online ordering page.</p>
                    <Link
                        href="/admin/dashboard-slides/new"
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                    >
                        Add First Slide
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden shadow">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="py-3 px-4 text-left">Order</th>
                                <th className="py-3 px-4 text-left">Image</th>
                                <th className="py-3 px-4 text-left">Title</th>
                                <th className="py-3 px-4 text-left">Description</th>
                                <th className="py-3 px-4 text-left">Color</th>
                                <th className="py-3 px-4 text-left">Features</th>
                                <th className="py-3 px-4 text-left">Status</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {slides.map((slide) => (
                                <tr key={slide.id} className="hover:bg-gray-50">
                                    <td className="py-3 px-4">{slide.order}</td>
                                    <td className="py-3 px-4">
                                        <div className="w-16 h-16 relative rounded overflow-hidden">
                                            <Image
                                                src={slide.image_url}
                                                alt={slide.title}
                                                fill
                                                sizes="64px"
                                                className="object-cover"
                                            />
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 font-medium">{slide.title}</td>
                                    <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                                        {slide.description}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span
                                            className={`inline-block w-6 h-6 rounded-full bg-${slide.color}`}
                                            title={slide.color}
                                        ></span>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-600">
                                        {Array.isArray(slide.features) ? (
                                            <span>{slide.features.length} features</span>
                                        ) : (
                                            <span>No features</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${slide.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {slide.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right space-x-2">
                                        <button
                                            onClick={() => toggleSlideStatus(slide.id, slide.is_active)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            {slide.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <Link
                                            href={`/admin/dashboard-slides/edit/${slide.id}`}
                                            className="text-yellow-600 hover:text-yellow-800 mx-2"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => deleteSlide(slide.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Delete
                                        </button>
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