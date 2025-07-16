/**
 * Subscription React Hooks - Client-side subscription state management
 * Provides easy access to subscription data and actions in React components
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  billing_cycle: 'monthly' | 'yearly';
  features: Record<string, any>;
  stripe_product_id?: string;
  stripe_price_id?: string;
  is_active: boolean;
  trial_days?: number;
}

export interface UserSubscription {
  id: number;
  user_id: number;
  subscription_plan_id: number;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  status: 'active' | 'inactive' | 'canceled' | 'past_due' | 'trialing';
  current_period_start?: Date;
  current_period_end?: Date;
  trial_start?: Date;
  trial_end?: Date;
  cancel_at_period_end: boolean;
  canceled_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface SubscriptionStatus {
  isActive: boolean;
  plan: SubscriptionPlan;
  subscription?: UserSubscription;
  features: Record<string, boolean>;
  limits: Record<string, { current: number; maximum: number; unit: string }>;
  trialInfo?: {
    isInTrial: boolean;
    daysRemaining: number;
    trialEnd: Date;
  };
  billingInfo?: {
    nextBillingDate: Date;
    amount: number;
    currency: string;
  };
}

export interface UseSubscriptionReturn {
  subscription: SubscriptionStatus | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  hasFeature: (featureKey: string) => boolean;
  getLimit: (limitKey: string) => { current: number; maximum: number; unit: string } | null;
  canUpgrade: boolean;
  canDowngrade: boolean;
  isTrialExpiring: boolean;
}

/**
 * Main subscription hook - provides comprehensive subscription data
 */
export function useSubscription(): UseSubscriptionReturn {
  const { data: session, status } = useSession();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (status === 'loading' || !session?.user?.id) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/subscription/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch subscription: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setSubscription(data.subscription);
      } else {
        throw new Error(data.error || 'Failed to fetch subscription');
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, status]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const hasFeature = useCallback((featureKey: string): boolean => {
    return subscription?.features[featureKey] || false;
  }, [subscription?.features]);

  const getLimit = useCallback((limitKey: string) => {
    return subscription?.limits[limitKey] || null;
  }, [subscription?.limits]);

  const canUpgrade = useMemo(() => {
    if (!subscription) return false;
    return subscription.plan.name !== 'Enterprise';
  }, [subscription?.plan.name]);

  const canDowngrade = useMemo(() => {
    if (!subscription) return false;
    return subscription.plan.name !== 'Free';
  }, [subscription?.plan.name]);

  const isTrialExpiring = useMemo(() => {
    if (!subscription?.trialInfo?.isInTrial) return false;
    return subscription.trialInfo.daysRemaining <= 3;
  }, [subscription?.trialInfo]);

  return {
    subscription,
    loading,
    error,
    refetch: fetchSubscription,
    hasFeature,
    getLimit,
    canUpgrade,
    canDowngrade,
    isTrialExpiring,
  };
}

/**
 * Hook for subscription plans data
 */
export function useSubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/subscription-plans', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch plans: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setPlans(data.plans);
      } else {
        throw new Error(data.error || 'Failed to fetch plans');
      }
    } catch (err) {
      console.error('Error fetching subscription plans:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return {
    plans,
    loading,
    error,
    refetch: fetchPlans,
  };
}

/**
 * Hook for subscription actions (upgrade, downgrade, cancel)
 */
export function useSubscriptionActions() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = useCallback(async (planId: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create checkout session: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel subscription: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      // Refresh the page to update subscription status
      router.refresh();
    } catch (err) {
      console.error('Error canceling subscription:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const reactivateSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/subscription/reactivate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to reactivate subscription: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to reactivate subscription');
      }

      // Refresh the page to update subscription status
      router.refresh();
    } catch (err) {
      console.error('Error reactivating subscription:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const updatePaymentMethod = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/subscription/billing-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to access billing portal: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to access billing portal');
      }
    } catch (err) {
      console.error('Error accessing billing portal:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createCheckoutSession,
    cancelSubscription,
    reactivateSubscription,
    updatePaymentMethod,
  };
}

/**
 * Hook for feature access checking
 */
export function useFeatureAccess(featureKey: string) {
  const { subscription, loading } = useSubscription();

  const hasAccess = useMemo(() => {
    if (loading || !subscription) return false;
    return subscription.features[featureKey] || false;
  }, [subscription, featureKey, loading]);

  const requiresUpgrade = useMemo(() => {
    if (loading || !subscription) return false;
    return !subscription.features[featureKey];
  }, [subscription, featureKey, loading]);

  return {
    hasAccess,
    requiresUpgrade,
    loading,
    currentPlan: subscription?.plan.name,
  };
}

/**
 * Hook for usage limits checking
 */
export function useUsageLimit(limitKey: string) {
  const { subscription, loading } = useSubscription();

  const limit = useMemo(() => {
    if (loading || !subscription) return null;
    return subscription.limits[limitKey] || null;
  }, [subscription, limitKey, loading]);

  const isAtLimit = useMemo(() => {
    if (!limit) return false;
    return limit.current >= limit.maximum;
  }, [limit]);

  const isNearLimit = useMemo(() => {
    if (!limit) return false;
    const percentage = (limit.current / limit.maximum) * 100;
    return percentage >= 80;
  }, [limit]);

  const remaining = useMemo(() => {
    if (!limit) return Infinity;
    return Math.max(0, limit.maximum - limit.current);
  }, [limit]);

  return {
    limit,
    isAtLimit,
    isNearLimit,
    remaining,
    loading,
  };
}

/**
 * Hook for trial information
 */
export function useTrialInfo() {
  const { subscription, loading } = useSubscription();

  const trialInfo = useMemo(() => {
    if (loading || !subscription?.trialInfo) return null;
    return subscription.trialInfo;
  }, [subscription?.trialInfo, loading]);

  const isInTrial = useMemo(() => {
    return trialInfo?.isInTrial || false;
  }, [trialInfo]);

  const isExpiring = useMemo(() => {
    if (!trialInfo?.isInTrial) return false;
    return trialInfo.daysRemaining <= 3;
  }, [trialInfo]);

  const isExpired = useMemo(() => {
    if (!trialInfo?.isInTrial) return false;
    return trialInfo.daysRemaining <= 0;
  }, [trialInfo]);

  return {
    trialInfo,
    isInTrial,
    isExpiring,
    isExpired,
    loading,
  };
}

/**
 * Hook for billing information
 */
export function useBillingInfo() {
  const { subscription, loading } = useSubscription();

  const billingInfo = useMemo(() => {
    if (loading || !subscription?.billingInfo) return null;
    return subscription.billingInfo;
  }, [subscription?.billingInfo, loading]);

  const nextBillingDate = useMemo(() => {
    return billingInfo?.nextBillingDate || null;
  }, [billingInfo]);

  const daysUntilBilling = useMemo(() => {
    if (!nextBillingDate) return null;
    const now = new Date();
    const diffTime = nextBillingDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [nextBillingDate]);

  return {
    billingInfo,
    nextBillingDate,
    daysUntilBilling,
    loading,
  };
}