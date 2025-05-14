import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-primary",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-white hover:bg-primary/90",
                destructive:
                    "bg-charcoal text-white hover:bg-charcoal/90",
                outline:
                    "border border-lightGray bg-white hover:bg-beige hover:text-charcoal",
                secondary:
                    "bg-olive text-white hover:bg-olive/90",
                accent:
                    "bg-yellow text-charcoal hover:bg-yellow/90",
                ghost: "hover:bg-beige hover:text-charcoal",
                link: "text-skyBlue underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        if (asChild && React.isValidElement(props.children)) {
            // Extract the child element
            const child = React.Children.only(props.children);

            // Clone the child with the button's props
            return React.cloneElement(child, {
                className: cn(buttonVariants({ variant, size, className })),
                ref,
                ...child.props,
            });
        }

        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants }; 