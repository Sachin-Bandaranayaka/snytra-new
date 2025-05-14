'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Review {
    id: number;
    customer_name: string;
    customer_image_url: string | null;
    rating: number;
    review_text: string;
}

export default function ReviewSection() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch('/api/reviews');
                if (!response.ok) {
                    throw new Error('Failed to fetch reviews');
                }
                const data = await response.json();
                setReviews(data.reviews);
            } catch (err) {
                console.error('Error fetching reviews:', err);
                setError('Failed to load reviews. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    // Fallback content in case there are no reviews or while loading
    if (loading) {
        return (
            <div className="py-16 bg-beige">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-primary text-center mb-3">
                        Customer Reviews
                    </h2>
                    <p className="text-center text-charcoal mb-12">What our customers says about us.</p>
                    <div className="flex justify-center">
                        <div className="animate-pulse">Loading reviews...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-16 bg-beige">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-primary text-center mb-3">
                        Customer Reviews
                    </h2>
                    <p className="text-center text-charcoal mb-12">What our customers says about us.</p>
                    <div className="text-center text-red-500">{error}</div>
                </div>
            </div>
        );
    }

    // If no reviews found, show a message or return null
    if (reviews.length === 0) {
        return (
            <div className="py-16 bg-beige">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-primary text-center mb-3">
                        Customer Reviews
                    </h2>
                    <p className="text-center text-charcoal mb-12">Be the first to leave a review!</p>
                </div>
            </div>
        );
    }

    return (
        <section className="py-16 bg-beige">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl font-bold text-primary text-center mb-3">
                    Customer Reviews
                </h2>
                <p className="text-center text-charcoal mb-12">What our customers says about us.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white p-6 rounded-lg shadow-md">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 mr-4">
                                    {review.customer_image_url ? (
                                        <Image
                                            src={review.customer_image_url}
                                            alt={review.customer_name}
                                            width={48}
                                            height={48}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-primary">{review.customer_name}</h4>
                                    <div className="flex text-yellow">
                                        {[...Array(5)].map((_, i) => (
                                            <svg
                                                key={i}
                                                xmlns="http://www.w3.org/2000/svg"
                                                className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <p className="text-charcoal">{review.review_text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
} 