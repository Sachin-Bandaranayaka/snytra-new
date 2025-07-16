# Snytra SaaS Pricing Packages - Testing and Security

## Introduction

This document outlines the comprehensive testing strategy and security requirements for the SaaS pricing packages rebuild. It focuses on integration with existing testing frameworks while adding subscription-specific test coverage and security measures.

## Related Documents

- **Architecture Overview** - High-level approach and integration strategy
- **Data Models and Schema** - Database design and schema changes
- **API Design and Integration** - API endpoints and external integrations
- **Component Architecture** - Component design and interaction patterns
- **Infrastructure and Deployment** - Deployment strategy and infrastructure changes
- **Testing and Security** (this document) - Testing strategy and security requirements

## Testing Strategy

### Integration with Existing Testing Framework

**Current Testing Stack Analysis:**
- **Framework:** Jest + React Testing Library (assumed based on Next.js best practices)
- **E2E Testing:** Playwright or Cypress (to be confirmed)
- **API Testing:** Supertest or similar
- **Database Testing:** In-memory SQLite or test database

**Enhanced Testing Architecture:**
```typescript
// src/test/setup/test-config.ts
import { PrismaClient } from '@prisma/client';
import { mockStripe } from './mocks/stripe-mock';
import { createTestCache } from './mocks/cache-mock';

// Test database setup
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'file:./test.db'
    }
  }
});

// Test environment setup
export const setupTestEnvironment = async () => {
  // Reset database
  await testPrisma.$executeRaw`DELETE FROM user_subscriptions`;
  await testPrisma.$executeRaw`DELETE FROM subscription_events`;
  await testPrisma.$executeRaw`DELETE FROM webhook_events`;
  
  // Seed test data
  await seedTestData();
  
  // Setup mocks
  jest.mock('stripe', () => mockStripe);
  jest.mock('@/lib/cache/cache-service', () => createTestCache());
};

export const teardownTestEnvironment = async () => {
  await testPrisma.$disconnect();
};

const seedTestData = async () => {
  // Create test subscription plans
  await testPrisma.subscriptionPlan.createMany({
    data: [
      {
        id: 1,
        name: 'Basic Test Plan',
        description: 'Test basic plan',
        price: 29.99,
        billing_cycle: 'monthly',
        stripe_product_id: 'prod_test_basic',
        stripe_price_id: 'price_test_basic',
        trial_settings: { trial_enabled: true, trial_days: 14 },
        is_active: true
      },
      {
        id: 2,
        name: 'Premium Test Plan',
        description: 'Test premium plan',
        price: 79.99,
        billing_cycle: 'monthly',
        stripe_product_id: 'prod_test_premium',
        stripe_price_id: 'price_test_premium',
        trial_settings: { trial_enabled: true, trial_days: 14 },
        is_active: true
      }
    ]
  });

  // Create test subscription features
  await testPrisma.subscriptionFeature.createMany({
    data: [
      {
        subscription_plan_id: 1,
        feature_key: 'menu_management',
        feature_name: 'Menu Management',
        is_enabled: true
      },
      {
        subscription_plan_id: 2,
        feature_key: 'menu_management',
        feature_name: 'Menu Management',
        is_enabled: true
      },
      {
        subscription_plan_id: 2,
        feature_key: 'analytics',
        feature_name: 'Analytics Dashboard',
        is_enabled: true
      }
    ]
  });
};
```

### Unit Testing

