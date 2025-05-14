import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Us | Snytra",
    description: "Learn about Snytra - we are committed to helping restaurants operate smarter, faster, and better with our integrated management tools.",
    keywords: "restaurant management system, restaurant software, about Snytra",
    openGraph: {
        title: "About Us | Snytra",
        description: "We are committed to helping restaurants operate smarter, faster, and better with our integrated management tools.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "About Us | Snytra",
        description: "We are committed to helping restaurants operate smarter, faster, and better with our integrated management tools.",
    },
};

export default function AboutUs() {
    return (
        <>
            {/* Hero Section */}
            <section className="bg-beige py-16">
                <div className="container mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-bold text-primary text-center mb-4">
                        Who We Are and What We Do
                    </h1>
                    <p className="text-lg text-center text-charcoal max-w-3xl mx-auto mb-8">
                        We are committed to helping restaurants operate smarter, faster, and better with our integrated management tools.
                    </p>
                </div>
            </section>

            {/* Vision and Mission Section */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-primary text-center mb-12">
                        Our Vision and Mission
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Vision Card */}
                        <div className="bg-white p-8 rounded-lg shadow-md">
                            <div className="flex items-start mb-4">
                                <div className="bg-primary/10 p-3 rounded-full mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-primary">Vision</h3>
                            </div>
                            <p className="text-charcoal">
                                To empower restaurants with cutting-edge technology for seamless operations.
                            </p>
                        </div>

                        {/* Mission Card */}
                        <div className="bg-white p-8 rounded-lg shadow-md">
                            <div className="flex items-start mb-4">
                                <div className="bg-primary/10 p-3 rounded-full mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-primary">Mission</h3>
                            </div>
                            <p className="text-charcoal">
                                Deliver reliable, easy-to-use solutions that boost efficiency and customer satisfaction.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="py-16 bg-light">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-primary text-center mb-12">
                        Why Choose Us
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Feature 1 */}
                        <div className="text-center">
                            <div className="bg-primary w-20 h-20 rounded flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2">All-in-One Platform</h3>
                            <p className="text-charcoal">
                                Comprehensive restaurant management in a single, integrated system.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="text-center">
                            <div className="bg-primary w-20 h-20 rounded flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Customizable to Your Needs</h3>
                            <p className="text-charcoal">
                                Flexible features that adapt to your restaurant's unique requirements.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="text-center">
                            <div className="bg-primary w-20 h-20 rounded flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2">User-Friendly Dashboards</h3>
                            <p className="text-charcoal">
                                Intuitive interfaces designed for restaurant staff of all technical abilities.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="text-center">
                            <div className="bg-primary w-20 h-20 rounded flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Exceptional Support and Scalability</h3>
                            <p className="text-charcoal">
                                Dedicated customer service and solutions that grow with your business.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section (Placeholder) */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-primary text-center mb-12">
                        Our Team
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Team Member 1 */}
                        <div className="bg-white p-6 rounded-lg shadow-md text-center">
                            <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden flex items-center justify-center">
                                {/* Fallback display for missing image */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-1">John Smith</h3>
                            <p className="text-primary mb-3">CEO & Founder</p>
                            <p className="text-charcoal mb-4">
                                Restaurant industry veteran with 15+ years of experience.
                            </p>
                        </div>

                        {/* Team Member 2 */}
                        <div className="bg-white p-6 rounded-lg shadow-md text-center">
                            <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden flex items-center justify-center">
                                {/* Fallback display for missing image */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-1">Sarah Johnson</h3>
                            <p className="text-primary mb-3">CTO</p>
                            <p className="text-charcoal mb-4">
                                Tech innovator with experience building scalable platforms.
                            </p>
                        </div>

                        {/* Team Member 3 */}
                        <div className="bg-white p-6 rounded-lg shadow-md text-center">
                            <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden flex items-center justify-center">
                                {/* Fallback display for missing image */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-1">Michael Chen</h3>
                            <p className="text-primary mb-3">Head of Customer Success</p>
                            <p className="text-charcoal mb-4">
                                Dedicated to ensuring restaurants thrive with our platform.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-16 bg-light">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-primary text-center mb-8">
                        Our Story
                    </h2>
                    <div className="max-w-3xl mx-auto">
                        <p className="text-lg mb-6">
                            Snytra was founded in 2018 by a team of restaurant operators and technology experts who experienced firsthand the challenges of running a restaurant with disconnected systems.
                        </p>
                        <p className="text-lg mb-6">
                            We started with a simple mission: create an all-in-one platform that makes restaurant management easier, more efficient, and more profitable.
                        </p>
                        <p className="text-lg">
                            Today, we're proud to serve thousands of restaurants worldwide, from small cafes to large restaurant chains, helping them streamline operations and deliver exceptional dining experiences.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    <div className="bg-primary rounded-lg p-8 md:p-12 text-center">
                        <h2 className="text-3xl font-bold text-white mb-6">
                            Ready to transform your restaurant management?
                        </h2>
                        <p className="text-white text-lg mb-8 max-w-2xl mx-auto">
                            Join thousands of restaurants that have revolutionized their operations with Snytra.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <Link
                                href="/register"
                                className="bg-white text-primary px-8 py-3 rounded font-medium hover:bg-beige transition-colors"
                            >
                                Get Started
                            </Link>
                            <Link
                                href="/contact-us"
                                className="border border-white text-white px-8 py-3 rounded font-medium hover:bg-primary-dark transition-colors"
                            >
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
} 