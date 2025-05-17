import Link from "next/link";
import { Metadata } from "next";
import ComparisonTable from "@/components/ComparisonTable";
import PricingPlans from "@/components/PricingPlans";
import FeatureList from "@/components/FeatureList";

export const metadata: Metadata = {
    title: "What We Offer | Snytra",
    description: "Explore our comprehensive restaurant management system - featuring detailed comparisons, pricing, and features designed to streamline your operations.",
    keywords: "restaurant management system, POS software, table management, ordering system, inventory management, online ordering, financial management, business intelligence",
    openGraph: {
        title: "What We Offer | Snytra",
        description: "Discover what our restaurant management system offers to streamline your operations and boost profitability.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "What We Offer | Snytra",
        description: "Discover what our restaurant management system offers to streamline your operations and boost profitability.",
    },
};

export default function WhatWeOffer() {
    return (
        <>
            {/* Hero Section */}
            <section className="bg-beige py-16">
                <div className="container mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-bold text-primary text-center mb-4">
                        Explore Our Comprehensive Restaurant Management System
                    </h1>
                    <p className="text-lg text-center text-charcoal max-w-3xl mx-auto mb-8">
                        A powerful, integrated platform designed to streamline operations, increase efficiency, and boost profitability
                    </p>
                    <div className="flex justify-center mt-8">
                        <Link
                            href="/register"
                            className="bg-primary text-white px-8 py-3 rounded font-medium hover:bg-primary/90 transition-colors"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </section>

            {/* System Overview */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-primary text-center mb-12">Why Choose Our Restaurant Management System?</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                        <div className="bg-beige p-8 rounded-lg shadow-md">
                            <h3 className="text-2xl font-bold text-primary mb-4">Comprehensive Solution</h3>
                            <p className="text-charcoal mb-4">
                                Our integrated platform handles all aspects of restaurant operations, from front-of-house management to back-office administration.
                                Unlike competitors who offer piecemeal solutions, our system provides seamless functionality across all areas of your business.
                            </p>
                            <ul className="list-disc list-inside text-charcoal space-y-2">
                                <li>Unified platform for all restaurant operations</li>
                                <li>Seamless integration between modules</li>
                                <li>Single dashboard for complete business overview</li>
                                <li>Reduced complexity and training requirements</li>
                            </ul>
                        </div>

                        <div className="bg-beige p-8 rounded-lg shadow-md">
                            <h3 className="text-2xl font-bold text-primary mb-4">Cloud-Based Architecture</h3>
                            <p className="text-charcoal mb-4">
                                Our system leverages modern cloud technology to provide real-time data access, automatic updates, and enhanced security. Access your
                                restaurant's performance metrics anytime, anywhere, from any device.
                            </p>
                            <ul className="list-disc list-inside text-charcoal space-y-2">
                                <li>No expensive hardware requirements</li>
                                <li>Automatic updates and maintenance</li>
                                <li>Enterprise-grade security and data protection</li>
                                <li>Seamless multi-location management</li>
                            </ul>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="bg-beige p-8 rounded-lg shadow-md">
                            <h3 className="text-2xl font-bold text-primary mb-4">Data-Driven Insights</h3>
                            <p className="text-charcoal mb-4">
                                Transform raw data into actionable insights with our advanced analytics and reporting tools. Our system helps you identify trends, optimize operations,
                                and make informed decisions that drive profitability.
                            </p>
                            <ul className="list-disc list-inside text-charcoal space-y-2">
                                <li>Real-time performance dashboards</li>
                                <li>Customizable reports and analytics</li>
                                <li>Predictive analytics for inventory and staffing</li>
                                <li>Data visualization tools for quick insights</li>
                            </ul>
                        </div>

                        <div className="bg-beige p-8 rounded-lg shadow-md">
                            <h3 className="text-2xl font-bold text-primary mb-4">Scalable Solution</h3>
                            <p className="text-charcoal mb-4">
                                Whether you're running a single location or managing a nationwide chain, our system scales effortlessly to meet your needs.
                                Start with the essentials and add features as your business grows.
                            </p>
                            <ul className="list-disc list-inside text-charcoal space-y-2">
                                <li>Flexible deployment options for any business size</li>
                                <li>Modular design to add functionality as needed</li>
                                <li>Enterprise features for multi-location management</li>
                                <li>Volume-based pricing that grows with your business</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Features Section */}
            <section className="py-16 bg-light">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-primary text-center mb-12">Core Features</h2>

                    {/* Point of Sale System */}
                    <div className="bg-white p-8 rounded-lg shadow-md mb-12">
                        <div className="flex items-center mb-6">
                            <div className="bg-primary/10 p-3 rounded-full mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-primary">Point of Sale (POS) System</h3>
                        </div>

                        <p className="text-charcoal mb-6">
                            Our intuitive POS system streamlines order processing, payment handling, and customer management, enabling your staff
                            to provide faster service and reduce errors.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-bold mb-2">User-Friendly Interface</h4>
                                <p className="text-sm">Intuitive touchscreen design with minimal training required</p>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-bold mb-2">Flexible Payment Options</h4>
                                <p className="text-sm">Accept all major payment methods including contactless and mobile payments</p>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-bold mb-2">Custom Order Modifiers</h4>
                                <p className="text-sm">Easily customize orders with special requests and modifications</p>
                            </div>
                        </div>

                        <div className="bg-beige p-6 rounded-lg">
                            <h4 className="text-xl font-bold mb-4">POS System Comparison</h4>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="p-3 text-left">Feature</th>
                                            <th className="p-3 text-center">Snytra</th>
                                            <th className="p-3 text-center">Toast</th>
                                            <th className="p-3 text-center">Square</th>
                                            <th className="p-3 text-center">Lightspeed</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-gray-200">
                                            <td className="p-3 font-medium">Cloud-Based</td>
                                            <td className="p-3 text-center">✓</td>
                                            <td className="p-3 text-center">✓</td>
                                            <td className="p-3 text-center">✓</td>
                                            <td className="p-3 text-center">✓</td>
                                        </tr>
                                        <tr className="border-b border-gray-200">
                                            <td className="p-3 font-medium">Offline Mode</td>
                                            <td className="p-3 text-center">✓</td>
                                            <td className="p-3 text-center">✓</td>
                                            <td className="p-3 text-center">Limited</td>
                                            <td className="p-3 text-center">Limited</td>
                                        </tr>
                                        <tr className="border-b border-gray-200">
                                            <td className="p-3 font-medium">Custom Modifier Groups</td>
                                            <td className="p-3 text-center">Unlimited</td>
                                            <td className="p-3 text-center">Limited</td>
                                            <td className="p-3 text-center">Limited</td>
                                            <td className="p-3 text-center">Limited</td>
                                        </tr>
                                        <tr className="border-b border-gray-200">
                                            <td className="p-3 font-medium">Split Checks</td>
                                            <td className="p-3 text-center">Unlimited</td>
                                            <td className="p-3 text-center">✓</td>
                                            <td className="p-3 text-center">Limited</td>
                                            <td className="p-3 text-center">✓</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-medium">Hardware Flexibility</td>
                                            <td className="p-3 text-center">High</td>
                                            <td className="p-3 text-center">Low</td>
                                            <td className="p-3 text-center">Medium</td>
                                            <td className="p-3 text-center">Medium</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Inventory Management */}
                    <div className="bg-white p-8 rounded-lg shadow-md mb-12">
                        <div className="flex items-center mb-6">
                            <div className="bg-primary/10 p-3 rounded-full mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-primary">Inventory Management</h3>
                        </div>

                        <p className="text-charcoal mb-6">
                            Our advanced inventory management system helps you track stock levels, reduce waste, and optimize purchasing
                            decisions based on actual usage and forecasted demand.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-bold mb-2">Real-Time Tracking</h4>
                                <p className="text-sm">Monitor inventory levels in real time across all locations</p>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-bold mb-2">Automated Purchasing</h4>
                                <p className="text-sm">Set par levels and generate purchase orders automatically</p>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-bold mb-2">Vendor Management</h4>
                                <p className="text-sm">Manage vendor relationships, pricing, and order history</p>
                            </div>
                        </div>

                        <div className="bg-beige p-6 rounded-lg">
                            <h4 className="text-xl font-bold mb-4">Inventory Management Comparison</h4>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="p-3 text-left">Feature</th>
                                            <th className="p-3 text-center">Snytra</th>
                                            <th className="p-3 text-center">MarketMan</th>
                                            <th className="p-3 text-center">Restaurant365</th>
                                            <th className="p-3 text-center">Foodics</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-gray-200">
                                            <td className="p-3 font-medium">Recipe Management</td>
                                            <td className="p-3 text-center">Advanced</td>
                                            <td className="p-3 text-center">Basic</td>
                                            <td className="p-3 text-center">Advanced</td>
                                            <td className="p-3 text-center">Basic</td>
                                        </tr>
                                        <tr className="border-b border-gray-200">
                                            <td className="p-3 font-medium">Automated Ordering</td>
                                            <td className="p-3 text-center">✓</td>
                                            <td className="p-3 text-center">✓</td>
                                            <td className="p-3 text-center">Limited</td>
                                            <td className="p-3 text-center">✓</td>
                                        </tr>
                                        <tr className="border-b border-gray-200">
                                            <td className="p-3 font-medium">Waste Tracking</td>
                                            <td className="p-3 text-center">Advanced</td>
                                            <td className="p-3 text-center">Basic</td>
                                            <td className="p-3 text-center">Basic</td>
                                            <td className="p-3 text-center">Basic</td>
                                        </tr>
                                        <tr className="border-b border-gray-200">
                                            <td className="p-3 font-medium">Variance Analysis</td>
                                            <td className="p-3 text-center">✓</td>
                                            <td className="p-3 text-center">Limited</td>
                                            <td className="p-3 text-center">✓</td>
                                            <td className="p-3 text-center">Limited</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-medium">Vendor Management</td>
                                            <td className="p-3 text-center">Advanced</td>
                                            <td className="p-3 text-center">Advanced</td>
                                            <td className="p-3 text-center">Advanced</td>
                                            <td className="p-3 text-center">Basic</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Table Management */}
                    <div className="bg-white p-8 rounded-lg shadow-md">
                        <div className="flex items-center mb-6">
                            <div className="bg-primary/10 p-3 rounded-full mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-primary">Table Management</h3>
                        </div>

                        <p className="text-charcoal mb-6">
                            Our table management system helps you optimize seating, reduce wait times, and improve the overall
                            dining experience for your customers.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-bold mb-2">Custom Floor Plans</h4>
                                <p className="text-sm">Create and manage digital floor plans that match your restaurant layout</p>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-bold mb-2">Reservation Management</h4>
                                <p className="text-sm">Handle reservations, waitlists, and walk-ins from a single interface</p>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-4">
                                <h4 className="font-bold mb-2">Table Status Tracking</h4>
                                <p className="text-sm">Monitor table status and turnover times in real-time</p>
                            </div>
                        </div>

                        <div className="bg-beige p-6 rounded-lg">
                            <h4 className="text-xl font-bold mb-4">Table Management Comparison</h4>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="p-3 text-left">Feature</th>
                                            <th className="p-3 text-center">Snytra</th>
                                            <th className="p-3 text-center">OpenTable</th>
                                            <th className="p-3 text-center">Resy</th>
                                            <th className="p-3 text-center">SevenRooms</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-gray-200">
                                            <td className="p-3 font-medium">Floor Plan Customization</td>
                                            <td className="p-3 text-center">High</td>
                                            <td className="p-3 text-center">Medium</td>
                                            <td className="p-3 text-center">Medium</td>
                                            <td className="p-3 text-center">High</td>
                                        </tr>
                                        <tr className="border-b border-gray-200">
                                            <td className="p-3 font-medium">Waitlist Management</td>
                                            <td className="p-3 text-center">Advanced</td>
                                            <td className="p-3 text-center">Basic</td>
                                            <td className="p-3 text-center">Advanced</td>
                                            <td className="p-3 text-center">Advanced</td>
                                        </tr>
                                        <tr className="border-b border-gray-200">
                                            <td className="p-3 font-medium">Guest Communication</td>
                                            <td className="p-3 text-center">SMS + Email</td>
                                            <td className="p-3 text-center">In-App</td>
                                            <td className="p-3 text-center">SMS + App</td>
                                            <td className="p-3 text-center">SMS + Email</td>
                                        </tr>
                                        <tr className="border-b border-gray-200">
                                            <td className="p-3 font-medium">POS Integration</td>
                                            <td className="p-3 text-center">Native</td>
                                            <td className="p-3 text-center">3rd Party</td>
                                            <td className="p-3 text-center">3rd Party</td>
                                            <td className="p-3 text-center">3rd Party</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-medium">Guest Profiles</td>
                                            <td className="p-3 text-center">✓</td>
                                            <td className="p-3 text-center">Limited</td>
                                            <td className="p-3 text-center">✓</td>
                                            <td className="p-3 text-center">✓</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Enterprise Features Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-primary text-center mb-4">Enterprise-Grade Features</h2>
                    <p className="text-center text-charcoal max-w-3xl mx-auto mb-12">
                        Our platform includes advanced capabilities designed specifically for multi-location restaurants and growing chains.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="bg-beige p-6 rounded-lg shadow-md">
                            <div className="mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-primary mb-2">Multi-Location Management</h3>
                            <p className="text-charcoal">
                                Centralized control over multiple locations with location-specific customizations and permissions.
                            </p>
                            <ul className="mt-4 text-sm space-y-2">
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Cross-location inventory transfer
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Regional menu variations
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Consolidated reporting
                                </li>
                            </ul>
                        </div>

                        <div className="bg-beige p-6 rounded-lg shadow-md">
                            <div className="mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-primary mb-2">Advanced Analytics</h3>
                            <p className="text-charcoal">
                                In-depth business intelligence tools for data-driven decision making at scale.
                            </p>
                            <ul className="mt-4 text-sm space-y-2">
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Custom report builder
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Predictive analytics
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Automated business insights
                                </li>
                            </ul>
                        </div>

                        <div className="bg-beige p-6 rounded-lg shadow-md">
                            <div className="mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-primary mb-2">Enterprise Security</h3>
                            <p className="text-charcoal">
                                Bank-level security protocols to protect your business and customer data.
                            </p>
                            <ul className="mt-4 text-sm space-y-2">
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Role-based access control
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    End-to-end encryption
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    PCI DSS compliance
                                </li>
                            </ul>
                        </div>

                        <div className="bg-beige p-6 rounded-lg shadow-md">
                            <div className="mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-primary mb-2">API Access & Integration</h3>
                            <p className="text-charcoal">
                                Open API framework for seamless integration with your existing technology stack.
                            </p>
                            <ul className="mt-4 text-sm space-y-2">
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    RESTful API
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Webhook support
                                </li>
                                <li className="flex items-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Custom integration services
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-16">
                        <h3 className="text-2xl font-bold text-primary text-center mb-8">Enterprise Plan Feature Comparison</h3>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm bg-white rounded-lg shadow-md">
                                <thead>
                                    <tr className="bg-primary text-white">
                                        <th className="p-4 text-left">Feature</th>
                                        <th className="p-4 text-center">Snytra</th>
                                        <th className="p-4 text-center">Toast</th>
                                        <th className="p-4 text-center">Oracle MICROS</th>
                                        <th className="p-4 text-center">NCR Aloha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-200">
                                        <td className="p-4 font-medium">Centralized Menu Management</td>
                                        <td className="p-4 text-center text-green-600 font-bold">Advanced</td>
                                        <td className="p-4 text-center">Basic</td>
                                        <td className="p-4 text-center">Advanced</td>
                                        <td className="p-4 text-center">Basic</td>
                                    </tr>
                                    <tr className="border-b border-gray-200 bg-gray-50">
                                        <td className="p-4 font-medium">Multi-Location Analytics</td>
                                        <td className="p-4 text-center text-green-600 font-bold">Real-time</td>
                                        <td className="p-4 text-center">Daily</td>
                                        <td className="p-4 text-center">Daily</td>
                                        <td className="p-4 text-center">Daily</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="p-4 font-medium">Franchisee Portal</td>
                                        <td className="p-4 text-center text-green-600 font-bold">✓</td>
                                        <td className="p-4 text-center">Limited</td>
                                        <td className="p-4 text-center">✓</td>
                                        <td className="p-4 text-center">×</td>
                                    </tr>
                                    <tr className="border-b border-gray-200 bg-gray-50">
                                        <td className="p-4 font-medium">Enterprise API Access</td>
                                        <td className="p-4 text-center text-green-600 font-bold">Unlimited</td>
                                        <td className="p-4 text-center">Limited</td>
                                        <td className="p-4 text-center">Limited</td>
                                        <td className="p-4 text-center">Limited</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="p-4 font-medium">Dedicated Account Manager</td>
                                        <td className="p-4 text-center text-green-600 font-bold">✓</td>
                                        <td className="p-4 text-center">Premium Only</td>
                                        <td className="p-4 text-center">Premium Only</td>
                                        <td className="p-4 text-center">Premium Only</td>
                                    </tr>
                                    <tr className="bg-gray-50">
                                        <td className="p-4 font-medium">Custom Development</td>
                                        <td className="p-4 text-center text-green-600 font-bold">Included</td>
                                        <td className="p-4 text-center">Additional Cost</td>
                                        <td className="p-4 text-center">Additional Cost</td>
                                        <td className="p-4 text-center">Additional Cost</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-20 bg-primary">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Restaurant Operations?</h2>
                    <p className="text-white/90 max-w-2xl mx-auto mb-8">
                        Join thousands of restaurants worldwide that have improved efficiency, increased revenue, and enhanced customer satisfaction with Snytra.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href="/request-demo" className="py-3 px-6 bg-white text-primary rounded-lg font-medium hover:bg-gray-100 transition-colors">
                            Schedule a Demo
                        </a>
                        <a href="/contact-us" className="py-3 px-6 bg-transparent border-2 border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors">
                            Contact Us
                        </a>
                    </div>
                </div>
            </section>
        </>
    );
} 