#### Subscription Service Testing
```typescript
// src/lib/subscription/__tests__/subscription-service.test.ts
import { SubscriptionService } from '../subscription-service';
import { testPrisma, setupTestEnvironment, teardownTestEnvironment } from '@/test/setup/test-config';
import { mockStripe } from '@/test/mocks/stripe-mock';
import { createTestCache } from '@/test/mocks/cache-mock';

describe('SubscriptionService', () => {
  let subscriptionService: SubscriptionService;
  let mockCache: any;

  beforeAll(async () => {
    await setupTestEnvironment();
  });

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  beforeEach(() => {
    mockCache = createTestCache();
    subscriptionService = new SubscriptionService(
      testPrisma,
      mockStripe,
      mockCache
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockCache.clear();
  });

  describe('checkSubscriptionStatus', () => {
    it('should return active subscription status for user with active subscription', async () => {
      // Arrange
      const userId = 123;
      await testPrisma.userSubscription.create({
        data: {
          user_id: userId,
          subscription_plan_id: 1,
          stripe_subscription_id: 'sub_test_123',
          stripe_customer_id: 'cus_test_123',
          status: 'active',
          current_period_start: new Date(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Act
      const status = await subscriptionService.checkSubscriptionStatus(userId);

      // Assert
      expect(status.isActive).toBe(true);
      expect(status.plan.name).toBe('Basic Test Plan');
      expect(status.features.menu_management).toBe(true);
      expect(status.features.analytics).toBe(false);
    });

    it('should return inactive status for user without subscription', async () => {
      // Arrange
      const userId = 456;

      // Act
      const status = await subscriptionService.checkSubscriptionStatus(userId);

      // Assert
      expect(status.isActive).toBe(false);
      expect(status.plan).toBeNull();
      expect(status.features).toEqual({});
    });

    it('should use cache when available', async () => {
      // Arrange
      const userId = 789;
      const cachedStatus = {
        isActive: true,
        plan: { id: 1, name: 'Cached Plan' },
        features: { menu_management: true },
        limits: {},
        billingInfo: null
      };
      mockCache.set(`subscription:${userId}`, cachedStatus);

      // Act
      const status = await subscriptionService.checkSubscriptionStatus(userId);

      // Assert
      expect(status).toEqual(cachedStatus);
      expect(testPrisma.userSubscription.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('createSubscription', () => {
    it('should create Stripe checkout session', async () => {
      // Arrange
      const userId = 123;
      const planId = 1;
      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123'
      });

      // Act
      const session = await subscriptionService.createSubscription(userId, planId);

      // Assert
      expect(session.url).toBe('https://checkout.stripe.com/pay/cs_test_123');
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'subscription',
          line_items: expect.arrayContaining([
            expect.objectContaining({
              price: 'price_test_basic',
              quantity: 1
            })
          ])
        })
      );
    });

    it('should handle Stripe errors gracefully', async () => {
      // Arrange
      const userId = 123;
      const planId = 1;
      mockStripe.checkout.sessions.create.mockRejectedValue(
        new Error('Stripe API error')
      );

      // Act & Assert
      await expect(
        subscriptionService.createSubscription(userId, planId)
      ).rejects.toThrow('Stripe API error');
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription immediately when requested', async () => {
      // Arrange
      const subscriptionId = 'sub_test_123';
      mockStripe.subscriptions.update.mockResolvedValue({
        id: subscriptionId,
        status: 'canceled'
      });

      // Act
      await subscriptionService.cancelSubscription(subscriptionId, true);

      // Assert
      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(
        subscriptionId,
        { cancel_at_period_end: false }
      );
    });

    it('should schedule cancellation at period end when not immediate', async () => {
      // Arrange
      const subscriptionId = 'sub_test_123';
      mockStripe.subscriptions.update.mockResolvedValue({
        id: subscriptionId,
        status: 'active',
        cancel_at_period_end: true
      });

      // Act
      await subscriptionService.cancelSubscription(subscriptionId, false);

      // Assert
      expect(mockStripe.subscriptions.update).toHaveBeenCalledWith(
        subscriptionId,
        { cancel_at_period_end: true }
      );
    });
  });
});
```

