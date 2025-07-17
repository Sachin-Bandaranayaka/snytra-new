// src/app/products/ai-sms-messaging/page.tsx

import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import SEO, { createProductSchema } from "@/components/SEO";
import { executeQuery } from '@/lib/db'; // Import db helper
import { notFound } from 'next/navigation'; // Import notFound

// Define the page content structure
interface FeatureItem {
    title: string;
    description: string;
    svgPathD?: string; // Added svgPathD for the feature icon
}

interface AiSmsData {
    title: string;
    description: string;
    links: Array<{ text: string; href: string; attributes: { class: string; } }>;
    features: {
        title: string;
        items: FeatureItem[]; // Updated to use the new FeatureItem interface
    };
}

async function getPageData(slug: string): Promise<AiSmsData | null> {
    const query = 'SELECT content FROM pages WHERE slug = $1 AND status = $2 LIMIT 1';
    try {
        const result = await executeQuery<{ content: { AISMSMessaging: AiSmsData } }[]>(query, [slug, 'published']);
        if (result?.[0]?.content?.AISMSMessaging) {
            return result[0].content.AISMSMessaging;
        }
    } catch (error) {
        console.error(`Failed to fetch page data for slug "${slug}":`, error);
    }
    return null;
}

// Make metadata function async
export async function generateMetadata(): Promise<Metadata> {
    const pageContent = await getPageData('products/ai-sms-messaging');
    const title = pageContent?.title || "AI SMS Messaging";
    const description = pageContent?.description || "Enhance your restaurant communication with AI-powered SMS messaging.";

    return {
        title: `${title} | RestaurantOS`,
        description,
        keywords: "ai sms, restaurant messaging, automated texts",
        openGraph: {
            title: `${title} | RestaurantOS`,
            description,
            images: [{ url: "/images/products/ai-sms-messaging.jpg" }],
        },
    };
}

// Convert the main component to an async function
export default async function AISMSMessaging() {
    const pageContent = await getPageData('products/ai-sms-messaging');

    if (!pageContent) {
        notFound();
    }

    const productSchema = createProductSchema({
        name: pageContent.title,
        description: pageContent.description,
        image: "https://restaurantos.com/images/products/ai-sms-messaging.jpg",
        offers: { price: 59, priceCurrency: "USD", availability: "https://schema.org/InStock" },
    });

    return (
        <>
            <SEO
                title={`${pageContent.title} | RestaurantOS`}
                description={pageContent.description}
                ogImage="/images/products/ai-sms-messaging.jpg"
                ogType="product"
                schema={productSchema}
            />

            {/* Hero Section */}
            <section className="bg-beige py-16">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12">
                            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
                                {pageContent.title}
                            </h1>
                            <p className="text-lg mb-8 text-charcoal">
                                {pageContent.description}
                            </p>
                            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                               {pageContent.links.map((link, index) => (
                                    <Link key={index} href={link.href} className={link.attributes.class}>
                                        {link.text}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="md:w-1/2">
                            <div className="rounded-lg overflow-hidden shadow-xl">
                                <Image src="/images/products/ai-sms-messaging.jpg" alt="AI SMS Messaging System" width={600} height={400} className="w-full h-auto"/>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-primary text-center mb-12">
                        {pageContent.features.title}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {pageContent.features.items.map((item, index) => {
                            // --- DEBUGGING LOG ---
                            console.log(`AI SMS Feature: ${item.title}, svgPathD:`, item.svgPathD);
                            // --- END DEBUGGING LOG ---
                            const isValidSvgPath = typeof item.svgPathD === 'string' && item.svgPathD.trim() !== '';

                            return (
                                <div key={index} className="bg-white p-8 rounded-lg shadow-md">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                                        {/* Icon SVG */}
                                        {isValidSvgPath ? (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-6 w-6" // Consistent size
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d={item.svgPathD} // Dynamic path data
                                                />
                                            </svg>
                                        ) : (
                                            // Fallback icon (a generic message icon)
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.11C6.233 14.935 12 14 12 14s6.97-1.582 9-6z" />
                                            </svg>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                                    <p>{item.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="bg-light py-16">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-primary text-center mb-12">
                        Pricing
                    </h2>
                    <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-8">
                            <h3 className="text-2xl font-bold mb-4">Starting at</h3>
                            <div className="flex items-end mb-6">
                                <span className="text-5xl font-bold">$59</span>
                                <span className="text-xl text-charcoal ml-2">/month</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>500 SMS messages included</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>AI-powered response handling</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Campaign scheduling</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Basic analytics dashboard</span>
                                </li>
                            </ul>
                            <Link
                                href="/register?product=ai-sms-messaging"
                                className="w-full bg-primary text-white px-6 py-3 rounded font-medium text-center block hover:bg-primary/90 transition-colors"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    <div className="bg-primary rounded-lg p-8 md:p-12 text-center">
                        <h2 className="text-3xl font-bold text-white mb-6">
                            Ready to enhance your customer communication?
                        </h2>
                        <p className="text-white text-lg mb-8 max-w-2xl mx-auto">
                            Join restaurants that have increased customer engagement and revenue with our AI SMS Messaging solution.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <Link
                                href="/register?product=ai-sms-messaging"
                                className="bg-white text-primary px-8 py-3 rounded font-medium hover:bg-beige transition-colors"
                            >
                                Get Started
                            </Link>
                            <Link
                                href="/request-demo"
                                className="border border-white text-white px-8 py-3 rounded font-medium hover:bg-primary-dark transition-colors"
                            >
                                Request Demo
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
