import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import AppWrapper from "@/components/AppWrapper";
import RootLayoutClient from "./RootLayoutClient";
import { sql } from "@/db/postgres";

// Use Inter as a fallback font instead of Geist to avoid font loading issues
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export async function generateMetadata(): Promise<Metadata> {
  const seoResult = await sql`SELECT value FROM settings WHERE key = 'seo'`;
  const seo = seoResult[0]?.value || {};

  return {
    title: seo.siteTitle || "Your Restaurant Management System",
    description: seo.metaDescription || "A comprehensive restaurant management solution",
    keywords: seo.keywords,
    openGraph: {
      images: seo.ogImage ? [seo.ogImage] : [],
    },
  };
}

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
  // Fetch site name from database
  const generalResult = await sql`SELECT value FROM settings WHERE key = 'general'`;
  const appearanceResult = await sql`SELECT value FROM settings WHERE key = 'appearance'`;
  const siteName = generalResult[0]?.value?.siteName || "Snytra";
  const logoUrl = appearanceResult[0]?.value?.logo || "/images/logo.png";

  // Then pass to RootLayoutClient:
  <RootLayoutClient siteName={siteName} logoUrl={logoUrl}>
    {children}
  </RootLayoutClient>

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} min-h-screen flex flex-col antialiased font-sans`}
      >
        <AppWrapper>
          <RootLayoutClient siteName={siteName} logoUrl={logoUrl}>
            {children}
          </RootLayoutClient>
        </AppWrapper>
      </body>
    </html>
  );
}
