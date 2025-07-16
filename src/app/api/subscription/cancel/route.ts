/**
 * Subscription Cancel API - Cancel user's subscription
 * POST /api/subscription/cancel
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { subscriptionService } from '@/lib/subscription/service';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
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
    const { immediate = false } = await request.json().catch(() => ({}));

    // Get current subscription status
    const subscriptionStatus = await subscriptionService.checkSubscriptionStatus(userId);
    
    if (!subscriptionStatus.isActive || subscriptionStatus.plan.name === 'Free') {
      return NextResponse.json(
        { error: 'No active subscription to cancel', success: false },
        { status: 400 }
      );
    }

    // Get user's subscription details
    const userSubscription = await subscriptionService.getUserSubscription(userId);
    
    if (!userSubscription?.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No Stripe subscription found', success: false },
        { status: 400 }
      );
    }

    let canceledSubscription;
    
    if (immediate) {
      // Cancel immediately
      canceledSubscription = await stripe.subscriptions.cancel(
        userSubscription.stripe_subscription_id
      );
    } else {
      // Cancel at period end
      canceledSubscription = await stripe.subscriptions.update(
        userSubscription.stripe_subscription_id,
        {
          cancel_at_period_end: true,
        }
      );
    }

    // Update subscription in database
    await subscriptionService.updateSubscription(userId, {
      status: immediate ? 'canceled' : 'active',
      cancel_at_period_end: !immediate,
      canceled_at: immediate ? new Date() : null,
    });

    // Log the cancellation event
    await subscriptionService.logSubscriptionEvent({
      userId,
      eventType: immediate ? 'subscription_canceled_immediately' : 'subscription_canceled_at_period_end',
      subscriptionPlanId: subscriptionStatus.plan.id,
      eventData: {
        stripeSubscriptionId: userSubscription.stripe_subscription_id,
        canceledAt: immediate ? new Date().toISOString() : null,
        cancelAtPeriodEnd: !immediate,
        currentPeriodEnd: canceledSubscription.current_period_end ? 
          new Date(canceledSubscription.current_period_end * 1000).toISOString() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: immediate 
        ? 'Subscription canceled immediately' 
        : 'Subscription will be canceled at the end of the current billing period',
      canceledAt: immediate ? new Date().toISOString() : null,
      accessUntil: canceledSubscription.current_period_end ? 
        new Date(canceledSubscription.current_period_end * 1000).toISOString() : null,
    });

  } catch (error) {
    console.error('Error canceling subscription:', error);
    
    // Log the error
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      await subscriptionService.logSubscriptionEvent({
        userId: parseInt(session.user.id),
        eventType: 'subscription_cancel_error',
        eventData: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json(
      { 
        error: 'Failed to cancel subscription', 
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