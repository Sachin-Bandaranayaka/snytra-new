# Snytra SaaS Pricing Packages - API Design and Integration

## Introduction

This document details the API design and external integrations required for the SaaS pricing packages rebuild. It focuses on extending existing API endpoints and adding new ones while maintaining backward compatibility.

## Related Documents

- **Architecture Overview** - High-level approach and integration strategy
- **Data Models and Schema** - Database design and schema changes
- **API Design and Integration** (this document) - API endpoints and external integrations
- **Component Architecture** - Component design and interaction patterns
- **Infrastructure and Deployment** - Deployment strategy and infrastructure changes
- **Testing and Security** - Testing strategy and security requirements

## API Integration Strategy

**API Integration Strategy:** Extend existing `/api/subscription-plans` endpoints, maintain current response format, add new webhook endpoints, ensure backward compatibility
**Authentication:** Integrate with existing NextAuth session management, maintain role-based access control
**Versioning:** No versioning required - enhancement of existing endpoints with backward compatibility

## New API Endpoints

### Enhanced Subscription Plans Management
- **Method:** GET/POST/PUT/DELETE
- **Endpoint:** `/api/subscription-plans` (enhanced existing)
- **Purpose:** Complete CRUD operations with Stripe synchronization
- **Integration:** Extends existing endpoint with enhanced Stripe integration

#### GET /api/subscription-plans
**Purpose:** Retrieve all subscription plans with Stripe sync status

**Request:** GET with optional query parameters
```
GET /api/subscription-plans?include_inactive=false&sync_status=completed
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Basic Plan",
      "description": "Essential restaurant management",
      "price": 2999,
      "billing_cycle": "monthly",
      "features": ["menu_management", "basic_analytics"],
      "stripe_product_id": "prod_abc123",
      "stripe_price_id": "price_def456",
      "feature_limits": {
        "max_menu_items": 100,
        "max_staff_accounts": 5
      },
      "trial_settings": {
        "trial_days": 14,
        "trial_enabled": true
      },
      "is_active": true,
      "stripe_sync_status": "completed"
    }
  ]
}
```

#### POST /api/subscription-plans
**Purpose:** Create new subscription plan with Stripe synchronization

**Request:**
```json
{
  "name": "Premium Plan",
  "description": "Advanced restaurant management",
  "price": 9999,
  "billing_cycle": "monthly",
  "features": ["menu_management", "advanced_analytics", "inventory_tracking"],
  "feature_limits": {
    "max_menu_items": 500,
    "max_staff_accounts": 25
  },
  "trial_settings": {
    "trial_days": 14,
    "trial_enabled": true
  },
  "stripe_sync": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "stripe_product_id": "prod_xyz789",
    "stripe_price_id": "price_uvw012",
    "sync_status": "completed",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### PUT /api/subscription-plans/[id]
**Purpose:** Update existing subscription plan with Stripe synchronization

**Request:**
```json
{
  "name": "Premium Plan Updated",
  "price": 10999,
  "feature_limits": {
    "max_menu_items": 750,
    "max_staff_accounts": 30
  },
  "sync_with_stripe": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "updated_fields": ["name", "price", "feature_limits"],
    "stripe_sync_status": "completed",
    "updated_at": "2024-01-15T11:45:00Z"
  }
}
```

### Stripe Webhook Handler
- **Method:** POST
- **Endpoint:** `/api/webhooks/stripe`
- **Purpose:** Handle all Stripe subscription lifecycle events
- **Integration:** New endpoint following existing API handler patterns

**Request:**
```json
{
  "id": "evt_1234567890",
  "type": "customer.subscription.updated",
  "data": {
    "object": {
      "id": "sub_abc123",
      "status": "active",
      "current_period_start": 1640995200,
      "current_period_end": 1643673600,
      "customer": "cus_def456",
      "items": {
        "data": [
          {
            "price": {
              "id": "price_ghi789"
            }
          }
        ]
      }
    }
  },
  "created": 1640995200
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "processed": true,
    "event_id": "evt_1234567890",
    "subscription_updated": true,
    "user_id": 123
  }
}
```

### Subscription Status Check
- **Method:** GET
- **Endpoint:** `/api/subscription/status`
- **Purpose:** Real-time subscription status verification for access control
- **Integration:** New endpoint using existing authentication patterns

**Request:** GET with NextAuth session

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "active",
    "plan": {
      "id": 2,
      "name": "Premium Plan",
      "billing_cycle": "monthly"
    },
    "features": {
      "menu_management": true,
      "advanced_analytics": true,
      "inventory_tracking": true
    },
    "limits": {
      "max_menu_items": 500,
      "max_staff_accounts": 25,
      "current_usage": {
        "menu_items": 87,
        "staff_accounts": 12
      }
    },
    "billing_info": {
      "trial_end": null,
      "next_billing_date": "2024-02-01T00:00:00Z",
      "amount_due": 9999
    }
  }
}
```

