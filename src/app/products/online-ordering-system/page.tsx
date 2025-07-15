// src/app/products/online-ordering-system/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SEO, { createProductSchema } from "@/components/SEO";
import FeatureComparisonTable from "@/components/FeatureComparisonTable";
import DashboardCarousel from "@/components/DashboardCarousel";

// --- Define the new interface for dynamic page content ---
interface PageContent {
    title: string;
    description: string;
    links: Array<{ text: string; href: string; attributes: { class: string; } }>;
    features: {
        title: string;
        items: Array<{ title: string; description: string; }>;
    };
}

// All other interfaces remain the same
interface SubscriptionPlan { id: number; name: string; description: string; price: number; billing_cycle: string; features: string[]; is_active: boolean; }
interface Review { id: number; name: string; business: string; content: string; rating: number; product: string; }

export default function OnlineOrderingSystem() {
    // --- All your existing state variables and hooks remain ---
    const router = useRouter();
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [planLoading, setPlanLoading] = useState(true);
    const [reviewLoading, setReviewLoading] = useState(true);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // --- ADD NEW STATE FOR DYNAMIC CONTENT ---
    const [pageContent, setPageContent] = useState<PageContent | null>(null);
    const [contentLoading, setContentLoading] = useState(true);

    // --- ADD NEW USEEFFECT TO FETCH PAGE CONTENT ---
    useEffect(() => {
        const fetchPageContent = async () => {
            setContentLoading(true);
            try {
                const slug = 'products/online-ordering-system';
                // **THE FIX:** Encode the slug to handle the '/' character correctly.
                const encodedSlug = encodeURIComponent(slug);
                const response = await fetch(`/api/pages/${encodedSlug}`);

                if (!response.ok) {
                    // Add more detailed error logging
                    const errorBody = await response.text();
                    console.error(`API Error: ${response.status}`, errorBody);
                    throw new Error('Failed to fetch page content');
                }

                const data = await response.json();
                if (data.success && data.page.content?.OnlineOrderingSystem) {
                    setPageContent(data.page.content.OnlineOrderingSystem);
                } else {
                    console.error("API returned success, but content format is incorrect:", data);
                    throw new Error('Page content format is incorrect');
                }
            } catch (err) {
                console.error("Error fetching page content:", err);
            } finally {
                setContentLoading(false);
            }
        };

        fetchPageContent();
    }, []);


    // --- All your other useEffect hooks and handlers remain unchanged ---
    // Fetch plans from database
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setPlanLoading(true);
                const response = await fetch('/api/subscription-plans');
                if (!response.ok) {
                    throw new Error('Failed to fetch plans');
                }

                const data = await response.json();
                if (data.success && data.plans && data.plans.length > 0) {
                    setPlans(data.plans);
                } else {
                    // Use fallback plans if API returns empty data
                    setPlans(fallbackPlans);
                }
            } catch (err) {
                console.error('Error fetching plans:', err);
                setPlans(fallbackPlans);
            } finally {
                setPlanLoading(false);
            }
        };

        fetchPlans();
    }, []);

    // Fetch reviews from database
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setReviewLoading(true);
                const response = await fetch('/api/reviews?product=online-ordering-system');
                if (!response.ok) {
                    throw new Error('Failed to fetch reviews');
                }

                const data = await response.json();
                if (data.success && data.reviews && data.reviews.length > 0) {
                    setReviews(data.reviews);
                } else {
                    // Use fallback reviews if API returns empty data
                    setReviews(fallbackReviews);
                }
            } catch (err) {
                console.error('Error fetching reviews:', err);
                setReviews(fallbackReviews);
            } finally {
                setReviewLoading(false);
            }
        };

        fetchReviews();
    }, []);

    const handlePlanSelect = async (plan: SubscriptionPlan) => {
        // If user is not logged in, direct to register page with plan parameter
        if (!isLoggedIn) {
            router.push(`/register?plan=${plan.id}&product=online-ordering-system`);
            return;
        }

        // For logged in users, get user info
        const userJson = localStorage.getItem('user');
        if (!userJson) {
            router.push(`/login?plan=${plan.id}&product=online-ordering-system`);
            return;
        }

        try {
            const user = JSON.parse(userJson);

            // Create a checkout session with Stripe
            const response = await fetch('/api/payment/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    planId: plan.id.toString(),
                    customerId: user.id.toString(),
                    userEmail: user.email,
                    productId: 'online-ordering-system'
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Failed to create checkout session:', data.error);
                return;
            }

            // Redirect to Stripe Checkout
            window.location.href = data.url;
        } catch (error) {
            console.error('Error creating checkout session:', error);
        }
    };
    
