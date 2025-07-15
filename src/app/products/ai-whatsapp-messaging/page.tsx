// src/app/products/ai-whatsapp-messaging/page.tsx

import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import SEO, { createProductSchema } from "@/components/SEO";
import { executeQuery } from '@/lib/db'; // Import db helper
import { notFound } from 'next/navigation'; // Import notFound

// Define the structure of the page content
interface AiWhatsappData {
    title: string;
    description: string;
    links: Array<{ text: string; href: string; attributes: { class: string; } }>;
    features: {
        title: string;
        items: Array<{ title: string; description: string; }>;
    };
}

async function getPageData(slug: string): Promise<AiWhatsappData | null> {
    const query = 'SELECT content FROM pages WHERE slug = $1 AND status = $2 LIMIT 1';
    try {
        const result = await executeQuery<{ content: { AIWhatsAppMessaging: AiWhatsappData } }[]>(query, [slug, 'published']);
        if (result?.[0]?.content?.AIWhatsAppMessaging) {
            return result[0].content.AIWhatsAppMessaging;
        }
    } catch (error) {
        console.error(`Failed to fetch page data for slug "${slug}":`, error);
    }
    return null;
}

// The metadata function is now async to fetch dynamic data
export async function generateMetadata(): Promise<Metadata> {
    const pageContent = await getPageData('products/ai-whatsapp-messaging');
    const title = pageContent?.title || 'AI WhatsApp Messaging';
    const description = pageContent?.description || 'Transform your business communication...';
    
    return {
        title: `${title} | Snytra`,
        description: description,
        keywords: "ai whatsapp, business messaging, automated communication",
        openGraph: {
            title: `${title} | Snytra`,
            description: description,
            images: [{ url: "/images/products/ai-whatsapp-messaging.jpg" }],
        },
    };
}

// The main component is now async
export default async function AIWhatsAppMessaging() {
    const pageContent = await getPageData('products/ai-whatsapp-messaging');

    if (!pageContent) {
        notFound();
    }

    const productSchema = createProductSchema({
        name: pageContent.title,
        description: pageContent.description,
        image: "https://snytra.com/images/products/ai-whatsapp-messaging.jpg",
        offers: { price: 69, priceCurrency: "USD", availability: "https://schema.org/InStock" },
    });

    return (
        <>
            <SEO
                title={`${pageContent.title} | Snytra`}
                description={pageContent.description}
                ogImage="/images/products/ai-whatsapp-messaging.jpg"
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
                                <Image src="/images/products/ai-whatsapp-messaging.jpg" alt="AI WhatsApp Messaging System" width={600} height={400} className="w-full h-auto"/>
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
                                    {/* Corresponding feature icon would go here */}
                                    <svg>...</svg>
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
                                <span className="text-5xl font-bold">$69</span>
                                <span className="text-xl text-charcoal ml-2">/month</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Unlimited AI-powered conversations</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>WhatsApp Business API integration</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Custom response templates</span>
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Basic analytics dashboard</span>
                                </li>
                            </ul>
                            <Link
                                href="/register?product=ai-whatsapp-messaging"
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
                            Ready to transform your customer communication?
                        </h2>
                        <p className="text-white text-lg mb-8 max-w-2xl mx-auto">
                            Join businesses that have increased customer engagement and satisfaction with our AI WhatsApp Messaging solution.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <Link
                                href="/register?product=ai-whatsapp-messaging"
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