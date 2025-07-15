/**
 * Server-side subscription utilities that require database access
 * This file is separate from subscription-utils.ts to avoid client-side bundling issues
 */

import { planHasFeature } from './subscription-utils';

/**
 * Server-side feature verification function
 * This should be used on the backend to verify feature access
 * @param userId User ID to check access for
 * @param featureKey Feature key to check
 * @returns Promise that resolves to boolean indicating access
 */
export async function verifyFeatureAccess(userId: number, featureKey: string): Promise<boolean> {
    try {
        const { executeQuery } = await import('@/lib/db');
        
        // Get the user's subscription and plan
        const userRows = await executeQuery<any[]>(
            `SELECT 
                u.subscription_plan, 
                u.subscription_status,
                s.plan_id
             FROM users u
             LEFT JOIN subscriptions s ON u.id = s.user_id
             WHERE u.id = $1 AND u.subscription_status = 'active'`,
            [userId]
        );

        if (userRows.length === 0) {
            return false; // No active subscription
        }

        const { plan_id, subscription_plan } = userRows[0];

        // If we have a plan_id, get features from the database
        if (plan_id) {
            const featureRows = await executeQuery<any[]>(
                `SELECT feature_key
                 FROM plan_features
                 WHERE plan_id = $1`,
                [plan_id]
            );

            const planFeatures = featureRows.map((row: any) => row.feature_key);
            return planHasFeature('', featureKey, planFeatures);
        }

        // Fallback to subscription_plan name if no plan_id
        if (subscription_plan) {
            return planHasFeature(subscription_plan, featureKey);
        }

        return false;
    } catch (error) {
        console.error('Error verifying feature access:', error);
        return false;
    }
} 