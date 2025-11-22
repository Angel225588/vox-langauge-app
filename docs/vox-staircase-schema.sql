-- ============================================================================
-- VOX LANGUAGE APP - STAIRCASE SYSTEM SCHEMA
-- ============================================================================
-- Generated: November 22, 2025
-- Database: PostgreSQL 13+ (Supabase compatible)
-- Purpose: Personalized AI-generated learning staircases
--
-- TABLES:
--   1. user_onboarding_profiles - Stores user goals and preferences from onboarding
--   2. user_staircases - Gemini-generated personalized learning paths
--   3. staircase_steps - Individual steps within each staircase (8-12 per staircase)
--   4. user_stair_progress - Tracks user position and completion status
--   5. stair_vocabulary - Links flashcards to specific stairs
--   6. user_medals - Achievement/medal tracking
--   7. medal_templates - Admin-configurable medal types
--
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE 1: user_onboarding_profiles
-- Purpose: Store user goals, level, time commitment from 4-question onboarding
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_onboarding_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Onboarding responses
  learning_goal TEXT NOT NULL CHECK (learning_goal IN (
    'job_interview', 'travel', 'business', 'daily_conversation', 'academic', 'making_friends'
  )),
  proficiency_level TEXT NOT NULL CHECK (proficiency_level IN (
    'beginner', 'elementary', 'intermediate', 'upper_intermediate', 'advanced'
  )),
  daily_time_minutes INTEGER NOT NULL CHECK (daily_time_minutes IN (10, 20, 30, 45)),
  scenarios TEXT[] NOT NULL DEFAULT '{}', -- Array of selected scenario IDs

  -- Metadata
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id)
);

-- Indexes for user_onboarding_profiles
CREATE INDEX IF NOT EXISTS idx_onboarding_user_id ON user_onboarding_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_goal ON user_onboarding_profiles(learning_goal);

-- RLS Policies for user_onboarding_profiles
ALTER TABLE user_onboarding_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own onboarding profile"
  ON user_onboarding_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding profile"
  ON user_onboarding_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding profile"
  ON user_onboarding_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TABLE 2: user_staircases
-- Purpose: Store Gemini-generated staircases (one active per user, with versioning)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_staircases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_profile_id UUID REFERENCES user_onboarding_profiles(id) ON DELETE SET NULL,

  -- Staircase metadata
  version INTEGER NOT NULL DEFAULT 1, -- Allows regeneration/versioning
  is_active BOOLEAN NOT NULL DEFAULT TRUE, -- Only one active staircase per user

  -- Generation details
  generation_parameters JSONB NOT NULL, -- Store exact Gemini prompt/parameters for reproducibility
  total_stairs INTEGER NOT NULL CHECK (total_stairs BETWEEN 8 AND 12),
  estimated_completion_days INTEGER,

  -- Progress tracking
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for user_staircases
CREATE INDEX IF NOT EXISTS idx_staircase_user_id ON user_staircases(user_id);
CREATE INDEX IF NOT EXISTS idx_staircase_active ON user_staircases(user_id, is_active) WHERE is_active = TRUE;

-- Partial unique index: Only one active staircase per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_staircase_per_user
  ON user_staircases(user_id)
  WHERE is_active = TRUE;

-- RLS Policies for user_staircases
ALTER TABLE user_staircases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own staircases"
  ON user_staircases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own staircases"
  ON user_staircases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own staircases"
  ON user_staircases FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TABLE 3: staircase_steps
-- Purpose: Individual steps within each staircase (8-12 progressive stairs)
-- ============================================================================

CREATE TABLE IF NOT EXISTS staircase_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staircase_id UUID NOT NULL REFERENCES user_staircases(id) ON DELETE CASCADE,

  -- Step details (generated by Gemini)
  step_order INTEGER NOT NULL CHECK (step_order > 0),
  title TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '📚',
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN (
    'beginner', 'elementary', 'intermediate', 'upper_intermediate', 'advanced'
  )),

  -- Learning content
  estimated_days INTEGER NOT NULL DEFAULT 3,
  vocabulary_count INTEGER NOT NULL DEFAULT 30,
  skills_focus TEXT[] NOT NULL DEFAULT '{}', -- ['listening', 'speaking', 'reading', 'writing']
  scenario_tags TEXT[] NOT NULL DEFAULT '{}', -- Links to onboarding scenarios

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  UNIQUE(staircase_id, step_order)
);

-- Indexes for staircase_steps
CREATE INDEX IF NOT EXISTS idx_steps_staircase_id ON staircase_steps(staircase_id);
CREATE INDEX IF NOT EXISTS idx_steps_order ON staircase_steps(staircase_id, step_order);

