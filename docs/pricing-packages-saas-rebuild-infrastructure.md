# Snytra SaaS Pricing Packages - Infrastructure and Deployment

## Introduction

This document outlines the infrastructure and deployment strategy for the SaaS pricing packages rebuild. It focuses on leveraging existing infrastructure while adding minimal new components for subscription management.

## Related Documents

- **Architecture Overview** - High-level approach and integration strategy
- **Data Models and Schema** - Database design and schema changes
- **API Design and Integration** - API endpoints and external integrations
- **Component Architecture** - Component design and interaction patterns
- **Infrastructure and Deployment** (this document) - Deployment strategy and infrastructure changes
- **Testing and Security** - Testing strategy and security requirements

## Current Infrastructure Analysis

### Existing Infrastructure Stack

**Application Layer:**
- **Framework:** Next.js 15 with React 18
- **Runtime:** Node.js (latest LTS)
- **Package Manager:** npm/yarn
- **Build System:** Next.js built-in build system

**Database Layer:**
- **Primary Database:** PostgreSQL
- **ORM:** Prisma 6.6.0
- **Connection Pooling:** Prisma connection pooling
- **Migrations:** Prisma migrate

**Authentication & Security:**
- **Authentication:** NextAuth.js
- **Session Management:** JWT/Database sessions
- **Security Headers:** Next.js security headers

**External Integrations:**
- **Payment Processing:** Stripe (existing integration)
- **Email Service:** [Current email provider]
- **File Storage:** [Current storage solution]

**Deployment Environment:**
- **Hosting Platform:** [Current hosting platform - Vercel/AWS/etc.]
- **Domain Management:** [Current domain setup]
- **SSL/TLS:** [Current SSL setup]
- **CDN:** [Current CDN if any]

### Infrastructure Strengths
- Modern Next.js stack with excellent performance
- Robust PostgreSQL database with Prisma ORM
- Existing Stripe integration foundation
- Scalable authentication system with NextAuth
- Production-ready deployment pipeline

### Infrastructure Gaps for SaaS Enhancement
- **Subscription State Caching:** Need Redis/memory cache for subscription status
- **Webhook Processing:** Enhanced webhook handling for Stripe events
- **Background Jobs:** Subscription sync and billing operations
- **Monitoring:** Subscription-specific metrics and alerts
- **Backup Strategy:** Enhanced backup for subscription data

## Enhanced Infrastructure Architecture

### Minimal Infrastructure Additions

#### 1. Caching Layer (Optional but Recommended)
**Purpose:** Cache subscription status and feature access for performance
**Technology:** Redis or in-memory caching
**Integration:** Seamless integration with existing application

**Implementation Options:**

**Option A: Redis (Recommended for Production)**
```yaml
# docker-compose.yml addition
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped

volumes:
  redis_data:
```

**Option B: In-Memory Cache (Development/Small Scale)**
```typescript
// src/lib/cache/memory-cache.ts
class MemoryCache {
  private cache = new Map<string, { value: any; expires: number }>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry || entry.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    this.cache.set(key, {
      value,
      expires: Date.now() + (ttlSeconds * 1000)
    });
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expires < now) {
        this.cache.delete(key);
      }
    }
  }
}

export const memoryCache = new MemoryCache();
```

**Cache Integration:**
```typescript
// src/lib/cache/cache-service.ts
interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: any, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

class RedisCacheService implements CacheService {
  constructor(private redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async clear(): Promise<void> {
    await this.redis.flushall();
  }
}

// Factory function for cache service
export function createCacheService(): CacheService {
  if (process.env.REDIS_URL) {
    const redis = new Redis(process.env.REDIS_URL);
    return new RedisCacheService(redis);
  } else {
    return memoryCache;
  }
}
```

#### 2. Enhanced Webhook Processing
**Purpose:** Reliable processing of Stripe webhook events
**Technology:** Next.js API routes with enhanced error handling
**Integration:** Extends existing Stripe webhook setup

