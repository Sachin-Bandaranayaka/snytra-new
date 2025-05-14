"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { UploadButton } from '@uploadthing/react';
import { OurFileRouter } from '@/app/api/uploadthing/route';

const ICON_OPTIONS = [
    { value: 'menu', label: 'Menu' },
    { value: 'orders', label: 'Orders' },
    { value: 'tables', label: 'Tables' },
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'waitlist', label: 'Waitlist' },
    { value: 'reservations', label: 'Reservations' },
    { value: 'analytics', label: 'Analytics' },
];

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

export default function EditSlidePage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        description: '',
        imageUrl: '',
        iconType: 'menu',
        order: 0,
        isActive: true,
    });

    useEffect(() => {
        async function fetchSlide() {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/slideshow`);

                if (!response.ok) {
                    throw new Error('Failed to fetch slide');
                }

                const slides = await response.json();
                const slide = slides.find((s: SlideShow) => s.id === params.id);

                if (!slide) {
                    toast.error('Slide not found');
                    router.push('/admin/slideshow');
                    return;
                }

                setFormData({
                    id: slide.id,
                    title: slide.title,
                    description: slide.description,
                    imageUrl: slide.image_url,
                    iconType: slide.icon_type,
                    order: slide.order,
                    isActive: slide.is_active,
                });
            } catch (error) {
                console.error('Error:', error);
                toast.error('Failed to load slide data');
            } finally {
                setIsLoading(false);
            }
        }

        fetchSlide();
    }, [params.id, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checkbox = e.target as HTMLInputElement;
            setFormData((prev) => ({
                ...prev,
                [name]: checkbox.checked,
            }));
        } else if (type === 'number') {
            setFormData((prev) => ({
                ...prev,
                [name]: parseInt(value, 10),
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.imageUrl) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await fetch('/api/slideshow', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update slide');
            }

            toast.success('Slide updated successfully');
            router.push('/admin/slideshow');
        } catch (error: any) {
            console.error('Error updating slide:', error);
            toast.error(error.message || 'Failed to update slide');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container px-6 py-8 mx-auto">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container px-6 py-8 mx-auto">
            <div className="mb-6">
                <Link
                    href="/admin/slideshow"
                    className="text-primary hover:underline flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Slideshow Management
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-primary">Edit Slide</h1>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="col-span-2 md:col-span-1">
                            <div className="mb-6">
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label htmlFor="iconType" className="block text-sm font-medium text-gray-700 mb-1">
                                    Icon Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="iconType"
                                    name="iconType"
                                    value={formData.iconType}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    required
                                >
                                    {ICON_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="mb-6">
                                    <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        id="order"
                                        name="order"
                                        value={formData.order}
                                        onChange={handleInputChange}
                                        min={0}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>

                                <div className="mb-6 flex items-end">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleInputChange}
                                            className="h-5 w-5 text-primary border-gray-300 rounded focus:ring-primary"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Active</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Image <span className="text-red-500">*</span>
                                </label>

                                {formData.imageUrl ? (
                                    <div className="mb-4">
                                        <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                                            <Image
                                                src={formData.imageUrl}
                                                alt="Slide preview"
                                                fill
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                                className="object-contain"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                                            className="mt-2 text-sm text-red-600 hover:text-red-800"
                                        >
                                            Change Image
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                        <div className="space-y-1 text-center">
                                            <svg
                                                className="mx-auto h-12 w-12 text-gray-400"
                                                stroke="currentColor"
                                                fill="none"
                                                viewBox="0 0 48 48"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                    strokeWidth={2}
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                            <div className="flex justify-center text-sm text-gray-600">
                                                <UploadButton<OurFileRouter>
                                                    endpoint="imageUploader"
                                                    onClientUploadComplete={(res) => {
                                                        if (res && res.length > 0) {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                imageUrl: res[0].url,
                                                            }));
                                                            toast.success('Image uploaded successfully');
                                                        }
                                                    }}
                                                    onUploadError={(error: Error) => {
                                                        toast.error(`Upload failed: ${error.message}`);
                                                    }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG, or WebP up to 4MB</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 border-t border-gray-200 pt-6 flex justify-end space-x-3">
                        <Link
                            href="/admin/slideshow"
                            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-4 py-2 bg-primary text-white rounded-md transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-dark'
                                }`}
                        >
                            {isSubmitting ? 'Updating...' : 'Update Slide'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 