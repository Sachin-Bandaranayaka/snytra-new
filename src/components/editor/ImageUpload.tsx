'use client';

import { useState } from 'react';
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";
import { toast } from 'react-hot-toast';

interface ImageUploadProps {
    onImageSelected: (imageUrl: string) => void;
    className?: string;
}

const ImageUpload = ({ onImageSelected, className = '' }: ImageUploadProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    return (
        <div className={`flex flex-col ${className}`}>
            <div className="flex items-center space-x-2">
                <UploadButton<OurFileRouter, any>
                    endpoint="imageUploader"
                    onUploadBegin={() => {
                        setIsUploading(true);
                        setError(null);
                    }}
                    onClientUploadComplete={(res) => {
                        setIsUploading(false);
                        if (res && res[0]) {
                            const imageUrl = res[0].url;
                            onImageSelected(imageUrl);
                            toast.success('Image uploaded successfully!');
                        }
                    }}
                    onUploadError={(error: Error) => {
                        setIsUploading(false);
                        const errorMessage = error.message || 'Failed to upload image';
                        setError(errorMessage);
                        toast.error(`Upload failed: ${errorMessage}`);
                    }}
                    appearance={{
                        button: "px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ut-uploading:after:bg-primary",
                        allowedContent: "text-sm text-gray-500",
                        container: "flex items-center space-x-2"
                    }}
                    content={{
                        button({ ready }) {
                            if (ready && !isUploading) return "Upload Image";
                            if (isUploading) return "Uploading...";
                            return "Getting ready...";
                        },
                        allowedContent: "Max 4MB (PNG, JPG, JPEG, GIF, WebP)"
                    }}
                />
            </div>

            {error && (
                <p className="mt-2 text-red-500 text-sm">{error}</p>
            )}
        </div>
    );
};

export default ImageUpload; 