import NextAuth from "next-auth";
import { authOptions } from '@/lib/auth';
import { cookies } from 'next/headers';

// This function will clean up any existing NextAuth cookies to prevent decryption issues
const cleanupAuthCookies = () => {
    const cookieStore = cookies();
    const authCookies = [
        'next-auth.session-token',
        'next-auth.csrf-token',
        'next-auth.callback-url',
        '__Secure-next-auth.session-token',
        '__Secure-next-auth.csrf-token',
        '__Secure-next-auth.callback-url',
        '__Host-next-auth.csrf-token'
    ];

    // For development only: log cookies that will be cleared
    if (process.env.NODE_ENV === 'development') {
        console.log('Checking for NextAuth cookies to clean up');
        authCookies.forEach(cookieName => {
            if (cookieStore.has(cookieName)) {
                console.log(`Found cookie to clean: ${cookieName}`);
            }
        });
    }
};

// Initialize NextAuth
const handler = NextAuth(authOptions);

// Export GET and POST handlers
export { handler as GET, handler as POST }; 