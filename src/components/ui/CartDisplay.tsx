"use client";

import React, { useState } from 'react';
import { useCart } from '@/components/providers/CartProvider';
import Link from 'next/link';
import { debugLog } from '@/utils/logger';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShoppingCart, X, Plus, Minus, Trash } from 'lucide-react';

export default function CartDisplay({ compact = false }: { compact?: boolean }) {
    const { cart, removeItem, updateQuantity, clearCart } = useCart();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const tableId = searchParams?.get('table');

    if (!cart) {
        return null;
    }

    // Add debugging logs
    debugLog('Cart object', cart);
    if (cart.items && cart.items.length > 0) {
        debugLog('First cart item', cart.items[0]);
    }

    const toggleCart = () => {
        setIsCartOpen(!isCartOpen);
    };

    const handleCheckout = () => {
        setIsCartOpen(false);
        router.push(`/menu/checkout${tableId ? `?table=${tableId}` : ''}`);
    };

    // If cart is empty and compact, just show the icon
    if (compact && (!cart.items || cart.items.length === 0)) {
        return (
            <div className="relative">
                <button
                    onClick={toggleCart}
                    className="p-2 rounded-full bg-primary text-white relative"
                    aria-label="Shopping cart"
                >
                    <ShoppingCart size={20} />
                </button>
            </div>
        );
    }

    const cartContent = (
        <div className={`bg-white rounded-lg shadow-lg ${compact ? 'p-4' : 'p-6'}`}>
            <div className="flex items-center justify-between mb-4">
                <h2 className={`font-bold ${compact ? 'text-lg' : 'text-2xl'}`}>Your Order</h2>
                {compact && (
                    <button
                        onClick={toggleCart}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label="Close cart"
                    >
                        <X size={18} />
                    </button>
                )}
                {cart.items && cart.items.length > 0 && (
                    <button
                        onClick={clearCart}
                        className="text-sm text-red-500 hover:text-red-700"
                    >
                        Clear all
                    </button>
                )}
            </div>

            {(!cart.items || cart.items.length === 0) ? (
                <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">Your cart is empty</p>
                    <button
                        onClick={() => {
                            setIsCartOpen(false);
                            router.push(`/menu/browse${tableId ? `?table=${tableId}` : ''}`);
                        }}
                        className="inline-block bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                    >
                        Browse Menu
                    </button>
                </div>
            ) : (
                <>
                    <div className={`divide-y ${compact ? 'max-h-60 overflow-auto' : ''}`}>
                        {cart.items.map((item) => {
                            // Log each item for debugging
                            debugLog(`Cart item ${item.menuItemId}`, item);

                            return (
                                <div key={item.id} className="py-3 flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <p className="font-medium">{item.menuItemName}</p>
                                            <p className="font-medium ml-4">${item.subtotal.toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center mt-1">
                                            <div className="flex items-center border rounded-md">
                                                <button
                                                    onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                                                    className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="px-2 py-1">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                                                    className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.menuItemId)}
                                                className="ml-3 text-sm text-red-500 hover:text-red-700"
                                                aria-label="Remove item"
                                            >
                                                <Trash size={14} />
                                            </button>
                                        </div>
                                        {item.specialInstructions && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                Note: {item.specialInstructions}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between mb-2">
                            <span>Subtotal</span>
                            <span>${cart.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>${cart.subtotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={handleCheckout}
                            className="block w-full bg-primary text-white text-center py-3 rounded-md hover:bg-primary/90"
                        >
                            Checkout (${cart.subtotal.toFixed(2)})
                        </button>

                        {compact && (
                            <Link
                                href={`/menu/cart${tableId ? `?table=${tableId}` : ''}`}
                                className="block w-full text-center py-3 mt-2 rounded-md border border-gray-300 hover:bg-gray-50"
                                onClick={() => setIsCartOpen(false)}
                            >
                                View Cart
                            </Link>
                        )}
                    </div>
                </>
            )}
        </div>
    );

    // Compact version (for header)
    if (compact) {
        return (
            <div className="relative">
                <button
                    onClick={toggleCart}
                    className="p-2 rounded-full bg-primary text-white relative"
                    aria-label="Shopping cart"
                >
                    <ShoppingCart size={20} />
                    {cart.itemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                            {cart.itemCount}
                        </span>
                    )}
                </button>

                {isCartOpen && (
                    <div className="absolute right-0 top-full mt-2 z-50 w-80">
                        {cartContent}
                    </div>
                )}
            </div>
        );
    }

    // Full version (for cart page)
    return cartContent;
} 