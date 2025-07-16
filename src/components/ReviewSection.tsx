'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

interface Review {
    id: number;
    customer_name: string;
    customer_image_url: string | null;
    rating: number;
    review_text: string;
}

// Helper function to validate if a string is a valid URL
function isValidImageUrl(url: string): boolean {
    try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:' || urlObj.protocol === 'data:';
    } catch (_) {
        return false;
    }
}

export default function ReviewSection() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

    // Auto-rotation effect
    useEffect(() => {
        if (reviews.length > 0 && !isHovered) {
            intervalRef.current = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % Math.ceil(reviews.length / 3));
            }, 4000); // Change slide every 4 seconds
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [reviews.length, isHovered]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % Math.ceil(reviews.length / 3));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + Math.ceil(reviews.length / 3)) % Math.ceil(reviews.length / 3));
    };

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

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

                <div 
                    className="relative max-w-5xl mx-auto"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Carousel Container */}
                    <div className="overflow-hidden">
                        <div 
                            className="flex transition-transform duration-500 ease-in-out"
                            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                        >
                            {Array.from({ length: Math.ceil(reviews.length / 3) }).map((_, slideIndex) => (
                                <div key={slideIndex} className="w-full flex-shrink-0">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {reviews.slice(slideIndex * 3, slideIndex * 3 + 3).map((review) => (
                                            <div key={review.id} className="bg-white p-6 rounded-lg shadow-md">
                                                <div className="flex items-center mb-4">
                                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 mr-4">
                                                        {review.customer_image_url && isValidImageUrl(review.customer_image_url) ? (
                                                            <Image
                                                                src={review.customer_image_url}
                                                                alt={review.customer_name}
                                                                width={48}
                                                                height={48}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    // Hide the image if it fails to load
                                                                    e.currentTarget.style.display = 'none';
                                                                }}
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
                            ))}
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    {Math.ceil(reviews.length / 3) > 1 && (
                        <>
                            <button
                                onClick={prevSlide}
                                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors duration-200"
                                aria-label="Previous reviews"
                            >
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors duration-200"
                                aria-label="Next reviews"
                            >
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </>
                    )}

                    {/* Dots Indicator */}
                    {Math.ceil(reviews.length / 3) > 1 && (
                        <div className="flex justify-center mt-8 space-x-2">
                            {Array.from({ length: Math.ceil(reviews.length / 3) }).map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                                        index === currentSlide ? 'bg-primary' : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}