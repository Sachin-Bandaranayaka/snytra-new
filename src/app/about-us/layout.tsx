import { ReactNode } from "react";

export default function AboutUsLayout({ children }: { children: ReactNode }) {
    return (
        <div className="bg-beige min-h-screen">
            {children}
        </div>
    );
} 