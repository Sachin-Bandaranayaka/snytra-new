'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import ImageUpload from './ImageUpload';

interface FeaturedImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectImage: (imageUrl: string) => void;
    currentImage?: string;
}

const FeaturedImageModal = ({
    isOpen,
    onClose,
    onSelectImage,
    currentImage
}: FeaturedImageModalProps) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(currentImage || null);
    const [recentImages, setRecentImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Load recent images when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchRecentImages();
        }
    }, [isOpen]);

    const fetchRecentImages = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/uploads/recent-images?limit=12');
            if (!response.ok) {
                throw new Error('Failed to fetch recent images');
            }

            const data = await response.json();
            setRecentImages(data.images.map((img: any) => img.file_path));
        } catch (error) {
            console.error('Error fetching recent images:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageSelect = (imageUrl: string) => {
        setSelectedImage(imageUrl);
    };

    const handleSubmit = () => {
        if (selectedImage) {
            onSelectImage(selectedImage);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={onClose}
                    aria-hidden="true"
                ></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                    Featured Image
                                </h3>

                                <ImageUpload
                                    onImageSelected={(imageUrl) => {
                                        setSelectedImage(imageUrl);
                                        // Add to recent images if not already there
                                        if (!recentImages.includes(imageUrl)) {
                                            setRecentImages(prev => [imageUrl, ...prev]);
                                        }
                                    }}
                                    className="mb-6"
                                />

                                <div className="border-t border-gray-200 pt-4">
                                    <h4 className="font-medium text-gray-700 mb-3">Recent Images</h4>

                                    {isLoading ? (
                                        <div className="flex justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        </div>
                                    ) : recentImages.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {recentImages.map((image, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => handleImageSelect(image)}
                                                    className={`
                            relative aspect-video cursor-pointer rounded-md overflow-hidden
                            ${selectedImage === image ? 'ring-2 ring-primary ring-offset-2' : 'hover:opacity-80'}
                          `}
                                                >
                                                    <Image
                                                        src={image}
                                                        alt="Uploaded image"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">No recent images found.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!selectedImage}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Select Image
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeaturedImageModal; 