#### Access Control Middleware Testing
```typescript
// src/lib/subscription/__tests__/access-control.test.ts
import { AccessControlMiddleware } from '../access-control';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { setupTestEnvironment, teardownTestEnvironment } from '@/test/setup/test-config';

jest.mock('next-auth/jwt');
const mockGetToken = getToken as jest.MockedFunction<typeof getToken>;

describe('AccessControlMiddleware', () => {
  let accessControl: AccessControlMiddleware;
  let mockSubscriptionService: any;

  beforeAll(async () => {
    await setupTestEnvironment();
  });

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  beforeEach(() => {
    mockSubscriptionService = {
      checkSubscriptionStatus: jest.fn()
    };
    accessControl = new AccessControlMiddleware(mockSubscriptionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verifySubscriptionAccess', () => {
    it('should allow access when user has required features', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/analytics');
      mockGetToken.mockResolvedValue({ sub: '123' });
      mockSubscriptionService.checkSubscriptionStatus.mockResolvedValue({
        isActive: true,
        features: {
          analytics: true,
          menu_management: true
        }
      });

      // Act
      const hasAccess = await accessControl.verifySubscriptionAccess(
        request,
        ['analytics']
      );

      // Assert
      expect(hasAccess).toBe(true);
    });

    it('should deny access when user lacks required features', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/analytics');
      mockGetToken.mockResolvedValue({ sub: '123' });
      mockSubscriptionService.checkSubscriptionStatus.mockResolvedValue({
        isActive: true,
        features: {
          menu_management: true
        }
      });

      // Act
      const hasAccess = await accessControl.verifySubscriptionAccess(
        request,
        ['analytics']
      );

      // Assert
      expect(hasAccess).toBe(false);
    });

    it('should deny access when user has no active subscription', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/analytics');
      mockGetToken.mockResolvedValue({ sub: '123' });
      mockSubscriptionService.checkSubscriptionStatus.mockResolvedValue({
        isActive: false,
        features: {}
      });

      // Act
      const hasAccess = await accessControl.verifySubscriptionAccess(
        request,
        ['analytics']
      );

      // Assert
      expect(hasAccess).toBe(false);
    });

    it('should deny access when user is not authenticated', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/analytics');
      mockGetToken.mockResolvedValue(null);

      // Act
      const hasAccess = await accessControl.verifySubscriptionAccess(
        request,
        ['analytics']
      );

      // Assert
      expect(hasAccess).toBe(false);
    });
  });

  describe('checkFeatureLimit', () => {
    it('should allow usage within limits', async () => {
      // Arrange
      const userId = 123;
      mockSubscriptionService.checkSubscriptionStatus.mockResolvedValue({
        isActive: true,
        limits: {
          api_calls: {
            current: 50,
            max: 100,
            remaining: 50
          }
        }
      });

      // Act
      const result = await accessControl.checkFeatureLimit(userId, 'api_calls', 10);

      // Assert
      expect(result.allowed).toBe(true);
      expect(result.current).toBe(50);
      expect(result.max).toBe(100);
      expect(result.remaining).toBe(40);
    });

    it('should deny usage when would exceed limits', async () => {
      // Arrange
      const userId = 123;
      mockSubscriptionService.checkSubscriptionStatus.mockResolvedValue({
        isActive: true,
        limits: {
          api_calls: {
            current: 95,
            max: 100,
            remaining: 5
          }
        }
      });

      // Act
      const result = await accessControl.checkFeatureLimit(userId, 'api_calls', 10);

      // Assert
      expect(result.allowed).toBe(false);
      expect(result.current).toBe(95);
      expect(result.max).toBe(100);
      expect(result.remaining).toBe(-5);
    });
  });
});
```

### Integration Testing

#### API Endpoint Testing
```typescript
// src/app/api/subscription/__tests__/subscription-api.test.ts
import { POST } from '../checkout/route';
import { GET } from '../status/route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { setupTestEnvironment, teardownTestEnvironment, testPrisma } from '@/test/setup/test-config';

jest.mock('next-auth');
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

describe('Subscription API', () => {
  beforeAll(async () => {
    await setupTestEnvironment();
  });

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  beforeEach(() => {
    mockGetServerSession.mockResolvedValue({
      user: { id: '123', email: 'test@example.com' }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/subscription/checkout', () => {
    it('should create checkout session for valid plan', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/subscription/checkout', {
        method: 'POST',
        body: JSON.stringify({
          plan_id: 1,
          success_url: 'http://localhost:3000/success',
          cancel_url: 'http://localhost:3000/cancel'
        })
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.checkout_url).toContain('checkout.stripe.com');
    });

    it('should return error for invalid plan', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/subscription/checkout', {
        method: 'POST',
        body: JSON.stringify({
          plan_id: 999,
          success_url: 'http://localhost:3000/success',
          cancel_url: 'http://localhost:3000/cancel'
        })
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('Plan not found');
    });

    it('should require authentication', async () => {
      // Arrange
      mockGetServerSession.mockResolvedValue(null);
      const request = new NextRequest('http://localhost:3000/api/subscription/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan_id: 1 })
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.message).toBe('Unauthorized');
    });
  });

  describe('GET /api/subscription/status', () => {
    it('should return subscription status for authenticated user', async () => {
      // Arrange
      await testPrisma.userSubscription.create({
        data: {
          user_id: 123,
          subscription_plan_id: 1,
          stripe_subscription_id: 'sub_test_123',
          stripe_customer_id: 'cus_test_123',
          status: 'active',
          current_period_start: new Date(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      const request = new NextRequest('http://localhost:3000/api/subscription/status');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.isActive).toBe(true);
      expect(data.data.plan.name).toBe('Basic Test Plan');
    });

    it('should return inactive status for user without subscription', async () => {
      // Arrange
      const request = new NextRequest('http://localhost:3000/api/subscription/status');

      // Act
      const response = await GET(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.isActive).toBe(false);
    });
  });
});
```