### User Subscription Management
- **Method:** GET/POST/PUT/DELETE
- **Endpoint:** `/api/user/subscription`
- **Purpose:** User-facing subscription management operations
- **Integration:** New endpoint integrating with existing user authentication

#### GET /api/user/subscription
**Purpose:** Get current user's subscription details

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub_abc123",
      "status": "active",
      "plan": {
        "name": "Premium Plan",
        "price": 9999,
        "billing_cycle": "monthly"
      },
      "current_period_end": "2024-02-01T00:00:00Z",
      "cancel_at_period_end": false
    },
    "billing_history": [
      {
        "date": "2024-01-01T00:00:00Z",
        "amount": 9999,
        "status": "paid",
        "invoice_url": "https://invoice.stripe.com/..."
      }
    ],
    "usage": {
      "menu_items": 87,
      "staff_accounts": 12
    }
  }
}
```

#### POST /api/user/subscription
**Purpose:** Create new subscription for user

**Request:**
```json
{
  "plan_id": 2,
  "payment_method_id": "pm_abc123",
  "trial": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription_id": "sub_def456",
    "status": "trialing",
    "trial_end": "2024-01-29T00:00:00Z",
    "client_secret": "seti_abc123_secret_def456"
  }
}
```

#### PUT /api/user/subscription
**Purpose:** Update user's subscription (plan change, cancellation)

**Request (Plan Change):**
```json
{
  "action": "change_plan",
  "new_plan_id": 3,
  "proration": true,
  "effective_date": "immediate"
}
```

**Request (Cancellation):**
```json
{
  "action": "cancel",
  "immediate": false,
  "reason": "switching_providers"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription_id": "sub_abc123",
    "status": "active",
    "changes_applied": {
      "plan_changed": true,
      "proration_amount": 1500,
      "effective_date": "2024-01-15T12:00:00Z"
    },
    "next_billing_date": "2024-02-01T00:00:00Z"
  }
}
```

### Subscription Checkout
- **Method:** POST
- **Endpoint:** `/api/subscription/checkout`
- **Purpose:** Create Stripe checkout session for subscription
- **Integration:** New endpoint using existing Stripe integration patterns

**Request:**
```json
{
  "plan_id": 2,
  "success_url": "https://app.snytra.com/subscription/success",
  "cancel_url": "https://app.snytra.com/pricing",
  "trial": true,
  "customer_email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "checkout_session_id": "cs_abc123",
    "checkout_url": "https://checkout.stripe.com/pay/cs_abc123",
    "expires_at": "2024-01-15T13:30:00Z"
  }
}
```

### Admin Subscription Management
- **Method:** GET/POST/PUT/DELETE
- **Endpoint:** `/api/admin/subscriptions`
- **Purpose:** Admin interface for subscription management
- **Integration:** Extends existing admin API patterns

#### GET /api/admin/subscriptions
**Purpose:** Get all subscriptions with filtering and pagination

**Request:**
```
GET /api/admin/subscriptions?status=active&plan_id=2&page=1&limit=50
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscriptions": [
      {
        "id": 1,
        "user": {
          "id": 123,
          "email": "user@example.com",
          "name": "John Doe"
        },
        "plan": {
          "id": 2,
          "name": "Premium Plan"
        },
        "status": "active",
        "created_at": "2024-01-01T00:00:00Z",
        "current_period_end": "2024-02-01T00:00:00Z",
        "mrr": 9999
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "pages": 3
    },
    "summary": {
      "total_subscriptions": 150,
      "active_subscriptions": 120,
      "total_mrr": 1199880,
      "churn_rate": 2.5
    }
  }
}
```

## External API Integration

### Stripe API Enhanced Integration
- **Purpose:** Complete subscription lifecycle management with products, prices, customers, and webhooks
- **Documentation:** https://stripe.com/docs/api
- **Base URL:** https://api.stripe.com/v1
- **Authentication:** Bearer token with existing Stripe secret key
- **Integration Method:** Enhanced existing Stripe SDK usage with comprehensive webhook handling

#### Key Endpoints Used

##### Product Management
```javascript
// Create Product
POST /v1/products
{
  "name": "Premium Plan",
  "description": "Advanced restaurant management features",
  "metadata": {
    "snytra_plan_id": "2"
  }
}

