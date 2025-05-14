"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type CartItem = {
    id: number;
    menuItemId: number;
    menuItemName: string;
    quantity: number;
    price: number;
    subtotal: number;
    specialInstructions?: string;
};

export type Cart = {
    id?: number;
    sessionId: string;
    tableId?: number;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    itemCount: number;
    subtotal: number;
    items: CartItem[];
};

type CartContextType = {
    cart: Cart | null;
    isLoading: boolean;
    addItem: (item: Omit<CartItem, 'id' | 'subtotal'>) => Promise<void>;
    removeItem: (menuItemId: number) => Promise<void>;
    updateQuantity: (menuItemId: number, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    saveCart: () => Promise<void>;
    loadCart: () => Promise<void>;
    getCartTotal: () => number;
    updateCustomerInfo?: (info: { name: string; email: string; phone: string }) => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<Cart | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Generate a session ID if not exists
    useEffect(() => {
        const sessionId = localStorage.getItem('cartSessionId') ||
            `session_${Math.random().toString(36).substring(2, 15)}`;

        localStorage.setItem('cartSessionId', sessionId);

        // Initialize empty cart with session ID
        if (!cart) {
            setCart({
                sessionId,
                itemCount: 0,
                subtotal: 0,
                items: []
            });
        }

        loadCart();
    }, []);

    const calculateSubtotal = (items: CartItem[]): number => {
        return items.reduce((total, item) => total + item.subtotal, 0);
    };

    const loadCart = async (): Promise<void> => {
        setIsLoading(true);
        try {
            const sessionId = localStorage.getItem('cartSessionId');
            if (!sessionId) return;

            const response = await fetch(`/api/cart?sessionId=${sessionId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setCart(data);
                } else {
                    // If no cart exists yet or there's an error, create an empty one
                    setCart({
                        sessionId,
                        itemCount: 0,
                        subtotal: 0,
                        items: []
                    });
                }
            } else {
                // If API endpoint isn't available yet, use empty cart
                setCart({
                    sessionId,
                    itemCount: 0,
                    subtotal: 0,
                    items: []
                });
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            // Fallback to empty cart on error
            const sessionId = localStorage.getItem('cartSessionId');
            if (sessionId) {
                setCart({
                    sessionId,
                    itemCount: 0,
                    subtotal: 0,
                    items: []
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const saveCart = async (): Promise<void> => {
        if (!cart) return;

        try {
            const response = await fetch('/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cart),
            });

            if (response.ok) {
                const savedCart = await response.json();
                if (savedCart.success) {
                    // We don't need to set the cart here as we're using optimistic updates
                    // This prevents the UI from jumping when there are multiple operations
                    console.log('Cart saved successfully');
                }
            }
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    };

    const addItem = async (newItem: Omit<CartItem, 'id' | 'subtotal'>): Promise<void> => {
        if (!cart) return;

        // Use optimistic updates to prevent race conditions
        setCart(prevCart => {
            if (!prevCart) return null;

            // Check if item already exists in cart
            const existingItemIndex = prevCart.items.findIndex(item => item.menuItemId === newItem.menuItemId);
            let updatedItems: CartItem[];

            if (existingItemIndex >= 0) {
                // Update quantity if item exists
                updatedItems = [...prevCart.items];
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
                    subtotal: updatedItems[existingItemIndex].price * (updatedItems[existingItemIndex].quantity + newItem.quantity)
                };
            } else {
                // Add new item
                const newCartItem: CartItem = {
                    ...newItem,
                    id: Date.now(), // Temporary ID until saved to database
                    subtotal: newItem.price * newItem.quantity
                };
                updatedItems = [...prevCart.items, newCartItem];
            }

            const itemCount = updatedItems.reduce((count, item) => count + item.quantity, 0);
            const subtotal = calculateSubtotal(updatedItems);

            // Return new cart state
            return {
                ...prevCart,
                items: updatedItems,
                itemCount,
                subtotal
            };
        });

        // Save to server after state update
        await saveCart();
    };

    const removeItem = async (menuItemId: number): Promise<void> => {
        if (!cart) return;

        // Use optimistic updates to prevent race conditions
        setCart(prevCart => {
            if (!prevCart) return null;

            const updatedItems = prevCart.items.filter(item => item.menuItemId !== menuItemId);
            const itemCount = updatedItems.reduce((count, item) => count + item.quantity, 0);
            const subtotal = calculateSubtotal(updatedItems);

            // Return new cart state
            return {
                ...prevCart,
                items: updatedItems,
                itemCount,
                subtotal
            };
        });

        // Save to server after state update
        await saveCart();
    };

    const updateQuantity = async (menuItemId: number, quantity: number): Promise<void> => {
        if (!cart) return;

        // Don't allow quantities less than 1
        if (quantity < 1) {
            return removeItem(menuItemId);
        }

        // Use optimistic updates to prevent race conditions
        setCart(prevCart => {
            if (!prevCart) return null;

            const updatedItems = prevCart.items.map(item => {
                if (item.menuItemId === menuItemId) {
                    return {
                        ...item,
                        quantity,
                        subtotal: item.price * quantity
                    };
                }
                return item;
            });

            const itemCount = updatedItems.reduce((count, item) => count + item.quantity, 0);
            const subtotal = calculateSubtotal(updatedItems);

            // Return new cart state
            return {
                ...prevCart,
                items: updatedItems,
                itemCount,
                subtotal
            };
        });

        // Save to server after state update
        await saveCart();
    };

    const clearCart = async (): Promise<void> => {
        if (!cart) return;

        const emptyCart: Cart = {
            sessionId: cart.sessionId,
            itemCount: 0,
            subtotal: 0,
            items: []
        };

        setCart(emptyCart);

        try {
            await fetch(`/api/cart?sessionId=${cart.sessionId}`, {
                method: 'DELETE',
            });
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    };

    const getCartTotal = (): number => {
        if (!cart) return 0;
        return cart.subtotal;
    };

    const updateCustomerInfo = async (info: { name: string; email: string; phone: string }): Promise<void> => {
        if (!cart) return;

        const updatedCart: Cart = {
            ...cart,
            customerName: info.name,
            customerEmail: info.email,
            customerPhone: info.phone
        };

        setCart(updatedCart);
        await saveCart();
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                isLoading,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                saveCart,
                loadCart,
                getCartTotal,
                updateCustomerInfo
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export default CartProvider; 