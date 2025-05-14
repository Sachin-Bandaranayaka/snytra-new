import { SYSTEM_FEATURES } from '@/lib/system-features';

/**
 * Helper function to ensure features is always processed correctly
 * regardless of whether it's stored as an array or object in the database
 */
export function ensureFeaturesIsArray(featuresData: any): any {
    // If featuresData is null or undefined, return empty array
    if (featuresData === null || featuresData === undefined) {
        return [];
    }

    // If it's already an array, return it
    if (Array.isArray(featuresData)) {
        return featuresData;
    }

    // If it's an object, return it as is (for object-style features)
    if (typeof featuresData === 'object') {
        return featuresData;
    }

    // If it's a string, try to parse it as JSON
    if (typeof featuresData === 'string') {
        try {
            const parsed = JSON.parse(featuresData);
            return parsed;
        } catch (e) {
            // If parsing fails, it might be a comma-separated string
            return featuresData.split(',').map(item => item.trim());
        }
    }

    // Fallback: return as single-item array
    return [featuresData];
}

/**
 * Determines if a feature string is likely a feature ID from our system-features.ts
 * @param feature The feature string to check
 * @returns Boolean indicating if the string looks like a feature ID
 */
export function isFeatureId(feature: string): boolean {
    // Feature IDs are snake_case strings like "menu_items" or "customer_analytics"
    return /^[a-z_]+$/.test(feature);
}

/**
 * Converts feature strings to display names
 * If a feature is stored as an ID, converts it to the display name
 * Otherwise leaves it as is
 * @param features Array of feature strings or IDs, or object with feature properties
 * @returns Array of feature display names or feature object
 */
export function convertFeatureIdsToNames(features: any): any {
    // If features is null or undefined, return empty array
    if (features === null || features === undefined) {
        return [];
    }

    // If features is an array, map over it
    if (Array.isArray(features)) {
        return features.map(feature => {
            if (isFeatureId(feature)) {
                const systemFeature = SYSTEM_FEATURES.find(f => f.id === feature);
                return systemFeature ? systemFeature.name : feature;
            }
            return feature;
        });
    }

    // If features is an object, process keys and values
    if (typeof features === 'object') {
        const result: Record<string, any> = {};
        for (const [key, value] of Object.entries(features)) {
            const newKey = isFeatureId(key) ?
                SYSTEM_FEATURES.find(f => f.id === key)?.name || key :
                key;
            result[newKey] = value;
        }
        return result;
    }

    // If it's a string or other type, return as is
    return features;
}

/**
 * Attempts to convert feature names to IDs when possible
 * Useful when receiving features from clients that might be using display names
 * @param features Array of feature strings or object with feature properties
 * @returns Array of feature IDs or object with feature IDs as keys
 */
export function convertFeatureNamesToIds(features: any): any {
    // If features is null or undefined, return empty array
    if (features === null || features === undefined) {
        return [];
    }

    // If features is an array, map over it
    if (Array.isArray(features)) {
        return features.map(feature => {
            // If it already looks like an ID, keep it
            if (isFeatureId(feature)) {
                return feature;
            }

            // Try to find a matching feature by name (case insensitive)
            const systemFeature = SYSTEM_FEATURES.find(
                f => f.name.toLowerCase() === feature.toLowerCase()
            );

            return systemFeature ? systemFeature.id : feature;
        });
    }

    // If features is an object, process keys and values
    if (typeof features === 'object') {
        const result: Record<string, any> = {};
        for (const [key, value] of Object.entries(features)) {
            // If the key already looks like an ID, keep it
            if (isFeatureId(key)) {
                result[key] = value;
                continue;
            }

            // Try to find a matching feature by name (case insensitive)
            const systemFeature = SYSTEM_FEATURES.find(
                f => f.name.toLowerCase() === key.toLowerCase()
            );

            const newKey = systemFeature ? systemFeature.id : key;
            result[newKey] = value;
        }
        return result;
    }

    // If it's a string or other type, return as is
    return features;
} 