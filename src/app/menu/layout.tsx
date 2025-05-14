"use client";

import { AuthProvider } from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import CartProvider from "@/components/providers/CartProvider";
import RestaurantProvider from "@/components/providers/RestaurantProvider";

export default function MenuLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <RestaurantProvider>
            <CartProvider>
                {children}
            </CartProvider>
        </RestaurantProvider>
    );
} 