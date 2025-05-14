"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";

// Define fallback slides in case API fails
const fallbackSlides = [
    {
        id: "menu",
        title: "Menu Management",
        description: "Easily manage your menu items and categories",
        image_url: "/images/slide1.png",
        icon_type: "menu",
        order: 0,
        is_active: true
    },
    {
        id: "orders",
        title: "Order Management",
        description: "Track and manage customer orders efficiently",
        image_url: "/images/slide2.png",
        icon_type: "orders",
        order: 1,
        is_active: true
    },
    {
        id: "tables",
        title: "Table Management",
        description: "Organize and optimize your seating arrangements",
        image_url: "/images/slide3.png",
        icon_type: "tables",
        order: 2,
        is_active: true
    },
];

// Icon mapping for different slide types
const getIconForType = (type: string) => {
    switch (type) {
        case 'menu':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            );
        case 'orders':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            );
        case 'tables':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            );
        case 'dashboard':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
            );
        case 'kitchen':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
            );
        case 'waitlist':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            );
        case 'reservations':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            );
        case 'analytics':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            );
        default:
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
    }
};

interface Slide {
    id: string;
    title: string;
    description: string;
    image_url: string;
    icon_type: string;
    order: number;
    is_active: boolean;
}

export default function ImageSlideWrapper() {
    const [slides, setSlides] = useState<Slide[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isAutoplay, setIsAutoplay] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchSlides() {
            try {
                const response = await fetch('/api/slideshow');
                if (!response.ok) {
                    throw new Error('Failed to fetch slides');
                }

                const data = await response.json();
                // Filter only active slides and sort by order
                const activeSlides = data
                    .filter((slide: Slide) => slide.is_active)
                    .sort((a: Slide, b: Slide) => a.order - b.order);

                if (activeSlides.length > 0) {
                    setSlides(activeSlides);
                } else {
                    // If no active slides, use fallback
                    setSlides(fallbackSlides);
                }
            } catch (error) {
                console.error('Error fetching slides:', error);
                // Use fallback slides if API fails
                setSlides(fallbackSlides);
            } finally {
                setIsLoading(false);
            }
        }

        fetchSlides();
    }, []);

    useEffect(() => {
        let interval;
        if (isAutoplay && slides.length > 0) {
            interval = setInterval(() => {
                setCurrentImageIndex((prevIndex) => (prevIndex + 1) % slides.length);
            }, 5000);
        }

        return () => clearInterval(interval);
    }, [isAutoplay, slides.length]);

    const handlePrevSlide = () => {
        setIsAutoplay(false);
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
    };

    const handleNextSlide = () => {
        setIsAutoplay(false);
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % slides.length);
    };

    if (isLoading) {
        return (
            <div className="relative bg-white p-6 rounded-xl shadow-lg overflow-hidden border border-beige/50 min-h-[460px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (slides.length === 0) {
        return (
            <div className="relative bg-white p-6 rounded-xl shadow-lg overflow-hidden border border-beige/50 min-h-[460px] flex items-center justify-center">
                <p className="text-charcoal text-center">No slides available</p>
            </div>
        );
    }

    return (
        <div className="relative bg-white p-6 rounded-xl shadow-lg overflow-hidden border border-beige/50">
            <div className="absolute top-4 right-4 z-10 flex items-center">
                <button
                    onClick={() => setIsAutoplay(!isAutoplay)}
                    className={`p-2 rounded-full transition-colors ${isAutoplay ? "bg-primary/10 text-primary" : "bg-gray-200 text-gray-500"}`}
                    aria-label={isAutoplay ? "Pause slideshow" : "Play slideshow"}
                >
                    {isAutoplay ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                </button>
            </div>

            <div className="flex flex-wrap gap-3 mb-6 justify-center">
                {slides.map((slide, index) => (
                    <button
                        key={slide.id}
                        onClick={() => {
                            setCurrentImageIndex(index);
                            setIsAutoplay(false);
                        }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 ${index === currentImageIndex
                                ? "bg-primary text-white shadow-md scale-105"
                                : "bg-beige text-charcoal hover:bg-primary/10"
                            }`}
                        aria-label={`View ${slide.title}`}
                    >
                        <span className="hidden sm:flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
                            {getIconForType(slide.icon_type)}
                        </span>
                        <span className="font-medium">{slide.title}</span>
                    </button>
                ))}
            </div>

            <div className="w-full h-[420px] relative rounded-lg overflow-hidden border border-beige/50">
                {/* Navigation arrows */}
                <button
                    onClick={handlePrevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 shadow-md text-charcoal hover:bg-primary hover:text-white transition-colors duration-300"
                    aria-label="Previous slide"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <button
                    onClick={handleNextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 shadow-md text-charcoal hover:bg-primary hover:text-white transition-colors duration-300"
                    aria-label="Next slide"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ${index === currentImageIndex ? "opacity-100" : "opacity-0"
                            }`}
                    >
                        <Image
                            src={slide.image_url}
                            alt={slide.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                            className="object-contain"
                            priority={index === 0}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/95 to-transparent p-5">
                            <h3 className="text-xl font-bold text-primary mb-1">{slide.title}</h3>
                            <p className="text-charcoal">{slide.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center space-x-3 mt-5">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            setCurrentImageIndex(index);
                            setIsAutoplay(false);
                        }}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentImageIndex
                                ? "bg-primary w-8"
                                : "bg-gray-300 hover:bg-primary/50"
                            }`}
                        aria-label={`View image ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
} 