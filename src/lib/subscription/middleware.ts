/**
 * Subscription Middleware - Route protection and subscription verification
 * Integrates with existing NextAuth middleware pattern
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { subscriptionService } from './service';

// Routes that require active subscription
const PROTECTED_ROUTES = [
  '/dashboard',
  '/admin',
  '/menu',
  '/reservations',
  '/orders',
  '/staff',
  '/kitchen',
  '/account'
];

// Routes that are always accessible (free tier)
const FREE_ROUTES = [
  '/',
  '/login',
  '/register',
  '/pricing',
  '/about-us',
  '/contact',
  '/terms-of-service',
  '/privacy-policy',
  '/api/auth',
  '/api/subscription-plans'
];

// Admin routes that bypass subscription checks
const ADMIN_ROUTES = [
  '/admin/subscription-plans',
  '/admin/users',
  '/admin/settings'
];

export interface SubscriptionMiddlewareConfig {
  requireActiveSubscription?: boolean;
  allowFreeTier?: boolean;
  adminBypass?: boolean;
  redirectUrl?: string;
}

/**
 * Check if route requires subscription
 */
export function requiresSubscription(pathname: string): boolean {
  // Check if it's a free route
  if (FREE_ROUTES.some(route => pathname.startsWith(route))) {
    return false;
  }

  // Check if it's a protected route
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if route is admin route
 */
export function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Main subscription middleware function
 */
export async function subscriptionMiddleware(
  request: NextRequest,
  config: SubscriptionMiddlewareConfig = {}
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and free routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/webhooks') ||
    pathname.includes('.') ||
    FREE_ROUTES.some(route => pathname.startsWith(route))
  ) {
    return null;
  }

  try {
    // Get user session
    const token = await getToken({ req: request });
    
    if (!token?.sub) {
      // No session, redirect to login for protected routes
      if (requiresSubscription(pathname)) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }
      return null;
    }

    const userId = parseInt(token.sub);

    // Check if admin route and user has admin role
    if (isAdminRoute(pathname)) {
      if (token.role === 'admin' || config.adminBypass) {
        return null; // Allow access
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Check subscription status for protected routes
    if (requiresSubscription(pathname) && config.requireActiveSubscription !== false) {
      const subscriptionStatus = await subscriptionService.checkSubscriptionStatus(userId);
      
      // Allow free tier access if configured
      if (config.allowFreeTier && subscriptionStatus.plan.name === 'Free') {
        return null;
      }

      // Check if subscription is active
      if (!subscriptionStatus.isActive && subscriptionStatus.plan.name !== 'Free') {
        const pricingUrl = new URL(config.redirectUrl || '/pricing', request.url);
        pricingUrl.searchParams.set('reason', 'subscription_required');
        return NextResponse.redirect(pricingUrl);
      }

      // Check trial expiration
      if (subscriptionStatus.trialInfo?.isInTrial && subscriptionStatus.trialInfo.daysRemaining <= 0) {
        const pricingUrl = new URL(config.redirectUrl || '/pricing', request.url);
        pricingUrl.searchParams.set('reason', 'trial_expired');
        return NextResponse.redirect(pricingUrl);
      }

      // Add subscription info to headers for downstream use
      const response = NextResponse.next();
      response.headers.set('x-subscription-status', JSON.stringify({
        isActive: subscriptionStatus.isActive,
        planName: subscriptionStatus.plan.name,
        planId: subscriptionStatus.plan.id,
        trialDaysRemaining: subscriptionStatus.trialInfo?.daysRemaining || 0
      }));
      
      return response;
    }

    return null;
  } catch (error) {
    console.error('Subscription middleware error:', error);
    
    // On error, allow access but log the issue
    if (process.env.NODE_ENV === 'development') {
      console.warn('Subscription check failed, allowing access in development mode');
      return null;
    }
    
    // In production, redirect to pricing page on subscription check failure
    if (requiresSubscription(pathname)) {
      return NextResponse.redirect(new URL('/pricing', request.url));
    }
    
    return null;
  }
}

/**
 * Feature access middleware for API routes
 */
export async function featureAccessMiddleware(
  request: NextRequest,
  requiredFeature: string
): Promise<NextResponse | null> {
  try {
    const token = await getToken({ req: request });
    
    if (!token?.sub) {
      return NextResponse.json(
        { error: 'Authentication required', success: false },
        { status: 401 }
      );
    }

    const userId = parseInt(token.sub);
    const subscriptionStatus = await subscriptionService.checkSubscriptionStatus(userId);
    
    // Check if user has access to the required feature
    if (!subscriptionStatus.features[requiredFeature]) {
      return NextResponse.json(
        { 
          error: 'Feature not available in your current plan', 
          success: false,
          requiredFeature,
          currentPlan: subscriptionStatus.plan.name
        },
        { status: 403 }
      );
    }

    return null;
  } catch (error) {
    console.error('Feature access middleware error:', error);
    return NextResponse.json(
      { error: 'Failed to verify feature access', success: false },
      { status: 500 }
    );
  }
}

/**
 * Usage limit middleware for API routes
 */
export async function usageLimitMiddleware(
  request: NextRequest,
  limitKey: string
): Promise<NextResponse | null> {
  try {
    const token = await getToken({ req: request });
    
    if (!token?.sub) {
      return NextResponse.json(
        { error: 'Authentication required', success: false },
        { status: 401 }
      );
    }

    const userId = parseInt(token.sub);
    const subscriptionStatus = await subscriptionService.checkSubscriptionStatus(userId);
    
    const limit = subscriptionStatus.limits[limitKey];
    if (limit && limit.current >= limit.maximum) {
      return NextResponse.json(
        { 
          error: `Usage limit exceeded for ${limitKey}`, 
          success: false,
          limit: limit.maximum,
          current: limit.current,
          upgradeRequired: true
        },
        { status: 429 }
      );
    }

    return null;
  } catch (error) {
    console.error('Usage limit middleware error:', error);
    return NextResponse.json(
      { error: 'Failed to verify usage limits', success: false },
      { status: 500 }
    );
  }
}

/**
 * Subscription context for React components
 */
export interface SubscriptionContext {
  isActive: boolean;
  plan: {
    id: number;
    name: string;
    price: number;
  };
  features: Record<string, boolean>;
  limits: Record<string, { current: number; maximum: number; unit: string }>;
  trial?: {
    isInTrial: boolean;
    daysRemaining: number;
  };
}

/**
 * Extract subscription context from headers (set by middleware)
 */
export function getSubscriptionContext(headers: Headers): SubscriptionContext | null {
  try {
    const subscriptionHeader = headers.get('x-subscription-status');
    if (!subscriptionHeader) {
      return null;
    }

    const data = JSON.parse(subscriptionHeader);
    return {
      isActive: data.isActive,
      plan: {
        id: data.planId,
        name: data.planName,
        price: 0 // Would need to be added to header if needed
      },
      features: {}, // Would need to be added to header if needed
      limits: {}, // Would need to be added to header if needed
      trial: data.trialDaysRemaining > 0 ? {
        isInTrial: true,
        daysRemaining: data.trialDaysRemaining
      } : undefined
    };
  } catch (error) {
    console.error('Error parsing subscription context:', error);
    return null;
  }
}

/**
 * Utility function to check if a feature is available
 */
export async function checkFeatureAccess(userId: number, featureKey: string): Promise<boolean> {
  try {
    const subscriptionStatus = await subscriptionService.checkSubscriptionStatus(userId);
    return subscriptionStatus.features[featureKey] || false;
  } catch (error) {
    console.error('Error checking feature access:', error);
    return false;
  }
}

/**
 * Utility function to check usage limits
 */
export async function checkUsageLimit(userId: number, limitKey: string): Promise<{
  allowed: boolean;
  current: number;
  maximum: number;
  remaining: number;
}> {
  try {
    const subscriptionStatus = await subscriptionService.checkSubscriptionStatus(userId);
    const limit = subscriptionStatus.limits[limitKey];
    
    if (!limit) {
      return {
        allowed: true,
        current: 0,
        maximum: Infinity,
        remaining: Infinity
      };
    }

    return {
      allowed: limit.current < limit.maximum,
      current: limit.current,
      maximum: limit.maximum,
      remaining: limit.maximum - limit.current
    };
  } catch (error) {
    console.error('Error checking usage limit:', error);
    return {
      allowed: false,
      current: 0,
      maximum: 0,
      remaining: 0
    };
  }
}