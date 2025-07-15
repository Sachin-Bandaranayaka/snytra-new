import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that should be accessible even in maintenance mode
const ALLOWED_PATHS = [
    '/api/settings',
    '/api/auth',
    '/api/maintenance-status',
    '/api/uploadthing',
    '/admin',
    '/login',
    '/auth',
    '/maintenance'
];

// Check if a path should be allowed during maintenance mode
function isAllowedPath(path: string): boolean {
    return ALLOWED_PATHS.some(allowedPath => path.startsWith(allowedPath));
}

// Check if user has admin role based on cookies or headers
function isAdmin(request: NextRequest): boolean {
    // Check for admin cookie or header
    const adminCookie = request.cookies.get('user_role')?.value;
    return adminCookie === 'admin' || adminCookie === 'super_admin';
}

export async function middleware(request: NextRequest) {
    try {
        // Skip maintenance check for allowed paths
        if (isAllowedPath(request.nextUrl.pathname)) {
            return NextResponse.next();
        }

        // Get maintenance mode from cookie first
        const maintenanceCookie = request.cookies.get('maintenance_mode')?.value;
        let isMaintenanceMode = maintenanceCookie === 'true';

        // If cookie not present, fetch from API route instead of direct DB access
        if (maintenanceCookie === undefined) {
            try {
                const baseUrl = request.nextUrl.origin;
                const response = await fetch(`${baseUrl}/api/maintenance-status`, {
                    headers: {
                        'cookie': request.headers.get('cookie') || '',
                    },
                });
                
                if (response.ok) {
                    const data = await response.json();
                    isMaintenanceMode = data.maintenanceMode === true;
                    
                    // Set cookie for future requests to avoid API calls
                    const nextResponse = NextResponse.next();
                    nextResponse.cookies.set('maintenance_mode', isMaintenanceMode.toString(), {
                        maxAge: 60 * 5, // 5 minutes
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                    });
                    
                    if (isMaintenanceMode && !isAdmin(request)) {
                        return NextResponse.redirect(new URL('/maintenance', request.url));
                    }
                    
                    return nextResponse;
                }
            } catch (fetchError) {
                console.error('Failed to fetch maintenance status:', fetchError);
                // Fall back to allowing the request if we can't check maintenance status
                return NextResponse.next();
            }
        }

        // If maintenance mode is enabled and user is not an admin
        if (isMaintenanceMode && !isAdmin(request)) {
            return NextResponse.redirect(new URL('/maintenance', request.url));
        }

        return NextResponse.next();
    } catch (error) {
        console.error('Error in middleware:', error);
        // In case of any error, allow the request to proceed
        return NextResponse.next();
    }
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    ],
};