import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const alertVariants = cva(
    "relative w-full rounded-lg border p-4",
    {
        variants: {
            variant: {
                default: "bg-white text-charcoal border-lightGray",
                destructive: "border-primary/50 text-primary bg-beige",
                success: "border-olive/50 text-olive bg-beige",
                warning: "border-yellow/50 text-darkGray bg-yellow/20",
                info: "border-skyBlue/50 text-skyBlue bg-skyBlue/10",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
    title?: string;
    icon?: React.ReactNode;
    onClose?: () => void;
}

export function Alert({ className, variant, title, children, icon, onClose, ...props }: AlertProps) {
    const Icon = () => {
        if (icon) return <>{icon}</>;

        switch (variant) {
            case 'destructive':
                return <XCircle className="h-5 w-5" />;
            case 'success':
                return <CheckCircle className="h-5 w-5" />;
            case 'warning':
                return <AlertCircle className="h-5 w-5" />;
            case 'info':
                return <Info className="h-5 w-5" />;
            default:
                return <Info className="h-5 w-5" />;
        }
    };

    return (
        <div
            className={cn(alertVariants({ variant }), className)}
            role="alert"
            {...props}
        >
            <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                    <Icon />
                </div>
                <div className="flex-1">
                    {title && <h3 className="text-sm font-medium">{title}</h3>}
                    {children && <div className="text-sm mt-1">{children}</div>}
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 focus:outline-none"
                        aria-label="Close"
                    >
                        <span className="sr-only">Close</span>
                        <XCircle className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
}

export interface FormErrorProps {
    message?: string;
    errors?: string[] | null;
    onClose?: () => void;
}

export function FormError({ message, errors, onClose }: FormErrorProps) {
    if (!message && (!errors || errors.length === 0)) return null;

    return (
        <Alert variant="destructive" title={message || "Error"} onClose={onClose}>
            {errors && errors.length > 0 && (
                <ul className="mt-2 text-sm list-disc list-inside">
                    {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                    ))}
                </ul>
            )}
        </Alert>
    );
}

export function FormSuccess({ message, onClose }: { message?: string; onClose?: () => void }) {
    if (!message) return null;

    return (
        <Alert variant="success" title="Success" onClose={onClose}>
            {message}
        </Alert>
    );
} 