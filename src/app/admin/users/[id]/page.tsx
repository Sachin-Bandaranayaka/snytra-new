"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserData {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
    updated_at: string;
    subscription_plan?: string;
    subscription_status?: string;
    subscription_current_period_start?: string;
    subscription_current_period_end?: string;
}

export default function EditUser() {
    const params = useParams();
    const userId = params.id as string;
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<UserData | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        password: '',
        confirmPassword: ''
    });

    // Fetch user data
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`/api/users/${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch user');
                }

                const data = await response.json();
                setUser(data.user);
                setFormData({
                    name: data.user.name,
                    email: data.user.email,
                    role: data.user.role,
                    password: '',
                    confirmPassword: ''
                });
                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching user:', err);
                setError('Failed to load user data. Please try again.');
                setIsLoading(false);
            }
        };

        if (userId) {
            fetchUser();
        }
    }, [userId]);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle form submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // Validate passwords if being changed
        if (formData.password && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsSubmitting(false);
            return;
        }

        // Prepare update data
        const updateData: any = {
            name: formData.name,
            email: formData.email,
            role: formData.role
        };

        // Only include password if it's being changed
        if (formData.password) {
            updateData.password = formData.password;
        }

        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update user');
            }

            // Redirect to users list
            router.push('/admin/users');
            router.refresh();
        } catch (err: any) {
            console.error('Error updating user:', err);
            setError(err.message || 'Failed to update user. Please try again.');
            setIsSubmitting(false);
        }
    };

    // Handle user deletion
    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete user');
            }

            router.push('/admin/users');
            router.refresh();
        } catch (err: any) {
            console.error('Error deleting user:', err);
            setError(err.message || 'Failed to delete user. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error && !user) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
                <div className="mt-4">
                    <Link
                        href="/admin/users"
                        className="text-blue-600 hover:text-blue-800"
                    >
                        Back to Users
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">Edit User</h1>
                    <Link
                        href="/admin/users"
                        className="text-blue-600 hover:text-blue-800"
                    >
                        Back to Users
                    </Link>
                </div>
                <p className="text-gray-600">Update user account information</p>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
                    {error}
                </div>
            )}

            <div className="bg-white shadow rounded-lg p-6">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address *
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                            Role *
                        </label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="user">User</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Leave blank to keep current password"
                            minLength={8}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Password must be at least 8 characters long
                        </p>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Leave blank to keep current password"
                            minLength={8}
                        />
                    </div>

                    {user && (
                        <div className="bg-gray-50 p-4 rounded-md mb-6">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Account Information</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500">User ID</p>
                                    <p>{user.id}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Created</p>
                                    <p>{new Date(user.created_at).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Last Updated</p>
                                    <p>{new Date(user.updated_at).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Subscription</p>
                                    <p>{user.subscription_plan || 'No subscription'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Delete User
                        </button>

                        <div className="flex items-center">
                            <Link
                                href="/admin/users"
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
} 