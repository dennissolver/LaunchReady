-- Add Stripe subscription fields to profiles table
-- Run this in your Supabase SQL Editor

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
ADD COLUMN IF NOT EXISTS stripe_subscription_status text,
ADD COLUMN IF NOT EXISTS stripe_current_period_end timestamptz;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan);

-- Comment for documentation
COMMENT ON COLUMN profiles.plan IS 'User subscription plan: free or pro';
COMMENT ON COLUMN profiles.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN profiles.stripe_subscription_id IS 'Active Stripe subscription ID';
COMMENT ON COLUMN profiles.stripe_subscription_status IS 'Stripe subscription status: active, past_due, canceled, etc.';
COMMENT ON COLUMN profiles.stripe_current_period_end IS 'When current billing period ends';