#### Webhook Testing
```typescript
// src/app/api/webhooks/stripe/__tests__/webhook.test.ts
import { POST } from '../route';
import { NextRequest } from 'next/server';
import { setupTestEnvironment, teardownTestEnvironment, testPrisma } from '@/test/setup/test-config';
import Stripe from 'stripe';

// Mock Stripe webhook verification
jest.mock('stripe', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: jest.fn()
    }
  }))
}));

describe('Stripe Webhook', () => {
  let mockStripe: any;

  beforeAll(async () => {
    await setupTestEnvironment();
  });

  afterAll(async () => {
    await teardownTestEnvironment();
  });

  beforeEach(() => {
    mockStripe = {
      webhooks: {
        constructEvent: jest.fn()
      }
    };
    (Stripe as any).mockImplementation(() => mockStripe);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('subscription.created webhook', () => {
    it('should create user subscription record', async () => {
      // Arrange
      const webhookEvent = {
        id: 'evt_test_123',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
            status: 'active',
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
            items: {
              data: [{
                price: {
                  id: 'price_test_basic'
                }
              }]
            }
          }
        }
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(webhookEvent);

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(webhookEvent),
        headers: {
          'stripe-signature': 'test_signature'
        }
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify database record was created
      const subscription = await testPrisma.userSubscription.findFirst({
        where: { stripe_subscription_id: 'sub_test_123' }
      });
      expect(subscription).toBeTruthy();
      expect(subscription?.status).toBe('active');
    });
  });

  describe('subscription.updated webhook', () => {
    it('should update existing subscription record', async () => {
      // Arrange
      // First create a subscription
      await testPrisma.userSubscription.create({
        data: {
          user_id: 123,
          subscription_plan_id: 1,
          stripe_subscription_id: 'sub_test_123',
          stripe_customer_id: 'cus_test_123',
          status: 'active',
          current_period_start: new Date(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      const webhookEvent = {
        id: 'evt_test_456',
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
            status: 'past_due',
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000)
          }
        }
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(webhookEvent);

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(webhookEvent),
        headers: {
          'stripe-signature': 'test_signature'
        }
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      // Verify database record was updated
      const subscription = await testPrisma.userSubscription.findFirst({
        where: { stripe_subscription_id: 'sub_test_123' }
      });
      expect(subscription?.status).toBe('past_due');
    });
  });

  it('should handle invalid webhook signatures', async () => {
    // Arrange
    mockStripe.webhooks.constructEvent.mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      body: 'invalid_body',
      headers: {
        'stripe-signature': 'invalid_signature'
      }
    });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid signature');
  });
});
```

### End-to-End Testing