// Fallback plans data
const fallbackPlans = [
    {
        id: 1,
        name: 'Basic',
        description: 'Perfect for small businesses',
        price: 49.99,
        billing_cycle: 'monthly',
        features: [
            'Online ordering',
            'Reservation management',
            'Menu editor',
            'Basic analytics'
        ],
        is_active: true
    },
    {
        id: 2,
        name: 'Standard',
        description: 'Great for growing businesses',
        price: 99.99,
        billing_cycle: 'monthly',
        features: [
            'All Basic features',
            'Customer management',
            'Inventory control',
            'Advanced analytics',
            'Marketing tools'
        ],
        is_active: true
    },
    {
        id: 3,
        name: 'Premium',
        description: 'Complete solution for established businesses',
        price: 199.99,
        billing_cycle: 'monthly',
        features: [
            'All Standard features',
            'Multi-location support',
            'White-label mobile app',
            'Dedicated support',
            'Custom integrations'
        ],
        is_active: true
    },
    {
        id: 4,
        name: 'Basic Annual',
        description: 'Perfect for small businesses - Annual billing',
        price: 479.88,
        billing_cycle: 'yearly',
        features: [
            'Online ordering',
            'Reservation management',
            'Menu editor',
            'Basic analytics'
        ],
        is_active: true
    },
    {
        id: 5,
        name: 'Standard Annual',
        description: 'Great for growing businesses - Annual billing',
        price: 959.88,
        billing_cycle: 'yearly',
        features: [
            'All Basic features',
            'Customer management',
            'Inventory control',
            'Advanced analytics',
            'Marketing tools'
        ],
        is_active: true
    },
    {
        id: 6,
        name: 'Premium Annual',
        description: 'Complete solution for established businesses - Annual billing',
        price: 1919.88,
        billing_cycle: 'yearly',
        features: [
            'All Standard features',
            'Multi-location support',
            'White-label mobile app',
            'Dedicated support',
            'Custom integrations'
        ],
        is_active: true
    }
];

 // Fallback reviews data
 const fallbackReviews = [
    {
        id: 1,
        name: "Sarah Johnson",
        business: "The Rustic Table",
        content: "Since implementing Snytra's Online Ordering System, we've seen a 35% increase in our takeout orders. The system is intuitive for both our staff and customers, and the analytics help us make better business decisions.",
        rating: 5,
        product: "online-ordering-system"
    },
    {
        id: 2,
        name: "Michael Rodriguez",
        business: "Spice Avenue",
        content: "The online ordering platform has revolutionized our operations. We're now able to handle twice as many orders without adding staff, and our customers love the easy-to-use interface.",
        rating: 5,
        product: "online-ordering-system"
    }
];

