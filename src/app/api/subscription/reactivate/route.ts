/**
 * Subscription Reactivate API - Reactivate canceled subscription
 * POST /api/subscription/reactivate
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

    // Get current subscription status
    const subscriptionStatus = await subscriptionService.checkSubscriptionStatus(userId);
    
    // Get user's subscription details
    const userSubscription = await subscriptionService.getUserSubscription(userId);
    
    if (!userSubscription?.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No subscription found to reactivate', success: false },
        { status: 400 }
      );
    }

    // Check if subscription is eligible for reactivation
    if (subscriptionStatus.isActive && !userSubscription.cancel_at_period_end) {
      return NextResponse.json(
        { error: 'Subscription is already active', success: false },
        { status: 400 }
      );
    }

    // Get the Stripe subscription
    const stripeSubscription = await stripe.subscriptions.retrieve(
      userSubscription.stripe_subscription_id
    );

    let reactivatedSubscription;

    if (stripeSubscription.status === 'canceled') {
      // If subscription is already canceled, we need to create a new one
      // This typically happens when immediate cancellation was used
      
      // Get the plan details
      const plan = await subscriptionService.getSubscriptionPlan(subscriptionStatus.plan.id);
      if (!plan?.stripe_price_id) {
        return NextResponse.json(
          { error: 'Cannot reactivate: plan no longer available', success: false },
          { status: 400 }
        );
      }

      // Create new subscription
      reactivatedSubscription = await stripe.subscriptions.create({
        customer: userSubscription.stripe_customer_id!,
        items: [{ price: plan.stripe_price_id }],
        metadata: {
          userId: userId.toString(),
          planId: plan.id.toString(),
          reactivated: 'true',
        },
      });

      // Update database with new subscription
      await subscriptionService.updateSubscription(userId, {
        stripe_subscription_id: reactivatedSubscription.id,
        status: 'active',
        cancel_at_period_end: false,
        canceled_at: null,
        current_period_start: new Date(reactivatedSubscription.current_period_start * 1000),
        current_period_end: new Date(reactivatedSubscription.current_period_end * 1000),
      });

    } else {
      // If subscription is still active but set to cancel at period end, just remove the cancellation
      reactivatedSubscription = await stripe.subscriptions.update(
        userSubscription.stripe_subscription_id,
        {
          cancel_at_period_end: false,
        }
      );

      // Update database
      await subscriptionService.updateSubscription(userId, {
        cancel_at_period_end: false,
        canceled_at: null,
      });
    }

    // Log the reactivation event
    await subscriptionService.logSubscriptionEvent({
      userId,
      eventType: 'subscription_reactivated',
      subscriptionPlanId: subscriptionStatus.plan.id,
      eventData: {
        stripeSubscriptionId: reactivatedSubscription.id,
        reactivatedAt: new Date().toISOString(),
        newSubscriptionCreated: stripeSubscription.status === 'canceled',
        currentPeriodEnd: new Date(reactivatedSubscription.current_period_end * 1000).toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription reactivated successfully',
      subscription: {
        id: reactivatedSubscription.id,
        status: reactivatedSubscription.status,
        currentPeriodEnd: new Date(reactivatedSubscription.current_period_end * 1000).toISOString(),
      },
    });

  } catch (error) {
    console.error('Error reactivating subscription:', error);
    
    // Log the error
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      await subscriptionService.logSubscriptionEvent({
        userId: parseInt(session.user.id),
        eventType: 'subscription_reactivate_error',
        eventData: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json(
      { 
        error: 'Failed to reactivate subscription', 
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