#### Subscription Flow E2E Tests
```typescript
// e2e/subscription-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Subscription Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup test user and login
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'testpassword');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should complete subscription checkout flow', async ({ page }) => {
    // Navigate to pricing page
    await page.goto('/pricing');
    await expect(page.locator('h1')).toContainText('Choose Your Plan');

    // Select premium plan
    await page.click('[data-testid="premium-plan-select"]');
    await expect(page).toHaveURL('/subscription/checkout');

    // Verify plan selection
    await expect(page.locator('[data-testid="selected-plan"]')).toContainText('Premium Plan');
    await expect(page.locator('[data-testid="plan-price"]')).toContainText('$79.99');

    // Continue to payment
    await page.click('[data-testid="continue-to-payment"]');

    // Fill payment information (using Stripe test card)
    const stripeFrame = page.frameLocator('iframe[name*="__privateStripeFrame"]');
    await stripeFrame.locator('[placeholder="Card number"]').fill('4242424242424242');
    await stripeFrame.locator('[placeholder="MM / YY"]').fill('12/25');
    await stripeFrame.locator('[placeholder="CVC"]').fill('123');
    await stripeFrame.locator('[placeholder="ZIP"]').fill('12345');

    // Submit subscription
    await page.click('[data-testid="subscribe-button"]');

    // Wait for redirect to success page
    await expect(page).toHaveURL('/subscription/success', { timeout: 30000 });
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Welcome to Premium!');

    // Verify subscription is active in dashboard
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="subscription-status"]')).toContainText('Premium');
    await expect(page.locator('[data-testid="subscription-badge"]')).toHaveClass(/bg-green/);
  });

  test('should show trial information for new users', async ({ page }) => {
    await page.goto('/pricing');
    
    // Check trial information is displayed
    await expect(page.locator('[data-testid="trial-info"]')).toContainText('14-day free trial');
    
    // Select basic plan
    await page.click('[data-testid="basic-plan-select"]');
    
    // Verify trial is mentioned in checkout
    await expect(page.locator('[data-testid="trial-notice"]')).toContainText('Your 14-day trial starts today');
  });

  test('should handle subscription cancellation', async ({ page }) => {
    // Assume user already has an active subscription
    await page.goto('/subscription/manage');
    
    // Click cancel subscription
    await page.click('[data-testid="cancel-subscription"]');
    
    // Confirm cancellation in modal
    await expect(page.locator('[data-testid="cancel-modal"]')).toBeVisible();
    await page.click('[data-testid="confirm-cancel"]');
    
    // Verify cancellation success
    await expect(page.locator('[data-testid="cancel-success"]')).toContainText('Subscription cancelled');
    
    // Verify status updated
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="subscription-status"]')).toContainText('Cancelled');
  });

  test('should restrict access to premium features for basic users', async ({ page }) => {
    // Assume user has basic subscription
    await page.goto('/analytics');
    
    // Should be redirected to upgrade page
    await expect(page).toHaveURL('/upgrade');
    await expect(page.locator('[data-testid="upgrade-message"]')).toContainText('Analytics requires Premium');
    
    // Should show upgrade options
    await expect(page.locator('[data-testid="upgrade-to-premium"]')).toBeVisible();
  });
});
```

### Performance Testing

#### Load Testing for Subscription APIs
```typescript
// performance/subscription-load.test.ts
import { test } from '@playwright/test';
import { performance } from 'perf_hooks';

test.describe('Subscription API Performance', () => {
  test('should handle concurrent subscription status checks', async ({ request }) => {
    const concurrentRequests = 50;
    const requests = [];
    
    const startTime = performance.now();
    
    // Create concurrent requests
    for (let i = 0; i < concurrentRequests; i++) {
      requests.push(
        request.get('/api/subscription/status', {
          headers: {
            'Authorization': `Bearer ${process.env.TEST_AUTH_TOKEN}`
          }
        })
      );
    }
    
    // Wait for all requests to complete
    const responses = await Promise.all(requests);
    const endTime = performance.now();
    
    // Verify all requests succeeded
    for (const response of responses) {
      expect(response.status()).toBe(200);
    }
    
    // Verify performance
    const totalTime = endTime - startTime;
    const averageTime = totalTime / concurrentRequests;
    
    console.log(`Total time: ${totalTime}ms`);
    console.log(`Average time per request: ${averageTime}ms`);
    
    // Assert reasonable performance (adjust thresholds as needed)
    expect(averageTime).toBeLessThan(500); // 500ms average
    expect(totalTime).toBeLessThan(5000); // 5s total
  });

  test('should handle webhook processing under load', async ({ request }) => {
    const webhookEvents = 20;
    const requests = [];
    
    for (let i = 0; i < webhookEvents; i++) {
      const webhookPayload = {
        id: `evt_test_${i}`,
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: `sub_test_${i}`,
            status: 'active'
          }
        }
      };
      
      requests.push(
        request.post('/api/webhooks/stripe', {
          data: webhookPayload,
          headers: {
            'stripe-signature': 'test_signature'
          }
        })
      );
    }
    
    const startTime = performance.now();
    const responses = await Promise.all(requests);
    const endTime = performance.now();
    
    // Verify all webhooks processed successfully
    for (const response of responses) {
      expect(response.status()).toBe(200);
    }
    
    const totalTime = endTime - startTime;
    console.log(`Processed ${webhookEvents} webhooks in ${totalTime}ms`);
    
    // Assert reasonable webhook processing time
    expect(totalTime).toBeLessThan(10000); // 10s for 20 webhooks
  });
});
```

## Security Implementation

### Authentication and Authorization

