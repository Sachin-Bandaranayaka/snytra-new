"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import SEO from "@/components/SEO";
import Link from "next/link";
import { AlertCircle, CheckCircle, Database, Plus, Calendar } from "lucide-react";

interface StaffMember {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    hiring_date: string;
    phone?: string;
}

export default function StaffManagementPage() {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Form state for new staff member
    const [newStaffMember, setNewStaffMember] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "waiter", // Default role
        phone: "",
        is_active: true
    });

    useEffect(() => {
        // Redirect if not authenticated
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated && user) {
            // Fetch staff members
            fetchStaffMembers();
        }
    }, [user, isAuthenticated]);

    const fetchStaffMembers = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/dashboard/staff`);
            if (response.ok) {
                const data = await response.json();
                setStaffMembers(data.staff);
            } else {
                const error = await response.json();
                setErrorMessage(error.message || "Failed to fetch staff members");
            }
        } catch (error) {
            console.error("Error fetching staff members:", error);
            setErrorMessage("An error occurred while fetching staff members");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;

        setNewStaffMember(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const validateForm = () => {
        if (!newStaffMember.name.trim()) {
            setErrorMessage("Name is required");
            return false;
        }

        if (!newStaffMember.email.trim()) {
            setErrorMessage("Email is required");
            return false;
        }

        if (!newStaffMember.password) {
            setErrorMessage("Password is required");
            return false;
        }

        if (newStaffMember.password.length < 8) {
            setErrorMessage("Password must be at least 8 characters");
            return false;
        }

        if (newStaffMember.password !== newStaffMember.confirmPassword) {
            setErrorMessage("Passwords do not match");
            return false;
        }

        return true;
    };

    const handleCreateStaff = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setIsCreating(true);
            setErrorMessage("");

            const response = await fetch('/api/dashboard/staff', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newStaffMember.name,
                    email: newStaffMember.email,
                    password: newStaffMember.password,
                    role: newStaffMember.role,
                    phone: newStaffMember.phone,
                    is_active: newStaffMember.is_active
                }),
            });

            if (response.ok) {
                const data = await response.json();
                // Add new staff member to the list
                setStaffMembers(prev => [...prev, data.staff]);
                // Reset form
                setNewStaffMember({
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    role: "waiter",
                    phone: "",
                    is_active: true
                });
                setShowCreateForm(false);
                setSuccessMessage("Staff member created successfully");

                // Clear success message after 3 seconds
                setTimeout(() => {
                    setSuccessMessage("");
                }, 3000);
            } else {
                const error = await response.json();
                setErrorMessage(error.message || "Failed to create staff member");
            }
        } catch (error) {
            console.error("Error creating staff member:", error);
            setErrorMessage("An error occurred while creating staff member");
        } finally {
            setIsCreating(false);
        }
    };

    const handleToggleActive = async (id: number, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/dashboard/staff/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    is_active: !currentStatus
                }),
            });

            if (response.ok) {
                // Update the local state
                setStaffMembers(prev =>
                    prev.map(staff =>
                        staff.id === id
                            ? { ...staff, is_active: !currentStatus }
                            : staff
                    )
                );
                setSuccessMessage(`Staff member ${currentStatus ? 'deactivated' : 'activated'} successfully`);

                // Clear success message after 3 seconds
                setTimeout(() => {
                    setSuccessMessage("");
                }, 3000);
            } else {
                const error = await response.json();
                setErrorMessage(error.message || `Failed to ${currentStatus ? 'deactivate' : 'activate'} staff member`);
            }
        } catch (error) {
            console.error("Error toggling staff active status:", error);
            setErrorMessage("An error occurred while updating staff member");
        }
    };

    const handleDeleteStaff = async (id: number) => {
        if (!confirm("Are you sure you want to delete this staff member? This action cannot be undone.")) {
            return;
        }

        try {
            const response = await fetch(`/api/dashboard/staff/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Remove from local state
                setStaffMembers(prev => prev.filter(staff => staff.id !== id));
                setSuccessMessage("Staff member deleted successfully");

                // Clear success message after 3 seconds
                setTimeout(() => {
                    setSuccessMessage("");
                }, 3000);
            } else {
                const error = await response.json();
                setErrorMessage(error.message || "Failed to delete staff member");
            }
        } catch (error) {
            console.error("Error deleting staff member:", error);
            setErrorMessage("An error occurred while deleting staff member");
        }
    };

    const getRoleBadgeClass = (role: string) => {
        switch (role.toLowerCase()) {
            case 'manager':
                return 'bg-purple-100 text-purple-800';
            case 'chef':
            case 'kitchen':
                return 'bg-red-100 text-red-800';
            case 'waiter':
                return 'bg-blue-100 text-blue-800';
            case 'host':
            case 'hostess':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <SEO
                title="Staff Management | RestaurantOS"
                description="Manage your restaurant staff and their roles."
                ogImage="/images/staff-management-banner.jpg"
            />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
                    <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-900">
                        ← Back to Dashboard
                    </Link>
                </div>

                {errorMessage && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                        <p>{errorMessage}</p>
                    </div>
                )}

                {successMessage && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
                        <p>{successMessage}</p>
                    </div>
                )}

                <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
                    <div className="p-6 flex justify-between items-center border-b border-gray-200">
                        <h2 className="text-xl font-semibold">Staff Members</h2>
                        <button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {showCreateForm ? 'Cancel' : 'Add Staff Member'}
                        </button>
                    </div>

                    {showCreateForm && (
                        <div className="p-6 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-medium mb-4">Create New Staff Member</h3>
                            <form onSubmit={handleCreateStaff} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                            Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            required
                                            value={newStaffMember.name}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            value={newStaffMember.email}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                            Password <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            value={newStaffMember.password}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Password must be at least 8 characters
                                        </p>
                                    </div>

                                    <div>
                                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                            Confirm Password <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            required
                                            value={newStaffMember.confirmPassword}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                            Role <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="role"
                                            name="role"
                                            required
                                            value={newStaffMember.role}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="manager">Manager</option>
                                            <option value="chef">Chef</option>
                                            <option value="waiter">Waiter</option>
                                            <option value="host">Host/Hostess</option>
                                            <option value="bartender">Bartender</option>
                                            <option value="kitchen">Kitchen Staff</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone
                                        </label>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={newStaffMember.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            id="is_active"
                                            name="is_active"
                                            type="checkbox"
                                            checked={newStaffMember.is_active}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                                            Active
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateForm(false)}
                                        className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreating}
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                    >
                                        {isCreating ? 'Creating...' : 'Create Staff Member'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="p-6 flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : staffMembers.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Phone
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {staffMembers.map((staff) => (
                                        <tr key={staff.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{staff.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-gray-500">{staff.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeClass(staff.role)}`}>
                                                    {staff.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${staff.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {staff.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                                {staff.phone || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => router.push(`/dashboard/staff/${staff.id}`)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActive(staff.id, staff.is_active)}
                                                    className={staff.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                                                >
                                                    {staff.is_active ? 'Deactivate' : 'Activate'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteStaff(staff.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-6 text-center">
                            <p className="text-gray-500">No staff members found.</p>
                            <p className="text-gray-500 mt-1">Click "Add Staff Member" to create your first staff account.</p>
                        </div>
                    )}
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold">Staff Login Information</h2>
                    </div>
                    <div className="p-6">
                        <div className="rounded-md bg-blue-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3 flex-1 md:flex md:justify-between">
                                    <p className="text-sm text-blue-700">
                                        Staff members can log in at <span className="font-medium">{process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/staff/login</span> using their email address and password.
                                    </p>
                                    <p className="mt-3 text-sm md:mt-0 md:ml-6">
                                        <Link href="/staff/login" target="_blank" className="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600">
                                            View login page <span aria-hidden="true">&rarr;</span>
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            <h3 className="text-lg font-medium">Staff Roles and Permissions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-medium text-indigo-700">Manager</h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Full access to all restaurant operations, including staff management, menu management, and reports.
                                    </p>
                                </div>
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-medium text-red-700">Chef / Kitchen Staff</h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Access to kitchen display system, order preparation, and inventory management.
                                    </p>
                                </div>
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-medium text-blue-700">Waiter</h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Access to order-taking interface, table management, and bill generation.
                                    </p>
                                </div>
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-medium text-green-700">Host/Hostess</h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Access to reservation and waitlist management, table assignments.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 