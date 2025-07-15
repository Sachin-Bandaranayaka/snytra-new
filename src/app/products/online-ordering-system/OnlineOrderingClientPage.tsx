// src/app/products/online-ordering-system/OnlineOrderingClientPage.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
// ... all other original imports
import { useEffect, useState } from "react";
// ...

// Define the structure of the props it will receive
interface PageContent {
    title: string;
    description: string;
    links: Array<{ text: string; href: string; attributes: { class: string; } }>;
    features: {
        title: string;
        items: Array<{ title: string; description: string; }>;
    };
}

export default function OnlineOrderingClientPage({ pageContent }: { pageContent: PageContent }) {
    // All of the original useState, useEffect, and handler functions go here
    // const router = useRouter();
    // const [plans, setPlans] = useState...
    // etc.
    
    return (
        <>
            {/* The SEO component is handled by the parent */}
            
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
                                {pageContent.links.map(link => (
                                    <Link key={link.href} href={link.href} className={link.attributes.class}>
                                        {link.text}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="md:w-1/2">
                            {/* ... Image component ... */}
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section - remains static */}
            {/* ... */}
            
            {/* Features Section */}
            <section className="py-20 bg-beige/50">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-primary text-center mb-12">
                        {pageContent.features.title} {/* DYNAMIC */}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {pageContent.features.items.map(item => (
                            <div key={item.title} className="bg-white p-8 rounded-lg shadow-md ...">
                                {/* ... SVG Icon ... */}
                                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                                <p className="text-charcoal">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing, Testimonial, and CTA sections remain unchanged and use their own logic */}
            {/* ... */}
        </>
    );
}