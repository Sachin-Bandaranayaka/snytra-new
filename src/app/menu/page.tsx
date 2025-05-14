"use client";

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { QrCode, ArrowRight, Clock, ShoppingCart, User, Search } from 'lucide-react';
import { useCart } from '@/components/providers/CartProvider';
import { useRestaurant } from '@/components/providers/RestaurantProvider';

interface Table {
    id: number;
    table_number: string;
}

function MenuLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-beige">
            <div className="w-16 h-16 border-4 border-restaurant-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}

function MenuContent() {
    const searchParams = useSearchParams();
    const tableId = searchParams.get('table');
    const { cart } = useCart();
    const { restaurant, loading: restaurantLoading, error: restaurantError, refreshData } = useRestaurant();

    const [table, setTable] = useState<Table | null>(null);
    const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
    const [popularItems, setPopularItems] = useState<{
        id: number;
        name: string;
        description: string;
        price: number;
        image_url: string | null;
        category_id: number;
        category_name?: string;
        is_available: boolean;
        labels?: { [key: string]: boolean };
        review_count?: number;
        average_rating?: number;
        tag?: string;
    }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        // Only fetch data on initial load or tableId change
        if (hasFetchedRef.current && !tableId) return;

        // Refresh restaurant data once when page loads
        refreshData();

        async function fetchData() {
            try {
                // Fetch menu categories
                const categoriesResponse = await fetch('/api/dashboard/menu/categories', {
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    }
                });
                if (categoriesResponse.ok) {
                    const categoriesData = await categoriesResponse.json();
                    const activeCategories = categoriesData.categories
                        .filter((cat: any) => cat.is_active)
                        .slice(0, 3); // Get up to 3 categories for featured display
                    setCategories(activeCategories);
                }

                // Fetch popular menu items
                const popularItemsResponse = await fetch('/api/menu/popular');
                if (popularItemsResponse.ok) {
                    const data = await popularItemsResponse.json();
                    // Add tags based on properties
                    const taggedItems = data.items.map((item: any, index: number) => {
                        let tag = '';

                        // Assign a tag based on item index or properties
                        if (index === 0) tag = 'Best Seller';
                        else if (index === 1) tag = 'Chef\'s Choice';
                        else if (item.labels?.vegetarian || item.labels?.vegan) tag = 'Healthy Choice';
                        else if (item.category_name?.toLowerCase().includes('dessert') ||
                            item.name.toLowerCase().includes('cake') ||
                            item.name.toLowerCase().includes('ice cream')) tag = 'Sweet Treat';
                        else tag = 'Popular';

                        return {
                            ...item,
                            tag
                        };
                    });

                    setPopularItems(taggedItems);
                } else {
                    console.error('Failed to fetch popular items');
                    // Fallback to empty array if fetch fails
                    setPopularItems([]);
                }

                // If table ID is provided, fetch table info
                if (tableId) {
                    const tableResponse = await fetch(`/api/tables/${tableId}`);
                    if (tableResponse.ok) {
                        const tableData = await tableResponse.json();
                        setTable(tableData.table);
                    }
                }
            } catch (err: any) {
                console.error('Error fetching data:', err);
                setError(err.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        }

        fetchData();

        // Mark as fetched after initial load
        hasFetchedRef.current = true;
    }, [tableId, refreshData]);

    if (loading || restaurantLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin"
                    style={{ borderColor: `${restaurant?.primary_color || 'var(--restaurant-primary-color)'} transparent transparent transparent` }}></div>
            </div>
        );
    }

    if (error || restaurantError) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2" style={{ color: restaurant?.primary_color || 'var(--restaurant-primary-color)' }}>Error</h2>
                    <p className="text-gray-600 mb-4">{error || restaurantError}</p>
                    <p className="text-gray-600">Please try again or contact the restaurant.</p>
                </div>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Restaurant Not Found</h2>
                    <p className="text-gray-600">The restaurant information could not be loaded.</p>
                </div>
            </div>
        );
    }

    const primaryColor = restaurant?.primary_color || 'var(--restaurant-primary-color)';
    const secondaryColor = restaurant?.secondary_color || 'var(--restaurant-secondary-color)';

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Main Navigation */}
            <header
                className="sticky top-0 z-10 py-4 px-4 text-white shadow-md"
                style={{
                    background: `linear-gradient(to right, ${primaryColor}, ${primaryColor}dd)`
                }}
            >
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center">
                        {restaurant.logo_url ? (
                            <img
                                src={restaurant.logo_url}
                                alt={restaurant.name}
                                className="h-12 w-12 rounded-full object-cover mr-3 border-2 border-white shadow-sm"
                            />
                        ) : (
                            <div className="h-12 w-12 mr-3 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <span className="font-bold text-xl" style={{ color: primaryColor }}>{restaurant.name.charAt(0)}</span>
                            </div>
                        )}
                        <h1 className="text-xl font-bold hidden md:block">{restaurant.name}</h1>
                    </div>

                    <nav className="hidden md:flex items-center space-x-6">
                        <Link href={`/menu${tableId ? `?table=${tableId}` : ''}`} className="font-medium text-white hover:text-white/80 border-b-2 border-white">
                            Home
                        </Link>
                        <Link href="/about-us" className="font-medium text-white hover:text-white/80">
                            About Us
                        </Link>
                        <Link href={`/menu/browse${tableId ? `?table=${tableId}` : ''}`} className="font-medium text-white hover:text-white/80">
                            Menu
                        </Link>
                        <Link
                            href={`/menu/reservations${tableId ? `?table=${tableId}` : ''}`}
                            className="font-medium text-white hover:text-white/80"
                        >
                            Reservations
                        </Link>
                        <Link
                            href="/menu/waitlist"
                            className="font-medium text-white hover:text-white/80"
                        >
                            Waitlist
                        </Link>
                        <Link
                            href={`/menu/scanner${tableId ? `?table=${tableId}` : ''}`}
                            className="font-medium text-white hover:text-white/80"
                        >
                            <QrCode className="inline-block mr-1 h-4 w-4" /> Scan QR
                        </Link>
                        <Link href="/menu/orders/track" className="font-medium text-white hover:text-white/80">
                            Track Orders
                        </Link>
                        <Link href="/contact-us" className="font-medium text-white hover:text-white/80">
                            Contact Us
                        </Link>
                    </nav>

                    <div className="flex items-center gap-3">
                        {cart && cart.itemCount > 0 && (
                            <Link
                                href={`/menu/cart${tableId ? `?table=${tableId}` : ''}`}
                                className="relative p-2 rounded-full text-white hover:opacity-90 transition-all hover:scale-105 hidden md:flex"
                                style={{
                                    background: `linear-gradient(to right, ${secondaryColor}, ${secondaryColor}dd)`
                                }}
                            >
                                <ShoppingCart size={20} />
                                <span className="absolute -top-1 -right-1 bg-white text-gray-800 rounded-full text-xs font-bold w-5 h-5 flex items-center justify-center shadow-sm">
                                    {cart.itemCount}
                                </span>
                            </Link>
                        )}
                        <Link
                            href="/sign-up"
                            className="px-4 py-2 text-white rounded-md font-medium hover:opacity-90 transition-all hover:scale-105 shadow-sm"
                            style={{
                                background: `linear-gradient(to right, ${secondaryColor}, ${secondaryColor}dd)`
                            }}
                        >
                            Sign Up
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative py-16 flex bg-white">
                <div className="container mx-auto px-4 flex flex-col-reverse md:flex-row items-center justify-center gap-12 md:gap-0">
                    <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
                        <h1 className="text-4xl md:text-5xl font-bold text-charcoal mb-4 leading-tight">
                            Taste the Difference.<br />
                            <span className="text-primary-orange" style={{ color: primaryColor }}>Experience the Flavor.</span>
                        </h1>
                        <p className="text-darkGray mb-8 text-lg">Dine-in, Order, and Reserve Effortlessly.</p>
                        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto justify-center md:justify-start">
                            <Link
                                href={`/menu/browse${tableId ? `?table=${tableId}` : ''}`}
                                className="w-full md:w-auto"
                            >
                                <button className="w-full md:w-auto px-6 py-3 bg-white text-charcoal font-medium rounded-lg border border-lightGray shadow-sm hover:bg-beige transition-all text-base">
                                    View Menu
                                </button>
                            </Link>
                            <Link
                                href={`/menu/reservations${tableId ? `?table=${tableId}` : ''}`}
                                className="w-full md:w-auto"
                            >
                                <button className="w-full md:w-auto px-6 py-3 bg-primary-orange text-white font-medium rounded-lg shadow-sm hover:opacity-90 transition-all text-base" style={{ background: `linear-gradient(to right, ${primaryColor}, ${primaryColor}dd)` }}>
                                    Reserve a Table
                                </button>
                            </Link>
                        </div>
                    </div>
                    <div className="w-full md:w-1/2 flex justify-center items-center mb-8 md:mb-0">
                        <img
                            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                            alt="Restaurant interior"
                            className="rounded-2xl w-full max-w-lg h-auto object-cover shadow-xl border-4 border-white"
                            style={{ maxHeight: "400px" }}
                        />
                    </div>
                </div>
            </section>

            {/* Restaurant Features */}
            <section className="py-16 bg-gradient-to-b from-white to-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-3 text-center text-gray-800">Restaurant Features</h2>
                    <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Experience a new level of dining with our innovative features designed for your convenience</p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100">
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                                style={{ backgroundColor: `${primaryColor}15` }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24" height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ color: primaryColor }}
                                >
                                    <path d="M16 6l4 14"></path><path d="M12 6v14"></path><path d="M8 8v12"></path><path d="M4 4v16"></path>
                                </svg>
                            </div>
                            <h3 className="font-medium text-gray-800 mb-2 text-center">Scan & Order Effortlessly</h3>
                            <p className="text-gray-600 text-sm text-center">Order directly from your table without waiting for service</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100">
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                                style={{ backgroundColor: `${primaryColor}15` }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24" height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ color: primaryColor }}
                                >
                                    <circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle>
                                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                                </svg>
                            </div>
                            <h3 className="font-medium text-gray-800 mb-2 text-center">Secure & Easy Payments</h3>
                            <p className="text-gray-600 text-sm text-center">Pay securely with multiple payment options for your convenience</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100">
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                                style={{ backgroundColor: `${primaryColor}15` }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24" height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ color: primaryColor }}
                                >
                                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                                </svg>
                            </div>
                            <h3 className="font-medium text-gray-800 mb-2 text-center">Earn Loyalty Points</h3>
                            <p className="text-gray-600 text-sm text-center">Get rewarded with every purchase and earn special discounts</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100">
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                                style={{ backgroundColor: `${primaryColor}15` }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24" height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ color: primaryColor }}
                                >
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                            </div>
                            <h3 className="font-medium text-gray-800 mb-2 text-center">Hassle-Free Reservations</h3>
                            <p className="text-gray-600 text-sm text-center">Book your table in advance and skip the wait</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Popular Dishes - Dynamic Version */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <h2
                        className="text-3xl font-bold mb-3 text-center"
                        style={{ color: primaryColor }}
                    >
                        Popular Dishes
                    </h2>
                    <p className="text-center text-gray-600 mb-10">Our most loved creations that keep customers coming back</p>

                    {popularItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            {popularItems.slice(0, 4).map((item) => (
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
                                        {item.tag && (
                                            <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 text-xs font-medium shadow-sm" style={{ color: primaryColor }}>
                                                {item.tag}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-medium text-gray-800">{item.name}</h3>
                                            <span className="text-sm font-bold" style={{ color: primaryColor }}>
                                                ${item.price.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex text-yellow-400 mt-1 mb-2">
                                            {/* Generate stars based on average rating or default to 5 */}
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <span key={i}>{i < (item.average_rating || 5) ? '★' : '☆'}</span>
                                            ))}
                                            {item.review_count !== undefined && (
                                                <span className="text-gray-500 text-xs ml-1">({item.review_count} reviews)</span>
                                            )}
                                        </div>
                                        <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-10">
                            <p className="text-center text-gray-500">Loading popular dishes...</p>
                        </div>
                    )}

                    <div className="text-center">
                        <Link
                            href={`/menu/browse${tableId ? `?table=${tableId}` : ''}`}
                            className="inline-block px-6 py-3 text-white font-medium rounded-lg hover:opacity-90 transition-all shadow-sm"
                            style={{
                                background: `linear-gradient(to right, ${primaryColor}, ${primaryColor}dd)`
                            }}
                        >
                            View Full Menu
                        </Link>
                    </div>
                </div>
            </section>

            {/* Customer Reviews */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2
                        className="text-3xl font-bold mb-3 text-center"
                        style={{ color: primaryColor }}
                    >
                        Customer Reviews
                    </h2>
                    <p className="text-center text-gray-600 mb-10">What our customers are saying about their experience</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100">
                            <div className="flex items-center mb-4">
                                <img
                                    src="https://randomuser.me/api/portraits/men/32.jpg"
                                    alt="Customer"
                                    className="w-12 h-12 rounded-full mr-4 border border-gray-200"
                                />
                                <div>
                                    <h4 className="font-medium text-gray-800">Alex Johnson</h4>
                                    <div className="flex text-yellow-400">
                                        <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-600">"The food here is incredible! The burgers are perfectly cooked and the service is always friendly. I come back at least once a week."</p>
                            <p className="text-gray-400 text-sm mt-3">Visited 2 days ago</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100">
                            <div className="flex items-center mb-4">
                                <img
                                    src="https://randomuser.me/api/portraits/women/44.jpg"
                                    alt="Customer"
                                    className="w-12 h-12 rounded-full mr-4 border border-gray-200"
                                />
                                <div>
                                    <h4 className="font-medium text-gray-800">Sarah Williams</h4>
                                    <div className="flex text-yellow-400">
                                        <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-600">"Amazing place for a family dinner! The kids menu has healthy options that my children actually enjoy. The atmosphere is welcoming and relaxed."</p>
                            <p className="text-gray-400 text-sm mt-3">Visited 1 week ago</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100">
                            <div className="flex items-center mb-4">
                                <img
                                    src="https://randomuser.me/api/portraits/men/67.jpg"
                                    alt="Customer"
                                    className="w-12 h-12 rounded-full mr-4 border border-gray-200"
                                />
                                <div>
                                    <h4 className="font-medium text-gray-800">Michael Chen</h4>
                                    <div className="flex text-yellow-400">
                                        <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-600">"The online ordering system is so convenient. I can place my order ahead of time and it's always ready when I arrive. Love the rewards program too!"</p>
                            <p className="text-gray-400 text-sm mt-3">Visited 3 days ago</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between max-w-4xl mx-auto">
                        <div className="mb-6 md:mb-0">
                            <h3 className="text-2xl font-bold mb-2">Ready to Experience Our Delicious Menu?</h3>
                            <p className="text-gray-300">Browse our menu and place your order in just a few clicks.</p>
                        </div>
                        <div className="flex gap-4">
                            <Link
                                href={`/menu/browse${tableId ? `?table=${tableId}` : ''}`}
                                className="px-6 py-3 text-white font-medium rounded-lg hover:opacity-90 transition-all shadow-sm"
                                style={{
                                    background: `linear-gradient(to right, ${primaryColor}, ${primaryColor}dd)`
                                }}
                            >
                                Browse Menu
                            </Link>
                            <Link
                                href={`/menu/reservations${tableId ? `?table=${tableId}` : ''}`}
                                className="px-6 py-3 bg-white text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition-all shadow-sm"
                            >
                                Make Reservation
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-10 mt-auto">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between mb-10 border-b border-gray-800 pb-10">
                        <div className="mb-8 md:mb-0 md:w-1/3">
                            <div className="flex items-center mb-5">
                                {restaurant.logo_url ? (
                                    <img
                                        src={restaurant.logo_url}
                                        alt={restaurant.name}
                                        className="h-10 w-10 rounded-full object-cover mr-3 border-2 border-gray-700"
                                    />
                                ) : (
                                    <div
                                        className="h-10 w-10 mr-3 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        <span className="text-white font-bold">{restaurant.name.charAt(0)}</span>
                                    </div>
                                )}
                                <span className="text-lg font-bold">{restaurant.name}</span>
                            </div>
                            <p className="text-gray-400 max-w-xs mb-4">Elevating your dining experience with innovative technology and exceptional service.</p>
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:w-2/3">
                            <div>
                                <h5 className="text-white font-medium mb-4">Features</h5>
                                <ul className="space-y-3">
                                    <li><Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">QR Code Ordering</Link></li>
                                    <li><Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Table Reservations</Link></li>
                                    <li><Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Loyalty Program</Link></li>
                                    <li><Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Mobile Ordering</Link></li>
                                </ul>
                            </div>

                            <div>
                                <h5 className="text-white font-medium mb-4">Company</h5>
                                <ul className="space-y-3">
                                    <li><Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">About Us</Link></li>
                                    <li><Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Contact Us</Link></li>
                                    <li><Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
                                    <li><Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</Link></li>
                                    <li><Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Careers</Link></li>
                                </ul>
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <h5 className="text-white font-medium mb-4">Contact</h5>
                                <ul className="space-y-3">
                                    <li className="flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="text-gray-400 text-sm">123 Restaurant Street, Food City, FC 12345</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-gray-400 text-sm">info@restaurant.com</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <span className="text-gray-400 text-sm">(123) 456-7890</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
                        <p>© {new Date().getFullYear()} {restaurant.name}. All rights reserved.</p>
                        <div className="mt-4 md:mt-0">
                            <span className="px-2">Privacy Policy</span>
                            <span className="px-2 border-l border-gray-700">Terms of Service</span>
                            <span className="px-2 border-l border-gray-700">Cookie Policy</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default function MenuLandingPage() {
    return (
        <Suspense fallback={<MenuLoading />}>
            <MenuContent />
        </Suspense>
    );
} 