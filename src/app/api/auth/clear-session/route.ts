import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
    // Get all cookies
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();

    // Log which cookies are being deleted
    console.log('Clearing all NextAuth related cookies');

    // Set all cookies to expire
    const response = new NextResponse(
        JSON.stringify({ success: true, message: 'Session cleared' }),
        {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        }
    );

    // Clear all cookies related to NextAuth
    const authCookies = [
        'next-auth.session-token',
        'next-auth.csrf-token',
        'next-auth.callback-url',
        '__Secure-next-auth.session-token',
        '__Secure-next-auth.csrf-token',
        '__Secure-next-auth.callback-url',
        '__Host-next-auth.csrf-token'
    ];

    // Remove each cookie
    authCookies.forEach(name => {
        response.cookies.delete(name);
        console.log(`Deleted cookie: ${name}`);
    });

    return response;
} 