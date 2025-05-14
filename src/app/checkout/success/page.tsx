'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function CheckoutSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [orderDetails, setOrderDetails] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!sessionId) {
                setError("No session ID found");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/get-order?session_id=${sessionId}`);

                if (!response.ok) {
                    throw new Error(`Error fetching order: ${response.statusText}`);
                }

                const data = await response.json();
                setOrderDetails(data);

                // Send order confirmation email
                await fetch('/api/send-order-confirmation', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ orderDetails: data }),
                });

                setLoading(false);
            } catch (err) {
                console.error("Error fetching order details:", err);
                setError("Failed to load order details");
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [sessionId]);

    // Redirects to home if directly accessed without a session ID
    useEffect(() => {
        if (!sessionId && !loading) {
            const timer = setTimeout(() => {
                router.push('/');
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [sessionId, loading, router]);

    if (loading) {
        return (
            <div className="container max-w-2xl mx-auto py-16 px-4">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="space-y-2 pt-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !sessionId) {
        return (
            <div className="container max-w-2xl mx-auto py-16 px-4">
                <Card className="text-center">
                    <CardHeader>
                        <CardTitle className="text-2xl">Order Information Unavailable</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">{error || 'No order information found. You will be redirected to the home page.'}</p>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Button asChild>
                            <Link href="/">Return to Home Page</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="container max-w-2xl mx-auto py-16 px-4">
            <Card>
                <CardHeader className="text-center border-b pb-6">
                    <div className="flex justify-center mb-4">
                        <CheckCircle2 className="h-16 w-16 text-green-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Order Confirmed!</CardTitle>
                    <p className="text-gray-500 mt-2">Thank you for your order. We&apos;ve sent a confirmation email to your inbox.</p>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    {orderDetails && (
                        <>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Order Information</h3>
                                <p className="text-sm text-gray-600">Order ID: {orderDetails.id}</p>
                                <p className="text-sm text-gray-600">Date: {new Date(orderDetails.created_at).toLocaleString()}</p>
                                <p className="text-sm text-gray-600">Email: {orderDetails.user_email}</p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">Order Summary</h3>
                                <div className="space-y-2">
                                    {orderDetails.items && Array.isArray(orderDetails.items) ? (
                                        orderDetails.items.map((item: any, index: number) => (
                                            <div key={index} className="flex justify-between text-sm">
                                                <span>{item.quantity}x {item.name}</span>
                                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-600">Order items not available</p>
                                    )}

                                    <div className="pt-2 mt-2 border-t border-gray-200">
                                        <div className="flex justify-between font-semibold">
                                            <span>Total</span>
                                            <span>${orderDetails.total_amount.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">Delivery Information</h3>
                                <p className="text-sm text-gray-600">Name: {orderDetails.customer_info?.name || 'N/A'}</p>
                                <p className="text-sm text-gray-600">Address: {orderDetails.customer_info?.address || 'N/A'}</p>
                                <p className="text-sm text-gray-600">Phone: {orderDetails.customer_info?.phone || 'N/A'}</p>
                            </div>
                        </>
                    )}

                    <div className="text-center text-sm text-gray-500 pt-4">
                        <p>A confirmation email has been sent to your email address.</p>
                        <p>If you have any questions, please contact our customer support.</p>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                        <Link href="/">Continue Shopping</Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                        <Link href="/">Return to Home</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function CheckoutSuccess() {
    return (
        <Suspense fallback={
            <div className="container max-w-2xl mx-auto py-16 px-4">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="space-y-2 pt-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        }>
            <CheckoutSuccessContent />
        </Suspense>
    );
} 