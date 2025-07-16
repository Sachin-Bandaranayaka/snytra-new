# Snytra SaaS Pricing Packages - Data Models and Schema

## Introduction

This document details the data models and database schema changes required for the SaaS pricing packages rebuild. It focuses on extending the existing database structure while maintaining backward compatibility.

## Related Documents

- **Architecture Overview** - High-level approach and integration strategy
- **Data Models and Schema** (this document) - Database design and schema changes
- **API Design and Integration** - API endpoints and external integrations
- **Component Architecture** - Component design and interaction patterns
- **Infrastructure and Deployment** - Deployment strategy and infrastructure changes
- **Testing and Security** - Testing strategy and security requirements

## Data Models and Schema Changes

### New Data Models

#### Enhanced Subscription Plans Model
**Purpose:** Extend existing subscription_plans table with complete SaaS functionality
**Integration:** Enhance existing table structure, maintain backward compatibility

**Key Attributes:**
- stripe_product_id: string - Stripe product identifier for synchronization
- stripe_price_id: string - Stripe price identifier for checkout
- feature_limits: JSON - Granular feature limitations per plan
- trial_settings: JSON - Free trial configuration
- upgrade_downgrade_rules: JSON - Plan change restrictions

**Relationships:**
- **With Existing:** Maintains current user.subscription_plan relationship
- **With New:** Links to enhanced subscription tracking tables

#### User Subscription Tracking Model
**Purpose:** Detailed subscription lifecycle and status tracking
**Integration:** New table linking to existing users table

**Key Attributes:**
- user_id: integer - Foreign key to existing users table
- stripe_subscription_id: string - Stripe subscription identifier
- status: enum - active, trialing, past_due, canceled, incomplete
- current_period_start: timestamp - Billing period start
- current_period_end: timestamp - Billing period end
- trial_start: timestamp - Trial period start
- trial_end: timestamp - Trial period end
- cancel_at_period_end: boolean - Scheduled cancellation flag

**Relationships:**
- **With Existing:** Foreign key to users.id, maintains existing user data
- **With New:** Links to subscription_events for audit trail

#### Subscription Events Model
**Purpose:** Audit trail for all subscription lifecycle events
**Integration:** New table for comprehensive event tracking

**Key Attributes:**
- subscription_id: integer - Links to user subscription
- event_type: string - created, updated, canceled, payment_failed, etc.
- stripe_event_id: string - Stripe webhook event identifier
- event_data: JSON - Complete event payload
- processed_at: timestamp - Event processing time

**Relationships:**
- **With Existing:** Indirect relationship through user subscriptions
- **With New:** Primary audit mechanism for subscription changes

### Schema Integration Strategy

**Database Changes Required:**
- **New Tables:** user_subscriptions, subscription_events, subscription_features
- **Modified Tables:** subscription_plans (add Stripe fields), users (enhance subscription tracking)
- **New Indexes:** subscription status queries, user lookup optimization, event processing
- **Migration Strategy:** Sequential migrations with rollback procedures, data preservation validation

**Backward Compatibility:**
- Existing subscription_plan field in users table maintained for compatibility
- New subscription tracking supplements rather than replaces existing fields
- All existing queries continue to function without modification
- Gradual migration path for existing subscription data

### Detailed Schema Changes

#### Enhanced subscription_plans Table
```sql
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS stripe_product_id VARCHAR(255);
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR(255);
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS feature_limits JSONB;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS trial_settings JSONB;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS upgrade_downgrade_rules JSONB;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS stripe_sync_status VARCHAR(50) DEFAULT 'pending';

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_plans_stripe_product ON subscription_plans(stripe_product_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_stripe_price ON subscription_plans(stripe_price_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);
```

#### New user_subscriptions Table
```sql
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'inactive',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_sub ON user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_period_end ON user_subscriptions(current_period_end);
```

#### New subscription_events Table
```sql
CREATE TABLE IF NOT EXISTS subscription_events (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER REFERENCES user_subscriptions(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    stripe_event_id VARCHAR(255) UNIQUE,
    event_data JSONB,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_events_subscription_id ON subscription_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_stripe_event ON subscription_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_type ON subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_events_processed ON subscription_events(processed_at);
```

#### New subscription_features Table
```sql
CREATE TABLE IF NOT EXISTS subscription_features (
    id SERIAL PRIMARY KEY,
    subscription_plan_id INTEGER NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
    feature_key VARCHAR(100) NOT NULL,
    feature_value JSONB,
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(subscription_plan_id, feature_key)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_features_plan_id ON subscription_features(subscription_plan_id);
CREATE INDEX IF NOT EXISTS idx_subscription_features_key ON subscription_features(feature_key);
CREATE INDEX IF NOT EXISTS idx_subscription_features_enabled ON subscription_features(is_enabled);
```

