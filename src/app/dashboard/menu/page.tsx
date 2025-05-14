"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Plus,
    Edit,
    Trash2,
    Search,
    FolderPlus,
    Tag,
    Utensils,
    X
} from 'lucide-react';

interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    category_id: number;
    image_url: string | null;
    is_available: boolean;
}

interface Category {
    id: number;
    name: string;
    is_active: boolean;
}

// Mock data for initial UI rendering
const mockCategories: Category[] = [
    { id: 1, name: 'Appetizers', is_active: true },
    { id: 2, name: 'Main Courses', is_active: true },
    { id: 3, name: 'Desserts', is_active: true },
    { id: 4, name: 'Beverages', is_active: false }
];

const mockMenuItems: MenuItem[] = [
    {
        id: 1,
        name: 'Garlic Bread',
        description: 'Freshly baked bread with garlic butter',
        price: 5.99,
        category_id: 1,
        image_url: 'https://placehold.co/100x100',
        is_available: true
    },
    {
        id: 2,
        name: 'Mozzarella Sticks',
        description: 'Crispy fried mozzarella sticks with marinara sauce',
        price: 7.99,
        category_id: 1,
        image_url: 'https://placehold.co/100x100',
        is_available: true
    },
    {
        id: 3,
        name: 'Spaghetti Bolognese',
        description: 'Classic Italian pasta with rich meat sauce',
        price: 12.99,
        category_id: 2,
        image_url: 'https://placehold.co/100x100',
        is_available: true
    },
    {
        id: 4,
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake with fudge frosting',
        price: 6.99,
        category_id: 3,
        image_url: 'https://placehold.co/100x100',
        is_available: true
    },
    {
        id: 5,
        name: 'Soda',
        description: 'Assorted carbonated beverages',
        price: 2.49,
        category_id: 4,
        image_url: 'https://placehold.co/100x100',
        is_available: true
    }
];

