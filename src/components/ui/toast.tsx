import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    return <div className="fixed inset-0 z-[100] flex flex-col items-end gap-2 p-4 sm:top-auto">{children}</div>;
};

const toastVariants = cva(
    "group pointer-events-auto relative flex w-full items-center justify-between gap-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
    {
        variants: {
            variant: {
                default: "bg-white text-charcoal border-lightGray",
                destructive: "border-primary bg-primary text-white",
                success: "border-olive bg-olive text-white",
                warning: "border-yellow bg-yellow text-charcoal",
                info: "border-skyBlue bg-skyBlue text-white",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface ToastProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
    onClose?: () => void;
}

function Toast({
    className,
    variant,
    onClose,
    ...props
}: ToastProps) {
    return (
        <div
            className={cn(toastVariants({ variant }), className)}
            {...props}
        >
            <div className="flex-1">{props.children}</div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/20 p-1 text-inherit hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
            )}
        </div>
    );
}

export function useToast() {
    const [toasts, setToasts] = React.useState<Array<{ id: string; message: string; title?: string; variant?: "default" | "destructive" | "success" | "warning" | "info" }>>([]);

    const toast = React.useCallback(
        ({ title, message, variant = "default" }: { title?: string; message: string; variant?: "default" | "destructive" | "success" | "warning" | "info" }) => {
            const id = Math.random().toString(36).substring(2, 9);
            setToasts((prev) => [...prev, { id, title, message, variant }]);

            // Auto-dismiss after 5 seconds
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 5000);

            return id;
        },
        []
    );

    const dismiss = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const Toaster = React.useCallback(() => {
        return (
            <ToastProvider>
                {toasts.map((t) => (
                    <Toast key={t.id} variant={t.variant} onClose={() => dismiss(t.id)}>
                        {t.title && <div className="font-semibold">{t.title}</div>}
                        <div>{t.message}</div>
                    </Toast>
                ))}
            </ToastProvider>
        );
    }, [toasts, dismiss]);

    return { toast, dismiss, Toaster };
}

export { Toast, ToastProvider }; 