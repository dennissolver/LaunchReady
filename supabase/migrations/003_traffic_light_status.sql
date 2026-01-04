-- ============================================
-- MIGRATION: Update schema for traffic light system + user contact details
-- Run this in Supabase SQL Editor AFTER the initial schema
-- ============================================

-- ============================================
-- PART 1: Add contact details to profiles
-- ============================================

-- Core contact fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_country_code TEXT DEFAULT '+61';

-- Location fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_state TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_country TEXT DEFAULT 'Australia';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Australia/Sydney';

-- Professional fields  
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Marketing/tracking fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_source TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS how_heard_about_us TEXT;

-- Business context
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS startup_stage TEXT CHECK (startup_stage IN ('idea', 'building', 'mvp', 'launched', 'scaling', 'established'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS funding_stage TEXT CHECK (funding_stage IN ('bootstrapped', 'pre_seed', 'seed', 'series_a', 'series_b_plus', 'profitable'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS team_size TEXT CHECK (team_size IN ('solo', '2-5', '6-10', '11-25', '26-50', '50+'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS primary_industry TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_raised_funding BOOLEAN DEFAULT FALSE;

-- Consent tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

-- ============================================
-- PART 2: Update protection_items for traffic light system
-- ============================================

-- Step 1: Drop the existing constraints
ALTER TABLE protection_items 
DROP CONSTRAINT IF EXISTS protection_items_status_check;

ALTER TABLE protection_items 
DROP CONSTRAINT IF EXISTS protection_items_item_type_check;

-- Step 2: Add new status constraint with traffic light values
ALTER TABLE protection_items 
ADD CONSTRAINT protection_items_status_check 
CHECK (status IN (
  -- Traffic light statuses
  'critical',      -- 🔴 Red - Act immediately
  'at_risk',       -- 🔴 Light red - Needs attention soon
  'pending',       -- 🟡 Amber - In progress / filed
  'in_progress',   -- 🟡 Amber - Being worked on
  'protected',     -- 🟢 Green - Complete and secure
  'registered',    -- 🟢 Green - Officially registered
  'not_started',   -- ⚪ Gray - To do
  -- Legacy values (for backwards compatibility)
  'urgent',
  'expired',
  'na',
  'available'
));

-- Step 3: Add new item_type constraint with specific IP categories
ALTER TABLE protection_items 
ADD CONSTRAINT protection_items_item_type_check 
CHECK (item_type IN (
  -- Brand & Trademarks
  'trademark',
  'company_name_tm',
  'product_name_tm',
  'logo_tm',
  'domain',
  'social_handles',
  'social',
  
  -- Patents
  'patent',
  'provisional_patent',
  'patent_search',
  'invention_disclosure',
  
  -- Copyright
  'copyright',
  'code_copyright',
  'design_copyright',
  'content_copyright',
  
  -- Contracts
  'contract',
  'ip_assignment',
  'contractor_ip',
  'employee_ip',
  'cofounder_ip',
  'nda',
  
  -- Trade Secrets
  'trade_secret',
  'trade_secret_policy',
  'access_controls',
  
  -- Other
  'design',
  'business_registration'
));

-- Step 4: Update evidence_events to allow voice_discovery source
ALTER TABLE evidence_events 
DROP CONSTRAINT IF EXISTS evidence_events_source_check;

ALTER TABLE evidence_events 
ADD CONSTRAINT evidence_events_source_check 
CHECK (source IN (
  'github', 'vercel', 'netlify', 'supabase', 'firebase', 
  'railway', 'render', 'figma', 'stripe', 'namecheap', 
  'elevenlabs', 'canva', 'manual',
  -- New sources
  'voice_discovery',
  'launchready'
));

-- ============================================
-- DONE! Schema updated for traffic light system
-- ============================================
