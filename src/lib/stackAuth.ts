/**
 * This file provides compatibility functions for auth functionality
 */
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * Gets the current user from NextAuth
 */
export async function getAuthUser() {
    try {
        const session = await getServerSession(authOptions);
        return session;
    } catch (error) {
        console.error('Error getting user from NextAuth:', error);
        return null;
    }
}

/**
 * Checks if the current user is an admin
 */
export async function isAdmin() {
    const session = await getAuthUser();
    return session?.user?.role === 'admin';
}

/**
 * Checks if the current user is staff
 */
export async function isStaff() {
    const session = await getAuthUser();
    return session?.user?.role === 'staff' || session?.user?.role === 'admin';
}

/**
 * Checks if the current user is authenticated
 */
export async function isAuthenticated() {
    const session = await getAuthUser();
    return !!session?.user;
} 