**Webhook Infrastructure:**
```typescript
// src/lib/webhooks/webhook-processor.ts
interface WebhookProcessor {
  process(event: Stripe.Event): Promise<WebhookResult>;
  retry(eventId: string, attempt: number): Promise<WebhookResult>;
  handleFailure(event: Stripe.Event, error: Error): Promise<void>;
}

class StripeWebhookProcessor implements WebhookProcessor {
  private maxRetries = 3;
  private retryDelays = [1000, 5000, 15000]; // 1s, 5s, 15s

  async process(event: Stripe.Event): Promise<WebhookResult> {
    try {
      // Log webhook event
      await this.logWebhookEvent(event);

      // Process based on event type
      switch (event.type) {
        case 'customer.subscription.created':
          return await this.handleSubscriptionCreated(event);
        case 'customer.subscription.updated':
          return await this.handleSubscriptionUpdated(event);
        case 'customer.subscription.deleted':
          return await this.handleSubscriptionDeleted(event);
        case 'invoice.payment_succeeded':
          return await this.handlePaymentSucceeded(event);
        case 'invoice.payment_failed':
          return await this.handlePaymentFailed(event);
        default:
          return { success: true, message: `Unhandled event type: ${event.type}` };
      }
    } catch (error) {
      await this.handleFailure(event, error as Error);
      throw error;
    }
  }

  private async handleSubscriptionCreated(event: Stripe.Event): Promise<WebhookResult> {
    const subscription = event.data.object as Stripe.Subscription;
    
    // Update database
    await prisma.userSubscription.upsert({
      where: {
        stripe_subscription_id: subscription.id
      },
      update: {
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000),
        updated_at: new Date()
      },
      create: {
        user_id: await this.getUserIdFromCustomer(subscription.customer as string),
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
        subscription_plan_id: await this.getPlanIdFromPrice(subscription.items.data[0].price.id),
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000),
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    // Clear cache
    const userId = await this.getUserIdFromCustomer(subscription.customer as string);
    await cacheService.delete(`subscription:${userId}`);

    // Send welcome email
    await this.sendWelcomeEmail(userId, subscription);

    return { success: true, message: 'Subscription created successfully' };
  }

  private async logWebhookEvent(event: Stripe.Event): Promise<void> {
    await prisma.webhookEvent.create({
      data: {
        stripe_event_id: event.id,
        event_type: event.type,
        processed: false,
        created_at: new Date(event.created * 1000),
        data: event.data.object as any
      }
    });
  }
}
```

**Webhook Endpoint Enhancement:**
```typescript
// src/app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { StripeWebhookProcessor } from '@/lib/webhooks/webhook-processor';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const processor = new StripeWebhookProcessor();

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    const result = await processor.process(event);
    
    // Mark as processed
    await prisma.webhookEvent.update({
      where: { stripe_event_id: event.id },
      data: { processed: true, processed_at: new Date() }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Webhook processing failed:', error);
    
    // Log failure
    await prisma.webhookEvent.update({
      where: { stripe_event_id: event.id },
      data: { 
        processed: false, 
        error_message: (error as Error).message,
        retry_count: { increment: 1 }
      }
    });

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
```

#### 3. Background Job Processing (Optional)
**Purpose:** Handle subscription synchronization and billing operations
**Technology:** Simple cron jobs or job queue
**Integration:** Minimal addition to existing infrastructure

