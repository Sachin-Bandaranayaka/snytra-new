"use client";

import * as React from "react";

// Define interfaces
interface Toast {
    id: string;
    title?: string;
    description?: string;
    variant?: "default" | "destructive";
}

interface ToastAction {
    id: string;
    title?: string;
    description: string;
    variant?: "default" | "destructive";
}

interface ToastActionElement {
    altText: string;
    onClick: () => void;
    content: React.ReactNode;
}

type ToastProps = ToastAction & {
    action?: ToastActionElement;
};

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 5000;

// Create a context
type ToasterToast = Toast & {
    id: string;
    title?: string;
    description?: string;
    variant?: "default" | "destructive";
};

const ToastContext = React.createContext<{
    toasts: ToasterToast[];
    toast: (props: ToastProps) => void;
    dismiss: (toastId: string) => void;
}>({
    toasts: [],
    toast: () => { },
    dismiss: () => { },
});

export function useToast() {
    const [toasts, setToasts] = React.useState<ToasterToast[]>([]);

    const toast = React.useCallback(
        ({ title, description, variant = "default" }: ToastProps) => {
            const id = Math.random().toString(36).substring(2, 9);
            const newToast = {
                id,
                title,
                description,
                variant,
            };

            setToasts((prevToasts) => {
                const nextToasts = [...prevToasts, newToast].slice(
                    -TOAST_LIMIT
                );

                return nextToasts;
            });

            setTimeout(() => {
                setToasts((prevToasts) =>
                    prevToasts.filter((toast) => toast.id !== id)
                );
            }, TOAST_REMOVE_DELAY);

            return id;
        },
        []
    );

    const dismiss = React.useCallback((toastId: string) => {
        setToasts((prevToasts) =>
            prevToasts.filter((toast) => toast.id !== toastId)
        );
    }, []);

    return {
        toast,
        dismiss,
        toasts,
    };
} 