/**
 * Provides utilities for working with subscription plans and features
 */

// Plan tiers with features
export const PLAN_FEATURES = {
    // Free tier
    Free: [
        'Limited menu items (up to 25)',
        'Basic reservations',
        'Standard support',
    ],

    // Basic tier
    Basic: [
        'Unlimited menu items',
        'Advanced reservations',
        'Email support',
        'Customer database',
        'Basic analytics',
    ],

    // Standard tier
    Standard: [
        'All Basic features',
        'Inventory management',
        'Staff scheduling',
        'Advanced analytics',
        'Table management',
        'Priority email support',
    ],

    // Premium tier
    Premium: [
        'All Standard features',
        'Multiple restaurant locations',
        'Custom reporting',
        'API access',
        'White-label mobile app',
        'Dedicated account manager',
    ],

    // Enterprise tier
    Enterprise: [
        'All Premium features',
        'Custom integrations',
        'Advanced security',
        'Dedicated hosting',
        'Custom development',
        '24/7 phone support',
    ],
};

// Mapping for plan name normalization
const PLAN_MAPPING: Record<string, keyof typeof PLAN_FEATURES> = {
    // Specific plans
    'free': 'Free',
    'basic': 'Basic',
    'standard': 'Standard',
    'premium': 'Premium',
    'enterprise': 'Enterprise',

    // Variations
    'starter': 'Basic',
    'pro': 'Standard',
    'business': 'Premium',
    'advanced': 'Premium',
    'ultimate': 'Enterprise',

    // Trial
    'trial': 'Basic',

    // Number-based (1 = Basic, 2 = Standard, etc.)
    '1': 'Basic',
    '2': 'Standard',
    '3': 'Premium',
    '4': 'Enterprise',
};

/**
 * Get features for a specific plan
 * @param planName The name of the plan
 * @returns Array of feature strings
 */
export function getFeaturesByPlan(planName: string): string[] {
    // Normalize the plan name by converting to lowercase
    const normalizedPlanName = planName.toLowerCase();

    // Find matching plan from mapping
    const planKey =
        PLAN_MAPPING[normalizedPlanName] ||
            // Try to find partial matches
            Object.keys(PLAN_MAPPING).find(key => normalizedPlanName.includes(key.toLowerCase()))
            ? PLAN_MAPPING[Object.keys(PLAN_MAPPING).find(key => normalizedPlanName.includes(key.toLowerCase())) as string]
            : 'Basic'; // Default to Basic if no match found

    // Return features for the plan
    return PLAN_FEATURES[planKey];
}

/**
 * Check if a subscription has a specific feature
 * This now checks against our database and falls back to hardcoded feature lists
 * @param planName The name of the plan or plan ID
 * @param featureName The feature to check for
 * @param planFeatures Optional array of features to check against (from database)
 * @returns Boolean indicating if the plan has the feature
 */
export function planHasFeature(planName: string, featureName: string, planFeatures?: string[]): boolean {
    // If we have planFeatures from the database, check if the feature exists
    if (planFeatures && Array.isArray(planFeatures)) {
        // Check for exact feature key (e.g., 'menu_management')
        const hasExactFeature = planFeatures.includes(featureName);
        if (hasExactFeature) return true;

        // Check for partial matches (e.g., 'menu' might match 'menu_management')
        const hasPartialMatch = planFeatures.some(feature =>
            feature.includes(featureName) || featureName.includes(feature)
        );
        if (hasPartialMatch) return true;
    }

    // 1. First try to check against our predefined features
    const predefinedFeatures = getFeaturesByPlan(planName);

    // Check if the exact feature exists in predefined features
    if (predefinedFeatures.includes(featureName)) {
        return true;
    }

    // Check for partial matches in predefined features 
    const hasPartialMatch = predefinedFeatures.some(feature =>
        feature.toLowerCase().includes(featureName.toLowerCase()) ||
        featureName.toLowerCase().includes(feature.toLowerCase())
    );

    if (hasPartialMatch) {
        return true;
    }

    // 2. Feature-based checks for specific dashboard features
    // These are specific feature permissions like "online_ordering", "table_management", etc.
    const featureMap: Record<string, string[]> = {
        // Basic plan features (direct access)
        "reservation": ["Basic", "Standard", "Premium", "Enterprise", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
        "menu": ["Basic", "Standard", "Premium", "Enterprise", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
        "orders": ["Basic", "Standard", "Premium", "Enterprise", "1", "2", "3", "4", "5", "6", "7", "8", "9"],

        // Standard plan and above features
        "inventory": ["Standard", "Premium", "Enterprise", "2", "3", "5", "6", "8", "9"],
        "staff": ["Standard", "Premium", "Enterprise", "2", "3", "5", "6", "8", "9"],
        "analytics": ["Standard", "Premium", "Enterprise", "2", "3", "5", "6", "8", "9"],
        "tables": ["Standard", "Premium", "Enterprise", "2", "3", "5", "6", "8", "9"],

        // Premium plan and above features
        "multiple_locations": ["Premium", "Enterprise", "3", "5", "6", "8", "9"],
        "api_access": ["Premium", "Enterprise", "3", "6", "9"],
        "custom_reporting": ["Premium", "Enterprise", "3", "6", "9"],

        // Enterprise plan only features
        "custom_integrations": ["Enterprise", "6", "9"],
        "white_label": ["Enterprise", "6", "9"]
    };

    // Check if the feature is directly defined in our feature map
    const featureKey = Object.keys(featureMap).find(key =>
        featureName.toLowerCase().includes(key.toLowerCase())
    );

    if (featureKey && featureMap[featureKey].some(plan =>
        plan.toLowerCase() === planName.toLowerCase() ||
        plan === planName // For numeric plan IDs
    )) {
        return true;
    }

    // If all checks fail, return false
    return false;
}

/**
 * Get plan price in cents
 * @param planName The name of the plan
 * @param isYearly Whether the price is for yearly billing
 */
export function getPlanPrice(planName: string, isYearly: boolean = false): number {
    const prices: Record<string, number> = {
        'free': 0,
        'basic': 4999,
        'standard': 9999,
        'premium': 19999,
        'enterprise': 49999,
    };

    // Normalize plan name
    const normalizedPlanName = planName.toLowerCase();

    // Find the base price
    let price = 0;
    for (const [key, basePrice] of Object.entries(prices)) {
        if (normalizedPlanName.includes(key)) {
            price = basePrice;
            break;
        }
    }

    // Apply yearly discount (17% off)
    if (isYearly) {
        price = Math.round(price * 12 * 0.83); // 17% discount for annual billing
    }

    return price;
}