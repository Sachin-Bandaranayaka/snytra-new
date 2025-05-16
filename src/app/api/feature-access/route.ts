import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { verifyFeatureAccess } from '@/lib/subscription-utils';

/**
 * Verify if the current user has access to a specific feature
 */
export async function GET(request: NextRequest) {
    try {
        // Get the feature from the query string
        const url = new URL(request.url);
        const feature = url.searchParams.get('feature');

        if (!feature) {
            return NextResponse.json(
                { error: 'Feature parameter is required', success: false },
                { status: 400 }
            );
        }

        // Get the current session
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: 'Not authenticated', success: false, hasAccess: false },
                { status: 401 }
            );
        }

        // Get the user ID from the database
        const rows = await executeQuery<any[]>(
            `SELECT id, role, subscription_plan, subscription_status FROM users WHERE email = $1`,
            [session.user.email]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                { error: 'User not found', success: false, hasAccess: false },
                { status: 404 }
            );
        }

        const user = rows[0];

        // Admin and developer roles have access to all features
        if (user.role === 'admin' || user.role === 'developer') {
            return NextResponse.json({
                success: true,
                hasAccess: true,
                reason: 'admin_role'
            });
        }

        // Check if user has an active subscription
        if (user.subscription_status !== 'active') {
            return NextResponse.json({
                success: true,
                hasAccess: false,
                reason: 'no_active_subscription'
            });
        }

        // Check if user has access to the feature
        const hasAccess = await verifyFeatureAccess(user.id, feature);

        return NextResponse.json({
            success: true,
            hasAccess,
            reason: hasAccess ? 'feature_included' : 'feature_not_included'
        });
    } catch (error) {
        console.error('Error checking feature access:', error);
        return NextResponse.json(
            { error: 'Failed to check feature access', success: false, hasAccess: false },
            { status: 500 }
        );
    }
} 