// Update Product
POST /v1/products/{product_id}
{
  "name": "Premium Plan Updated",
  "metadata": {
    "snytra_plan_id": "2",
    "last_sync": "2024-01-15T12:00:00Z"
  }
}
```

##### Price Management
```javascript
// Create Price
POST /v1/prices
{
  "product": "prod_abc123",
  "unit_amount": 9999,
  "currency": "usd",
  "recurring": {
    "interval": "month"
  },
  "metadata": {
    "snytra_plan_id": "2"
  }
}
```

##### Checkout Session
```javascript
// Create Checkout Session
POST /v1/checkout/sessions
{
  "mode": "subscription",
  "line_items": [
    {
      "price": "price_abc123",
      "quantity": 1
    }
  ],
  "success_url": "https://app.snytra.com/subscription/success?session_id={CHECKOUT_SESSION_ID}",
  "cancel_url": "https://app.snytra.com/pricing",
  "customer_email": "user@example.com",
  "subscription_data": {
    "trial_period_days": 14,
    "metadata": {
      "snytra_user_id": "123"
    }
  }
}
```

##### Subscription Management
```javascript
// Update Subscription
POST /v1/subscriptions/{subscription_id}
{
  "items": [
    {
      "id": "si_abc123",
      "price": "price_new456"
    }
  ],
  "proration_behavior": "create_prorations"
}

// Cancel Subscription
DELETE /v1/subscriptions/{subscription_id}
{
  "invoice_now": false,
  "prorate": true
}
```

##### Customer Management
```javascript
// Create Customer
POST /v1/customers
{
  "email": "user@example.com",
  "name": "John Doe",
  "metadata": {
    "snytra_user_id": "123"
  }
}

// Update Customer
POST /v1/customers/{customer_id}
{
  "metadata": {
    "snytra_user_id": "123",
    "last_login": "2024-01-15T12:00:00Z"
  }
}
```

##### Webhook Configuration
```javascript
// Create Webhook Endpoint
POST /v1/webhook_endpoints
{
  "url": "https://app.snytra.com/api/webhooks/stripe",
  "enabled_events": [
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.payment_succeeded",
    "invoice.payment_failed",
    "customer.subscription.trial_will_end"
  ]
}
```

### Error Handling Strategy

#### Stripe API Error Handling
```javascript
// Rate Limiting
if (error.type === 'RateLimitError') {
  // Implement exponential backoff
  await delay(Math.pow(2, retryCount) * 1000);
  return retryRequest();
}

// Idempotency
const idempotencyKey = `${operation}_${userId}_${timestamp}`;
const request = {
  headers: {
    'Idempotency-Key': idempotencyKey
  }
};

// Webhook Deduplication
const existingEvent = await db.subscription_events.findUnique({
  where: { stripe_event_id: event.id }
});
if (existingEvent) {
  return { success: true, data: { already_processed: true } };
}
```

#### API Response Error Handling
```javascript
// Standardized Error Response
function handleApiError(error, context) {
  const errorResponse = {
    success: false,
    error: {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      context: context,
      timestamp: new Date().toISOString()
    }
  };
  
  // Log error for monitoring
  logger.error('API Error', {
    error: errorResponse,
    stack: error.stack,
    context
  });
  
  return errorResponse;
}
```

### API Security

#### Authentication and Authorization
```javascript
// Subscription API Middleware
export async function subscriptionApiAuth(req, res, next) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
    });
  }
  
  // Check subscription status for protected endpoints
  if (req.url.includes('/premium/')) {
    const subscription = await checkUserSubscription(session.user.id);
    if (!subscription.hasAccess) {
      return res.status(403).json({
        success: false,
        error: { code: 'SUBSCRIPTION_REQUIRED', message: 'Active subscription required' }
      });
    }
  }
  
  next();
}
```

#### Webhook Security
```javascript
// Stripe Webhook Signature Verification
export async function verifyStripeWebhook(req) {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    return { valid: true, event };
  } catch (err) {
    logger.error('Webhook signature verification failed', { error: err.message });
    return { valid: false, error: err.message };
  }
}
```

### Performance Optimization

#### Caching Strategy
```javascript
// Subscription Status Caching
const CACHE_TTL = 300; // 5 minutes

export async function getCachedSubscriptionStatus(userId) {
  const cacheKey = `subscription:${userId}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const status = await fetchSubscriptionStatus(userId);
  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(status));
  
  return status;
}
```

#### Database Query Optimization
```javascript
// Optimized Subscription Query
export async function getSubscriptionWithDetails(userId) {
  return await prisma.userSubscription.findFirst({
    where: { user_id: userId, status: { in: ['active', 'trialing'] } },
    include: {
      subscription_plan: {
        include: {
          subscription_features: true
        }
      }
    },
    orderBy: { created_at: 'desc' }
  });
}
```