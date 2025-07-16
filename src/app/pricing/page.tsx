"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import SEO, { createProductSchema } from "@/components/SEO";

interface SubscriptionPlan {
    id: number;
    name: string;
    description: string;
    price: number;
    billing_interval: string;
    features: string[];
    is_active: boolean;
    stripe_price_id?: string;
}

interface FAQ {
    id: number;
    question: string;
    answer: string;
    is_published: boolean;
    category_id?: number;
    display_order?: number;
}

function PricingContent() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [faqLoading, setFaqLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [faqError, setFaqError] = useState<string | null>(null);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showSubscriptionAlert, setShowSubscriptionAlert] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const [processingPlanId, setProcessingPlanId] = useState<number | null>(null);

    useEffect(() => {
        // Check if user is logged in
        const user = localStorage.getItem('user');
        setIsLoggedIn(!!user);

        // Check if user was redirected here due to missing subscription
        const subscriptionRequired = searchParams.get('subscription');
        if (subscriptionRequired === 'required') {
            setShowSubscriptionAlert(true);
            // Hide the alert after 10 seconds
            const timer = setTimeout(() => {
                setShowSubscriptionAlert(false);
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [searchParams]);

    // Add fallback data for subscription plans
    const fallbackPlans = [
        {
            id: 1,
            name: 'Basic',
            description: 'Perfect for small businesses',
            price: 49.99,
            billing_interval: 'monthly',
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
            billing_interval: 'monthly',
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
            billing_interval: 'monthly',
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
            billing_interval: 'yearly',
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
            billing_interval: 'yearly',
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
            billing_interval: 'yearly',
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

    // Add fallback FAQs
    const fallbackFaqs = [
        {
            id: 1,
            question: 'How does the trial work?',
            answer: 'You get a 14-day free trial with full access to all features. No credit card required to start. You can upgrade to a paid plan at any time during or after your trial.',
            is_published: true
        },
        {
            id: 2,
            question: 'Can I change plans later?',
            answer: 'Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes to your plan will take effect at the end of your current billing cycle.',
            is_published: true
        },
        {
            id: 3,
            question: 'Is there a setup fee?',
            answer: 'No, there are no setup fees or hidden charges. You only pay the advertised price for your subscription plan.',
            is_published: true
        },
        {
            id: 4,
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit cards including Visa, Mastercard, American Express, and Discover. We also support PayPal for subscription payments.',
            is_published: true
        }
    ];

    // Fetch plans
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/subscription-plans');
                if (!response.ok) {
                    throw new Error('Failed to fetch plans');
                }

                const data = await response.json();
                if (data.success && data.plans && data.plans.length > 0) {
                    console.log('Successfully loaded plans from database:', data.plans);
                    setPlans(data.plans);
                } else {
                    // Log the issue and use fallback plans if API returns empty data
                    console.error('API returned empty or invalid data:', data);
                    setError('Using default plans as the server returned incomplete data.');
                    setPlans(fallbackPlans);
                }
            } catch (err) {
                console.error('Error fetching plans:', err);
                setError('Using default plans as we encountered an issue loading from the server.');
                // Use fallback plans on error
                setPlans(fallbackPlans);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    // Fetch FAQs
    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                setFaqLoading(true);
                const response = await fetch('/api/faqs?published=true');
                if (!response.ok) {
                    throw new Error('Failed to fetch FAQs');
                }

                const data = await response.json();
                if (data.success && data.faqs && data.faqs.length > 0) {
                    console.log('Successfully loaded FAQs from database:', data.faqs);
                    setFaqs(data.faqs);
                } else {
                    // Log the issue and use fallback FAQs if API returns empty data
                    console.error('API returned empty or invalid data for FAQs:', data);
                    setFaqError('Using default FAQs as the server returned incomplete data.');
                    setFaqs(fallbackFaqs);
                }
            } catch (err) {
                console.error('Error fetching FAQs:', err);
                setFaqError('Using default FAQs as we encountered an issue loading from the server.');
                // Use fallback FAQs on error
                setFaqs(fallbackFaqs);
            } finally {
                setFaqLoading(false);
            }
        };

        fetchFaqs();
    }, []);

    // Filter plans based on billing cycle and active status
    const filteredPlans = plans.filter(plan =>
        plan.is_active &&
        (plan.billing_interval === billingCycle ||
            (billingCycle === 'monthly' && !plan.billing_interval)) // Handle cases where billing_interval might be missing
    );

    const handlePlanSelect = async (plan: SubscriptionPlan) => {
        // If user is not logged in, direct to register page with plan parameter
        if (!isLoggedIn) {
            router.push(`/register?plan=${plan.id}`);
            return;
        }

        // For logged in users, get user info
        const userJson = localStorage.getItem('user');
        if (!userJson) {
            router.push(`/login?plan=${plan.id}`);
            return;
        }

        try {
            setProcessingPlanId(plan.id); // Set the processing plan ID
            setError(null);
            const user = JSON.parse(userJson);

            // Check if the plan has a stripe_price_id
            if (!plan.stripe_price_id) {
                setError('This plan is not properly configured for checkout. Please contact support.');
                setProcessingPlanId(null);
                return;
            }

            // Create a checkout session with Stripe
            const response = await fetch('/api/payment/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    planId: plan.id.toString(),
                    customerId: user.id.toString(),
                    userEmail: user.email
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Failed to create checkout session:', data.error);
                setError(data.error || 'Failed to create checkout session');
                setProcessingPlanId(null);
                return;
            }

            // Redirect to Stripe Checkout
            window.location.href = data.url;
        } catch (error) {
            console.error('Error creating checkout session:', error);
            setError('An error occurred while processing your request. Please try again.');
            setProcessingPlanId(null);
        }
    };

    // Calculate yearly price with 5% discount
    const getYearlyPrice = (monthlyPrice: number) => {
        return ((monthlyPrice * 12) * 0.95).toFixed(0);
    };

    // Product schema for SEO
    const pricingSchema = createProductSchema({
        name: "RestaurantOS Subscription Plans",
        description: "Choose the right subscription plan for your restaurant management needs.",
        image: "https://restaurantos.com/images/pricing-hero.jpg",
        offers: {
            price: 49,
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
        },
    });

    const additionalMetadata = {
        container: {
            "@type": "ItemList",
            name: "Snytra Subscription Plans",
            description: "Choose the right subscription plan for your business management needs.",
            image: "https://snytra.com/images/pricing-hero.jpg",
        }
    };

    return (
        <main className="min-h-screen flex flex-col">
            <SEO
                title="Pricing | Snytra"
                description="Choose the right subscription plan for your business management needs."
                schema={additionalMetadata}
            />

            {showSubscriptionAlert && (
                <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 fixed top-0 left-0 right-0 z-50">
                    <div className="flex items-center justify-between max-w-7xl mx-auto">
                        <div className="flex items-center">
                            <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>An active subscription is required to access the dashboard. Please select a plan to continue.</span>
                        </div>
                        <button
                            onClick={() => setShowSubscriptionAlert(false)}
                            className="text-orange-700 hover:text-orange-900"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-beige min-h-screen py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-primary text-center mb-4">
                            Choose the perfect plan for your business's needs
                        </h1>
                        <p className="mt-5 max-w-xl mx-auto text-xl text-charcoal">
                            Choose the perfect plan for your business's needs
                        </p>
                    </div>

                    {/* Billing toggle */}
                    <div className="mt-12 flex justify-center">
                        <div className="relative bg-white p-0.5 rounded-lg flex">
                            <button
                                type="button"
                                className={`relative py-2 px-6 border-transparent rounded-md shadow-sm text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary ${billingCycle === 'monthly'
                                    ? 'bg-primary text-white'
                                    : 'bg-white text-charcoal'
                                    }`}
                                onClick={() => setBillingCycle('monthly')}
                            >
                                Monthly billing
                            </button>
                            <button
                                type="button"
                                className={`relative py-2 px-6 border-transparent rounded-md shadow-sm text-sm font-medium whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary ${billingCycle === 'yearly'
                                    ? 'bg-primary text-white'
                                    : 'bg-white text-charcoal'
                                    }`}
                                onClick={() => setBillingCycle('yearly')}
                            >
                                Annual billing
                                <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-olive/20 text-olive">
                                    Save 17%
                                </span>
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="mt-16 flex justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : error ? (
                        <div className="mt-16 max-w-lg mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                            {error}
                        </div>
                    ) : filteredPlans.length === 0 ? (
                        <div className="mt-16 max-w-lg mx-auto text-center">
                            <p className="text-charcoal">No plans available for {billingCycle} billing at this time.</p>
                        </div>
                    ) : (
                        <div className="mt-16 max-w-7xl mx-auto grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {filteredPlans.map((plan, index) => {
                                // Ensure plan.features is always an array
                                const features = Array.isArray(plan.features) ? plan.features : [];
                                const isPopular = index === 1 || index === 4; // Mark Standard plans as popular

                                return (
                                    <div key={plan.id}
                                        className={`bg-white rounded-lg shadow-lg overflow-hidden border 
                                            ${isPopular ? 'border-primary ring-2 ring-primary/30 relative transform scale-105 z-10' : 'border-gray-100'} 
                                            flex flex-col transition-all duration-300 hover:shadow-xl`}>

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
                                                className={`mt-8 block w-full py-3 px-4 rounded-md text-center font-medium transition-colors 
                                                ${isPopular
                                                        ? 'bg-primary text-white hover:bg-primary/90'
                                                        : 'bg-white text-primary border-2 border-primary hover:bg-primary/10'}`}
                                                disabled={processingPlanId !== null}
                                            >
                                                {processingPlanId === plan.id
                                                    ? 'Processing...'
                                                    : 'Get started'}
                                            </button>
                                        </div>
                                        <div className="border-t border-gray-100 px-6 py-6 flex-grow bg-beige/30">
                                            <h4 className="text-sm font-medium text-primary tracking-wide uppercase">What's included</h4>
                                            <ul className="mt-6 space-y-4">
                                                {features.map((feature, index) => (
                                                    <li key={index} className="flex">
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

                    <div className="mt-20 max-w-3xl mx-auto">
                        <h2 className="text-3xl font-extrabold text-primary text-center mb-8">
                            Frequently asked questions
                        </h2>

                        {faqLoading ? (
                            <div className="mt-8 flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        ) : faqError ? (
                            <div className="mt-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                                {faqError}
                            </div>
                        ) : faqs.length === 0 ? (
                            <div className="mt-8 text-center">
                                <p className="text-charcoal">No FAQs available at this time.</p>
                            </div>
                        ) : (
                            <div className="mt-8 space-y-6 text-left">
                                {faqs.filter(faq => faq.is_published).map((faq) => (
                                    <div key={faq.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:border-primary/50 transition-all duration-300">
                                        <h3 className="text-xl font-bold text-primary">
                                            {faq.question}
                                        </h3>
                                        <p className="mt-2 text-charcoal">
                                            {faq.answer}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-20 text-center bg-primary/10 p-8 rounded-lg">
                        <h2 className="text-2xl font-extrabold text-primary">
                            Still have questions?
                        </h2>
                        <p className="mt-4 text-charcoal">
                            Contact our friendly support team and we'll be happy to help.
                        </p>
                        <Link
                            href="/contact-us"
                            className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
                        >
                            Contact Support
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function Pricing() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </div>}>
            <PricingContent />
        </Suspense>
    );
}