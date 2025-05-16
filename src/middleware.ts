import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that should be accessible even in maintenance mode
const ALLOWED_PATHS = [
    '/api/settings',
    '/api/auth',
    '/api/maintenance-status',
    '/admin',
    '/login',
    '/auth',
    '/maintenance'
];

// Check if a path should be allowed during maintenance mode
function isAllowedPath(path: string): boolean {
    return ALLOWED_PATHS.some(allowedPath => path.startsWith(allowedPath));
}

// Check if user is an admin based on cookies
function isAdmin(request: NextRequest): boolean {
    // This is a simplified check. In a real app, you'd verify the session
    // and check if the user has admin permissions
    const sessionToken = request.cookies.get('next-auth.session-token')?.value;
    const adminEmailCookie = request.cookies.get('admin_email')?.value;

    return !!sessionToken || !!adminEmailCookie;
}

export async function middleware(request: NextRequest) {
    // Check if we're in maintenance mode
    try {
        // Skip maintenance mode check for allowed paths
        if (isAllowedPath(request.nextUrl.pathname)) {
            return NextResponse.next();
        }

        // Get maintenance mode status from a cookie instead of the database
        const maintenanceCookie = request.cookies.get('maintenance_mode')?.value;
        const isMaintenanceMode = maintenanceCookie === 'true';

        // If maintenance mode is enabled and user is not an admin
        if (isMaintenanceMode && !isAdmin(request)) {
            // Redirect to maintenance page
            return NextResponse.rewrite(new URL('/maintenance', request.url));
        }
    } catch (error) {
        console.error('Error in middleware:', error);
        // In case of error, allow the request to proceed to avoid blocking the site
    }

    return NextResponse.next();
}

// Only run middleware on specific paths
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
}; 