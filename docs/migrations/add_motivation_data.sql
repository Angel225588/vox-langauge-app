-- ============================================================================
-- MIGRATION: Add motivation_data to user_onboarding_profiles
-- ============================================================================
-- Created: 2025-11-24
-- Purpose: Add JSONB column to store user's deep motivations from onboarding
--
-- This column stores:
--   - why: String - Why they want to learn
--   - fear: String - Biggest fear or frustration
--   - stakes: String - What happens if they don't reach goal
--   - timeline: String - Deadline or timeline
--
-- Example data:
-- {
--   "why": "I want to confidently interview for jobs abroad",
--   "fear": "I'll freeze up when speaking and sound stupid",
--   "stakes": "I'll miss out on better job opportunities",
--   "timeline": "3 months"
-- }
-- ============================================================================

-- Add motivation_data column to user_onboarding_profiles
ALTER TABLE user_onboarding_profiles
ADD COLUMN IF NOT EXISTS motivation_data JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN user_onboarding_profiles.motivation_data IS
'Deep motivation data collected during onboarding: why, fear, stakes, timeline. Used by Gemini AI to generate highly personalized learning paths.';

-- Create index for faster querying (optional, but helpful for analytics)
CREATE INDEX IF NOT EXISTS idx_onboarding_motivation_data
ON user_onboarding_profiles USING gin(motivation_data);

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================
-- To remove this column, run:
-- DROP INDEX IF EXISTS idx_onboarding_motivation_data;
-- ALTER TABLE user_onboarding_profiles DROP COLUMN IF EXISTS motivation_data;
-- ============================================================================
