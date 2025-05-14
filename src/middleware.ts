import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    // Get the pathname
    const path = request.nextUrl.pathname;

    // Define paths that require authentication
    const adminProtectedPaths = [
        '/admin/dashboard',
        '/admin/orders',
        '/admin/menu',
        '/admin/users',
        '/admin/contact-submissions',
        '/admin/settings',
        '/admin/blog',
        '/admin/faqs',
        '/admin/support-tickets',
        '/admin/packages',
        '/admin/notices',
        '/admin/reviews',
        '/admin/pages',
        '/admin/subscriptions'
    ];

    // Check if current path requires admin authentication
    const isAdminProtectedPath = adminProtectedPaths.some(protectedPath =>
        path.startsWith(protectedPath)
    );

    // Handle admin-specific routes
    if (isAdminProtectedPath && !path.includes('/admin/login')) {
        // Check for either next-auth token or admin_email cookie
        const authCookie = request.cookies.get('next-auth.session-token')?.value;
        const adminEmailCookie = request.cookies.get('admin_email')?.value;

        // Get user data from localStorage if available (client-side only, won't work in middleware)
        let hasAuth = false;

        // If either auth cookie is present, allow access
        if (authCookie || adminEmailCookie) {
            hasAuth = true;
        }

        // If no auth cookie, redirect to admin login
        if (!hasAuth) {
            const url = new URL('/admin/login', request.url);
            url.searchParams.set('callbackUrl', path);
            return NextResponse.redirect(url);
        }
    }

    // Handle API routes that require authentication
    if (path.startsWith('/api/') &&
        (path.includes('/admin/') || path.includes('/contact/submissions'))) {

        // Skip auth check for uploadthing routes
        if (path.includes('/api/uploadthing')) {
            return NextResponse.next();
        }

        // Check for either next-auth token or admin_email cookie
        const authCookie = request.cookies.get('next-auth.session-token')?.value;
        const adminEmailCookie = request.cookies.get('admin_email')?.value;

        // If neither auth cookie is present, return 403
        if (!authCookie && !adminEmailCookie) {
            return NextResponse.json(
                { error: 'Unauthorized - Please login again' },
                { status: 403 }
            );
        }
    }

    return NextResponse.next();
}

// Configure which paths the middleware applies to
export const config = {
    matcher: [
        '/admin/:path*',
        '/api/admin/:path*',
        '/api/contact/submissions/:path*',
    ],
}; 