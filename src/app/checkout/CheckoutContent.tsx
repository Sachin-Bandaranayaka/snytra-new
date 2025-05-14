"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useCart } from '@/components/providers/CartProvider';
import StripePaymentWrapper from '@/components/checkout/StripePayment';

interface Restaurant {
    id: number;
    name: string;
    logo_url: string | null;
    primary_color: string;
    secondary_color: string;
}

function CheckoutContentInner() {
    const searchParams = useSearchParams();
    const tableId = searchParams.get('table');
    const router = useRouter();
    const { cart, isLoading, clearCart } = useCart();

    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        specialInstructions: '',
        paymentMethod: 'card',
        // Card details
        cardNumber: '',
        cardExpiry: '',
        cardCvv: '',
        nameOnCard: '',
    });

    // Payment method state
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'apple' | 'google' | 'card'>('card');

    // Validation state
    const [errors, setErrors] = useState<{
        customerName?: string;
        customerEmail?: string;
        customerPhone?: string;
        cardNumber?: string;
        cardExpiry?: string;
        cardCvv?: string;
        nameOnCard?: string;
    }>({});

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch restaurant info
                const restaurantResponse = await fetch('/api/restaurant');
                if (!restaurantResponse.ok) {
                    throw new Error('Failed to fetch restaurant information');
                }
                const restaurantData = await restaurantResponse.json();
                setRestaurant(restaurantData.restaurant);
            } catch (err: any) {
                console.error('Error fetching data:', err);
                setError(err.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        // Clear validation error when user types
        if (errors[name as keyof typeof errors]) {
            setErrors({
                ...errors,
                [name]: undefined,
            });
        }
    };

    const validateForm = () => {
        const newErrors: {
            customerName?: string;
            customerEmail?: string;
            customerPhone?: string;
            cardNumber?: string;
            cardExpiry?: string;
            cardCvv?: string;
            nameOnCard?: string;
        } = {};

        // Only validate payment fields if card method is selected
        if (selectedPaymentMethod === 'card') {
            if (!formData.nameOnCard.trim()) {
                newErrors.nameOnCard = 'Name on card is required';
            }

            if (!formData.cardNumber.trim()) {
                newErrors.cardNumber = 'Card number is required';
            } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
                newErrors.cardNumber = 'Invalid card number';
            }

            if (!formData.cardExpiry.trim()) {
                newErrors.cardExpiry = 'Expiry date is required';
            } else if (!/^\d{2}\/\d{2}$/.test(formData.cardExpiry)) {
                newErrors.cardExpiry = 'Invalid expiry date (MM/YY)';
            }

            if (!formData.cardCvv.trim()) {
                newErrors.cardCvv = 'CVV is required';
            } else if (!/^\d{3,4}$/.test(formData.cardCvv)) {
                newErrors.cardCvv = 'Invalid CVV';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Only validate customer information fields
        const newErrors: {
            customerName?: string;
            customerEmail?: string;
            customerPhone?: string;
        } = {};

        if (!formData.customerName.trim()) {
            newErrors.customerName = 'Name is required';
        }

        if (!formData.customerEmail.trim()) {
            newErrors.customerEmail = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
            newErrors.customerEmail = 'Invalid email format';
        }

        if (!formData.customerPhone.trim()) {
            newErrors.customerPhone = 'Phone number is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        if (!cart || cart.items.length === 0) {
            setError('Your cart is empty');
            return;
        }

        setIsSubmitting(true);

        try {
            // Update cart with customer information
            const updatedCart = {
                ...cart,
                customerName: formData.customerName,
                customerEmail: formData.customerEmail,
                customerPhone: formData.customerPhone,
                tableId: tableId ? parseInt(tableId) : undefined
            };

            // Create order from cart
            const orderResponse = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cart: updatedCart,
                    specialInstructions: formData.specialInstructions,
                    paymentMethod: selectedPaymentMethod
                }),
            });

            if (!orderResponse.ok) {
                throw new Error('Failed to create order');
            }

            const orderData = await orderResponse.json();
            setOrderId(orderData.orderId);

            // For Apple Pay and Google Pay, clear cart and redirect immediately
            // For card payments, we'll handle the payment with Stripe
            if (selectedPaymentMethod !== 'card') {
                await clearCart();
                router.push(`/order-confirmation/${orderData.orderId}`);
            } else {
                setIsSubmitting(false);
            }
        } catch (err: any) {
            console.error('Error creating order:', err);
            setError(err.message || 'Failed to process your order');
            setIsSubmitting(false);
        }
    };

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
                    <p className="text-gray-700 mb-4">{error}</p>
                    <Link
                        href={`/menu/cart${tableId ? `?table=${tableId}` : ''}`}
                        className="text-blue-500 hover:underline"
                    >
                        Return to Cart
                    </Link>
                </div>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
                    <p className="text-gray-600 mb-4">Please add some items to your cart before checkout.</p>
                    <Link
                        href={`/menu/browse${tableId ? `?table=${tableId}` : ''}`}
                        className="text-blue-500 hover:underline"
                    >
                        Go to Menu
                    </Link>
                </div>
            </div>
        );
    }

    const primaryColor = restaurant?.primary_color || '#e75627';
    const secondaryColor = restaurant?.secondary_color || '#60a5fa';
    const subtotal = cart.subtotal || 0;
    const tax = subtotal * 0.07; // 7% tax
    const total = subtotal + tax;

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-10 py-4 px-4 bg-white shadow-sm backdrop-blur-md bg-opacity-90">
                <div className="container mx-auto max-w-6xl">
                    <Link href={`/menu/cart${tableId ? `?table=${tableId}` : ''}`}
                        className="flex items-center text-gray-800 hover:text-gray-600 transition-colors">
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        <span className="font-medium">Back to Cart</span>
                    </Link>
                    <h1 className="text-3xl font-bold mt-2" style={{ color: primaryColor }}>Complete Your Order</h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto max-w-6xl p-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column - Order Summary */}
                    <div className="lg:col-span-4 order-2 lg:order-1">
                        <div className="bg-white rounded-xl shadow p-6 mb-6 sticky top-24">
                            <h2 className="text-xl font-semibold mb-4 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" style={{ color: primaryColor }} viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
                                </svg>
                                Order Summary
                            </h2>

                            <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto pr-2">
                                {cart.items.map((item) => (
                                    <div key={item.id} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                                        <div className="flex items-start">
                                            <span className="inline-flex items-center justify-center text-white w-6 h-6 rounded-full text-xs font-medium mr-2" style={{ backgroundColor: primaryColor }}>
                                                {item.quantity}
                                            </span>
                                            <div>
                                                <span className="font-medium">{item.name}</span>
                                                {item.options && item.options.length > 0 && (
                                                    <div className="text-sm text-gray-500 mt-0.5">
                                                        {item.options.map((option: any) => option.name).join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 pt-4 space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax (7%)</span>
                                    <span>${tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200 mt-2">
                                    <span>Total</span>
                                    <span style={{ color: primaryColor }}>${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Checkout Form */}
                    <div className="lg:col-span-8 order-1 lg:order-2">
                        {!orderId ? (
                            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6">
                                <h2 className="text-xl font-semibold mb-6 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" style={{ color: primaryColor }} viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    Customer Information
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="customerName">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            id="customerName"
                                            name="customerName"
                                            value={formData.customerName}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 transition-all"
                                            style={{
                                                "--tw-ring-color": `${primaryColor}`,
                                                "--tw-ring-opacity": "0.5"
                                            } as React.CSSProperties}
                                            placeholder="Enter your full name"
                                        />
                                        {errors.customerName && (
                                            <p className="text-red-500 text-sm mt-1 flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                {errors.customerName}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="customerEmail">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="customerEmail"
                                            name="customerEmail"
                                            value={formData.customerEmail}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 transition-all"
                                            style={{
                                                "--tw-ring-color": `${primaryColor}`,
                                                "--tw-ring-opacity": "0.5"
                                            } as React.CSSProperties}
                                            placeholder="your.email@example.com"
                                        />
                                        {errors.customerEmail && (
                                            <p className="text-red-500 text-sm mt-1 flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                {errors.customerEmail}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="customerPhone">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            id="customerPhone"
                                            name="customerPhone"
                                            value={formData.customerPhone}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 transition-all"
                                            style={{
                                                "--tw-ring-color": `${primaryColor}`,
                                                "--tw-ring-opacity": "0.5"
                                            } as React.CSSProperties}
                                            placeholder="(123) 456-7890"
                                        />
                                        {errors.customerPhone && (
                                            <p className="text-red-500 text-sm mt-1 flex items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                {errors.customerPhone}
                                            </p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="specialInstructions">
                                            Special Instructions (Optional)
                                        </label>
                                        <textarea
                                            id="specialInstructions"
                                            name="specialInstructions"
                                            value={formData.specialInstructions}
                                            onChange={handleInputChange}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 transition-all"
                                            style={{
                                                "--tw-ring-color": `${primaryColor}`,
                                                "--tw-ring-opacity": "0.5"
                                            } as React.CSSProperties}
                                            rows={3}
                                            placeholder="Any special requests, allergies, or dietary concerns"
                                        ></textarea>
                                    </div>
                                </div>

                                <h2 className="text-xl font-semibold mb-4 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" style={{ color: primaryColor }} viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                                    </svg>
                                    Payment Method
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                    <div
                                        onClick={() => setSelectedPaymentMethod('card')}
                                        className={`p-4 border rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center gap-2`}
                                        style={{
                                            borderColor: selectedPaymentMethod === 'card' ? primaryColor : 'rgb(229, 231, 235)',
                                            backgroundColor: selectedPaymentMethod === 'card' ? `${primaryColor}10` : '',
                                            boxShadow: selectedPaymentMethod === 'card' ? `0 0 0 2px ${primaryColor}20` : ''
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg"
                                            className="h-8 w-8"
                                            style={{ color: selectedPaymentMethod === 'card' ? primaryColor : 'rgb(75, 85, 99)' }}
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                            <line x1="1" y1="10" x2="23" y2="10"></line>
                                        </svg>
                                        <span className="font-medium"
                                            style={{ color: selectedPaymentMethod === 'card' ? primaryColor : 'rgb(31, 41, 55)' }}>
                                            Credit Card
                                        </span>
                                    </div>
                                    <div
                                        onClick={() => setSelectedPaymentMethod('apple')}
                                        className={`p-4 border rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center gap-2`}
                                        style={{
                                            borderColor: selectedPaymentMethod === 'apple' ? primaryColor : 'rgb(229, 231, 235)',
                                            backgroundColor: selectedPaymentMethod === 'apple' ? `${primaryColor}10` : '',
                                            boxShadow: selectedPaymentMethod === 'apple' ? `0 0 0 2px ${primaryColor}20` : ''
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg"
                                            className="h-8 w-8"
                                            style={{ color: selectedPaymentMethod === 'apple' ? primaryColor : 'rgb(31, 41, 55)' }}
                                            viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.6 13.8c0-3 2.5-4.5 2.6-4.6-1.4-2.1-3.6-2.4-4.4-2.4-1.9-.2-3.6 1.1-4.6 1.1-.9 0-2.4-1.1-4-1-2 0-3.9 1.2-5 3-2.1 3.7-.5 9.1 1.5 12.1 1 1.5 2.2 3.1 3.8 3 1.5-.1 2.1-1 3.9-1s2.4.9 4 .9 2.7-1.5 3.7-2.9c1.2-1.7 1.6-3.3 1.7-3.4-.1-.1-3.2-1.3-3.2-4.8zM14.5 4.1c.8-1 1.4-2.4 1.2-3.8-1.2.1-2.7.8-3.5 1.8-.8.9-1.5 2.3-1.3 3.7 1.4.1 2.8-.7 3.6-1.7z" />
                                        </svg>
                                        <span className="font-medium"
                                            style={{ color: selectedPaymentMethod === 'apple' ? primaryColor : 'rgb(31, 41, 55)' }}>
                                            Apple Pay
                                        </span>
                                    </div>
                                    <div
                                        onClick={() => setSelectedPaymentMethod('google')}
                                        className={`p-4 border rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center gap-2`}
                                        style={{
                                            borderColor: selectedPaymentMethod === 'google' ? primaryColor : 'rgb(229, 231, 235)',
                                            backgroundColor: selectedPaymentMethod === 'google' ? `${primaryColor}10` : '',
                                            boxShadow: selectedPaymentMethod === 'google' ? `0 0 0 2px ${primaryColor}20` : ''
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24">
                                            <path d="M21.35 10.04C21.35 9.47 21.29 8.92 21.18 8.38H12V11.75H17.29C17.07 12.87 16.43 13.8 15.47 14.42V16.35H18.45C20.12 14.83 21.35 12.65 21.35 10.04Z" fill="#4285F4" />
                                            <path d="M12 21.75C14.7 21.75 16.97 20.89 18.45 19.35L15.47 17.42C14.67 17.95 13.49 18.26 12 18.26C9.47 18.26 7.31 16.59 6.46 14.3H3.38V16.3C4.85 19.5 8.18 21.75 12 21.75Z" fill="#34A853" />
                                            <path d="M6.46 14.3C6.28 13.8 6.18 13.26 6.18 12.7C6.18 12.14 6.28 11.59 6.46 11.1V9.11H3.38C2.81 10.18 2.5 11.39 2.5 12.7C2.5 14.01 2.81 15.23 3.38 16.3L6.46 14.3Z" fill="#FBBC05" />
                                            <path d="M12 7.12C13.32 7.12 14.5 7.57 15.44 8.47L18.06 5.85C16.53 4.42 14.48 3.5 12 3.5C8.18 3.5 4.85 5.75 3.38 8.94L6.46 10.94C7.31 8.65 9.47 7.12 12 7.12Z" fill="#EA4335" />
                                        </svg>
                                        <span className="font-medium"
                                            style={{ color: selectedPaymentMethod === 'google' ? primaryColor : 'rgb(31, 41, 55)' }}>
                                            Google Pay
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    style={{ backgroundColor: primaryColor }}
                                    className="w-full py-4 px-6 text-white font-medium rounded-lg transition-all transform hover:translate-y-[-2px] hover:shadow-lg hover:opacity-90"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center">
                                            Continue to Payment
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="bg-white rounded-xl shadow p-6">
                                {selectedPaymentMethod === 'card' && (
                                    <StripePaymentWrapper
                                        orderId={orderId}
                                        totalAmount={total}
                                        cart={cart}
                                        customerInfo={{
                                            name: formData.customerName,
                                            email: formData.customerEmail,
                                            phone: formData.customerPhone,
                                        }}
                                        onSuccess={async () => {
                                            await clearCart();
                                        }}
                                        onError={(errorMsg) => {
                                            setError(errorMsg);
                                            setOrderId(null);
                                        }}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-4 px-4 text-center text-gray-500 text-sm border-t border-gray-200">
                <div className="container mx-auto">
                    <p>All transactions are secure and encrypted.</p>
                    <div className="flex justify-center space-x-4 mt-3">
                        <svg className="h-6" viewBox="0 0 32 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M27.5 0H4.5C2.01375 0 0 2.01375 0 4.5V16.5C0 18.9862 2.01375 21 4.5 21H27.5C29.9862 21 32 18.9862 32 16.5V4.5C32 2.01375 29.9862 0 27.5 0Z" fill="#F7FAFC" />
                            <path d="M12.8842 14.3973H10.594L8.27246 7.69824H10.2978L11.7328 12.3412L13.1487 7.69824H15.1741L12.8842 14.3973ZM17.5334 14.3973L15.5647 7.69824H17.5051L19.473 14.3973H17.5334ZM22.0032 14.3973H19.9969L21.1783 7.69824H25.7281L25.2977 9.31066H22.6672L22.0032 14.3973Z" fill="#4A5568" />
                            <path d="M6.50989 7.69824L4.72452 12.3983L4.50271 11.6548L4.50179 11.6521L3.23649 8.38289C3.23649 8.38289 3.09922 7.69824 2.28711 7.69824H0.0326538L0 7.8355C0 7.8355 0.691553 7.96552 1.4999 8.40294L3.03937 14.3973H5.06871L8.0717 7.69824H6.50989Z" fill="#4A5568" />
                        </svg>
                        <svg className="h-6" viewBox="0 0 32 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M27.5 0H4.5C2.01375 0 0 2.01375 0 4.5V16.5C0 18.9862 2.01375 21 4.5 21H27.5C29.9862 21 32 18.9862 32 16.5V4.5C32 2.01375 29.9862 0 27.5 0Z" fill="#F7FAFC" />
                            <path d="M21.9834 10.5264C21.9834 12.9178 20.0508 14.8504 17.6594 14.8504C15.268 14.8504 13.3354 12.9178 13.3354 10.5264C13.3354 8.135 15.268 6.20239 17.6594 6.20239C20.0508 6.20239 21.9834 8.135 21.9834 10.5264Z" fill="#ED8027" />
                            <path d="M12.8842 14.3973H10.594L8.27246 7.69824H10.2978L11.7328 12.3412L13.1487 7.69824H15.1741L12.8842 14.3973Z" fill="#4A5568" />
                        </svg>
                        <svg className="h-6" viewBox="0 0 32 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M27.5 0H4.5C2.01375 0 0 2.01375 0 4.5V16.5C0 18.9862 2.01375 21 4.5 21H27.5C29.9862 21 32 18.9862 32 16.5V4.5C32 2.01375 29.9862 0 27.5 0Z" fill="#F7FAFC" />
                            <path d="M13.738 10.5C13.738 11.8809 12.6193 13 11.2385 13H8V8H11.2385C12.6193 8 13.738 9.11909 13.738 10.5Z" fill="#2D3748" />
                            <path d="M26 8H23.2747C22.019 8 21 9.11909 21 10.5C21 11.8809 22.019 13 23.2747 13H26V8Z" fill="#4A5568" />
                            <path d="M24.4 10.5C24.4 11.8807 23.2822 13 21.9 13C20.5178 13 19.4 11.8807 19.4 10.5C19.4 9.11934 20.5178 8 21.9 8C23.2822 8 24.4 9.11934 24.4 10.5Z" fill="#2D3748" />
                            <path d="M18.7 10.5C18.7 11.8807 17.5822 13 16.2 13C14.8178 13 13.7 11.8807 13.7 10.5C13.7 9.11934 14.8178 8 16.2 8C17.5822 8 18.7 9.11934 18.7 10.5Z" fill="#4A5568" />
                        </svg>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default function CheckoutContent() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <CheckoutContentInner />
        </Suspense>
    );
} 