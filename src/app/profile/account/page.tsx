"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import SEO from "@/components/SEO";
import { User, Mail, Building, MapPin, Check, Save, Edit } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface AccountForm {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    companyName: string;
    industry: string;
}

export default function AccountPage() {
    const { user, loading, isAuthenticated, updateUserProfile } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [form, setForm] = useState<AccountForm>({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        companyName: "",
        industry: "",
    });

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            // Fetch extended profile from API or use cached user data
            const fetchProfile = async () => {
                try {
                    const response = await fetch(`/api/users/${user.id}/profile`);
                    if (response.ok) {
                        const profileData = await response.json();
                        setForm({
                            name: user.name || "",
                            email: user.email || "",
                            phone: profileData.phone || "",
                            address: profileData.address || "",
                            city: profileData.city || "",
                            state: profileData.state || "",
                            zipCode: profileData.zipCode || "",
                            country: profileData.country || "",
                            companyName: profileData.companyName || "",
                            industry: profileData.industry || "",
                        });
                    } else {
                        // If no profile data, use available user data
                        setForm({
                            name: user.name || "",
                            email: user.email || "",
                            phone: "",
                            address: "",
                            city: "",
                            state: "",
                            zipCode: "",
                            country: "",
                            companyName: "",
                            industry: "",
                        });
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    setForm({
                        name: user.name || "",
                        email: user.email || "",
                        phone: "",
                        address: "",
                        city: "",
                        state: "",
                        zipCode: "",
                        country: "",
                        companyName: "",
                        industry: "",
                    });
                }
            };

            fetchProfile();

            // For development, use mock data if needed
            if (process.env.NODE_ENV === 'development') {
                setForm({
                    name: user.name || "John Doe",
                    email: user.email || "john@example.com",
                    phone: "+1 (555) 123-4567",
                    address: "123 Main Street",
                    city: "New York",
                    state: "NY",
                    zipCode: "10001",
                    country: "United States",
                    companyName: "Acme Restaurant",
                    industry: "Food & Beverage",
                });
            }
        }
    }, [user]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

    // Handle form change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isEditing) {
            setIsEditing(true);
            return;
        }

        setIsSaving(true);

        try {
            // Update user profile through API
            const response = await fetch(`/api/users/${user?.id}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });

            if (response.ok) {
                // Update local auth context if needed
                if (updateUserProfile) {
                    updateUserProfile({
                        name: form.name,
                        email: form.email,
                    });
                }

                toast({
                    title: "Profile Updated",
                    description: "Your account information has been updated successfully.",
                    type: "success",
                });

                setIsEditing(false);
            } else {
                toast({
                    title: "Update Failed",
                    description: "There was a problem updating your profile. Please try again.",
                    type: "error",
                });
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({
                title: "Update Failed",
                description: "There was a problem updating your profile. Please try again.",
                type: "error",
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || !isAuthenticated) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <>
            <SEO
                title="My Account | Client Portal | Snytra"
                description="Manage your personal and company information."
                ogImage="/images/client-portal.jpg"
            />

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-charcoal">My Account</h1>
                <p className="text-charcoal/70 mt-1">Manage your personal and company information</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-charcoal flex items-center">
                        <User className="mr-2 h-5 w-5 text-primary" />
                        Account Information
                    </h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Information Section */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium text-charcoal">Personal Information</h3>

                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-charcoal mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        readOnly={!isEditing}
                                        className={`w-full rounded-md border ${isEditing ? 'border-gray-300' : 'border-transparent bg-beige/30'
                                            } px-3 py-2 focus:outline-none ${isEditing ? 'focus:ring-2 focus:ring-primary/50 focus:border-primary' : ''
                                            }`}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        readOnly={true} // Email should typically not be editable
                                        className="w-full rounded-md border border-transparent bg-beige/30 px-3 py-2 focus:outline-none"
                                    />
                                    <p className="mt-1 text-xs text-charcoal/60">Contact support to change your email address</p>
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-charcoal mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        readOnly={!isEditing}
                                        className={`w-full rounded-md border ${isEditing ? 'border-gray-300' : 'border-transparent bg-beige/30'
                                            } px-3 py-2 focus:outline-none ${isEditing ? 'focus:ring-2 focus:ring-primary/50 focus:border-primary' : ''
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* Company Information Section */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-medium text-charcoal">Company Information</h3>

                                <div>
                                    <label htmlFor="companyName" className="block text-sm font-medium text-charcoal mb-1">
                                        Company Name
                                    </label>
                                    <input
                                        type="text"
                                        id="companyName"
                                        name="companyName"
                                        value={form.companyName}
                                        onChange={handleChange}
                                        readOnly={!isEditing}
                                        className={`w-full rounded-md border ${isEditing ? 'border-gray-300' : 'border-transparent bg-beige/30'
                                            } px-3 py-2 focus:outline-none ${isEditing ? 'focus:ring-2 focus:ring-primary/50 focus:border-primary' : ''
                                            }`}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="industry" className="block text-sm font-medium text-charcoal mb-1">
                                        Industry
                                    </label>
                                    <select
                                        id="industry"
                                        name="industry"
                                        value={form.industry}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className={`w-full rounded-md border ${isEditing ? 'border-gray-300' : 'border-transparent bg-beige/30'
                                            } px-3 py-2 focus:outline-none ${isEditing ? 'focus:ring-2 focus:ring-primary/50 focus:border-primary' : ''
                                            }`}
                                    >
                                        <option value="">Select Industry</option>
                                        <option value="Food & Beverage">Food & Beverage</option>
                                        <option value="Hospitality">Hospitality</option>
                                        <option value="Retail">Retail</option>
                                        <option value="Healthcare">Healthcare</option>
                                        <option value="Education">Education</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Address Section */}
                        <div className="mt-8">
                            <h3 className="text-lg font-medium text-charcoal mb-6">Address Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-charcoal mb-1">
                                        Street Address
                                    </label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        readOnly={!isEditing}
                                        className={`w-full rounded-md border ${isEditing ? 'border-gray-300' : 'border-transparent bg-beige/30'
                                            } px-3 py-2 focus:outline-none ${isEditing ? 'focus:ring-2 focus:ring-primary/50 focus:border-primary' : ''
                                            }`}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-charcoal mb-1">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={form.city}
                                        onChange={handleChange}
                                        readOnly={!isEditing}
                                        className={`w-full rounded-md border ${isEditing ? 'border-gray-300' : 'border-transparent bg-beige/30'
                                            } px-3 py-2 focus:outline-none ${isEditing ? 'focus:ring-2 focus:ring-primary/50 focus:border-primary' : ''
                                            }`}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="state" className="block text-sm font-medium text-charcoal mb-1">
                                        State / Province
                                    </label>
                                    <input
                                        type="text"
                                        id="state"
                                        name="state"
                                        value={form.state}
                                        onChange={handleChange}
                                        readOnly={!isEditing}
                                        className={`w-full rounded-md border ${isEditing ? 'border-gray-300' : 'border-transparent bg-beige/30'
                                            } px-3 py-2 focus:outline-none ${isEditing ? 'focus:ring-2 focus:ring-primary/50 focus:border-primary' : ''
                                            }`}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="zipCode" className="block text-sm font-medium text-charcoal mb-1">
                                        ZIP / Postal Code
                                    </label>
                                    <input
                                        type="text"
                                        id="zipCode"
                                        name="zipCode"
                                        value={form.zipCode}
                                        onChange={handleChange}
                                        readOnly={!isEditing}
                                        className={`w-full rounded-md border ${isEditing ? 'border-gray-300' : 'border-transparent bg-beige/30'
                                            } px-3 py-2 focus:outline-none ${isEditing ? 'focus:ring-2 focus:ring-primary/50 focus:border-primary' : ''
                                            }`}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="country" className="block text-sm font-medium text-charcoal mb-1">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        id="country"
                                        name="country"
                                        value={form.country}
                                        onChange={handleChange}
                                        readOnly={!isEditing}
                                        className={`w-full rounded-md border ${isEditing ? 'border-gray-300' : 'border-transparent bg-beige/30'
                                            } px-3 py-2 focus:outline-none ${isEditing ? 'focus:ring-2 focus:ring-primary/50 focus:border-primary' : ''
                                            }`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="bg-beige/30 px-6 py-4 flex justify-end">
                        {isEditing ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="mr-4 px-4 py-2 border border-gray-300 rounded-md text-charcoal hover:bg-gray-50 transition-colors"
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70"
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </>
                        ) : (
                            <button
                                type="submit"
                                className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Profile
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </>
    );
} 