#### Enhanced Session Security
```typescript
// src/lib/auth/session-security.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { SubscriptionService } from '@/lib/subscription/subscription-service';

interface SecurityContext {
  user: {
    id: string;
    email: string;
    role: string;
  };
  subscription: {
    isActive: boolean;
    plan: string;
    features: string[];
  };
  session: {
    isValid: boolean;
    expiresAt: Date;
  };
}

export class SessionSecurity {
  constructor(private subscriptionService: SubscriptionService) {}

  async validateSession(request: Request): Promise<SecurityContext | null> {
    try {
      const session = await getServerSession(authOptions);
      
      if (!session?.user) {
        return null;
      }

      // Validate session hasn't been tampered with
      if (!this.isValidSessionStructure(session)) {
        throw new Error('Invalid session structure');
      }

      // Check if session is expired
      if (session.expires && new Date(session.expires) < new Date()) {
        throw new Error('Session expired');
      }

      // Get subscription context
      const subscriptionStatus = await this.subscriptionService.checkSubscriptionStatus(
        parseInt(session.user.id)
      );

      return {
        user: {
          id: session.user.id,
          email: session.user.email!,
          role: session.user.role || 'user'
        },
        subscription: {
          isActive: subscriptionStatus.isActive,
          plan: subscriptionStatus.plan?.name || 'none',
          features: Object.keys(subscriptionStatus.features || {})
        },
        session: {
          isValid: true,
          expiresAt: new Date(session.expires!)
        }
      };
    } catch (error) {
      console.error('Session validation failed:', error);
      return null;
    }
  }

  private isValidSessionStructure(session: any): boolean {
    return (
      session &&
      session.user &&
      typeof session.user.id === 'string' &&
      typeof session.user.email === 'string' &&
      session.expires &&
      typeof session.expires === 'string'
    );
  }

  async requireSubscriptionFeature(
    request: Request,
    requiredFeature: string
  ): Promise<SecurityContext> {
    const context = await this.validateSession(request);
    
    if (!context) {
      throw new Error('Authentication required');
    }

    if (!context.subscription.isActive) {
      throw new Error('Active subscription required');
    }

    if (!context.subscription.features.includes(requiredFeature)) {
      throw new Error(`Feature '${requiredFeature}' not available in current plan`);
    }

    return context;
  }

  async requireAdminAccess(request: Request): Promise<SecurityContext> {
    const context = await this.validateSession(request);
    
    if (!context) {
      throw new Error('Authentication required');
    }

    if (context.user.role !== 'admin') {
      throw new Error('Admin access required');
    }

    return context;
  }
}
```

#### API Route Security Wrapper
```typescript
// src/lib/auth/api-security.ts
import { NextRequest, NextResponse } from 'next/server';
import { SessionSecurity } from './session-security';
import { RateLimiter } from './rate-limiter';
import { AuditLogger } from './audit-logger';

interface SecurityOptions {
  requireAuth?: boolean;
  requireSubscription?: boolean;
  requiredFeatures?: string[];
  requireAdmin?: boolean;
  rateLimit?: {
    requests: number;
    windowMs: number;
  };
  auditLog?: boolean;
}

export function withSecurity(
  handler: (request: NextRequest, context: SecurityContext) => Promise<NextResponse>,
  options: SecurityOptions = {}
) {
  return async function securedHandler(request: NextRequest): Promise<NextResponse> {
    const sessionSecurity = new SessionSecurity(subscriptionService);
    const rateLimiter = new RateLimiter();
    const auditLogger = new AuditLogger();

    try {
      // Rate limiting
      if (options.rateLimit) {
        const isAllowed = await rateLimiter.checkLimit(
          request,
          options.rateLimit.requests,
          options.rateLimit.windowMs
        );
        
        if (!isAllowed) {
          return NextResponse.json(
            { error: 'Rate limit exceeded' },
            { status: 429 }
          );
        }
      }

      // Authentication and authorization
      let context: SecurityContext | null = null;

      if (options.requireAuth || options.requireSubscription || options.requiredFeatures) {
        context = await sessionSecurity.validateSession(request);
        
        if (!context) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
        }
      }

      if (options.requireAdmin) {
        context = await sessionSecurity.requireAdminAccess(request);
      }

      if (options.requireSubscription && context) {
        if (!context.subscription.isActive) {
          return NextResponse.json(
            { error: 'Active subscription required' },
            { status: 403 }
          );
        }
      }

      if (options.requiredFeatures && context) {
        for (const feature of options.requiredFeatures) {
          if (!context.subscription.features.includes(feature)) {
            return NextResponse.json(
              { 
                error: `Feature '${feature}' not available in current plan`,
                upgrade_required: true
              },
              { status: 403 }
            );
          }
        }
      }

      // Audit logging
      if (options.auditLog && context) {
        await auditLogger.logApiAccess({
          userId: context.user.id,
          endpoint: request.url,
          method: request.method,
          timestamp: new Date(),
          userAgent: request.headers.get('user-agent') || 'unknown'
        });
      }

      // Call the actual handler
      return await handler(request, context!);

    } catch (error) {
      console.error('Security middleware error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Authentication required')) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
        }
        
        if (error.message.includes('required')) {
          return NextResponse.json(
            { error: error.message },
            { status: 403 }
          );
        }
      }

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Usage example
export const GET = withSecurity(
  async (request: NextRequest, context: SecurityContext) => {
    // Your API logic here
    return NextResponse.json({ data: 'success' });
  },
  {
    requireAuth: true,
    requireSubscription: true,
    requiredFeatures: ['analytics'],
    rateLimit: { requests: 100, windowMs: 60000 },
    auditLog: true
  }
);
```

