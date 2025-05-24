"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";

// Define fallback slides in case API fails
const fallbackSlides = [
    {
        id: "staff-dashboard-overview",
        title: "Staff Dashboard",
        description: "Efficient order management interface for restaurant staff",
        image_url: "/images/slide1.png",
        features: [
            "Real-time order notifications",
            "Order status tracking",
            "Customer information display",
            "Quick order modification",
            "Payment processing"
        ],
        color: "primary"
    },
    {
        id: "staff-dashboard-orders",
        title: "Order Management",
        description: "Streamlined interface for processing customer orders",
        image_url: "/images/slide2.png",
        features: [
            "Drag-and-drop order assignment",
            "Priority order flagging",
            "Order history tracking",
            "Customizable order views",
            "Order search and filtering"
        ],
        color: "primary"
    },
    {
        id: "kitchen-dashboard-overview",
        title: "Kitchen Dashboard",
        description: "Optimized interface for kitchen staff to manage food preparation",
        image_url: "/images/slide3.png",
        features: [
            "Real-time order queue",
            "Preparation time tracking",
            "Digital recipe access",
            "Inventory alerts",
            "Order completion reporting"
        ],
        color: "olive"
    },
    {
        id: "kitchen-dashboard-tickets",
        title: "Kitchen Ticket System",
        description: "Digital ticket system for smooth kitchen operations",
        image_url: "/images/slide1.png",
        features: [
            "Digital ticket creation",
            "Automatic ticket routing",
            "Preparation timers",
            "Special instructions highlighting",
            "Completion confirmation"
        ],
        color: "olive"
    }
];

interface DashboardSlide {
    id: string;
    title: string;
    description: string;
    image_url: string;
    features: string[];
    color: string;
    order?: number;
    is_active?: boolean;
}

export default function DashboardCarousel() {
    const [slides, setSlides] = useState<DashboardSlide[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isAutoplay, setIsAutoplay] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchSlides() {
            try {
                const response = await fetch('/api/dashboard-slides');
                if (!response.ok) {
                    throw new Error('Failed to fetch dashboard slides');
                }

                const data = await response.json();
                // Filter only active slides and sort by order
                const activeSlides = data.slides
                    .filter((slide: DashboardSlide) => slide.is_active)
                    .sort((a: DashboardSlide, b: DashboardSlide) => (a.order || 0) - (b.order || 0));

                if (activeSlides.length > 0) {
                    setSlides(activeSlides);
                } else {
                    // If no active slides, use fallback
                    setSlides(fallbackSlides);
                    console.info('No active slides found, using fallback slides');
                }
            } catch (error) {
                console.error('Error fetching dashboard slides:', error);
                // Use fallback slides if API fails
                setSlides(fallbackSlides);
                toast.error('Failed to load dashboard slides');
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
                <p className="text-charcoal text-center">No dashboard slides available</p>
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
                                ? `bg-${slide.color} text-white shadow-md scale-105`
                                : "bg-beige text-charcoal hover:bg-beige/70"
                            }`}
                        aria-label={`View ${slide.title}`}
                    >
                        <span className="font-medium">{slide.title}</span>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="w-full h-[350px] relative rounded-lg overflow-hidden border border-beige/50">
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
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-contain"
                                priority={index === 0}
                            />
                        </div>
                    ))}
                </div>

                <div className="flex flex-col">
                    <h3 className={`text-2xl font-bold mb-3 text-${slides[currentImageIndex].color}`}>
                        {slides[currentImageIndex].title}
                    </h3>
                    <p className="text-charcoal mb-6">{slides[currentImageIndex].description}</p>

                    <div className="bg-beige/30 p-6 rounded-lg border border-lightGray">
                        <h4 className="text-lg font-semibold mb-4">Key Features</h4>
                        <ul className="space-y-3">
                            {slides[currentImageIndex].features.map((feature, idx) => (
                                <li key={idx} className="flex items-start">
                                    <svg className={`flex-shrink-0 h-6 w-6 mt-0.5 text-${slides[currentImageIndex].color}`}
                                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="ml-3 text-charcoal">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="flex justify-center space-x-3 mt-5">
                {slides.map((slide, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            setCurrentImageIndex(index);
                            setIsAutoplay(false);
                        }}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentImageIndex
                                ? `bg-${slide.color} w-8`
                                : "bg-gray-300 hover:bg-primary/50"
                            }`}
                        aria-label={`View image ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
} 