export default function MenuPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Fetch real data from API
        async function fetchMenuData() {
            try {
                const response = await fetch('/api/dashboard/menu');
                if (!response.ok) {
                    throw new Error(`Failed to fetch menu data: ${response.status}`);
                }
                const data = await response.json();

                if (data.success) {
                    setCategories(data.categories);
                    setMenuItems(data.menuItems);

                    if (data.categories.length > 0) {
                        setActiveCategory(data.categories[0].id);
                    }
                } else {
                    throw new Error(data.error || 'Failed to fetch menu data');
                }
            } catch (err: any) {
                console.error('Error fetching menu data:', err);
                setError(err.message || 'Failed to fetch menu data');

                // Fallback to mock data if API fails
                setCategories(mockCategories);
                setMenuItems(mockMenuItems);

                if (mockCategories.length > 0) {
                    setActiveCategory(mockCategories[0].id);
                }
            } finally {
                setLoading(false);
            }
        }

        fetchMenuData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const handleCategoryClick = (categoryId: number) => {
        setActiveCategory(categoryId);
    };

    const filteredItems = menuItems.filter(item => {
        const matchesCategory = activeCategory === null || item.category_id === activeCategory;
        const matchesSearch = searchQuery === '' ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    const getCategoryName = (categoryId: number) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.name : 'Uncategorized';
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) {
            setError('Category name cannot be empty');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/dashboard/menu/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newCategoryName.trim(),
                    is_active: true
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to add category');
            }

            if (!data.success) {
                throw new Error(data.error || 'Failed to add category');
            }

            // Add the new category to the state
            setCategories([...categories, data.category]);
            setNewCategoryName('');
            setShowAddCategoryModal(false);
        } catch (err: any) {
            console.error('Error adding category:', err);
            setError(err.message || 'Failed to add category');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-charcoal">Menu Management</h1>
                <div className="flex gap-2">
                    <Link
                        href="/dashboard/menu/new"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none"
                    >
                        <Plus size={16} className="mr-1" />
                        Add Menu Item
                    </Link>
                </div>
            </div>

            {error && (
                <div className="my-4 bg-beige border-l-4 border-primary text-primary p-4">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Categories Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg border border-lightGray shadow-sm overflow-hidden">
                        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-lightGray">
                            <h3 className="text-lg font-medium text-charcoal">Categories</h3>
                            <button
                                onClick={() => setShowAddCategoryModal(true)}
                                className="p-1 rounded-full text-primary hover:bg-beige"
                                title="Add category"
                            >
                                <FolderPlus size={20} />
                            </button>
                        </div>
                        <div className="divide-y divide-lightGray">
                            <button
                                onClick={() => setActiveCategory(null)}
                                className={`w-full px-4 py-3 flex items-center ${activeCategory === null
                                    ? 'bg-beige text-primary'
                                    : 'hover:bg-beige text-darkGray'
                                    }`}
                            >
                                <Tag size={16} className="mr-2" />
                                <span className="text-left font-medium">All Items</span>
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => handleCategoryClick(category.id)}
                                    className={`w-full px-4 py-3 flex items-center justify-between ${activeCategory === category.id
                                        ? 'bg-beige text-primary'
                                        : 'hover:bg-beige text-darkGray'
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <Utensils size={16} className="mr-2" />
                                        <span className="text-left font-medium">{category.name}</span>
                                    </div>
                                    {!category.is_active && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-lightGray text-darkGray">
                                            Inactive
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-lg border border-lightGray shadow-sm overflow-hidden">
                        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-lightGray">
                            <h3 className="text-lg font-medium text-charcoal">
                                {activeCategory === null ? 'All Menu Items' : `${getCategoryName(activeCategory)} Items`}
                            </h3>

                            {/* Search box */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={16} className="text-darkGray" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-lightGray rounded-md leading-5 bg-white placeholder-darkGray focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                    placeholder="Search items..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {filteredItems.length === 0 ? (
                            <div className="px-4 py-10 text-center">
                                <Utensils size={40} className="mx-auto text-darkGray mb-3" />
                                <p className="text-darkGray mb-2">No menu items found</p>
                                <p className="text-darkGray text-sm">
                                    {searchQuery ? 'Try a different search term' : 'Add your first menu item'}
                                </p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-lightGray">
                                {filteredItems.map((item) => (
                                    <li key={item.id} className="px-4 py-4 sm:px-6 hover:bg-beige">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                {item.image_url ? (
                                                    <img
                                                        src={item.image_url}
                                                        alt={item.name}
                                                        className="h-12 w-12 rounded-md object-cover mr-4"
                                                    />
                                                ) : (
                                                    <div className="h-12 w-12 rounded-md bg-lightGray flex items-center justify-center mr-4">
                                                        <Utensils size={20} className="text-darkGray" />
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="text-md font-medium text-charcoal flex items-center">
                                                        {item.name}
                                                        {!item.is_available && (
                                                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                                Unavailable
                                                            </span>
                                                        )}
                                                    </h4>
                                                    <div className="flex items-center text-sm text-darkGray mt-0.5">
                                                        <span className="font-medium text-charcoal">{formatCurrency(item.price)}</span>
                                                        <span className="mx-2">•</span>
                                                        <span>{getCategoryName(item.category_id)}</span>
                                                    </div>
                                                    <p className="text-sm text-darkGray mt-1 line-clamp-1">{item.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Link
                                                    href={`/dashboard/menu/edit/${item.id}`}
                                                    className="p-2 text-darkGray hover:text-primary hover:bg-primary/10 rounded-full"
                                                    title="Edit item"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                                <button
                                                    className="p-2 text-darkGray hover:text-primary hover:bg-primary/10 rounded-full"
                                                    title="Delete item"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Category Modal */}
            {showAddCategoryModal && (
                <div className="fixed inset-0 bg-charcoal/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
                        <div className="px-4 pt-5 pb-4 sm:p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-charcoal">Add New Category</h3>
                                <button
                                    onClick={() => setShowAddCategoryModal(false)}
                                    className="p-1 rounded-full text-darkGray hover:text-primary"
                                    type="button"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="mt-2">
                                <label htmlFor="category-name" className="block text-sm font-medium text-darkGray">
                                    Category Name
                                </label>
                                <input
                                    type="text"
                                    name="category-name"
                                    id="category-name"
                                    className="mt-1 block w-full px-3 py-2 border border-lightGray rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                                    placeholder="Enter category name"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="px-4 py-3 bg-beige sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="button"
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary/90 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                                onClick={handleAddCategory}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Adding...' : 'Add Category'}
                            </button>
                            <button
                                type="button"
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-lightGray shadow-sm px-4 py-2 bg-white text-base font-medium text-darkGray hover:bg-beige focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                onClick={() => setShowAddCategoryModal(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 