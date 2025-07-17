/**
 * Subscription Service - Central service for all subscription operations
 * Integrates with existing API handler pattern, NextAuth sessions, and Stripe SDK
 */

import { executeQuery } from '@/lib/db';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Core interfaces
export interface SubscriptionStatus {
  isActive: boolean;
  plan: SubscriptionPlan;
  features: FeatureAccess;
  limits: FeatureLimits;
  billingInfo: BillingInfo;
  trialInfo?: TrialInfo;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  billing_interval: string;
  features: string[];
  feature_limits: Record<string, any>;
  trial_settings: Record<string, any>;
  stripe_product_id?: string;
  stripe_price_id?: string;
  is_active: boolean;
}

export interface FeatureAccess {
  [featureKey: string]: boolean;
}

export interface FeatureLimits {
  [limitKey: string]: {
    current: number;
    maximum: number;
    unit: string;
  };
}

export interface BillingInfo {
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  nextBillingDate: Date;
  amount: number;
  currency: string;
  status: string;
}

export interface TrialInfo {
  isInTrial: boolean;
  trialStart?: Date;
  trialEnd?: Date;
  daysRemaining?: number;
}

export interface SubscriptionUpdate {
  planId?: number;
  status?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface SyncResult {
  success: boolean;
  changes: string[];
  errors?: string[];
}

export interface UsageMetrics {
  [metricKey: string]: {
    current: number;
    limit: number;
    percentage: number;
  };
}

export interface StripeSession {
  sessionId: string;
  url: string;
  subscriptionId?: string;
}

/**
 * Main Subscription Service Class
 */
export class SubscriptionService {
  /**
   * Check subscription status for a user
   */
  async checkSubscriptionStatus(userId: number): Promise<SubscriptionStatus> {
    try {
      const query = `
        SELECT 
          us.*,
          sp.name as plan_name,
          sp.description as plan_description,
          sp.price as plan_price,
          sp.billing_interval,
          sp.features as plan_features,
          sp.feature_limits,
          sp.trial_settings,
          sp.stripe_product_id,
          sp.stripe_price_id,
          sp.is_active as plan_is_active
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
        WHERE us.user_id = $1 AND us.status = 'active'
        ORDER BY us.created_at DESC
        LIMIT 1
      `;

      const result = await executeQuery(query, [userId]);
      
      if (result.length === 0) {
        // Return free plan status
        return this.getFreeSubscriptionStatus();
      }

      const subscription = result[0];
      const plan: SubscriptionPlan = {
        id: subscription.subscription_plan_id,
        name: subscription.plan_name,
        description: subscription.plan_description,
        price: subscription.plan_price,
        billing_interval: subscription.billing_interval,
        features: JSON.parse(subscription.plan_features || '[]'),
        feature_limits: JSON.parse(subscription.feature_limits || '{}'),
        trial_settings: JSON.parse(subscription.trial_settings || '{}'),
        stripe_product_id: subscription.stripe_product_id,
        stripe_price_id: subscription.stripe_price_id,
        is_active: subscription.plan_is_active
      };

      const features = await this.getFeatureAccess(subscription.subscription_plan_id);
      const limits = await this.getFeatureLimits(userId, subscription.subscription_plan_id);
      const billingInfo = this.getBillingInfo(subscription);
      const trialInfo = this.getTrialInfo(subscription);

      return {
        isActive: subscription.status === 'active',
        plan,
        features,
        limits,
        billingInfo,
        trialInfo
      };
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return this.getFreeSubscriptionStatus();
    }
  }

  /**
   * Create a new subscription
   */
  async createSubscription(userId: number, planId: number): Promise<StripeSession> {
    try {
      // Get plan details
      const planQuery = `
        SELECT * FROM subscription_plans 
        WHERE id = $1 AND is_active = true
      `;
      const planResult = await executeQuery(planQuery, [planId]);
      
      if (planResult.length === 0) {
        throw new Error('Plan not found or inactive');
      }

      const plan = planResult[0];

      // Get user details
      const userQuery = `
        SELECT email, stripe_customer_id FROM users WHERE id = $1
      `;
      const userResult = await executeQuery(userQuery, [userId]);
      
      if (userResult.length === 0) {
        throw new Error('User not found');
      }

      const user = userResult[0];
      let customerId = user.stripe_customer_id;

      // Create Stripe customer if doesn't exist
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: userId.toString()
          }
        });
        customerId = customer.id;