**Simple Cron Implementation:**
```typescript
// src/lib/jobs/subscription-sync.ts
export class SubscriptionSyncJob {
  private isRunning = false;

  async run(): Promise<void> {
    if (this.isRunning) {
      console.log('Subscription sync already running, skipping...');
      return;
    }

    this.isRunning = true;
    console.log('Starting subscription sync job...');

    try {
      // Sync subscriptions that haven't been updated in 24 hours
      const staleSubscriptions = await prisma.userSubscription.findMany({
        where: {
          updated_at: {
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000)
          },
          status: { in: ['active', 'trialing', 'past_due'] }
        },
        take: 50 // Process in batches
      });

      for (const subscription of staleSubscriptions) {
        await this.syncSubscription(subscription);
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`Synced ${staleSubscriptions.length} subscriptions`);
    } catch (error) {
      console.error('Subscription sync job failed:', error);
    } finally {
      this.isRunning = false;
    }
  }

  private async syncSubscription(subscription: any): Promise<void> {
    try {
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripe_subscription_id
      );

      await prisma.userSubscription.update({
        where: { id: subscription.id },
        data: {
          status: stripeSubscription.status,
          current_period_start: new Date(stripeSubscription.current_period_start * 1000),
          current_period_end: new Date(stripeSubscription.current_period_end * 1000),
          updated_at: new Date()
        }
      });

      // Clear cache
      await cacheService.delete(`subscription:${subscription.user_id}`);
    } catch (error) {
      console.error(`Failed to sync subscription ${subscription.id}:`, error);
    }
  }
}

// API endpoint for manual trigger
// src/app/api/admin/sync-subscriptions/route.ts
export async function POST() {
  const syncJob = new SubscriptionSyncJob();
  await syncJob.run();
  return NextResponse.json({ success: true });
}
```

**Cron Setup (if using Vercel):**
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/sync-subscriptions",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

## Deployment Strategy

### Development Environment Setup

**Local Development Requirements:**
```bash
# .env.local
DATABASE_URL="postgresql://username:password@localhost:5432/snytra_dev"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
REDIS_URL="redis://localhost:6379" # Optional
```

**Development Setup Script:**
```bash
#!/bin/bash
# scripts/setup-dev.sh

echo "Setting up development environment..."

# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Seed database with subscription plans
npx prisma db seed

# Start Redis (if using Docker)
docker-compose up -d redis

echo "Development environment ready!"
echo "Run 'npm run dev' to start the development server"
```

