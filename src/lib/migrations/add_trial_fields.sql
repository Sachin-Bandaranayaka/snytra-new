-- Migration to add trial-related fields to subscription_plans table
ALTER TABLE subscription_plans 
    ADD COLUMN IF NOT EXISTS has_trial BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS trial_days INTEGER DEFAULT 0;

-- Update any existing data
UPDATE subscription_plans 
SET has_trial = FALSE, trial_days = 0
WHERE has_trial IS NULL OR trial_days IS NULL;

-- Update subscription events table to handle trial events
ALTER TABLE subscription_events
    ADD COLUMN IF NOT EXISTS trial_status VARCHAR(50);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_subscription_has_trial ON subscription_plans(has_trial); 