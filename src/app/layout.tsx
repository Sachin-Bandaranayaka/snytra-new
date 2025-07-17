import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import AppWrapper from "@/components/AppWrapper";
import RootLayoutClient from "./RootLayoutClient";
import { sql } from "@/db/postgres"; // Assuming this is used for site settings
import { executeQuery } from '@/lib/db'; // Import database helper for pages content

// Define the structure of the Contact Us JSON data
// This interface should ideally be in a shared types file (e.g., src/types/index.ts)
// if it's used across multiple files.
interface ContactUsData {
    title: string;
    description: string;
    contactInfo: {
        phone: string;
        email: string;
        address?: string;
    };
}

/**
 * Fetches the page data from the database.
 * This function is crucial for getting dynamic content like contact info.
 * @param slug The URL slug of the page to fetch.
 * @returns The page's JSON content or null if not found.
 */
async function getPageData(slug: string): Promise<ContactUsData | null> {
    const query = 'SELECT content FROM pages WHERE slug = $1 AND status = $2 LIMIT 1';

    try {
        // The content from DB will be in the format { "ContactUs": { ... } }
        const result = await executeQuery<{ content: { ContactUs: ContactUsData } }[]>(query, [slug, 'published']); //

        if (result && result.length > 0 && result[0].content && result[0].content.ContactUs) {
            return result[0].content.ContactUs; //
        }
    } catch (error) {
        console.error(`Failed to fetch page data for slug "${slug}":`, error);
    }

    return null;
}

// Use Inter as a fallback font instead of Geist to avoid font loading issues
const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-sans",
});

export const metadata: Metadata = {
    title: "Your Restaurant Management System",
    description: "A comprehensive restaurant management solution",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Fetch site name and logo from database
    const generalResult = await sql`SELECT value FROM settings WHERE key = 'general'`;
    const appearanceResult = await sql`SELECT value FROM settings WHERE key = 'appearance'`;
    const siteName = generalResult[0]?.value?.siteName || "Snytra";
    const logoUrl = appearanceResult[0]?.value?.logo || "/images/logo.png";

    // Fetch contact page data for footer
    const contactPageContent = await getPageData('contact');
    const contactInfo = contactPageContent?.contactInfo; // Safely extract contact info

    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${inter.variable} min-h-screen flex flex-col antialiased font-sans`}
            >
                <AppWrapper>
                    {/* Pass siteName, logoUrl, and contactInfo to RootLayoutClient */}
                    <RootLayoutClient siteName={siteName} logoUrl={logoUrl} contactInfo={contactInfo}>
                        {children}
                    </RootLayoutClient>
                </AppWrapper>
            </body>
        </html>
    );
}