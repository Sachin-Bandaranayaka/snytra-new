'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function TestStripePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [testItems, setTestItems] = useState([
        {
            id: 1,
            name: 'Test Product',
            description: 'This is a test product for Stripe integration',
            price: 10.99,
            quantity: 1,
            image: '/placeholder.jpg',
        }
    ]);
    const [email, setEmail] = useState('test@example.com');
    const [testResults, setTestResults] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleTestStripeCheckout = async () => {
        setLoading(true);
        setError(null);

        try {
            // Create a test checkout session
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cartItems: testItems,
                    userEmail: email,
                    customerInfo: {
                        name: 'Test User',
                        phone: '(123) 456-7890',
                    },
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout session');
            }

            setTestResults({
                success: true,
                sessionId: data.sessionId,
                orderId: data.orderId,
                url: data.url,
                message: 'Checkout session created successfully!'
            });

        } catch (err: any) {
            console.error('Test error:', err);
            setError(err.message || 'Failed to test Stripe integration');

            setTestResults({
                success: false,
                message: 'Test failed',
                error: err.message
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container max-w-4xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-8 text-center">Stripe Integration Test</h1>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Test Stripe Checkout</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4 text-gray-600">
                        This page allows you to test the Stripe checkout integration without using webhooks.
                        It will create a test order and redirect you to the Stripe checkout page.
                    </p>

                    <div className="space-y-4 mt-6">
                        <div>
                            <Label htmlFor="email">Test Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="test@example.com"
                            />
                        </div>

                        <div>
                            <Label>Test Product</Label>
                            <div className="flex items-center justify-between p-4 border rounded-md mt-2">
                                <div>
                                    <div className="font-medium">Test Product</div>
                                    <div className="text-sm text-gray-500">$10.99</div>
                                </div>
                                <div>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={testItems[0].quantity}
                                        onChange={(e) => setTestItems([
                                            { ...testItems[0], quantity: parseInt(e.target.value) || 1 }
                                        ])}
                                        className="w-16 text-center"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        onClick={handleTestStripeCheckout}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Testing...
                            </>
                        ) : (
                            'Test Stripe Checkout'
                        )}
                    </Button>
                </CardFooter>
            </Card>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-8">
                    <h3 className="font-bold">Error</h3>
                    <p>{error}</p>
                </div>
            )}

            {testResults && (
                <Card>
                    <CardHeader>
                        <CardTitle className={testResults.success ? 'text-green-600' : 'text-red-600'}>
                            {testResults.success ? 'Test Successful!' : 'Test Failed'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <p><strong>Message:</strong> {testResults.message}</p>
                            {testResults.sessionId && (
                                <p><strong>Session ID:</strong> {testResults.sessionId}</p>
                            )}
                            {testResults.orderId && (
                                <p><strong>Order ID:</strong> {testResults.orderId}</p>
                            )}
                            {testResults.error && (
                                <p className="text-red-600"><strong>Error:</strong> {testResults.error}</p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        {testResults.success && testResults.url && (
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700"
                                onClick={() => window.open(testResults.url, '_blank')}
                            >
                                Proceed to Stripe Checkout
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            )}

            <div className="mt-8 text-center">
                <Link href="/test-integration" className="text-purple-600 hover:text-purple-800 underline">
                    Back to Integration Tests
                </Link>
            </div>
        </div>
    );
} 