'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Notice {
    id: string;
    title: string;
    content: string;
    important: boolean;
    created_at: string;
    updated_at: string;
    published: boolean;
    expires_at: string | null;
}

export default function NoticesBanner() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [dismissed, setDismissed] = useState<Record<string, boolean>>({});

    // Fetch notices from the API
    useEffect(() => {
        async function fetchNotices() {
            try {
                setLoading(true);
                const response = await fetch('/api/notices');

                if (!response.ok) {
                    throw new Error('Failed to fetch notices');
                }

                const data = await response.json();
                if (data.success && data.notices) {
                    console.log('Successfully loaded notices from database:', data.notices);
                    setNotices(data.notices);
                }
            } catch (err) {
                console.error('Error fetching notices:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchNotices();
    }, []);

    // Rotate through notices every 8 seconds if there are multiple
    useEffect(() => {
        if (notices.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentNoticeIndex((prevIndex) =>
                prevIndex === notices.length - 1 ? 0 : prevIndex + 1
            );
        }, 8000);

        return () => clearInterval(interval);
    }, [notices.length]);

    // Don't render anything if no notices or loading
    if (loading || notices.length === 0) {
        return null;
    }

    // Get the current notice
    const activeNotices = notices.filter(notice => !dismissed[notice.id]);
    if (activeNotices.length === 0) {
        return null;
    }

    const currentNotice = activeNotices[currentNoticeIndex % activeNotices.length];

    // Dismiss a notice
    const dismissNotice = (id: string) => {
        setDismissed(prev => ({
            ...prev,
            [id]: true
        }));
    };

    return (
        <div className={`w-full py-3 px-4 ${currentNotice.important ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    {currentNotice.important ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    )}

                    <p className="font-medium">
                        <span className="font-bold">{currentNotice.title}:</span>
                        <span dangerouslySetInnerHTML={{ __html: currentNotice.content }} />
                    </p>
                </div>

                <button
                    onClick={() => dismissNotice(currentNotice.id)}
                    className="text-white hover:text-gray-200 focus:outline-none ml-4"
                    aria-label="Dismiss notice"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {/* Indicator for multiple notices */}
            {activeNotices.length > 1 && (
                <div className="flex justify-center mt-2 space-x-1">
                    {activeNotices.map((_, index) => (
                        <div
                            key={index}
                            className={`w-2 h-2 rounded-full ${index === currentNoticeIndex % activeNotices.length ? 'bg-white' : 'bg-white/50'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
} 