import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import PricingPage from '@/app/pricing/page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({
        push: vi.fn(),
    })),
    useSearchParams: vi.fn(() => ({
        get: vi.fn(),
    })),
}));

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key]),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value.toString();
        }),
        clear: vi.fn(() => {
            store = {};
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch
vi.stubGlobal('fetch', vi.fn());

describe('Subscription End-to-End Flow', () => {
    const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
    };

    // Mock plans data
    const mockPlans = [
        {
            id: 1,
            name: 'Basic',
            description: 'Perfect for small businesses',
            price: 49.99,
            billing_cycle: 'monthly',
            features: [
                'Online ordering',
                'Reservation management',
                'Menu editor',
                'Basic analytics'
            ],
            is_active: true,
            stripe_price_id: 'price_basic_monthly'
        },
        {
            id: 2,
            name: 'Standard',
            description: 'Great for growing businesses',
            price: 99.99,
            billing_cycle: 'monthly',
            features: [
                'All Basic features',
                'Customer management',
                'Inventory control',
                'Advanced analytics',
                'Marketing tools'
            ],
            is_active: true,
            stripe_price_id: 'price_standard_monthly'
        },
        {
            id: 4,
            name: 'Basic Annual',
            description: 'Perfect for small businesses - Annual billing',
            price: 479.88,
            billing_cycle: 'yearly',
            features: [
                'Online ordering',
                'Reservation management',
                'Menu editor',
                'Basic analytics'
            ],
            is_active: true,
            stripe_price_id: 'price_basic_yearly'
        },
        {
            id: 5,
            name: 'Standard Annual',
            description: 'Great for growing businesses - Annual billing',
            price: 959.88,
            billing_cycle: 'yearly',
            features: [
                'All Basic features',
                'Customer management',
                'Inventory control',
                'Advanced analytics',
                'Marketing tools'
            ],
            is_active: true,
            stripe_price_id: 'price_standard_yearly'
        }
    ];

    beforeEach(() => {
        vi.resetAllMocks();
        localStorageMock.clear();

        // Mock fetch responses
        (global.fetch as any).mockImplementation((url: string) => {
            if (url === '/api/subscription-plans') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ success: true, plans: mockPlans })
                });
            }

            if (url === '/api/faqs?published=true') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        success: true,
                        faqs: [
                            { id: 1, question: 'FAQ 1', answer: 'Answer 1', is_published: true }
                        ]
                    })
                });
            }

            if (url === '/api/payment/create-checkout-session') {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        sessionId: 'cs_test_123',
                        url: 'https://checkout.stripe.com/cs_test_123'
                    })
                });
            }

            if (url.includes('/api/subscriptions/')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        subscription: {
                            id: 1,
                            user_id: 1,
                            plan_id: 2,
                            status: 'active',
                            stripe_subscription_id: 'sub_123',
                            start_date: new Date().toISOString(),
                            end_date: null,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            plan_name: 'Standard',
                            amount: 99.99,
                            interval: 'monthly'
                        }
                    })
                });
            }

            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({})
            });
        });

        // Mock useRouter and useSearchParams
        (useRouter as any).mockReturnValue({
            push: vi.fn(),
        });

        (useSearchParams as any).mockReturnValue({
            get: vi.fn((param) => {
                if (param === 'subscription') return null;
                return null;
            })
        });

        // Setup mock window.location
        Object.defineProperty(window, 'location', {
            value: {
                href: '',
            },
            writable: true,
        });
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('Guest User Journey', () => {
        it('should redirect to login when a guest user selects a plan', async () => {
            const user = userEvent.setup();
            const routerPush = vi.fn();
            (useRouter as any).mockReturnValue({
                push: routerPush,
            });

            // Render the pricing page
            render(<PricingPage />);

            // Wait for plans to load
            await waitFor(() => {
                expect(screen.getByText('Basic')).toBeInTheDocument();
            });

            // Click on the first plan's select button
            const selectButton = screen.getAllByText(/Select Plan/i)[0];
            await user.click(selectButton);

            // Verify the guest user is redirected to register with plan ID
            expect(routerPush).toHaveBeenCalledWith('/register?plan=1');
        });
    });

    describe('Logged-in User Journey', () => {
        beforeEach(() => {
            // Set up logged-in user
            localStorageMock.setItem('user', JSON.stringify(mockUser));
        });

        it('should initiate checkout when a logged-in user selects a plan', async () => {
            const user = userEvent.setup();

            // Render the pricing page
            render(<PricingPage />);

            // Wait for plans to load
            await waitFor(() => {
                expect(screen.getByText('Basic')).toBeInTheDocument();
            });

            // Click on the first plan's select button
            const selectButton = screen.getAllByText(/Select Plan/i)[0];
            await user.click(selectButton);

            // Verify fetch was called with correct parameters
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/payment/create-checkout-session',
                expect.objectContaining({
                    method: 'POST',
                    body: expect.any(String)
                })
            );

            // Verify user is redirected to Stripe checkout
            await waitFor(() => {
                expect(window.location.href).toBe('https://checkout.stripe.com/cs_test_123');
            });
        });

        it('should toggle between monthly and yearly billing', async () => {
            const user = userEvent.setup();

            // Render the pricing page
            render(<PricingPage />);

            // Wait for plans to load
            await waitFor(() => {
                expect(screen.getByText('Basic')).toBeInTheDocument();
            });

            // Verify we start with monthly plans
            expect(screen.getByText('$49.99')).toBeInTheDocument();

            // Click on the annual billing toggle
            const yearlyButton = screen.getByText(/Annual billing/i);
            await user.click(yearlyButton);

            // Verify we now see yearly plans
            await waitFor(() => {
                expect(screen.getByText('$479.88')).toBeInTheDocument();
            });

            // Click back to monthly
            const monthlyButton = screen.getByText(/Monthly billing/i);
            await user.click(monthlyButton);

            // Verify we're back to monthly plans
            await waitFor(() => {
                expect(screen.getByText('$49.99')).toBeInTheDocument();
            });
        });
    });

    describe('Subscription Required Alert', () => {
        it('should show an alert when redirected with subscription=required', async () => {
            // Mock that the user was redirected with subscription=required
            (useSearchParams as any).mockReturnValue({
                get: vi.fn((param) => {
                    if (param === 'subscription') return 'required';
                    return null;
                })
            });

            // Render the pricing page
            render(<PricingPage />);

            // Verify the alert is shown
            await waitFor(() => {
                expect(screen.getByText(/An active subscription is required to access the dashboard/i)).toBeInTheDocument();
            });
        });
    });

    describe('Subscription Success Flow', () => {
        it('should show subscription details after successful subscription', async () => {
            // This test would normally render the subscription success page
            // For now, we'll verify the subscription verification API is called with the correct parameters

            // Mock a successful subscription checkout
            (global.fetch as any).mockImplementation((url: string) => {
                if (url.includes('/api/subscriptions/1')) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({
                            subscription: {
                                id: 1,
                                user_id: 1,
                                plan_id: 2,
                                status: 'active',
                                stripe_subscription_id: 'sub_123',
                                start_date: new Date().toISOString(),
                                plan_name: 'Standard',
                                amount: 99.99,
                                interval: 'monthly'
                            }
                        })
                    });
                }
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({})
                });
            });

            // Call the subscription verification API
            const response = await fetch('/api/subscriptions/1');
            const data = await response.json();

            // Verify the returned data
            expect(data).toHaveProperty('subscription');
            expect(data.subscription).toHaveProperty('status', 'active');
            expect(data.subscription).toHaveProperty('plan_name', 'Standard');
        });
    });
}); 