**Database Seeding for Development:**
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create subscription plans
  const basicPlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'Basic' },
    update: {},
    create: {
      name: 'Basic',
      description: 'Perfect for small restaurants',
      price: 29.99,
      billing_cycle: 'monthly',
      stripe_product_id: 'prod_basic_dev',
      stripe_price_id: 'price_basic_monthly_dev',
      trial_settings: {
        trial_enabled: true,
        trial_days: 14
      },
      is_active: true
    }
  });

  const premiumPlan = await prisma.subscriptionPlan.upsert({
    where: { name: 'Premium' },
    update: {},
    create: {
      name: 'Premium',
      description: 'For growing restaurant chains',
      price: 79.99,
      billing_cycle: 'monthly',
      stripe_product_id: 'prod_premium_dev',
      stripe_price_id: 'price_premium_monthly_dev',
      trial_settings: {
        trial_enabled: true,
        trial_days: 14
      },
      is_active: true
    }
  });

  // Create subscription features
  const features = [
    { key: 'menu_management', name: 'Menu Management', basic: true, premium: true },
    { key: 'order_tracking', name: 'Order Tracking', basic: true, premium: true },
    { key: 'analytics', name: 'Analytics Dashboard', basic: false, premium: true },
    { key: 'multi_location', name: 'Multi-Location Support', basic: false, premium: true },
    { key: 'api_access', name: 'API Access', basic: false, premium: true }
  ];

  for (const feature of features) {
    if (feature.basic) {
      await prisma.subscriptionFeature.upsert({
        where: {
          subscription_plan_id_feature_key: {
            subscription_plan_id: basicPlan.id,
            feature_key: feature.key
          }
        },
        update: {},
        create: {
          subscription_plan_id: basicPlan.id,
          feature_key: feature.key,
          feature_name: feature.name,
          is_enabled: true
        }
      });
    }

    if (feature.premium) {
      await prisma.subscriptionFeature.upsert({
        where: {
          subscription_plan_id_feature_key: {
            subscription_plan_id: premiumPlan.id,
            feature_key: feature.key
          }
        },
        update: {},
        create: {
          subscription_plan_id: premiumPlan.id,
          feature_key: feature.key,
          feature_name: feature.name,
          is_enabled: true
        }
      });
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Staging Environment

**Staging Configuration:**
```bash
# .env.staging
DATABASE_URL="postgresql://username:password@staging-db:5432/snytra_staging"
NEXTAUTH_SECRET="staging-nextauth-secret"
NEXTAUTH_URL="https://staging.snytra.com"
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_staging_..."
REDIS_URL="redis://staging-redis:6379"
```

**Staging Deployment Pipeline:**
```yaml
# .github/workflows/staging.yml
name: Deploy to Staging

on:
  push:
    branches: [ develop ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test
      
      - name: Build application
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.STAGING_DATABASE_URL }}
      
      - name: Run database migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.STAGING_DATABASE_URL }}
      
      - name: Deploy to staging
        run: |
          # Deploy to your staging environment
          # This will vary based on your hosting platform
```

### Production Environment

**Production Configuration:**
```bash
# .env.production
DATABASE_URL="postgresql://username:password@prod-db:5432/snytra_production"
NEXTAUTH_SECRET="production-nextauth-secret"
NEXTAUTH_URL="https://app.snytra.com"
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_production_..."
REDIS_URL="redis://production-redis:6379"
```

**Production Deployment Strategy:**

1. **Blue-Green Deployment Approach:**
   - Deploy to staging environment (green)
   - Run comprehensive tests
   - Switch traffic from current production (blue) to new deployment (green)
   - Keep blue environment as rollback option

2. **Database Migration Strategy:**
   ```bash
   # Pre-deployment: Run migrations
   npx prisma migrate deploy
   
   # Post-deployment: Verify data integrity
   npm run verify-subscription-data
   ```

3. **Rollback Strategy:**
   ```bash
   # scripts/rollback.sh
   #!/bin/bash
   
   echo "Starting rollback process..."
   
   # Switch traffic back to previous version
   # This will vary based on your hosting platform
   
   # Rollback database if needed (use with extreme caution)
   # npx prisma migrate reset --force
   
   echo "Rollback completed"
   ```

### Monitoring and Observability

**Application Monitoring:**
```typescript
// src/lib/monitoring/metrics.ts
interface MetricsCollector {
  recordSubscriptionEvent(event: string, metadata?: Record<string, any>): void;
  recordApiCall(endpoint: string, duration: number, status: number): void;
  recordError(error: Error, context?: Record<string, any>): void;
}

class SimpleMetricsCollector implements MetricsCollector {
  recordSubscriptionEvent(event: string, metadata?: Record<string, any>): void {
    console.log(`[METRIC] Subscription Event: ${event}`, metadata);
    
    // In production, send to your monitoring service
    // e.g., DataDog, New Relic, CloudWatch, etc.
  }

  recordApiCall(endpoint: string, duration: number, status: number): void {
    console.log(`[METRIC] API Call: ${endpoint} - ${duration}ms - ${status}`);
  }

  recordError(error: Error, context?: Record<string, any>): void {
    console.error(`[ERROR] ${error.message}`, { error, context });
    
    // In production, send to error tracking service
    // e.g., Sentry, Bugsnag, etc.
  }
}

export const metrics = new SimpleMetricsCollector();
```

**Health Check Endpoints:**
```typescript
// src/app/api/health/route.ts
export async function GET() {
  const checks = {
    database: false,
    stripe: false,
    cache: false,
    timestamp: new Date().toISOString()
  };

  try {
    // Database check
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  try {
    // Stripe check
    await stripe.accounts.retrieve();
    checks.stripe = true;
  } catch (error) {
    console.error('Stripe health check failed:', error);
  }

  try {
    // Cache check (if using Redis)
    if (process.env.REDIS_URL) {
      await cacheService.set('health-check', 'ok', 10);
      const result = await cacheService.get('health-check');
      checks.cache = result === 'ok';
    } else {
      checks.cache = true; // Memory cache always available
    }
  } catch (error) {
    console.error('Cache health check failed:', error);
  }

  const isHealthy = Object.values(checks).every(check => 
    typeof check === 'boolean' ? check : true
  );

  return Response.json(checks, {
    status: isHealthy ? 200 : 503
  });
}
```

### Security Considerations

**Environment Security:**
```bash
# Security checklist for production

# 1. Secure environment variables
# - Use secure secret management (AWS Secrets Manager, etc.)
# - Rotate secrets regularly
# - Never commit secrets to version control

# 2. Database security
# - Use connection pooling
# - Enable SSL connections
# - Regular security updates
# - Backup encryption

# 3. API security
# - Rate limiting on webhook endpoints
# - Webhook signature verification
# - CORS configuration
# - Security headers

# 4. Infrastructure security
# - VPC/network isolation
# - Firewall rules
# - Regular security patches
# - Access logging
```

**Security Headers Configuration:**
```typescript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' api.stripe.com;"
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
```

## Performance Optimization

### Database Performance
```sql
-- Add indexes for subscription queries
CREATE INDEX CONCURRENTLY idx_user_subscriptions_user_status 
ON user_subscriptions(user_id, status) 
WHERE status IN ('active', 'trialing');

CREATE INDEX CONCURRENTLY idx_user_subscriptions_stripe_id 
ON user_subscriptions(stripe_subscription_id);

CREATE INDEX CONCURRENTLY idx_subscription_events_created 
ON subscription_events(created_at DESC);

CREATE INDEX CONCURRENTLY idx_webhook_events_processed 
ON webhook_events(processed, created_at) 
WHERE NOT processed;
```

### Application Performance
```typescript
// src/lib/performance/subscription-cache.ts
class SubscriptionCache {
  private static readonly CACHE_TTL = 300; // 5 minutes
  private static readonly CACHE_PREFIX = 'subscription:';

  static async getSubscriptionStatus(userId: number): Promise<SubscriptionStatus | null> {
    const cacheKey = `${this.CACHE_PREFIX}${userId}`;
    return await cacheService.get<SubscriptionStatus>(cacheKey);
  }

  static async setSubscriptionStatus(
    userId: number, 
    status: SubscriptionStatus
  ): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${userId}`;
    await cacheService.set(cacheKey, status, this.CACHE_TTL);
  }

  static async invalidateSubscription(userId: number): Promise<void> {
    const cacheKey = `${this.CACHE_PREFIX}${userId}`;
    await cacheService.delete(cacheKey);
  }
}
```

## Backup and Recovery

### Database Backup Strategy
```bash
#!/bin/bash
# scripts/backup-database.sh

