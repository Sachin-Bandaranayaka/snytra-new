"use client";

import React from "react";
import { useToast } from "@/components/ui/use-toast";
import { Toast } from "@/components/ui/toast";

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const { toasts, dismiss } = useToast();

    return (
        <>
            {children}
            <div className="fixed inset-0 z-[100] flex flex-col items-end gap-2 p-4 sm:top-auto">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        variant={toast.variant}
                        onClose={() => dismiss(toast.id)}
                    >
                        {toast.title && <div className="font-semibold">{toast.title}</div>}
                        {toast.description && <div>{toast.description}</div>}
                    </Toast>
                ))}
            </div>
        </>
    );
} 