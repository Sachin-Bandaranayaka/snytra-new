-- Add Stripe and subscription-related columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS subscription_current_period_start TIMESTAMP,
ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMP;

-- Create subscription events table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscription_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  event_type VARCHAR(50) NOT NULL,
  plan_id VARCHAR(100),
  amount DECIMAL(10, 2),
  status VARCHAR(50) NOT NULL,
  stripe_subscription_id VARCHAR(255),
  session_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Create subscription payments table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscription_payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  stripe_invoice_id VARCHAR(255) NOT NULL,
  stripe_subscription_id VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  payment_date TIMESTAMP NOT NULL,
  plan_name VARCHAR(255),
  currency VARCHAR(10) DEFAULT 'usd',
  invoice_pdf VARCHAR(500),
  invoice_number VARCHAR(100),
  payment_method VARCHAR(50) DEFAULT 'card',
  payment_status VARCHAR(50) DEFAULT 'succeeded',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Make sure subscription table has correct fields
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  plan_id INTEGER,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP,
  billing_cycle VARCHAR(50) DEFAULT 'monthly',
  plan VARCHAR(255),
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP,
  next_billing_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
); 