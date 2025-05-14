"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface SlideShow {
    id: string;
    title: string;
    description: string;
    image_url: string;
    icon_type: string;
    order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export default function SlideshowAdminPage() {
    const [slides, setSlides] = useState<SlideShow[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchSlides();
    }, []);

    async function fetchSlides() {
        try {
            setLoading(true);
            const response = await fetch('/api/slideshow');
            if (!response.ok) {
                throw new Error('Failed to fetch slideshow data');
            }
            const data = await response.json();
            setSlides(data);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load slideshow data');
        } finally {
            setLoading(false);
        }
    }

    async function toggleSlideStatus(id: string, currentStatus: boolean) {
        try {
            const response = await fetch('/api/slideshow', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                    isActive: !currentStatus,
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
            const response = await fetch(`/api/slideshow?id=${id}`, {
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
                <h1 className="text-2xl font-bold text-primary">Slideshow Management</h1>
                <Link
                    href="/admin/slideshow/new"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                    Add New Slide
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : slides.length === 0 ? (
                <div className="bg-beige/30 border border-beige rounded-lg p-8 text-center">
                    <h3 className="text-lg font-medium text-charcoal mb-2">No slides found</h3>
                    <p className="text-gray-600 mb-4">Create your first slideshow slide to display on the homepage.</p>
                    <Link
                        href="/admin/slideshow/new"
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
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
                                <th className="py-3 px-4 text-left">Icon Type</th>
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
                                    <td className="py-3 px-4">{slide.icon_type}</td>
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
                                            href={`/admin/slideshow/edit/${slide.id}`}
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