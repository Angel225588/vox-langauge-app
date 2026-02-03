-- Stair Content Storage Migration
-- Adds columns to staircase_steps for storing AI-generated content
-- Run this migration in your Supabase SQL editor

-- ============================================================================
-- Add content columns to staircase_steps table
-- These store AI-generated vocabulary, scenarios, and grammar points
-- ============================================================================

-- Vocabulary array (VocabItem[])
-- Example: [{"word": "hola", "translation": "hello", "pronunciation": "OH-lah", ...}]
ALTER TABLE staircase_steps
  ADD COLUMN IF NOT EXISTS vocabulary JSONB DEFAULT '[]'::jsonb;

-- Scenarios array (Scenario[])
-- Example: [{"title": "Café Order", "description": "...", "context": "...", "key_phrases": [...]}]
ALTER TABLE staircase_steps
  ADD COLUMN IF NOT EXISTS scenarios JSONB DEFAULT '[]'::jsonb;

-- Grammar points array (string[])
-- Example: ["Present tense conjugation", "Noun gender agreement"]
ALTER TABLE staircase_steps
  ADD COLUMN IF NOT EXISTS grammar_points JSONB DEFAULT '[]'::jsonb;

-- Flag indicating if detailed content has been loaded (for skeleton stairs)
ALTER TABLE staircase_steps
  ADD COLUMN IF NOT EXISTS content_loaded BOOLEAN DEFAULT FALSE;

-- Timestamp when content was loaded/generated
ALTER TABLE staircase_steps
  ADD COLUMN IF NOT EXISTS content_loaded_at TIMESTAMPTZ;

-- ============================================================================
-- Add scenarios_completed to user_stair_progress
-- Tracks which speaking scenarios the user has completed for each stair
-- ============================================================================
ALTER TABLE user_stair_progress
  ADD COLUMN IF NOT EXISTS scenarios_completed TEXT[] DEFAULT '{}';

-- ============================================================================
-- Indexes for efficient queries
-- ============================================================================

-- Index for finding stairs that need content loaded
CREATE INDEX IF NOT EXISTS idx_staircase_steps_content_loaded
  ON staircase_steps(content_loaded)
  WHERE content_loaded = FALSE;

-- GIN index for querying vocabulary JSONB (useful for word searches)
CREATE INDEX IF NOT EXISTS idx_staircase_steps_vocabulary_gin
  ON staircase_steps
  USING GIN (vocabulary);

-- ============================================================================
-- Comments for documentation
-- ============================================================================
COMMENT ON COLUMN staircase_steps.vocabulary IS 'AI-generated vocabulary items as JSONB array of VocabItem objects';
COMMENT ON COLUMN staircase_steps.scenarios IS 'AI-generated conversation scenarios as JSONB array of Scenario objects';
COMMENT ON COLUMN staircase_steps.grammar_points IS 'Grammar focus points for this stair as JSONB array of strings';
COMMENT ON COLUMN staircase_steps.content_loaded IS 'Flag indicating if detailed content has been loaded (skeleton stairs start with false)';
COMMENT ON COLUMN staircase_steps.content_loaded_at IS 'Timestamp when content was generated/loaded by AI';
COMMENT ON COLUMN user_stair_progress.scenarios_completed IS 'Array of scenario IDs that user has completed for this stair';
