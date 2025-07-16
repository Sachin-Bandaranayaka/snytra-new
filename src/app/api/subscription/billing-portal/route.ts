/**
 * Billing Portal API - Create Stripe billing portal session
 * POST /api/subscription/billing-portal
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth/options';
import { subscriptionService } from '@/lib/subscription/service';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required', success: false },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);

    // Get user's Stripe customer ID
    const stripeCustomerId = await subscriptionService.getCustomerStripeId(userId);
    
    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: 'No billing information found. Please subscribe to a plan first.', success: false },
        { status: 400 }
      );
    }

    // Get current subscription to check if user has an active subscription
    const subscriptionStatus = await subscriptionService.checkSubscriptionStatus(userId);
    
    if (subscriptionStatus.plan.name === 'Free') {
      return NextResponse.json(
        { error: 'Billing portal is only available for paid subscriptions', success: false },
        { status: 400 }
      );
    }

    // Create billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard?tab=billing`,
    });

    // Log the billing portal access
    await subscriptionService.logSubscriptionEvent({
      userId,
      eventType: 'billing_portal_accessed',
      subscriptionPlanId: subscriptionStatus.plan.id,
      eventData: {
        stripeCustomerId,
        portalSessionId: portalSession.id,
        accessedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      url: portalSession.url,
      sessionId: portalSession.id,
    });

  } catch (error) {
    console.error('Error creating billing portal session:', error);
    
    // Log the error
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      await subscriptionService.logSubscriptionEvent({
        userId: parseInt(session.user.id),
        eventType: 'billing_portal_error',
        eventData: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json(
      { 
        error: 'Failed to access billing portal', 
        success: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}