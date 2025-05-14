"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Search,
    Filter,
    ShoppingCart,
    Plus,
    Minus,
    Info,
    Leaf,
    Wheat,
    X
} from 'lucide-react';
import { useCart } from '@/components/providers/CartProvider';
import { useRestaurant } from '@/components/providers/RestaurantProvider';
import CallWaiter from '@/components/ui/CallWaiter';

interface Category {
    id: number;
    name: string;
    is_active: boolean;
}

interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    image_url: string | null;
    is_available: boolean;
    category_id: number;
    labels: {
        vegetarian?: boolean;
        vegan?: boolean;
        gluten_free?: boolean;
        spicy?: boolean;
    } | null;
}

function MenuContent() {
    const searchParams = useSearchParams();
    const tableId = searchParams.get('table');
    const initialCategoryParam = searchParams.get('category');
    const { cart, addItem, updateQuantity, removeItem } = useCart();
    const { restaurant, loading: restaurantLoading, error: restaurantError } = useRestaurant();

    const [categories, setCategories] = useState<Category[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCart, setShowCart] = useState(false);

    // Filters
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        vegetarian: false,
        vegan: false,
        glutenFree: false,
    });

    const [itemStates, setItemStates] = useState<{ [key: number]: { isAdding: boolean } }>({});

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch categories
                const categoriesResponse = await fetch('/api/dashboard/menu/categories');
                if (!categoriesResponse.ok) {
                    throw new Error('Failed to fetch menu categories');
                }
                const categoriesData = await categoriesResponse.json();
                const activeCategories = categoriesData.categories.filter((cat: Category) => cat.is_active);
                setCategories(activeCategories);

                // Fetch menu items
                const menuItemsResponse = await fetch('/api/menu' +
                    (initialCategoryParam ? `?category=${initialCategoryParam}` : ''));
                if (!menuItemsResponse.ok) {
                    throw new Error('Failed to fetch menu items');
                }
                const menuItemsData = await menuItemsResponse.json();
                setMenuItems(menuItemsData.menuItems);

                // Set the initial category based on URL param or first category
                if (initialCategoryParam) {
                    setSelectedCategory(parseInt(initialCategoryParam));
                } else if (activeCategories.length > 0) {
                    setSelectedCategory(activeCategories[0].id);
                }
            } catch (err: any) {
                console.error('Error fetching data:', err);
                setError(err.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [initialCategoryParam]);

    // Get displayed menu items based on category, search and filters
    const getFilteredItems = () => {
        return menuItems.filter(item => {
            // Filter by category
            if (selectedCategory && item.category_id !== selectedCategory) {
                return false;
            }

            // Filter by search
            if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !item.description.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            // Apply dietary filters
            if (filters.vegetarian && !item.labels?.vegetarian) {
                return false;
            }
            if (filters.vegan && !item.labels?.vegan) {
                return false;
            }
            if (filters.glutenFree && !item.labels?.gluten_free) {
                return false;
            }

            return true;
        });
    };

    const filteredItems = getFilteredItems();

    const handleAddToCart = async (item: MenuItem) => {
        // Prevent multiple clicks on the same item
        if (itemStates[item.id]?.isAdding) {
            return;
        }

        try {
            // Set loading state
            setItemStates(prevState => ({
                ...prevState,
                [item.id]: { isAdding: true }
            }));

            // Add item with a specified quantity of exactly 1
            await addItem({
                menuItemId: item.id,
                menuItemName: item.name,
                quantity: 1,
                price: item.price
            });

            // Show cart when an item is added
            setShowCart(true);
        } catch (error) {
            console.error("Error adding item to cart:", error);
        } finally {
            // Clear loading state after a short delay to prevent rapid re-clicks
            setTimeout(() => {
                setItemStates(prevState => ({
                    ...prevState,
                    [item.id]: { isAdding: false }
                }));
            }, 500);
        }
    };

    const toggleCart = () => {
        setShowCart(!showCart);
    };

    if (loading || restaurantLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-beige">
                <div className="w-16 h-16 border-4 border-restaurant-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || restaurantError) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-beige">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-restaurant-primary mb-2">Error</h2>
                    <p className="text-darkGray mb-4">{error || restaurantError}</p>
                    <p className="text-darkGray">Please try again or contact the restaurant.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <header
                className="sticky top-0 z-10 py-4 px-4 text-white shadow-md"
                style={{
                    background: `linear-gradient(to right, ${restaurant?.primary_color || 'var(--restaurant-primary-color)'}, ${restaurant?.primary_color ? restaurant.primary_color + 'dd' : 'var(--restaurant-primary-color-light)'})`
                }}
            >
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        {restaurant?.logo_url ? (
                            <img
                                src={restaurant.logo_url}
                                alt={restaurant.name}
                                className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                        ) : (
                            <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <span
                                    className="font-bold"
                                    style={{ color: restaurant?.primary_color || 'var(--restaurant-primary-color)' }}
                                >
                                    {restaurant?.name.charAt(0)}
                                </span>
                            </div>
                        )}
                        <Link href={`/menu${tableId ? `?table=${tableId}` : ''}`} className="text-white hover:text-gray-200 bg-white/20 p-2 rounded-full transition-all">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <Link href="/menu/orders/track" className="text-white hover:text-gray-200 hidden md:flex items-center">
                            <span className="ml-2">Track Orders</span>
                        </Link>
                        <nav className="hidden md:flex items-center space-x-6">
                            <Link href={`/menu${tableId ? `?table=${tableId}` : ''}`} className="font-medium text-white hover:text-white/80">
                                Home
                            </Link>
                            <Link href="/about-us" className="font-medium text-white hover:text-white/80">
                                About Us
                            </Link>
                            <Link href={`/menu/browse${tableId ? `?table=${tableId}` : ''}`} className="font-medium text-white hover:text-white/80 border-b-2 border-white">
                                Menu
                            </Link>
                            <Link
                                href={`/menu/reservations${tableId ? `?table=${tableId}` : ''}`}
                                className="font-medium text-white hover:text-white/80"
                            >
                                Reservations
                            </Link>
                            <Link href="/contact-us" className="font-medium text-white hover:text-white/80">
                                Contact Us
                            </Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleCart}
                            className="relative p-2 rounded-full text-white hover:opacity-90 transition-all hover:scale-105"
                            style={{
                                background: `linear-gradient(to right, ${restaurant?.secondary_color || 'var(--restaurant-secondary-color)'}, ${restaurant?.secondary_color ? restaurant.secondary_color + 'dd' : 'var(--restaurant-secondary-color-light)'})`
                            }}
                            aria-label="Toggle Cart"
                        >
                            <ShoppingCart size={20} />
                            {cart && cart.itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-white text-gray-800 rounded-full text-xs font-bold w-5 h-5 flex items-center justify-center shadow-sm">
                                    {cart.itemCount}
                                </span>
                            )}
                        </button>
                        {cart && cart.itemCount > 0 && (
                            <Link
                                href={`/menu/cart${tableId ? `?table=${tableId}` : ''}`}
                                className="hidden md:block px-4 py-2 text-white rounded-md font-medium hover:opacity-90 transition-all hover:scale-105"
                                style={{
                                    background: `linear-gradient(to right, ${restaurant?.secondary_color || 'var(--restaurant-secondary-color)'}, ${restaurant?.secondary_color ? restaurant.secondary_color + 'dd' : 'var(--restaurant-secondary-color-light)'})`
                                }}
                            >
                                View Cart
                            </Link>
                        )}
                        <Link
                            href="/sign-up"
                            className="px-4 py-2 text-white rounded-md font-medium hover:opacity-90 transition-all hover:scale-105 shadow-sm"
                            style={{
                                background: `linear-gradient(to right, ${restaurant?.secondary_color || 'var(--restaurant-secondary-color)'}, ${restaurant?.secondary_color ? restaurant.secondary_color + 'dd' : 'var(--restaurant-secondary-color-light)'})`
                            }}
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row relative">
                {/* Left Column - Menu */}
                <div className="w-full">
                    <h1
                        className="text-3xl font-bold mb-6 flex items-center"
                        style={{ color: restaurant?.primary_color || 'var(--restaurant-primary-color)' }}
                    >
                        <span className="mr-2">Menu</span>
                        <span className="text-sm font-normal bg-gray-100 text-gray-700 py-1 px-3 rounded-full">
                            {filteredItems.length} items
                        </span>
                    </h1>

                    {/* Search Bar */}
                    <div className="mb-6 relative">
                        <input
                            type="text"
                            placeholder="Search Menu"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border border-gray-200 shadow-sm focus:outline-none focus:ring-2 transition-all"
                            style={{
                                borderColor: 'transparent',
                                outlineColor: restaurant?.primary_color || 'var(--restaurant-primary-color)',
                                focusRing: restaurant?.primary_color || 'var(--restaurant-primary-color)'
                            }}
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <Search size={20} />
                        </span>
                    </div>

                    {/* Categories */}
                    <div className="mb-8 flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
                        <button
                            className="px-4 py-2 rounded-full whitespace-nowrap text-white hover:opacity-90 transition-all hover:scale-105 shadow-sm"
                            style={{
                                background: selectedCategory === null
                                    ? `linear-gradient(to right, ${restaurant?.primary_color || 'var(--restaurant-primary-color)'}, ${restaurant?.primary_color ? restaurant.primary_color + 'dd' : 'var(--restaurant-primary-color-light)'})`
                                    : `linear-gradient(to right, ${restaurant?.secondary_color || 'var(--restaurant-secondary-color)'}, ${restaurant?.secondary_color ? restaurant.secondary_color + 'dd' : 'var(--restaurant-secondary-color-light)'})`
                            }}
                            onClick={() => setSelectedCategory(null)}
                        >
                            All Items
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                className="px-4 py-2 rounded-full whitespace-nowrap text-white hover:opacity-90 transition-all hover:scale-105 shadow-sm"
                                style={{
                                    background: selectedCategory === category.id
                                        ? `linear-gradient(to right, ${restaurant?.primary_color || 'var(--restaurant-primary-color)'}, ${restaurant?.primary_color ? restaurant.primary_color + 'dd' : 'var(--restaurant-primary-color-light)'})`
                                        : `linear-gradient(to right, ${restaurant?.secondary_color || 'var(--restaurant-secondary-color)'}, ${restaurant?.secondary_color ? restaurant.secondary_color + 'dd' : 'var(--restaurant-secondary-color-light)'})`
                                }}
                                onClick={() => setSelectedCategory(category.id)}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>

                    {/* Menu Items */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.length > 0 ? (
                            filteredItems.map((item) => (
                                <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100">
                                    <div className="relative">
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                className="w-full h-48 object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                                                <span className="text-gray-400">No image available</span>
                                            </div>
                                        )}

                                        {/* Item Labels */}
                                        {item.labels && (
                                            <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap">
                                                {item.labels.vegetarian && (
                                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full shadow-sm">
                                                        <Leaf size={12} className="inline mr-1" />
                                                        Vegetarian
                                                    </span>
                                                )}
                                                {item.labels.gluten_free && (
                                                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full shadow-sm">
                                                        <Wheat size={12} className="inline mr-1" />
                                                        Gluten Free
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-medium text-lg text-gray-800">{item.name}</h3>
                                            <span
                                                className="font-bold text-lg"
                                                style={{ color: restaurant?.primary_color || 'var(--restaurant-primary-color)' }}
                                            >
                                                ${item.price ? item.price.toFixed(2) : '0.00'}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>

                                        {/* Item Controls */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center text-sm">
                                                {categories.find(c => c.id === item.category_id)?.name && (
                                                    <span
                                                        className="px-2 py-1 rounded-full text-xs"
                                                        style={{
                                                            backgroundColor: `${restaurant?.primary_color || 'var(--restaurant-primary-color)'}10`,
                                                            color: restaurant?.primary_color || 'var(--restaurant-primary-color)'
                                                        }}
                                                    >
                                                        {categories.find(c => c.id === item.category_id)?.name}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleAddToCart(item)}
                                                disabled={!item.is_available || itemStates[item.id]?.isAdding}
                                                className="px-4 py-1.5 rounded-full text-sm font-medium text-white hover:opacity-90 transition-all hover:scale-105 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100"
                                                style={{
                                                    background: item.is_available
                                                        ? `linear-gradient(to right, ${restaurant?.secondary_color || 'var(--restaurant-secondary-color)'}, ${restaurant?.secondary_color ? restaurant.secondary_color + 'dd' : 'var(--restaurant-secondary-color-light)'})`
                                                        : undefined
                                                }}
                                            >
                                                {itemStates[item.id]?.isAdding ? (
                                                    <span className="flex items-center">
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Adding...
                                                    </span>
                                                ) : item.is_available ? (
                                                    <>
                                                        <Plus size={16} className="inline mr-1" />
                                                        Add to Cart
                                                    </>
                                                ) : (
                                                    'Out of Stock'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 bg-white rounded-lg p-8 text-center shadow-sm">
                                <p className="text-gray-600">No menu items found matching your criteria.</p>
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedCategory(null);
                                        setFilters({
                                            vegetarian: false,
                                            vegan: false,
                                            glutenFree: false,
                                        });
                                    }}
                                    className="mt-4 px-4 py-2 rounded-md text-white"
                                    style={{ backgroundColor: restaurant?.primary_color || 'var(--restaurant-primary-color)' }}
                                >
                                    Reset Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Cart Slide-in */}
            {showCart && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={toggleCart}></div>
                    <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-xl transform transition-transform ease-in-out duration-300">
                        <div className="h-full flex flex-col">
                            <div
                                className="px-4 py-3 flex items-center justify-between"
                                style={{
                                    background: `linear-gradient(to right, ${restaurant?.primary_color || 'var(--restaurant-primary-color)'}, ${restaurant?.primary_color ? restaurant.primary_color + 'dd' : 'var(--restaurant-primary-color-light)'})`
                                }}
                            >
                                <h2 className="text-xl font-bold text-white">Your Cart</h2>
                                <button onClick={toggleCart} className="p-1 rounded-full text-white hover:bg-white/20 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                                {/* Cart Contents */}
                                {cart && cart.items.length > 0 ? (
                                    <>
                                        {cart.items.map((item) => (
                                            <div key={item.id} className="mb-4 p-4 bg-gray-50 rounded-lg hover:shadow-sm transition-all">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-medium text-gray-800">{item.menuItemName}</h3>
                                                        <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            className="w-7 h-7 flex items-center justify-center rounded-full text-white shadow-sm"
                                                            style={{ backgroundColor: restaurant?.secondary_color || 'var(--restaurant-secondary-color)' }}
                                                            onClick={() => item.quantity > 1 ? updateQuantity(item.menuItemId, item.quantity - 1) : removeItem(item.menuItemId)}
                                                            aria-label="Decrease quantity"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="text-gray-700 font-medium w-5 text-center">{item.quantity}</span>
                                                        <button
                                                            className="w-7 h-7 flex items-center justify-center rounded-full text-white shadow-sm"
                                                            style={{ backgroundColor: restaurant?.secondary_color || 'var(--restaurant-secondary-color)' }}
                                                            onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                                                            aria-label="Increase quantity"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span
                                                        className="text-xs font-medium rounded-full px-2 py-0.5"
                                                        style={{
                                                            backgroundColor: `${restaurant?.primary_color || 'var(--restaurant-primary-color)'}10`,
                                                            color: restaurant?.primary_color || 'var(--restaurant-primary-color)'
                                                        }}
                                                    >
                                                        Item total: ${(item.price * item.quantity).toFixed(2)}
                                                    </span>
                                                    <button
                                                        onClick={() => removeItem(item.menuItemId)}
                                                        className="text-xs text-gray-500 hover:text-red-500"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div className="h-full flex items-center justify-center">
                                        <div className="text-center">
                                            <ShoppingCart
                                                size={48}
                                                className="mx-auto mb-4"
                                                style={{ color: restaurant?.primary_color || 'var(--restaurant-primary-color)' }}
                                            />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                                            <p className="text-gray-500">Browse the menu and add some items!</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {cart && cart.items.length > 0 && (
                                <div className="border-t border-gray-200 p-4">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span
                                            className="font-bold text-lg"
                                            style={{ color: restaurant?.primary_color || 'var(--restaurant-primary-color)' }}
                                        >
                                            ${cart.subtotal.toFixed(2)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-4">Taxes and delivery fees calculated at checkout</p>
                                    <Link
                                        href={`/menu/cart${tableId ? `?table=${tableId}` : ''}`}
                                        className="block w-full py-3 text-center text-white font-medium rounded-lg hover:opacity-90 transition-all shadow-sm"
                                        style={{
                                            background: `linear-gradient(to right, ${restaurant?.primary_color || 'var(--restaurant-primary-color)'}, ${restaurant?.primary_color ? restaurant.primary_color + 'dd' : 'var(--restaurant-primary-color-light)'})`
                                        }}
                                    >
                                        Proceed to Checkout
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="fixed bottom-0 left-0 right-0 z-20 md:hidden">
                {cart && cart.itemCount > 0 && (
                    <Link
                        href={`/menu/cart${tableId ? `?table=${tableId}` : ''}`}
                        className="flex items-center justify-center py-3 shadow-lg"
                        style={{
                            background: `linear-gradient(to right, ${restaurant?.primary_color || 'var(--restaurant-primary-color)'}, ${restaurant?.primary_color ? restaurant.primary_color + 'dd' : 'var(--restaurant-primary-color-light)'})`,
                            color: 'white'
                        }}
                    >
                        <ShoppingCart size={16} className="mr-2" />
                        View Cart ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})
                        <span className="ml-2 font-bold">${cart.subtotal.toFixed(2)}</span>
                    </Link>
                )}
            </div>
        </div>
    );
}

function MenuBrowseLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-beige">
            <div className="w-16 h-16 border-4 border-restaurant-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}

export default function MenuBrowsePage() {
    return (
        <Suspense fallback={<MenuBrowseLoading />}>
            <MenuContent />
        </Suspense>
    );
} 