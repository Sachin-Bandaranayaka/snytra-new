'use client';

import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

// Interface to match the old useAuth hook's return type
interface AuthContextType {
    user: any | null;
    loading: boolean;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

// Create a hook that mimics the old useAuth hook but uses NextAuth
export function useAuth(): AuthContextType {
    const { data: session, status } = useSession();
    const router = useRouter();
    const loading = status === 'loading';
    const isAuthenticated = !!session?.user;

    // Logout function
    const logout = async () => {
        try {
            await signOut({ redirect: false });
            router.push('/login');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return {
        user: session?.user || null,
        loading,
        logout,
        isAuthenticated
    };
} 