const filteredPlans = plans.filter(plan => plan.billing_cycle === billingCycle && plan.is_active);
    const productSchema = createProductSchema({
        name: pageContent?.title || "Online Ordering System", // Use dynamic title
        description: pageContent?.description || "Streamline your business operations...",
        image: "https://utfs.io/f/N6Qv8dPmZYGOaNvU0he8bSzrTmEU7AlveqCFHo1nB4iJOX5c",
        offers: { price: 49, priceCurrency: "USD", availability: "https://schema.org/InStock" },
    });

    // --- RENDER ---
    // You can show a loading state for the whole page while content loads
    if (contentLoading) {
        return <div>Loading System Details...</div>
    }

    // If content fails to load but you want to show the rest, you can handle that
    if (!pageContent) {
        return <div>Error: Could not load page content.</div>
    }

    return (
        <>
            <SEO
                title={`${pageContent.title} | Snytra`}
                description={pageContent.description}
                ogImage="https://utfs.io/f/N6Qv8dPmZYGOaNvU0he8bSzrTmEU7AlveqCFHo1nB4iJOX5c"
                ogType="product"
                schema={productSchema}
            />

            {/* Hero Section */}
            <section className="bg-beige py-20">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className="md:w-1/2 mb-8 md:mb-0">
                            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
                                {pageContent.title} {/* DYNAMIC */}
                            </h1>
                            <p className="text-lg mb-8 text-charcoal leading-relaxed">
                                {pageContent.description} {/* DYNAMIC */}
                            </p>
                            <div className="flex flex-row gap-4">
                                {pageContent.links.map((link, index) => (
                                    <Link key={index} href={link.href} className={(link as any).attributes.class}>
                                        {link.text}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="md:w-1/2">
                            <div className="rounded-lg overflow-hidden shadow-xl border border-lightGray">
                                <Image src="https://utfs.io/f/N6Qv8dPmZYGOaNvU0he8bSzrTmEU7AlveqCFHo1nB4iJOX5c" alt="Online Ordering System Dashboard" width={600} height={400} className="w-full h-auto" priority />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-primary text-center mb-12">
                        How It Works
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-beige/30 p-8 rounded-lg border border-lightGray">
                            <div className="flex items-center justify-center w-16 h-16 bg-primary text-white rounded-full mb-6 text-2xl font-bold mx-auto">1</div>
                            <h3 className="text-xl font-bold mb-4 text-center">Create Your Menu</h3>
                            <p className="text-center text-charcoal">
                                Easily upload your menu items with descriptions, images, pricing, and categorization.
                            </p>
                        </div>
                        <div className="bg-beige/30 p-8 rounded-lg border border-lightGray">
                            <div className="flex items-center justify-center w-16 h-16 bg-primary text-white rounded-full mb-6 text-2xl font-bold mx-auto">2</div>
                            <h3 className="text-xl font-bold mb-4 text-center">Receive Orders</h3>
                            <p className="text-center text-charcoal">
                                Get instant notifications when customers place orders through your website or mobile app.
                            </p>
                        </div>
                        <div className="bg-beige/30 p-8 rounded-lg border border-lightGray">
                            <div className="flex items-center justify-center w-16 h-16 bg-primary text-white rounded-full mb-6 text-2xl font-bold mx-auto">3</div>
                            <h3 className="text-xl font-bold mb-4 text-center">Fulfill & Analyze</h3>
                            <p className="text-center text-charcoal">
                                Process orders efficiently and gain insights from detailed analytics on sales and customer behavior.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Dashboard Showcase Section */}
            <section className="py-20 bg-beige/30">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-primary text-center mb-6">
                        Powerful Dashboards for Your Team
                    </h2>
                    <p className="text-center text-charcoal max-w-3xl mx-auto mb-12">
                        Our system includes specialized dashboards for your staff and kitchen team, providing intuitive interfaces that streamline operations and enhance productivity.
                    </p>
                    <DashboardCarousel />
                </div>
            </section>

            {/* Features Section - now dynamic */}
            <section className="py-20 bg-beige/50">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-primary text-center mb-12">
                        {pageContent.features.title} {/* DYNAMIC */}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {pageContent.features.items.map((item, index) => (
                            <div key={index} className="bg-white p-8 rounded-lg shadow-md border border-lightGray hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path d="M..." /> {/* Your existing icon path */}
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                                <p className="text-charcoal">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* All other sections (Pricing, Comparison, Testimonials, CTA) remain unchanged and will work as before */}
            {/* Pricing Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-primary text-center mb-8">
                        Choose the perfect plan for your business
                    </h2>
                    <p className="text-center text-charcoal max-w-2xl mx-auto mb-12">
                        Select the plan that best fits your restaurant's needs. All plans include our core online ordering functionality.
                    </p>

                    {/* Pricing Toggle */}
                    <div className="flex justify-center mb-12">
                        <div className="relative bg-white p-0.5 rounded-lg flex shadow-sm">
                            <button
                                type="button"
                                onClick={() => setBillingCycle('monthly')}
                                className={`relative py-2 px-6 border-transparent rounded-md shadow-sm text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary ${billingCycle === 'monthly' ? 'bg-primary text-white' : 'bg-white text-charcoal'
                                    }`}
                            >
                                Monthly billing
                            </button>
                            <button
                                type="button"
                                onClick={() => setBillingCycle('yearly')}
                                className={`relative py-2 px-6 border-transparent rounded-md shadow-sm text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary ${billingCycle === 'yearly' ? 'bg-primary text-white' : 'bg-white text-charcoal'
                                    }`}
                            >
                                Annual billing
                                <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-olive/20 text-olive">
                                    Save 17%
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Pricing Cards */}
                    {planLoading ? (
                        <div className="flex justify-center my-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : filteredPlans.length === 0 ? (
                        <div className="text-center my-12">
                            <p className="text-charcoal">No plans available for {billingCycle} billing at this time.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                            {filteredPlans.map((plan, index) => {
                                const features = Array.isArray(plan.features) ? plan.features : [];
                                const isPopular = billingCycle === 'monthly' ? index === 1 : index === 1;

                                return (
                                    <div
                                        key={plan.id}
                                        className={`bg-white rounded-lg shadow-lg overflow-hidden border 
                                            ${isPopular ? 'border-primary ring-2 ring-primary/30 relative transform scale-105 z-10' : 'border-gray-100'} 
                                            flex flex-col transition-all duration-300 hover:shadow-xl`}
                                    >
                                        {isPopular && (
                                            <div className="absolute top-0 right-0 mt-4 mr-4 bg-primary/20 rounded-full px-3 py-1">
                                                <span className="text-xs font-semibold text-primary">Most Popular</span>
                                            </div>
                                        )}
                                        <div className="px-6 py-8">
                                            <h3 className="text-2xl font-bold text-primary">{plan.name}</h3>
                                            <p className="mt-4 text-charcoal">{plan.description}</p>
                                            <p className="mt-8 flex items-baseline">
                                                <span className="text-4xl font-extrabold text-primary">${plan.price}</span>
                                                <span className="text-base font-medium text-charcoal ml-1">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                                            </p>
                                            <button
                                                onClick={() => handlePlanSelect(plan)}
                                                className={`mt-8 block w-full py-3 px-4 rounded-md text-center font-medium transition-colors cursor-pointer
                                                ${isPopular
                                                        ? 'bg-primary text-white hover:bg-primary/90'
                                                        : 'bg-white text-primary border-2 border-primary hover:bg-primary/10'
                                                    }`}
                                            >
                                                Get started
                                            </button>
                                        </div>
                                        <div className="border-t border-gray-100 px-6 py-6 flex-grow bg-beige/30">
                                            <h4 className="text-sm font-medium text-primary tracking-wide uppercase">What's included</h4>
                                            <ul className="mt-6 space-y-4">
                                                {features.map((feature, idx) => (
                                                    <li key={idx} className="flex">
                                                        <svg className="flex-shrink-0 h-6 w-6 text-olive" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        <span className="ml-3 text-charcoal">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
            {/* Feature Comparison Table Section */}
            <section className="py-20 bg-beige/30">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-primary text-center mb-8">
                        Compare Plan Features
                    </h2>
                    <p className="text-center text-charcoal max-w-2xl mx-auto mb-12">
                        Detailed comparison of features available in each plan to help you choose the perfect fit for your business.
                    </p>
                    <FeatureComparisonTable billingCycle={billingCycle} />
                </div>
            </section>

            {/* Testimonial Section */}
            <section className="py-20 bg-beige">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-primary text-center mb-12">
                        What Our Customers Say
                    </h2>

                    {reviewLoading ? (
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center">
                            <p className="text-charcoal">No reviews available at this time.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            {reviews.map(review => (
                                <div key={review.id} className="bg-white p-8 rounded-lg shadow-md border border-lightGray">
                                    <div className="flex flex-col items-start">
                                        <div className="flex items-center mb-4">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <svg
                                                    key={i}
                                                    className={`h-5 w-5 ${i < review.rating ? 'text-yellow' : 'text-lightGray'}`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <p className="text-lg mb-6 italic text-charcoal">
                                            "{review.content}"
                                        </p>
                                        <div>
                                            <h4 className="font-bold">{review.name}</h4>
                                            <p className="text-sm text-charcoal">{review.business}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="bg-primary rounded-lg p-8 md:p-12 text-center">
                        <h2 className="text-3xl font-bold text-white mb-6">
                            Ready to transform your business operations?
                        </h2>
                        <p className="text-white text-lg mb-8 max-w-2xl mx-auto">
                            Join thousands of businesses that have streamlined their operations and increased revenue with our Online Ordering System.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Link
                                href="/register?product=online-ordering-system"
                                className="bg-white text-primary px-8 py-3 rounded-md font-medium hover:bg-beige transition-colors w-full sm:w-auto"
                            >
                                Get Started
                            </Link>
                            <Link
                                href="/request-demo"
                                className="border border-white text-white px-8 py-3 rounded-md font-medium hover:bg-primary-dark transition-colors w-full sm:w-auto"
                            >
                                Request Demo
                            </Link>
                        </div>
                    </div>
                </div>
            </section>        </>
    );
}