### Data Protection and Privacy

#### Sensitive Data Handling
```typescript
// src/lib/security/data-protection.ts
import crypto from 'crypto';

interface EncryptionService {
  encrypt(data: string): string;
  decrypt(encryptedData: string): string;
  hash(data: string): string;
  verifyHash(data: string, hash: string): boolean;
}

class DataProtection implements EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly secretKey: Buffer;

  constructor() {
    const secret = process.env.ENCRYPTION_SECRET;
    if (!secret) {
      throw new Error('ENCRYPTION_SECRET environment variable is required');
    }
    this.secretKey = crypto.scryptSync(secret, 'salt', 32);
  }

  encrypt(data: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.secretKey);
    cipher.setAAD(Buffer.from('subscription-data'));
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  decrypt(encryptedData: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipher(this.algorithm, this.secretKey);
    decipher.setAAD(Buffer.from('subscription-data'));
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  hash(data: string): string {
    return crypto.pbkdf2Sync(data, 'subscription-salt', 10000, 64, 'sha512').toString('hex');
  }

  verifyHash(data: string, hash: string): boolean {
    const dataHash = this.hash(data);
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(dataHash));
  }

  // Secure random token generation
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  // PII data masking for logs
  maskSensitiveData(data: any): any {
    const sensitiveFields = ['email', 'phone', 'address', 'payment_method'];
    const masked = { ...data };
    
    for (const field of sensitiveFields) {
      if (masked[field]) {
        if (field === 'email') {
          const [local, domain] = masked[field].split('@');
          masked[field] = `${local.substring(0, 2)}***@${domain}`;
        } else {
          masked[field] = '***MASKED***';
        }
      }
    }
    
    return masked;
  }
}

export const dataProtection = new DataProtection();
```

#### Audit Logging
```typescript
// src/lib/security/audit-logger.ts
interface AuditEvent {
  userId: string;
  action: string;
  resource: string;
  details?: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

export class AuditLogger {
  async logSubscriptionEvent(event: {
    userId: string;
    action: 'subscribe' | 'cancel' | 'upgrade' | 'downgrade' | 'trial_start' | 'trial_end';
    planId?: number;
    subscriptionId?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const auditEvent: AuditEvent = {
      userId: event.userId,
      action: `subscription.${event.action}`,
      resource: 'subscription',
      details: {
        planId: event.planId,
        subscriptionId: event.subscriptionId,
        ...event.metadata
      },
      timestamp: new Date(),
      success: true
    };

    await this.writeAuditLog(auditEvent);
  }

  async logApiAccess(event: {
    userId: string;
    endpoint: string;
    method: string;
    timestamp: Date;
    userAgent: string;
    ipAddress?: string;
  }): Promise<void> {
    const auditEvent: AuditEvent = {
      userId: event.userId,
      action: 'api.access',
      resource: event.endpoint,
      details: {
        method: event.method,
        userAgent: event.userAgent,
        ipAddress: event.ipAddress
      },
      timestamp: event.timestamp,
      success: true
    };

    await this.writeAuditLog(auditEvent);
  }

  async logSecurityEvent(event: {
    userId?: string;
    action: 'login_failed' | 'suspicious_activity' | 'rate_limit_exceeded' | 'unauthorized_access';
    details: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const auditEvent: AuditEvent = {
      userId: event.userId || 'anonymous',
      action: `security.${event.action}`,
      resource: 'security',
      details: event.details,
      timestamp: new Date(),
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      success: false
    };

    await this.writeAuditLog(auditEvent);
  }

  private async writeAuditLog(event: AuditEvent): Promise<void> {
    try {
      // Write to database
      await prisma.auditLog.create({
        data: {
          user_id: event.userId !== 'anonymous' ? parseInt(event.userId) : null,
          action: event.action,
          resource: event.resource,
          details: event.details || {},
          ip_address: event.ipAddress,
          user_agent: event.userAgent,
          success: event.success,
          error_message: event.errorMessage,
          created_at: event.timestamp
        }
      });

      // Also log to console for development
      if (process.env.NODE_ENV === 'development') {
        console.log('[AUDIT]', {
          ...event,
          details: dataProtection.maskSensitiveData(event.details || {})
        });
      }

      // In production, you might also want to send to external logging service
      if (process.env.NODE_ENV === 'production' && event.action.startsWith('security.')) {
        // Send security events to monitoring service
        await this.sendToSecurityMonitoring(event);
      }
    } catch (error) {
      console.error('Failed to write audit log:', error);
      // Don't throw - audit logging failure shouldn't break the application
    }
  }

  private async sendToSecurityMonitoring(event: AuditEvent): Promise<void> {
    // Implementation depends on your monitoring service
    // e.g., DataDog, Splunk, CloudWatch, etc.
    console.log('[SECURITY ALERT]', event);
  }
}
```

