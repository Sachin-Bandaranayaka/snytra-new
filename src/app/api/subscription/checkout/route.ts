/**
 * Subscription Checkout API - Create Stripe checkout session
 * POST /api/subscription/checkout
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
    const { planId } = await request.json();

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required', success: false },
        { status: 400 }
      );
    }

    // Get the subscription plan details
    const plan = await subscriptionService.getSubscriptionPlan(planId);
    if (!plan) {
      return NextResponse.json(
        { error: 'Invalid plan ID', success: false },
        { status: 404 }
      );
    }

    // Check if plan has Stripe integration
    if (!plan.stripe_price_id) {
      return NextResponse.json(
        { error: 'Plan does not support online payments', success: false },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    let stripeCustomerId = await subscriptionService.getStripeCustomerId(userId);
    
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: session.user.email!,
        metadata: {
          userId: userId.toString(),
        },
      });
      stripeCustomerId = customer.id;
      
      // Update user with Stripe customer ID
      await subscriptionService.updateUserStripeCustomerId(userId, stripeCustomerId);
    }

    // Check current subscription
    const currentSubscription = await subscriptionService.checkSubscriptionStatus(userId);
    
    // Determine if this is an upgrade, downgrade, or new subscription
    const isUpgrade = currentSubscription.plan.id !== planId && 
                     currentSubscription.plan.name !== 'Free';

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
      metadata: {
        userId: userId.toString(),
        planId: planId.toString(),
        isUpgrade: isUpgrade.toString(),
      },
      subscription_data: {
        metadata: {
          userId: userId.toString(),
          planId: planId.toString(),
        },
        trial_period_days: plan.trial_days || undefined,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
    });

    // Log the checkout session creation
    await subscriptionService.logSubscriptionEvent({
      userId,
      eventType: 'checkout_session_created',
      subscriptionPlanId: planId,
      eventData: {
        checkoutSessionId: checkoutSession.id,
        stripeCustomerId,
        planName: plan.name,
        amount: plan.price,
        isUpgrade,
      },
    });

    return NextResponse.json({
      success: true,
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    // Log the error
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      await subscriptionService.logSubscriptionEvent({
        userId: parseInt(session.user.id),
        eventType: 'checkout_session_error',
        eventData: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json(
      { 
        error: 'Failed to create checkout session', 
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