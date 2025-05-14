"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function SubscriptionSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get('session_id');
    const plan = searchParams.get('plan');
    const [userName, setUserName] = useState<string>('');
    const [userEmail, setUserEmail] = useState<string>('');
    const [emailSent, setEmailSent] = useState<boolean>(false);
    const [subscriptionStatus, setSubscriptionStatus] = useState<string>('processing');
    const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

    useEffect(() => {
        // Get user data from localStorage
        const userJson = localStorage.getItem('user');
        if (userJson) {
            const user = JSON.parse(userJson);
            setUserName(user.name || '');
            setUserEmail(user.email || '');

            // Send confirmation email as a backup if webhook hasn't processed yet
            if (user.email && plan && sessionId && !emailSent) {
                sendConfirmationEmail(user.email, user.name, plan, sessionId);
            }

            // Check subscription status
            checkSubscriptionStatus(user.id, sessionId);
        } else {
            // If no user data in localStorage, redirect to login
            router.push('/login');
        }
    }, [plan, sessionId, emailSent]);

    // Function to check the subscription status
    const checkSubscriptionStatus = async (userId: string, sessionId: string) => {
        try {
            const response = await fetch(`/api/subscription/check-status?userId=${userId}&sessionId=${sessionId}`);
            if (response.ok) {
                const data = await response.json();
                setSubscriptionStatus(data.status || 'pending');

                // If subscription is active, update the user data in localStorage
                if (data.status === 'active' && data.user) {
                    // Update user data in localStorage with subscription info
                    const userJson = localStorage.getItem('user');
                    if (userJson) {
                        const user = JSON.parse(userJson);
                        const updatedUser = {
                            ...user,
                            subscription_plan: data.user.subscription_plan,
                            subscription_status: data.user.subscription_status
                        };
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                    }

                    // Auto-redirect to dashboard after 3 seconds
                    if (!isRedirecting) {
                        setIsRedirecting(true);
                        setTimeout(() => {
                            router.push('/dashboard');
                        }, 3000);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to check subscription status:', error);
        }
    };

    const sendConfirmationEmail = async (email: string, name: string, planName: string, sessionId: string) => {
        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'order_confirmation',
                    data: {
                        orderNumber: sessionId.substring(0, 8),
                        customerEmail: email,
                        customerName: name,
                        items: [
                            {
                                name: `${getPlanName(planName)} Subscription`,
                                quantity: 1,
                                price: getPlanPrice(planName)
                            }
                        ],
                        total: getPlanPrice(planName),
                        orderDate: new Date()
                    }
                }),
            });

            if (response.ok) {
                setEmailSent(true);
                console.log('Confirmation email sent successfully');
            }
        } catch (error) {
            console.error('Failed to send confirmation email:', error);
        }
    };

    // Map plan IDs to readable names
    const getPlanName = (planId: string | null) => {
        if (!planId) return 'Unknown Plan';

        // If the plan name already includes "Plan", return it directly
        if (planId.includes('Plan')) {
            return planId;
        }

        const planMap: Record<string, string> = {
            'basic': 'Basic Plan',
            'premium': 'Premium Plan',
            'enterprise': 'Enterprise Plan'
        };

        return planMap[planId.toLowerCase()] || planId;
    };

    // Get plan price based on plan name
    const getPlanPrice = (planId: string | null) => {
        if (!planId) return 29.99;

        const planPrices: Record<string, number> = {
            'Basic Plan': 29.00,
            'basic': 29.00,
            'Premium Plan': 59.00,
            'premium': 59.00,
            'Enterprise Plan': 99.00,
            'enterprise': 99.00
        };

        return planPrices[planId] || planPrices[planId.toLowerCase()] || 29.99;
    };

    return (
        <div className="max-w-3xl mx-auto p-8 text-center">
            <div className="mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold mb-4 text-primary">Subscription Successful!</h1>
                <p className="text-lg text-charcoal mb-8">
                    {userName ? `Thank you, ${userName}!` : 'Thank you!'} Your subscription to the {getPlanName(plan)} has been successfully activated.
                </p>
            </div>

            <div className="bg-beige p-6 rounded-lg shadow-md border border-primary/10 mb-8">
                <h2 className="text-xl font-semibold mb-6 text-primary">Subscription Details</h2>
                <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-12">
                    <div className="text-center">
                        <p className="text-charcoal/70 mb-1">Plan</p>
                        <p className="font-semibold text-charcoal text-lg">{getPlanName(plan)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-charcoal/70 mb-1">Status</p>
                        <p className="font-semibold text-primary text-lg capitalize">
                            {subscriptionStatus === 'processing' ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing
                                </span>
                            ) : subscriptionStatus}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-charcoal/70 mb-1">Next Billing</p>
                        <p className="font-semibold text-charcoal text-lg">{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <p className="text-charcoal">
                    You now have access to all the features included in your plan.
                    You can manage your subscription from your account settings at any time.
                </p>
                {isRedirecting && (
                    <div className="text-primary mt-4 animate-pulse">
                        Redirecting to your dashboard...
                    </div>
                )}
                <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 mt-8">
                    <Link href="/dashboard" className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
                        Go to Dashboard
                    </Link>
                    <Link href="/profile/subscription" className="px-6 py-3 bg-beige text-charcoal border border-charcoal/20 rounded-lg font-medium hover:bg-beige/70 transition-colors">
                        Manage Subscription
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function SubscriptionSuccessPage() {
    return (
        <Suspense fallback={
            <div className="max-w-3xl mx-auto p-8 text-center">
                <div className="animate-pulse">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>

                    <div className="bg-gray-100 p-6 rounded-lg mb-8">
                        <div className="h-6 bg-gray-200 rounded w-1/4 mx-auto mb-6"></div>
                        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-12">
                            <div className="text-center w-24">
                                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                                <div className="h-6 bg-gray-200 rounded"></div>
                            </div>
                            <div className="text-center w-24">
                                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                                <div className="h-6 bg-gray-200 rounded"></div>
                            </div>
                            <div className="text-center w-24">
                                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                                <div className="h-6 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>

                    <div className="h-4 bg-gray-200 rounded w-full mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto mb-8"></div>

                    <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                        <div className="h-12 bg-gray-200 rounded w-48 mx-auto sm:mx-0"></div>
                        <div className="h-12 bg-gray-200 rounded w-48 mx-auto sm:mx-0"></div>
                    </div>
                </div>
            </div>
        }>
            <SubscriptionSuccessContent />
        </Suspense>
    );
} 