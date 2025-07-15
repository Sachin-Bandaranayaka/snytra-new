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
  // Fetch site name from database
  const result = await sql`SELECT value FROM settings WHERE key = 'general'`;
  const siteName = result[0]?.value?.siteName || "Snytra"; // Fallback to default

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} min-h-screen flex flex-col antialiased font-sans`}
      >
        <AppWrapper>
          <RootLayoutClient siteName={siteName}>
            {children}
          </RootLayoutClient>
        </AppWrapper>
      </body>
    </html>
  );
}