        // Update user with customer ID
        await executeQuery(
          'UPDATE users SET stripe_customer_id = $1 WHERE id = $2',
          [customerId, userId]
        );
      }

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: plan.stripe_price_id,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
        metadata: {
          userId: userId.toString(),
          planId: planId.toString()
        }
      });

      return {
        sessionId: session.id,
        url: session.url!,
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(subscriptionId: string, changes: SubscriptionUpdate): Promise<any> {
    try {
      // Update in Stripe first
      const stripeSubscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: changes.cancelAtPeriodEnd,
        // Add other Stripe updates as needed
      });

      // Update in database
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      if (changes.status) {
        updateFields.push(`status = $${paramIndex++}`);
        values.push(changes.status);
      }

      if (changes.cancelAtPeriodEnd !== undefined) {
        updateFields.push(`cancel_at_period_end = $${paramIndex++}`);
        values.push(changes.cancelAtPeriodEnd);
      }

      if (updateFields.length > 0) {
        updateFields.push(`updated_at = NOW()`);
        values.push(subscriptionId);

        const query = `
          UPDATE user_subscriptions 
          SET ${updateFields.join(', ')}
          WHERE stripe_subscription_id = $${paramIndex}
          RETURNING *
        `;

        const result = await executeQuery(query, values);
        return result[0];
      }

      return stripeSubscription;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, immediate: boolean = false): Promise<void> {
    try {
      if (immediate) {
        await stripe.subscriptions.cancel(subscriptionId);
      } else {
        await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true
        });
      }

      // Update database
      const query = `
        UPDATE user_subscriptions 
        SET 
          cancel_at_period_end = $1,
          canceled_at = $2,
          updated_at = NOW()
        WHERE stripe_subscription_id = $3
      `;

      await executeQuery(query, [
        !immediate,
        immediate ? new Date() : null,
        subscriptionId
      ]);
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  /**
   * Sync subscription with Stripe
   */
  async syncWithStripe(subscriptionId: string): Promise<SyncResult> {
    try {
      const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
      const changes: string[] = [];

      // Update database with Stripe data
      const query = `
        UPDATE user_subscriptions 
        SET 
          status = $1,
          current_period_start = $2,
          current_period_end = $3,
          cancel_at_period_end = $4,
          updated_at = NOW()
        WHERE stripe_subscription_id = $5
        RETURNING *
      `;

      const result = await executeQuery(query, [
        stripeSubscription.status,
        new Date(stripeSubscription.current_period_start * 1000),
        new Date(stripeSubscription.current_period_end * 1000),
        stripeSubscription.cancel_at_period_end,
        subscriptionId
      ]);

      if (result.length > 0) {
        changes.push('Subscription status synchronized');
      }

      return {
        success: true,
        changes
      };
    } catch (error) {
      console.error('Error syncing with Stripe:', error);
      return {
        success: false,
        changes: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get usage metrics for a user
   */
  async getUsageMetrics(userId: number): Promise<UsageMetrics> {
    try {
      // This would be implemented based on specific usage tracking needs
      // For now, return empty metrics
      return {};
    } catch (error) {
      console.error('Error getting usage metrics:', error);
      return {};
    }
  }

  /**
   * Get Stripe customer ID for a user
   */
  async getCustomerStripeId(userId: number): Promise<string | null> {
    try {
      const query = 'SELECT stripe_customer_id FROM users WHERE id = $1';
      const result = await executeQuery(query, [userId]);
      
      if (result.length === 0) {
        return null;
      }
      
      return result[0].stripe_customer_id || null;
    } catch (error) {
      console.error('Error getting customer Stripe ID:', error);
      return null;
    }
  }

  /**
   * Log subscription events (simplified version)
   */
  async logSubscriptionEvent(eventData: {
    userId: number;
    eventType: string;
    subscriptionPlanId?: number;
    eventData?: any;
  }): Promise<void> {
    try {
      // For now, just log to console
      // In a production environment, you might want to store this in a database
      console.log('Subscription Event:', {
        timestamp: new Date().toISOString(),
        ...eventData
      });
    } catch (error) {
      console.error('Error logging subscription event:', error);
    }
  }

  // Private helper methods
  private async getFreeSubscriptionStatus(): Promise<SubscriptionStatus> {
    const freePlan: SubscriptionPlan = {
      id: 0,
      name: 'Free',
      description: 'Free tier with limited features',
      price: 0,
      billing_interval: 'monthly',
      features: ['Limited menu items (up to 25)', 'Basic reservations', 'Standard support'],
      feature_limits: { menu_items: 25 },
      trial_settings: {},
      is_active: true
    };

    return {
      isActive: true,
      plan: freePlan,
      features: { basic_features: true },
      limits: {
        menu_items: {
          current: 0,
          maximum: 25,
          unit: 'items'
        }
      },
      billingInfo: {
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        amount: 0,
        currency: 'usd',
        status: 'active'
      }
    };
  }

  private async getFeatureAccess(planId: number): Promise<FeatureAccess> {
    try {
      const query = `
        SELECT feature_key, is_enabled 
        FROM subscription_features 
        WHERE subscription_plan_id = $1
      `;
      const result = await executeQuery(query, [planId]);
      
      const features: FeatureAccess = {};
      result.forEach(row => {
        features[row.feature_key] = row.is_enabled;
      });
      
      return features;
    } catch (error) {
      console.error('Error getting feature access:', error);
      return {};
    }
  }

  private async getFeatureLimits(userId: number, planId: number): Promise<FeatureLimits> {
    try {
      const query = `
        SELECT feature_key, limit_value, limit_type 
        FROM subscription_features 
        WHERE subscription_plan_id = $1 AND limit_value IS NOT NULL
      `;
      const result = await executeQuery(query, [planId]);
      
      const limits: FeatureLimits = {};
      
      for (const row of result) {
        // Get current usage (this would be implemented based on specific metrics)
        const currentUsage = await this.getCurrentUsage(userId, row.feature_key);
        
        limits[row.feature_key] = {
          current: currentUsage,
          maximum: row.limit_value,
          unit: row.limit_type || 'count'
        };
      }
      
      return limits;
    } catch (error) {
      console.error('Error getting feature limits:', error);
      return {};
    }
  }

  private async getCurrentUsage(userId: number, featureKey: string): Promise<number> {
    // This would be implemented based on specific usage tracking
    // For now, return 0
    return 0;
  }

  private getBillingInfo(subscription: any): BillingInfo {
    return {
      currentPeriodStart: new Date(subscription.current_period_start),
      currentPeriodEnd: new Date(subscription.current_period_end),
      nextBillingDate: new Date(subscription.current_period_end),
      amount: subscription.plan_price,
      currency: 'usd',
      status: subscription.status
    };
  }

  private getTrialInfo(subscription: any): TrialInfo | undefined {
    if (!subscription.trial_start) {
      return undefined;
    }

    const trialStart = new Date(subscription.trial_start);
    const trialEnd = new Date(subscription.trial_end);
    const now = new Date();
    const isInTrial = now >= trialStart && now <= trialEnd;
    const daysRemaining = isInTrial ? Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return {
      isInTrial,
      trialStart,
      trialEnd,
      daysRemaining
    };
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();

// Utility functions for easy access
export async function getCurrentUserSubscription(): Promise<SubscriptionStatus | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return null;
    }

    return await subscriptionService.checkSubscriptionStatus(parseInt(session.user.id));
  } catch (error) {
    console.error('Error getting current user subscription:', error);
    return null;
  }
}

export async function hasFeatureAccess(featureKey: string): Promise<boolean> {
  try {
    const subscription = await getCurrentUserSubscription();
    return subscription?.features[featureKey] || false;
  } catch (error) {
    console.error('Error checking feature access:', error);
    return false;
  }
}

export async function getFeatureLimit(limitKey: string): Promise<{ current: number; maximum: number; unit: string } | null> {
  try {
    const subscription = await getCurrentUserSubscription();
    return subscription?.limits[limitKey] || null;
  } catch (error) {
    console.error('Error getting feature limit:', error);
    return null;
  }
}