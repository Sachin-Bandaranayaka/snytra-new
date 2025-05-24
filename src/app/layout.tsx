import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import AppWrapper from "@/components/AppWrapper";
import RootLayoutClient from "./RootLayoutClient";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} min-h-screen flex flex-col antialiased font-sans`}
      >
        <AppWrapper>
          <RootLayoutClient>
            {children}
          </RootLayoutClient>
        </AppWrapper>
      </body>
    </html>
  );
}