BACKUP_DIR="/backups/$(date +%Y-%m-%d)"
mkdir -p $BACKUP_DIR

# Full database backup
pg_dump $DATABASE_URL > $BACKUP_DIR/full_backup.sql

# Subscription-specific backup
pg_dump $DATABASE_URL \
  --table=subscription_plans \
  --table=user_subscriptions \
  --table=subscription_features \
  --table=subscription_events \
  --table=webhook_events \
  > $BACKUP_DIR/subscription_backup.sql

# Compress backups
gzip $BACKUP_DIR/*.sql

# Upload to cloud storage (optional)
# aws s3 cp $BACKUP_DIR s3://your-backup-bucket/$(date +%Y-%m-%d)/ --recursive

echo "Backup completed: $BACKUP_DIR"
```

### Recovery Procedures
```bash
#!/bin/bash
# scripts/restore-database.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file>"
  exit 1
fi

echo "Restoring database from $BACKUP_FILE"
echo "WARNING: This will overwrite the current database!"
read -p "Are you sure? (y/N) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Restore database
  psql $DATABASE_URL < $BACKUP_FILE
  
  # Run migrations to ensure schema is up to date
  npx prisma migrate deploy
  
  echo "Database restored successfully"
else
  echo "Restore cancelled"
fi
```

This infrastructure approach maintains the existing system's simplicity while adding the minimal necessary components for robust subscription management. The strategy focuses on leveraging existing infrastructure and adding only essential new components with clear integration paths.