import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import SEO, { createProductSchema } from "@/components/SEO";

export const metadata: Metadata = {
    title: "AI WhatsApp Messaging | Snytra",
    description: "Transform your business communication with AI-powered WhatsApp messaging. Automate customer service, handle inquiries, and boost engagement.",
    keywords: "ai whatsapp, business messaging, automated communication, business whatsapp, customer engagement",
    openGraph: {
        title: "AI WhatsApp Messaging | Snytra",
        description: "Transform your business communication with AI-powered WhatsApp messaging.",
        images: [{ url: "/images/products/ai-whatsapp-messaging.jpg" }],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "AI WhatsApp Messaging | Snytra",
        description: "Transform your business communication with AI-powered WhatsApp messaging.",
        images: ["/images/products/ai-whatsapp-messaging.jpg"],
    },
};

export default function AIWhatsAppMessaging() {
    const productSchema = createProductSchema({
        name: "AI WhatsApp Messaging",
        description: "Transform your business communication with AI-powered WhatsApp messaging technology.",
        image: "https://snytra.com/images/products/ai-whatsapp-messaging.jpg",
        offers: {
            price: 69,
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
        },
    });

    return (
        <>
            <SEO
                title="AI WhatsApp Messaging | Snytra"
                description="Transform your business communication with AI-powered WhatsApp messaging."
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
                                AI WhatsApp Messaging
                            </h1>
                            <p className="text-lg mb-8 text-charcoal">
                                Engage with your customers through their preferred channel with AI-powered WhatsApp messaging. Automate responses, handle bookings, and provide instant customer service 24/7.
                            </p>
                            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                                <Link
                                    href="/register?product=ai-whatsapp-messaging"
                                    className="bg-primary text-white px-6 py-3 rounded font-medium text-center hover:bg-primary/90 transition-colors"
                                >
                                    Get Started
                                </Link>
                                <Link
                                    href="/contact-us"
                                    className="border border-primary text-primary px-6 py-3 rounded font-medium text-center hover:bg-beige transition-colors"
                                >
                                    Contact Sales
                                </Link>
                            </div>
                        </div>
                        <div className="md:w-1/2">
                            <div className="rounded-lg overflow-hidden shadow-xl">
                                <Image
                                    src="/images/products/ai-whatsapp-messaging.jpg"
                                    alt="AI WhatsApp Messaging System"
                                    width={600}
                                    height={400}
                                    className="w-full h-auto"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-primary text-center mb-12">
                        Key Features
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white p-8 rounded-lg shadow-md">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-4">Automated Responses</h3>
                            <p>
                                AI-powered responses to common questions about reservations, menu items, business hours, and more.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white p-8 rounded-lg shadow-md">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-4">24/7 Availability</h3>
                            <p>
                                Provide instant responses to customers at any time of day, improving satisfaction and reducing wait times.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white p-8 rounded-lg shadow-md">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-4">Order Management</h3>
                            <p>
                                Allow customers to place orders via WhatsApp, with automatic confirmation and status updates.
                            </p>
                        </div>
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
            </section>
        </>
    );
} 