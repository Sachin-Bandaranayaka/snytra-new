// src/app/about-us/page.tsx

import Link from "next/link";
import { Metadata } from "next";
import { notFound } from 'next/navigation';
import { executeQuery } from '@/lib/db'; // Make sure this path is correct

// 1. Updated TypeScript interfaces to match your new nested JSON structure
interface Principle {
    title: string;
    description: string;
}

interface Feature {
    title: string;
    description: string;
    svgPathD?: string; // Changed from 'svgCode' to 'svgPathD'
}

interface CallToAction {
    title: string;
    description: string;
    link: {
        text: string;
        href: string;
        attributes: {
            target: string;
            rel: string;
            class: string;
        };
    };
}

interface AboutUsData {
    title: string;
    description: string;
    vision: {
        title: string;
        description: string;
        principles: Principle[];
    };
    mission: {
        title: string;
        description: string;
    };
    whyChooseUs: {
        title: string;
        description?: string; // Added optional description to whyChooseUs
        features: Feature[];
    };
    callToAction: CallToAction;
}

/**
 * Fetches the page data from the database and extracts the "AboutUs" object.
 * @param slug The URL slug of the page to fetch.
 * @returns The AboutUs data object or null if not found.
 */
async function getPageData(slug: string): Promise<AboutUsData | null> {
    const query = 'SELECT content FROM pages WHERE slug = $1 AND status = $2 LIMIT 1';
    
    try {
        // The content from DB will be in the format { "AboutUs": { ... } }
        const result = await executeQuery<{ content: { AboutUs: AboutUsData } }[]>(query, [slug, 'published']);
        
        if (result && result.length > 0 && result[0].content && result[0].content.AboutUs) {
            return result[0].content.AboutUs;
        }
    } catch (error) {
        console.error(`Failed to fetch page data for slug "${slug}":`, error);
    }
    
    return null;
}


// Your existing static metadata can be updated dynamically if needed
export const metadata: Metadata = {
    title: "About Us | Snytra",
    description: "Learn about Snytra - we are committed to helping restaurants operate smarter, faster, and better with our integrated management tools.",
};

// The page component fetches and renders the complex JSON data
export default async function AboutUs() {
    const pageContent = await getPageData('about-us');

    if (!pageContent) {
        notFound();
    }
    
    return (
        <>
            {/* Hero Section */}
            <section className="bg-beige py-16">
                <div className="container mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-bold text-primary text-center mb-4">
                        {pageContent.title}
                    </h1>
                    <p className="text-lg text-center text-charcoal max-w-3xl mx-auto mb-8">
                        {pageContent.description}
                    </p>
                </div>
            </section>

            {/* Vision and Mission Section */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-primary text-center mb-12">
                        {pageContent.vision.title}
                    </h2>
                    <p className="text-lg text-center text-charcoal max-w-3xl mx-auto mb-8">
                        {pageContent.vision.description}
                    </p>

                    {/* Render Vision Principles from the array */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                       {pageContent.vision.principles.map((principle) => (
                           <div key={principle.title} className="bg-white p-8 rounded-lg shadow-md">
                               <h3 className="text-xl font-bold text-primary mb-2">{principle.title}</h3>
                               <p className="text-charcoal">{principle.description}</p>
                           </div>
                       ))}
                    </div>

                    <h2 className="text-3xl font-bold text-primary text-center mb-12">
                        {pageContent.mission.title}
                    </h2>
                    <p className="text-lg text-center text-charcoal max-w-3xl mx-auto">
                        {pageContent.mission.description}
                    </p>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="py-16 bg-light">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-primary text-center mb-12">
                        {pageContent.whyChooseUs.title}
                    </h2>
                    {/* Optional description for Why Choose Us section */}
                    {pageContent.whyChooseUs.description && (
                        <p className="text-lg text-center text-charcoal max-w-3xl mx-auto mb-8">
                            {pageContent.whyChooseUs.description}
                        </p>
                    )}

                    {/* Render Features from the array */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {pageContent.whyChooseUs.features.map((feature) => {
                            // --- DEBUGGING LOG ---
                            // Log the feature title and its svgPathD value
                            console.log(`Feature: ${feature.title}, svgPathD:`, feature.svgPathD);
                            // --- END DEBUGGING LOG ---

                            // Check if svgPathD is a non-empty string to avoid rendering issues
                            const isValidSvgPath = typeof feature.svgPathD === 'string' && feature.svgPathD.trim() !== '';

                            return (
                                <div key={feature.title} className="text-center">
                                    <div className="bg-primary w-20 h-20 rounded flex items-center justify-center mx-auto mb-4">
                                        {/* Render the dynamic SVG using a fixed structure and dynamic path data */}
                                        {isValidSvgPath ? (
                                            <svg 
                                                xmlns="http://www.w3.org/2000/svg" 
                                                className="h-10 w-10 text-white" 
                                                fill="none" 
                                                viewBox="0 0 24 24" 
                                                stroke="currentColor"
                                                // The strokeWidth, strokeLinecap, strokeLinejoin are hardcoded as requested
                                            >
                                                <path 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round" 
                                                    strokeWidth={2} 
                                                    d={feature.svgPathD} // Dynamic path data
                                                />
                                            </svg>
                                        ) : (
                                            // Fallback SVG if no valid path data is provided
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                    <p className="text-charcoal">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    <div className="bg-primary rounded-lg p-8 md:p-12 text-center">
                        <h2 className="text-3xl font-bold text-white mb-6">
                            {pageContent.callToAction.title}
                        </h2>
                        <p className="text-white text-lg mb-8 max-w-2xl mx-auto">
                            {pageContent.callToAction.description}
                        </p>
                        <div className="flex justify-center">
                            {/* Render the link dynamically */}
                            <a
                                href={pageContent.callToAction.link.href}
                                className={pageContent.callToAction.link.attributes.class}
                                target={pageContent.callToAction.link.attributes.target}
                                rel={pageContent.callToAction.link.attributes.rel}
                            >
                                {pageContent.callToAction.link.text}
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
