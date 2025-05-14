"use client";

import { createContext, useContext, ReactNode } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

// Define user type
export interface UserProfile {
    id?: string;
    name?: string;
    email?: string;
    emailVerified?: boolean;
    image?: string;
    role?: string;
    [key: string]: any;
}

// Define auth context type
interface AuthContextType {
    user: UserProfile | null;
    loading: boolean;
    isAuthenticated: boolean;
    signOut: () => Promise<void>;
    updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

// Create auth context
const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAuthenticated: false,
    signOut: async () => { },
    updateUserProfile: async () => { },
});

// Auth provider props
interface AuthProviderProps {
    children: ReactNode;
}

// Export the provider
export function AuthProvider({ children }: AuthProviderProps) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const loading = status === "loading";

    // Sign out function
    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.push('/login');
    };

    // Update user profile function
    const updateUserProfile = async (data: Partial<UserProfile>) => {
        try {
            // In a real implementation, you would update the user profile via an API
            console.log("Update user profile:", data);
            // Example API call:
            // await fetch('/api/user/profile', {
            //   method: 'PATCH',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(data)
            // });
        } catch (error) {
            console.error("Error updating user profile:", error);
            throw error;
        }
    };

    const value = {
        user: session?.user as UserProfile | null,
        loading,
        isAuthenticated: !!session?.user,
        signOut: handleSignOut,
        updateUserProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Export the hook
export function useAuth() {
    return useContext(AuthContext);
} 