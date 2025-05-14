"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash, Plus, Minus, Info, ShoppingCart, ChevronRight } from 'lucide-react';
import { useCart } from '@/components/providers/CartProvider';
import { useRestaurant } from '@/components/providers/RestaurantProvider';
import CartDisplay from '@/components/ui/CartDisplay';
import CallWaiter from '@/components/ui/CallWaiter';

function CartContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tableId = searchParams.get('table');
    const { cart, updateQuantity, removeItem, clearCart } = useCart();
    const { restaurant, loading: restaurantLoading, error: restaurantError } = useRestaurant();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            try {
                // Any additional data loading would go here
                setLoading(false);
            } catch (err: any) {
                console.error('Error loading cart data:', err);
                setError(err.message || 'An error occurred');
                setLoading(false);
            }
        }

        if (cart) {
            loadData();
        } else {
            setLoading(false);
        }
    }, [cart]);

    const handleQuantityChange = (menuItemId: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeItem(menuItemId);
        } else {
            updateQuantity(menuItemId, newQuantity);
        }
    };

    const handleCheckout = () => {
        // Navigate to checkout with table ID if available
        router.push(`/menu/checkout${tableId ? `?table=${tableId}` : ''}`);
    };

    if (loading || restaurantLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-16 h-16 border-4 border-[#e75627] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || restaurantError) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
                    <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100">
                        <Info className="h-10 w-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-gray-800">Something went wrong</h2>
                    <p className="text-gray-600 mb-4">{error || restaurantError}</p>
                    <Link
                        href={`/menu/browse${tableId ? `?table=${tableId}` : ''}`}
                        className="inline-block px-6 py-3 text-white font-medium rounded-lg hover:opacity-90 transition-colors"
                        style={{ backgroundColor: restaurant?.primary_color || '#e75627' }}
                    >
                        Return to Menu
                    </Link>
                </div>
            </div>
        );
    }

    const primaryColor = restaurant?.primary_color || '#e75627';
    const secondaryColor = restaurant?.secondary_color || '#f8f6f1';

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-10 py-4 px-4 bg-white shadow-sm backdrop-blur-md bg-opacity-90">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex items-center justify-between">
                        <Link href={`/menu/browse${tableId ? `?table=${tableId}` : ''}`}
                            className="flex items-center text-gray-800 hover:text-gray-600 transition-colors"
                            style={{ hoverColor: primaryColor }}
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            <span className="font-medium">Back to Menu</span>
                        </Link>
                        <Link
                            href="/menu/orders/track"
                            className="text-gray-700 hover:text-gray-900 transition-colors flex items-center text-sm font-medium"
                            style={{ hoverColor: primaryColor }}
                        >
                            Track Orders
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                    </div>
                    <h1 className="text-3xl font-bold mt-2" style={{ color: primaryColor }}>Your Cart</h1>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 container mx-auto max-w-6xl px-4 py-8 pb-20 md:pb-8">
                {!cart || cart.items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-80 bg-white rounded-xl shadow p-8">
                        <div className="w-24 h-24 mb-6 flex items-center justify-center rounded-full bg-gray-100">
                            <ShoppingCart className="h-12 w-12 text-gray-400" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-3 text-gray-800">Your cart is empty</h2>
                            <p className="text-gray-600 mb-8 max-w-md">Looks like you haven't added any items to your cart yet. Browse our menu to find something delicious!</p>
                            <Link
                                href={`/menu/browse${tableId ? `?table=${tableId}` : ''}`}
                                className="px-8 py-3 text-white rounded-lg font-medium transition-all transform hover:translate-y-[-2px] hover:shadow-lg hover:opacity-90"
                                style={{ backgroundColor: primaryColor }}
                            >
                                Browse Menu
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Column - Cart Items */}
                        <div className="lg:col-span-8 order-1">
                            <div className="mb-6 flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" style={{ color: primaryColor }} viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
                                    </svg>
                                    Your Items ({cart.items.length})
                                </h2>
                                <button
                                    onClick={() => clearCart()}
                                    className="text-gray-500 flex items-center hover:text-red-500 transition-colors text-sm font-medium"
                                >
                                    <Trash size={16} className="mr-1" />
                                    Clear Cart
                                </button>
                            </div>

                            <div className="space-y-4">
                                {cart.items.map((item) => (
                                    <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-gray-100 hover:border-gray-200 transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-800 text-lg">{item.menuItemName}</h3>
                                            {item.options && item.options.length > 0 && (
                                                <p className="text-gray-500 mt-1 text-sm">
                                                    {item.options.map((opt: any) => opt.name).join(', ')}
                                                </p>
                                            )}
                                            <p className="font-medium mt-2" style={{ color: primaryColor }}>${item.price.toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center self-end sm:self-center">
                                            <div className="flex items-center border border-gray-200 rounded-lg p-1">
                                                <button
                                                    onClick={() => handleQuantityChange(item.menuItemId, item.quantity - 1)}
                                                    className="w-8 h-8 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="mx-3 w-6 text-center font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleQuantityChange(item.menuItemId, item.quantity + 1)}
                                                    className="w-8 h-8 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.menuItemId)}
                                                className="ml-4 text-gray-400 hover:text-red-500 transition-colors p-2"
                                                aria-label="Remove item"
                                            >
                                                <Trash size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="lg:col-span-4 order-2 lg:order-1">
                            <div className="bg-white p-6 rounded-xl shadow sticky top-24 border border-gray-100">
                                <h3 className="text-xl font-semibold mb-6 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" style={{ color: primaryColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Order Summary
                                </h3>

                                <div className="space-y-3 border-b border-gray-100 pb-4 mb-4 max-h-[200px] overflow-y-auto">
                                    {cart.items.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm py-1">
                                            <div className="flex items-start">
                                                <span
                                                    className="inline-flex items-center justify-center text-white w-5 h-5 rounded-full text-xs font-medium mr-2 flex-shrink-0 mt-0.5"
                                                    style={{ backgroundColor: primaryColor }}
                                                >
                                                    {item.quantity}
                                                </span>
                                                <span className="text-gray-700">{item.menuItemName}</span>
                                            </div>
                                            <span className="font-medium">${item.subtotal.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>${cart.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tax (7%)</span>
                                        <span>${(cart.subtotal * 0.07).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200 mt-2">
                                        <span>Total</span>
                                        <span style={{ color: primaryColor }}>${(cart.subtotal + cart.subtotal * 0.07).toFixed(2)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    className="w-full py-4 mt-6 text-white font-medium rounded-lg transition-all transform hover:translate-y-[-2px] hover:shadow-lg hover:opacity-90 flex items-center justify-center"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    <span>Proceed to Checkout</span>
                                    <ChevronRight className="ml-1 h-5 w-5" />
                                </button>

                                <div className="mt-4 text-center text-xs text-gray-500">
                                    Estimated delivery time: 30-45 minutes
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Checkout Bar */}
            {cart && cart.items.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 z-20 lg:hidden bg-white border-t border-gray-200 p-4 shadow-lg">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <div className="text-sm text-gray-500">Total</div>
                            <div className="font-bold text-xl" style={{ color: primaryColor }}>${(cart.subtotal + cart.subtotal * 0.07).toFixed(2)}</div>
                        </div>
                        <button
                            onClick={handleCheckout}
                            className="px-6 py-3 text-white font-medium rounded-lg hover:opacity-90 transition-colors flex items-center"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Checkout
                            <ChevronRight className="ml-1 h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}

            <CallWaiter
                tableId={tableId ? parseInt(tableId) : undefined}
                buttonColor={primaryColor}
            />
        </div>
    );
}

function CartLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-[#e75627] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}

export default function CartPage() {
    return (
        <Suspense fallback={<CartLoading />}>
            <CartContent />
        </Suspense>
    );
} 