### Migration Strategy

#### Phase 1: Schema Enhancement
1. Add new columns to existing subscription_plans table
2. Create new user_subscriptions table
3. Create subscription_events table for audit trail
4. Create subscription_features table for granular feature control
5. Add necessary indexes for performance optimization

#### Phase 2: Data Migration
1. Migrate existing subscription data to new structure
2. Populate default feature sets for existing plans
3. Create initial subscription records for existing users
4. Validate data integrity and relationships

#### Phase 3: Cleanup and Optimization
1. Remove deprecated fields (if any)
2. Optimize queries and indexes based on usage patterns
3. Implement data retention policies for events
4. Add monitoring for subscription data health

### Prisma Schema Updates

```prisma
model SubscriptionPlan {
  id                     Int      @id @default(autoincrement())
  name                   String
  description            String?
  price                  Int      // Price in cents
  billing_cycle          String   // monthly, yearly
  features               Json?
  stripe_product_id      String?  @unique
  stripe_price_id        String?  @unique
  feature_limits         Json?
  trial_settings         Json?
  upgrade_downgrade_rules Json?
  is_active              Boolean  @default(true)
  stripe_sync_status     String   @default("pending")
  created_at             DateTime @default(now())
  updated_at             DateTime @updatedAt
  
  // Relationships
  users                  User[]
  user_subscriptions     UserSubscription[]
  subscription_features  SubscriptionFeature[]
  
  @@map("subscription_plans")
}

model UserSubscription {
  id                     Int       @id @default(autoincrement())
  user_id                Int
  subscription_plan_id   Int
  stripe_subscription_id String?   @unique
  stripe_customer_id     String?
  status                 String    @default("inactive")
  current_period_start   DateTime?
  current_period_end     DateTime?
  trial_start            DateTime?
  trial_end              DateTime?
  cancel_at_period_end   Boolean   @default(false)
  canceled_at            DateTime?
  created_at             DateTime  @default(now())
  updated_at             DateTime  @updatedAt
  
  // Relationships
  user                   User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
  subscription_plan      SubscriptionPlan @relation(fields: [subscription_plan_id], references: [id])
  subscription_events    SubscriptionEvent[]
  
  @@map("user_subscriptions")
}

model SubscriptionEvent {
  id              Int       @id @default(autoincrement())
  subscription_id Int?
  event_type      String
  stripe_event_id String?   @unique
  event_data      Json?
  processed_at    DateTime  @default(now())
  created_at      DateTime  @default(now())
  
  // Relationships
  subscription    UserSubscription? @relation(fields: [subscription_id], references: [id], onDelete: Cascade)
  
  @@map("subscription_events")
}

model SubscriptionFeature {
  id                   Int      @id @default(autoincrement())
  subscription_plan_id Int
  feature_key          String
  feature_value        Json?
  is_enabled           Boolean  @default(true)
  created_at           DateTime @default(now())
  updated_at           DateTime @updatedAt
  
  // Relationships
  subscription_plan    SubscriptionPlan @relation(fields: [subscription_plan_id], references: [id], onDelete: Cascade)
  
  @@unique([subscription_plan_id, feature_key])
  @@map("subscription_features")
}
```

### Data Validation and Integrity

#### Validation Rules
1. **Subscription Status Validation:** Ensure status transitions follow valid state machine
2. **Date Consistency:** Trial dates must be within subscription period
3. **Stripe ID Uniqueness:** Prevent duplicate Stripe identifiers
4. **Feature Limit Validation:** Ensure feature limits are within acceptable ranges

#### Integrity Constraints
1. **Foreign Key Constraints:** Maintain referential integrity across all tables
2. **Unique Constraints:** Prevent duplicate Stripe subscriptions and events
3. **Check Constraints:** Validate status values and date ranges
4. **Cascade Rules:** Proper cleanup when users or plans are deleted

### Performance Considerations

#### Query Optimization
1. **Subscription Status Checks:** Optimized indexes for frequent status queries
2. **User Lookup Performance:** Efficient user-to-subscription mapping
3. **Event Processing:** Batch processing for webhook events
4. **Feature Checking:** Cached feature availability checks

#### Monitoring and Metrics
1. **Query Performance:** Monitor slow queries and optimize indexes
2. **Data Growth:** Track table sizes and implement archiving strategies
3. **Subscription Health:** Monitor subscription lifecycle metrics
4. **Event Processing:** Track webhook processing times and failures