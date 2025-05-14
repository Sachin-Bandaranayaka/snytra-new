'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
    onImageSelected: (imageUrl: string) => void;
    className?: string;
}

const ImageUpload = ({ onImageSelected, className = '' }: ImageUploadProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file (PNG, JPG, JPEG, GIF)');
            return;
        }

        // Reset states
        setError(null);
        setIsUploading(true);
        setUploadProgress(0);

        // Simulate progress (in a real app, this would be tracking actual upload progress)
        const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + 10;
            });
        }, 100);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/uploads/image', {
                method: 'POST',
                body: formData,
            });

            clearInterval(progressInterval);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to upload image');
            }

            const data = await response.json();
            setUploadProgress(100);

            // Allow the progress bar to show 100% briefly before completing
            setTimeout(() => {
                onImageSelected(data.url);
                setIsUploading(false);
                setUploadProgress(0);
            }, 500);
        } catch (err) {
            clearInterval(progressInterval);
            setError(err instanceof Error ? err.message : 'Failed to upload image');
            setIsUploading(false);
        }

        // Clear the file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`flex flex-col ${className}`}>
            <div className="flex items-center space-x-2">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                </button>
                <span className="text-sm text-gray-500">
                    Max 5MB (PNG, JPG, JPEG, GIF)
                </span>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
            />

            {isUploading && (
                <div className="mt-2">
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-primary h-full rounded-full transition-all duration-150"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Uploading... {uploadProgress}%
                    </p>
                </div>
            )}

            {error && (
                <p className="mt-2 text-red-500 text-sm">{error}</p>
            )}
        </div>
    );
};

export default ImageUpload; 