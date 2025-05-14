import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Products | Snytra",
    description: "Discover our suite of business management solutions to streamline your operations and improve customer experience.",
    keywords: "business management, online ordering, business products, business technology",
};

export default function ProductsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="min-h-screen flex flex-col">
            {children}
        </main>
    );
} 