"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { UploadButton } from '@uploadthing/react';
import { OurFileRouter } from '@/app/api/uploadthing/route';

const COLOR_OPTIONS = [
    { value: 'primary', label: 'Primary' },
    { value: 'olive', label: 'Olive' },
    { value: 'yellow', label: 'Yellow' },
    { value: 'blue', label: 'Blue' },
    { value: 'charcoal', label: 'Charcoal' },
];

export default function NewDashboardSlidePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        imageUrl: '',
        color: 'primary',
        order: 0,
        isActive: true,
        features: ['']
    });

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
                [name]: parseInt(value, 10) || 0,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleFeatureChange = (index: number, value: string) => {
        const updatedFeatures = [...formData.features];
        updatedFeatures[index] = value;
        setFormData(prev => ({
            ...prev,
            features: updatedFeatures
        }));
    };

    const handleAddFeature = () => {
        setFormData(prev => ({
            ...prev,
            features: [...prev.features, '']
        }));
    };

    const handleRemoveFeature = (index: number) => {
        if (formData.features.length > 1) {
            const updatedFeatures = [...formData.features];
            updatedFeatures.splice(index, 1);
            setFormData(prev => ({
                ...prev,
                features: updatedFeatures
            }));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Filter out empty features
        const filteredFeatures = formData.features.filter(feature => feature.trim() !== '');

        if (!formData.title || !formData.description || !formData.imageUrl || filteredFeatures.length === 0) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);

            const slideData = {
                id: uuidv4(),
                title: formData.title,
                description: formData.description,
                image_url: formData.imageUrl,
                features: filteredFeatures,
                color: formData.color,
                order: formData.order,
                is_active: formData.isActive
            };

            const response = await fetch('/api/dashboard-slides', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ slide: slideData }),
            });

            if (!response.ok) {
                throw new Error('Failed to create slide');
            }

            toast.success('Dashboard slide created successfully');
            router.push('/admin/dashboard-slides');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to create slide');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container px-6 py-8 mx-auto">
            <div className="mb-6">
                <Link
                    href="/admin/dashboard-slides"
                    className="text-primary hover:text-primary/80 flex items-center"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                            clipRule="evenodd"
                        />
                    </svg>
                    Back to Dashboard Slides
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-primary">Add New Dashboard Slide</h1>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                    required
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                                        Color <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="color"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleInputChange}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                        required
                                    >
                                        {COLOR_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                                        Order
                                    </label>
                                    <input
                                        type="number"
                                        id="order"
                                        name="order"
                                        value={formData.order}
                                        onChange={handleInputChange}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                                    Active
                                </label>
                            </div>

                            <div>
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
                                            Remove Image
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
                                            <p className="text-xs text-gray-500">
                                                PNG, JPG, GIF up to 4MB
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Features <span className="text-red-500">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={handleAddFeature}
                                    className="text-primary hover:text-primary/80 text-sm"
                                >
                                    + Add Feature
                                </button>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-md space-y-3">
                                {formData.features.map((feature, index) => (
                                    <div key={index} className="flex items-center">
                                        <input
                                            type="text"
                                            value={feature}
                                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                            placeholder={`Feature ${index + 1}`}
                                        />
                                        {formData.features.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFeature(index)}
                                                className="ml-2 text-red-500 hover:text-red-700"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                                Add the key features that will be displayed for this dashboard slide.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <Link
                            href="/admin/dashboard-slides"
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Slide'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 