"use client";

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { createCssVariables } from "@/utils/cssUtils";

// Define the Restaurant interface
export interface Restaurant {
    id: number;
    name: string;
    description: string;
    logo_url: string | null;
    primary_color: string;
    secondary_color: string;
}

// Define the context type
type RestaurantContextType = {
    restaurant: Restaurant | null;
    loading: boolean;
    error: string | null;
    refreshData: () => Promise<void>;
};

// Create the context
const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

// Create the provider component
export function RestaurantProvider({ children }: { children: ReactNode }) {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const isFetchingRef = useRef(false);

    const fetchRestaurantData = async () => {
        // Prevent multiple concurrent fetches
        if (isFetchingRef.current) return;

        try {
            isFetchingRef.current = true;
            // Use the same API endpoint as the dashboard settings page
            const response = await fetch('/api/dashboard/restaurant', {
                // Add cache control to prevent browser caching
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch restaurant information');
            }

            const data = await response.json();

            // Only update state if the data actually changed
            if (data.restaurant && (!restaurant ||
                restaurant.name !== data.restaurant.name ||
                restaurant.primary_color !== data.restaurant.primary_color ||
                restaurant.secondary_color !== data.restaurant.secondary_color ||
                restaurant.logo_url !== data.restaurant.logo_url ||
                restaurant.description !== data.restaurant.description)) {

                setRestaurant(data.restaurant);

                // Apply restaurant colors as CSS variables
                createCssVariables(data.restaurant.primary_color, data.restaurant.secondary_color);
            }
        } catch (err: any) {
            console.error('Error fetching restaurant data:', err);
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    };

    useEffect(() => {
        fetchRestaurantData();

        // Only refresh on window focus, not on an interval
        const handleFocus = () => {
            fetchRestaurantData();
        };

        window.addEventListener('focus', handleFocus);

        // Cleanup on unmount
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    return (
        <RestaurantContext.Provider value={{
            restaurant,
            loading,
            error,
            refreshData: fetchRestaurantData
        }}>
            {children}
        </RestaurantContext.Provider>
    );
}

// Create a hook to use the restaurant context
export function useRestaurant() {
    const context = useContext(RestaurantContext);
    if (context === undefined) {
        throw new Error('useRestaurant must be used within a RestaurantProvider');
    }
    return context;
}

export default RestaurantProvider; 