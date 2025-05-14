import { loadStripe } from '@stripe/stripe-js';
import StripeServer from 'stripe';

// Client-side Stripe instance
let stripePromise: Promise<any | null>;

export const getStripe = () => {
    if (!stripePromise) {
        // Make sure the environment variable exists
        const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

        if (!publishableKey) {
            console.error('Stripe publishable key is missing. Check your environment variables.');
            return Promise.resolve(null);
        }

        stripePromise = loadStripe(publishableKey);
    }
    return stripePromise;
};

// Server-side Stripe instance
export const stripe = new StripeServer(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16', // Use the latest API version
});

// Stripe plan IDs - in a real implementation, these would come from your Stripe dashboard
export const STRIPE_PLANS = {
    BASIC: {
        id: 'price_basic_monthly',
        name: 'Basic',
        price: 49,
        features: [
            'Online ordering',
            'Menu management',
            'Basic analytics',
            'Email support'
        ]
    },
    PRO: {
        id: 'price_pro_monthly',
        name: 'Pro',
        price: 99,
        features: [
            'All Basic features',
            'Reservation system',
            'Inventory management',
            'Priority support'
        ]
    },
    ENTERPRISE: {
        id: 'price_enterprise_monthly',
        name: 'Enterprise',
        price: 199,
        features: [
            'All Pro features',
            'Multi-location support',
            'Advanced analytics',
            'Dedicated account manager',
            'Custom integrations'
        ]
    }
}; 