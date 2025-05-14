'use client';

import { useState, useEffect } from 'react';

interface FAQ {
    id: string;
    question: string;
    answer: string;
    display_order: number;
    is_published: boolean;
}

interface FAQCategory {
    id: string;
    name: string;
    faqs: FAQ[];
}

export default function FAQAccordion() {
    const [faqCategories, setFaqCategories] = useState<FAQCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openFaqs, setOpenFaqs] = useState<Record<string, boolean>>({});

    useEffect(() => {
        async function fetchFaqs() {
            try {
                setLoading(true);
                // Only get published FAQs for the main website
                const response = await fetch('/api/faqs?published=true');

                if (!response.ok) {
                    throw new Error('Failed to fetch FAQs');
                }

                const data = await response.json();

                if (data.success && data.faqsByCategory) {
                    console.log('Successfully loaded FAQs from database:', data.faqsByCategory);
                    setFaqCategories(data.faqsByCategory);
                } else {
                    console.error('API returned invalid data:', data);
                    setError('Unable to load FAQs at this time.');
                }
            } catch (err) {
                console.error('Error fetching FAQs:', err);
                setError('Unable to load FAQs. Please try again later.');
            } finally {
                setLoading(false);
            }
        }

        fetchFaqs();
    }, []);

    const toggleFaq = (faqId: string) => {
        setOpenFaqs(prev => ({
            ...prev,
            [faqId]: !prev[faqId]
        }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8 text-red-500">
                {error}
            </div>
        );
    }

    if (faqCategories.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No FAQs available at this time.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {faqCategories.map((category) => (
                <div key={category.id || 'uncategorized'} className="space-y-4">
                    {category.name && (
                        <h3 className="text-xl font-semibold text-primary">{category.name}</h3>
                    )}
                    <div className="space-y-3">
                        {category.faqs.map((faq) => (
                            <div
                                key={faq.id}
                                className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
                            >
                                <button
                                    onClick={() => toggleFaq(faq.id)}
                                    className="flex justify-between items-center w-full p-4 text-left bg-white hover:bg-gray-50 focus:outline-none"
                                >
                                    <span className="font-medium text-charcoal">{faq.question}</span>
                                    <svg
                                        className={`w-5 h-5 text-primary transition-transform ${openFaqs[faq.id] ? 'transform rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                <div
                                    className={`px-4 overflow-hidden transition-all duration-300 ease-in-out ${openFaqs[faq.id] ? 'max-h-96 pb-4' : 'max-h-0'
                                        }`}
                                >
                                    <div
                                        className="prose prose-sm max-w-none text-gray-600"
                                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
} 