-- RLS Policies for staircase_steps
ALTER TABLE staircase_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own staircase steps"
  ON staircase_steps FOR SELECT
  USING (
    staircase_id IN (
      SELECT id FROM user_staircases WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- TABLE 4: user_stair_progress
-- Purpose: Track user's current position and completion of each step
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_stair_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES staircase_steps(id) ON DELETE CASCADE,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'current', 'completed')),

  -- Progress metrics
  vocabulary_learned INTEGER NOT NULL DEFAULT 0,
  cards_reviewed INTEGER NOT NULL DEFAULT 0,
  practice_minutes INTEGER NOT NULL DEFAULT 0,

  -- Completion tracking
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, step_id)
);

-- Indexes for user_stair_progress
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON user_stair_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_step_id ON user_stair_progress(step_id);
CREATE INDEX IF NOT EXISTS idx_progress_status ON user_stair_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_progress_current ON user_stair_progress(user_id) WHERE status = 'current';

-- RLS Policies for user_stair_progress
ALTER TABLE user_stair_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON user_stair_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_stair_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_stair_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TABLE 5: stair_vocabulary
-- Purpose: Link flashcards to specific stairs (junction table)
-- ============================================================================

CREATE TABLE IF NOT EXISTS stair_vocabulary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_id UUID NOT NULL REFERENCES staircase_steps(id) ON DELETE CASCADE,
  flashcard_id TEXT NOT NULL, -- References existing flashcards table (may be UUID or TEXT)

  -- Metadata
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  UNIQUE(step_id, flashcard_id)
);

-- Indexes for stair_vocabulary
CREATE INDEX IF NOT EXISTS idx_vocab_step_id ON stair_vocabulary(step_id);
CREATE INDEX IF NOT EXISTS idx_vocab_flashcard_id ON stair_vocabulary(flashcard_id);

-- RLS Policies for stair_vocabulary
ALTER TABLE stair_vocabulary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view vocabulary for own stairs"
  ON stair_vocabulary FOR SELECT
  USING (
    step_id IN (
      SELECT s.id FROM staircase_steps s
      JOIN user_staircases sc ON s.staircase_id = sc.id
      WHERE sc.user_id = auth.uid()
    )
  );

-- ============================================================================
-- TABLE 6: medal_templates
-- Purpose: Admin-configurable medal types (achievement definitions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS medal_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Medal details
  medal_type TEXT NOT NULL UNIQUE,
  emoji TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Achievement criteria
  tier TEXT NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  criteria JSONB NOT NULL, -- Flexible criteria (e.g., {"stairs_completed": 1, "streak_days": 7})
  point_reward INTEGER NOT NULL DEFAULT 100,

  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for medal_templates
CREATE INDEX IF NOT EXISTS idx_medal_type ON medal_templates(medal_type);
CREATE INDEX IF NOT EXISTS idx_medal_active ON medal_templates(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- TABLE 7: user_medals
-- Purpose: Track medals earned by users
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_medals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medal_type TEXT NOT NULL,

  -- Earning details
  is_earned BOOLEAN NOT NULL DEFAULT FALSE,
  earned_at TIMESTAMP WITH TIME ZONE,
  points_awarded INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, medal_type)
);

-- Indexes for user_medals
CREATE INDEX IF NOT EXISTS idx_user_medals_user_id ON user_medals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_medals_earned ON user_medals(user_id, is_earned) WHERE is_earned = TRUE;

-- RLS Policies for user_medals
ALTER TABLE user_medals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own medals"
  ON user_medals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view all earned medals" -- For community leaderboard
  ON user_medals FOR SELECT
  USING (is_earned = TRUE);

CREATE POLICY "Users can insert own medals"
  ON user_medals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medals"
  ON user_medals FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS & AUTOMATION
-- ============================================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at on user_onboarding_profiles
CREATE TRIGGER update_onboarding_updated_at
  BEFORE UPDATE ON user_onboarding_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update updated_at on user_staircases
CREATE TRIGGER update_staircase_updated_at
  BEFORE UPDATE ON user_staircases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-update updated_at on user_stair_progress
CREATE TRIGGER update_progress_updated_at
  BEFORE UPDATE ON user_stair_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA (Commented out - uncomment for testing)
-- ============================================================================

-- Insert sample medal templates
-- INSERT INTO medal_templates (medal_type, emoji, title, description, tier, criteria, point_reward) VALUES
-- ('first_stair_completed', '🥇', 'First Stair Completed', 'Completed your first learning stair', 'gold', '{"stairs_completed": 1}', 100),
-- ('seven_day_streak', '🔥', '7 Day Streak', 'Maintained a 7-day learning streak', 'gold', '{"streak_days": 7}', 150),
-- ('vocabulary_master', '📚', 'Vocabulary Master', 'Learned 100 new words', 'silver', '{"words_learned": 100}', 200);

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
