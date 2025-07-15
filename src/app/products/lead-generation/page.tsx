// src/app/products/lead-generation/page.tsx

import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import SEO, { createProductSchema } from "@/components/SEO";
import { executeQuery } from '@/lib/db';
import { notFound } from 'next/navigation';

// Define the structure of the page content
interface LeadGenerationData {
    title: string;
    description: string;
    links: Array<{ text: string; href: string; attributes: { class: string; } }>;
    features: {
        title: string;
        items: Array<{ title: string; description: string; }>;
    };
}

async function getPageData(slug: string): Promise<LeadGenerationData | null> {
    const query = 'SELECT content FROM pages WHERE slug = $1 AND status = $2 LIMIT 1';
    try {
        const result = await executeQuery<{ content: { LeadGeneration: LeadGenerationData } }[]>(query, [slug, 'published']);
        if (result?.[0]?.content?.LeadGeneration) {
            return result[0].content.LeadGeneration;
        }
    } catch (error) {
        console.error(`Failed to fetch page data for slug "${slug}":`, error);
    }
    return null;
}

// Make metadata function async to fetch dynamic data
export async function generateMetadata(): Promise<Metadata> {
    const pageContent = await getPageData('products/lead-generation');
    const title = pageContent?.title || "Lead Generation";
    const description = pageContent?.description || "Attract new customers and grow your business...";

    return {
        title: `${title} | RestaurantOS`,
        description,
        keywords: "restaurant lead generation, customer acquisition, restaurant marketing",
        openGraph: {
            title: `${title} | RestaurantOS`,
            description,
            images: [{ url: "/images/products/lead-generation.jpg" }],
        },
    };
}

// The main component is now async
export default async function LeadGeneration() {
    const pageContent = await getPageData('products/lead-generation');

    if (!pageContent) {
        notFound();
    }

    const productSchema = createProductSchema({
        name: pageContent.title,
        description: pageContent.description,
        image: "https://restaurantos.com/images/products/lead-generation.jpg",
        offers: { price: 89, priceCurrency: "USD", availability: "https://schema.org/InStock" },
    });

    return (
        <>
            <SEO
                title={`${pageContent.title} | RestaurantOS`}
                description={pageContent.description}
                ogImage="/images/products/lead-generation.jpg"
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
                                <Image src="/images/products/lead-generation.jpg" alt="Restaurant Lead Generation System" width={600} height={400} className="w-full h-auto" />
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
                       {pageContent.features.items.map((item, index) => (
                            <div key={index} className="bg-white p-8 rounded-lg shadow-md">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                                    {/* Your original SVG icons go here */}
                                </div>
                                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                                <p>{item.description}</p>
                            </div>
                        ))}
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
                                <span className="text-5xl font-bold">$89</span>
                                <span className="text-xl text-charcoal ml-2">/month</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Unlimited lead capture forms</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Multi-channel campaign tools</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Automated follow-up sequences</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Comprehensive analytics</span>
                                </li>
                            </ul>
                            <Link
                                href="/register?product=lead-generation"
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
                            Ready to grow your customer base?
                        </h2>
                        <p className="text-white text-lg mb-8 max-w-2xl mx-auto">
                            Join restaurants that have increased their customer acquisition by up to 40% with our Lead Generation system.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <Link
                                href="/register?product=lead-generation"
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
            </section>        </>
    );
}