### Webhook Security

#### Stripe Webhook Verification
```typescript
// src/lib/security/webhook-security.ts
import crypto from 'crypto';
import { headers } from 'next/headers';

export class WebhookSecurity {
  static verifyStripeSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    try {
      const elements = signature.split(',');
      const signatureElements: Record<string, string> = {};
      
      for (const element of elements) {
        const [key, value] = element.split('=');
        signatureElements[key] = value;
      }

      const timestamp = signatureElements.t;
      const signatures = [
        signatureElements.v1,
        signatureElements.v0
      ].filter(Boolean);

      if (!timestamp || signatures.length === 0) {
        return false;
      }

      // Check timestamp (prevent replay attacks)
      const timestampNumber = parseInt(timestamp, 10);
      const currentTime = Math.floor(Date.now() / 1000);
      const timeDifference = Math.abs(currentTime - timestampNumber);
      
      // Reject if timestamp is more than 5 minutes old
      if (timeDifference > 300) {
        console.warn('Webhook timestamp too old:', timeDifference);
        return false;
      }

      // Verify signature
      const payloadForSignature = `${timestamp}.${payload}`;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payloadForSignature)
        .digest('hex');

      return signatures.some(signature => 
        crypto.timingSafeEqual(
          Buffer.from(signature, 'hex'),
          Buffer.from(expectedSignature, 'hex')
        )
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return false;
    }
  }

  static async validateWebhookRequest(request: Request): Promise<{
    isValid: boolean;
    payload: string;
    error?: string;
  }> {
    try {
      const payload = await request.text();
      const signature = request.headers.get('stripe-signature');
      const secret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!signature) {
        return {
          isValid: false,
          payload: '',
          error: 'Missing stripe-signature header'
        };
      }

      if (!secret) {
        return {
          isValid: false,
          payload: '',
          error: 'Missing webhook secret configuration'
        };
      }

      const isValid = this.verifyStripeSignature(payload, signature, secret);
      
      return {
        isValid,
        payload,
        error: isValid ? undefined : 'Invalid signature'
      };
    } catch (error) {
      return {
        isValid: false,
        payload: '',
        error: `Webhook validation error: ${(error as Error).message}`
      };
    }
  }

  // Rate limiting for webhooks
  static async checkWebhookRateLimit(
    eventId: string,
    eventType: string
  ): Promise<boolean> {
    const key = `webhook:${eventType}:${eventId}`;
    
    // Check if we've already processed this event
    const existing = await cacheService.get(key);
    if (existing) {
      console.warn('Duplicate webhook event detected:', eventId);
      return false;
    }

    // Mark event as processed (with 24 hour expiry)
    await cacheService.set(key, 'processed', 24 * 60 * 60);
    return true;
  }
}
```

This comprehensive testing and security strategy ensures robust protection and validation of the subscription system while maintaining integration with existing frameworks and following security best practices.