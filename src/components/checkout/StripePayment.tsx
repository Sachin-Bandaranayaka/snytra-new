"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
    AddressElement
} from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { CreditCard, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";

// Load Stripe outside of component to avoid recreating on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

interface StripePaymentProps {
    orderId: string;
    totalAmount: number;
    cart: any;
    customerInfo: {
        name: string;
        email: string;
        phone: string;
    };
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

// Wrapper component that loads Stripe
export default function StripePaymentWrapper({
    orderId,
    totalAmount,
    cart,
    customerInfo,
    onSuccess,
    onError
}: StripePaymentProps) {
    const [clientSecret, setClientSecret] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Create payment intent as soon as the component loads
        const createPaymentIntent = async () => {
            try {
                setLoading(true);
                console.log("Creating payment intent for order", orderId, "with amount", totalAmount);

                const response = await fetch("/api/payment/create-intent", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        cart,
                        customerEmail: customerInfo.email,
                        customerName: customerInfo.name,
                        totalAmount,
                        metadata: {
                            orderId,
                        },
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Error response from create-intent:", errorData);
                    throw new Error(errorData.message || "Failed to create payment intent");
                }

                const data = await response.json();
                console.log("Payment intent created successfully with client secret");
                setClientSecret(data.clientSecret);
            } catch (err: any) {
                console.error("Error creating payment intent:", err);
                setError(err.message || "An error occurred while setting up payment");
                if (onError) onError(err.message || "Payment setup failed");
            } finally {
                setLoading(false);
            }
        };

        if (orderId && totalAmount > 0) {
            createPaymentIntent();
        } else {
            console.error("Missing orderId or totalAmount", { orderId, totalAmount });
            setError("Invalid order information");
            setLoading(false);
        }
    }, [orderId, totalAmount, cart, customerInfo, onError]);

    const appearance = {
        theme: 'stripe',
        variables: {
            colorPrimary: '#e75627',
            colorBackground: '#ffffff',
            colorText: '#1a1a1a',
            colorDanger: '#ff4444',
            fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
        },
    };

    const options = {
        clientSecret,
        appearance,
    };

    if (loading) {
        return (
            <div className="my-8 p-6 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-[#e75627] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[#e75627]">Setting up secure payment...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-8 p-6 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-start space-x-3">
                    <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-medium text-red-800">Payment Error</h3>
                        <p className="text-red-700 mt-1">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="my-8">
            {clientSecret && (
                <Elements options={options} stripe={stripePromise}>
                    <StripePaymentForm
                        orderId={orderId}
                        onSuccess={onSuccess}
                        onError={onError}
                    />
                </Elements>
            )}
        </div>
    );
}

// Actual payment form that gets wrapped by Elements
function StripePaymentForm({
    orderId,
    onSuccess,
    onError
}: {
    orderId: string;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}) {
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();

    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            console.error("Stripe or elements not loaded");
            return;
        }

        setIsProcessing(true);
        setMessage(null);

        try {
            console.log("Confirming payment for order", orderId);

            // Confirm payment
            const result = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/order-confirmation/${orderId}`,
                },
                redirect: 'if_required',
            });

            console.log("Payment confirmation result:", result);

            if (result.error) {
                console.error("Payment error:", result.error);
                setMessage(result.error.message || "An error occurred while processing your payment");
                if (onError) onError(result.error.message || "Payment failed");
            } else if (result.paymentIntent?.status === 'succeeded') {
                setIsSuccess(true);
                setMessage("Payment successful! Redirecting...");

                // Notify the API that payment was successful
                await fetch(`/api/payment/verify-payment`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        paymentIntentId: result.paymentIntent.id,
                        orderId
                    }),
                });

                // Redirect to confirmation page
                if (onSuccess) onSuccess();
                setTimeout(() => {
                    router.push(`/order-confirmation/${orderId}`);
                }, 1500);
            } else {
                // Handle other statuses or redirect for 3D Secure
                setMessage("Verifying your payment...");
            }
        } catch (err: any) {
            console.error("Payment error:", err);
            setMessage(err.message || "An unexpected error occurred");
            if (onError) onError(err.message || "Payment processing failed");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 border rounded-lg bg-white shadow-sm">
            <h3 className="text-xl font-semibold mb-6 flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Secure Payment
            </h3>

            <div className="mb-6">
                <PaymentElement />
            </div>

            <div className="mb-6">
                <h4 className="text-sm font-medium mb-2 text-gray-700">Billing Address</h4>
                <AddressElement options={{ mode: 'billing' }} />
            </div>

            {message && (
                <div className={`p-4 mb-6 rounded-md ${isSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    <div className="flex items-center">
                        {isSuccess ? (
                            <CheckCircle className="h-5 w-5 mr-2" />
                        ) : (
                            <AlertCircle className="h-5 w-5 mr-2" />
                        )}
                        <p>{message}</p>
                    </div>
                </div>
            )}

            <button
                disabled={isProcessing || !stripe || !elements || isSuccess}
                className={`w-full flex items-center justify-center px-6 py-3 rounded-md text-white font-medium 
          ${isProcessing || !stripe || !elements || isSuccess
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#e75627] hover:bg-[#d24a1f]'}`}
            >
                {isProcessing ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                        Processing...
                    </>
                ) : (
                    <>
                        Pay Now <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                )}
            </button>

            <div className="mt-4 text-center text-sm text-gray-500">
                <p>Your payment is secured with bank-level encryption</p>
            </div>
        </form>
    );
} 