"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function TestCookiesPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const testSlideshow = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/slideshow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: "Test Slide",
                    description: "Testing if cookie fix works",
                    imageUrl: "https://example.com/image.jpg",
                    iconType: "menu",
                    order: 1,
                    isActive: true
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create test slide');
            }

            toast.success('Test successful! Created slide');
            router.push('/admin/slideshow');
        } catch (error: any) {
            console.error('Error:', error);
            toast.error(error.message || 'Test failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container px-6 py-8 mx-auto">
            <h1 className="text-2xl font-bold text-primary mb-6">Test Cookie Fix</h1>
            <button
                onClick={testSlideshow}
                disabled={isLoading}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 disabled:opacity-50"
            >
                {isLoading ? 'Testing...' : 'Test Slideshow API'}
            </button>
        </div>
    );
} 