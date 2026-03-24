-- ============================================================================
-- MIGRATION: Extend user_onboarding_profiles for V3 onboarding
-- ============================================================================
-- Created: 2026-03-24
-- Purpose: V3 onboarding collects richer data (name, target language,
--          native language, profession, custom scenarios). The original
--          schema was built for the V1 4-question onboarding and is too
--          rigid for V3's professional-focused flow.
--
-- WHAT THIS DOES:
-- 1. Drops rigid CHECK constraints that block V3 data
-- 2. Adds new columns for V3 fields
-- 3. Makes previously NOT NULL columns nullable (V3 doesn't always send them)
-- ============================================================================

-- Step 1: Drop rigid CHECK constraints
-- (V3 sends 'starting_fresh', 'basics', 'conversational', etc. — not the old enum)
ALTER TABLE user_onboarding_profiles
  DROP CONSTRAINT IF EXISTS user_onboarding_profiles_learning_goal_check;

ALTER TABLE user_onboarding_profiles
  DROP CONSTRAINT IF EXISTS user_onboarding_profiles_proficiency_level_check;

ALTER TABLE user_onboarding_profiles
  DROP CONSTRAINT IF EXISTS user_onboarding_profiles_daily_time_minutes_check;

-- Step 2: Make rigid NOT NULL columns nullable
-- (V3 may not send all of these)
ALTER TABLE user_onboarding_profiles
  ALTER COLUMN learning_goal DROP NOT NULL;

ALTER TABLE user_onboarding_profiles
  ALTER COLUMN proficiency_level DROP NOT NULL;

ALTER TABLE user_onboarding_profiles
  ALTER COLUMN daily_time_minutes DROP NOT NULL;

-- Step 3: Add V3 columns
ALTER TABLE user_onboarding_profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS target_language TEXT,
  ADD COLUMN IF NOT EXISTS native_language TEXT,
  ADD COLUMN IF NOT EXISTS goal_custom TEXT,
  ADD COLUMN IF NOT EXISTS profession TEXT,
  ADD COLUMN IF NOT EXISTS profession_custom TEXT,
  ADD COLUMN IF NOT EXISTS custom_scenarios TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS schedule_time INTEGER,
  ADD COLUMN IF NOT EXISTS schedule_days INTEGER,
  ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;

-- Step 4: Add comments for documentation
COMMENT ON COLUMN user_onboarding_profiles.first_name IS 'User display name from V3 onboarding';
COMMENT ON COLUMN user_onboarding_profiles.target_language IS 'Language being learned: english, french, spanish';
COMMENT ON COLUMN user_onboarding_profiles.native_language IS 'User native language (auto-detected from device)';
COMMENT ON COLUMN user_onboarding_profiles.profession IS 'Selected profession category';
COMMENT ON COLUMN user_onboarding_profiles.profession_custom IS 'Custom profession text if not in presets';
COMMENT ON COLUMN user_onboarding_profiles.custom_scenarios IS 'User-created scenario descriptions';
COMMENT ON COLUMN user_onboarding_profiles.completed IS 'Whether onboarding was fully completed';

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================
-- ALTER TABLE user_onboarding_profiles
--   DROP COLUMN IF EXISTS first_name,
--   DROP COLUMN IF EXISTS target_language,
--   DROP COLUMN IF EXISTS native_language,
--   DROP COLUMN IF EXISTS goal_custom,
--   DROP COLUMN IF EXISTS profession,
--   DROP COLUMN IF EXISTS profession_custom,
--   DROP COLUMN IF EXISTS custom_scenarios,
--   DROP COLUMN IF EXISTS schedule_time,
--   DROP COLUMN IF EXISTS schedule_days,
--   DROP COLUMN IF EXISTS completed;
-- ============================================================================
