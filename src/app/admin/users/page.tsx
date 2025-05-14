"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
    subscription_plan?: string;
    subscription_status?: string;
}

export default function UsersManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Fetch users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/users');
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }

                const data = await response.json();
                setUsers(data.users || []);
                setFilteredUsers(data.users || []);
                setLoading(false);
            } catch (err) {
                setError('Failed to load users. Please try again.');
                setLoading(false);
                console.error('Error fetching users:', err);
            }
        };

        fetchUsers();
    }, []);

    // Apply filters
    useEffect(() => {
        let result = [...users];

        if (roleFilter !== 'all') {
            result = result.filter(user => user.role === roleFilter);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                user =>
                    user.name.toLowerCase().includes(query) ||
                    user.email.toLowerCase().includes(query)
            );
        }

        setFilteredUsers(result);
    }, [users, roleFilter, searchQuery]);

    // Handle user status change
    const handleRoleChange = async (userId: number, newRole: string) => {
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role: newRole
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update user role');
            }

            // Update in UI
            setUsers(users.map(user =>
                user.id === userId
                    ? { ...user, role: newRole }
                    : user
            ));

            alert('User role updated successfully');
        } catch (err) {
            console.error('Error updating user role:', err);
            alert('Failed to update user role. Please try again.');
        }
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Users Management</h1>
                    <p className="text-gray-600">Manage user accounts and permissions</p>
                </div>
                <Link
                    href="/admin/users/new"
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                    Add New User
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1">
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                            Search
                        </label>
                        <input
                            type="text"
                            id="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="roleFilter" className="block text-sm font-medium text-gray-700 mb-1">
                            Role
                        </label>
                        <select
                            id="roleFilter"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="staff">Staff</option>
                            <option value="user">User</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    {error}
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center p-8 bg-white rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                    <p className="text-gray-500">Try adjusting your filters or add a new user</p>
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Subscription
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Joined
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                <span className="text-gray-500 font-medium">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin'
                                                ? 'bg-purple-100 text-purple-800'
                                                : user.role === 'staff'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.subscription_plan ? (
                                            <div>
                                                <div className="text-sm text-gray-900">{user.subscription_plan}</div>
                                                <div className={`text-xs ${user.subscription_status === 'active'
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                    }`}>
                                                    {user.subscription_status}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-500">No subscription</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                                        <div className="flex justify-center space-x-3">
                                            <Link
                                                href={`/admin/users/${user.id}`}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Edit
                                            </Link>

                                            <div className="relative inline-block text-left">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                    className="text-sm border-gray-300 rounded-md"
                                                >
                                                    <option value="admin">Admin</option>
                                                    <option value="staff">Staff</option>
                                                    <option value="user">User</option>
                                                </select>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
} 