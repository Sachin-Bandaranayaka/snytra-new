import { ReactNode } from "react";

export default function WhatWeOfferLayout({ children }: { children: ReactNode }) {
    return (
        <div className="bg-beige min-h-screen">
            {children}
        </div>
    );
} 