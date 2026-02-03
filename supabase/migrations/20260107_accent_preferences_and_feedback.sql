-- Accent Preferences and Conversation Feedback Tables for Vox Learning System
-- Run this migration in your Supabase SQL editor

-- ============================================================================
-- User Accent Preferences Table
-- Stores user's preferred accent for voice conversations
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_accent_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_language TEXT NOT NULL,           -- e.g., 'es', 'en', 'fr'
  primary_accent TEXT NOT NULL,            -- e.g., 'es-latam', 'es-spain', 'en-american', 'en-british'
  exposure_variety BOOLEAN DEFAULT true,   -- Enable 20% other accents for comprehension training
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one preference per user per language
  UNIQUE(user_id, target_language)
);

-- Indexes for accent preferences
CREATE INDEX IF NOT EXISTS idx_accent_preferences_user_id ON user_accent_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_accent_preferences_language ON user_accent_preferences(target_language);

-- RLS for accent preferences
ALTER TABLE user_accent_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own accent preferences" ON user_accent_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accent preferences" ON user_accent_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accent preferences" ON user_accent_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accent preferences" ON user_accent_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- Conversation Feedback Table
-- Stores feedback and analysis from voice conversations
-- ============================================================================
CREATE TABLE IF NOT EXISTS conversation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,                -- ElevenLabs conversation ID
  scenario_id TEXT NOT NULL,               -- Scenario identifier (e.g., 'cafe_ordering', 'job_interview')
  voice_used TEXT NOT NULL,                -- Voice ID used in conversation
  accent_used TEXT NOT NULL,               -- Accent type (e.g., 'es-latam', 'en-british')
  duration_seconds INTEGER,                -- Conversation duration
  user_turns INTEGER,                      -- Number of user messages

  -- AI-generated observations and feedback
  ai_observations JSONB,                   -- Pronunciation, fluency, vocabulary analysis
  -- Example: {
  --   "pronunciation_issues": ["r-rolling", "vowel_reduction"],
  --   "vocabulary_used": ["hola", "buenos dias", "gracias"],
  --   "fluency_score": 0.75,
  --   "confidence_signals": "moderate",
  --   "suggested_focus": ["greeting_responses", "question_formation"]
  -- }

  transcript JSONB,                        -- Full conversation transcript
  -- Example: [
  --   {"role": "assistant", "content": "Hola!", "timestamp": 1234567890},
  --   {"role": "user", "content": "Hola, buenos dias", "timestamp": 1234567895}
  -- ]

  -- Points and scoring
  points_earned INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for conversation feedback
CREATE INDEX IF NOT EXISTS idx_conversation_feedback_user_id ON conversation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_feedback_session_id ON conversation_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_feedback_scenario ON conversation_feedback(scenario_id);
CREATE INDEX IF NOT EXISTS idx_conversation_feedback_created_at ON conversation_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_feedback_user_date ON conversation_feedback(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_feedback_accent ON conversation_feedback(accent_used);

-- RLS for conversation feedback
ALTER TABLE conversation_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversation feedback" ON conversation_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversation feedback" ON conversation_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversation feedback" ON conversation_feedback
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversation feedback" ON conversation_feedback
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- Learning Analysis Table
-- Stores Gemini daily and Claude weekly analysis results
-- ============================================================================
CREATE TABLE IF NOT EXISTS learning_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('daily', 'weekly')),
  analysis_date DATE NOT NULL,

  -- Gemini insights (daily analysis)
  gemini_insights JSONB,
  -- Example: {
  --   "vocabulary_mastery": {"total": 50, "mastered": 35, "struggling": ["conjugation", "pronouns"]},
  --   "common_mistakes": ["gender agreement", "verb tenses"],
  --   "time_spent_minutes": 45,
  --   "conversation_quality": 0.72,
  --   "pronunciation_focus": ["r-rolling", "vowel sounds"]
  -- }

  -- Claude decisions (weekly review)
  claude_decisions JSONB,
  -- Example: {
  --   "restructure_needed": true,
  --   "priority_changes": [
  --     {"stair": 3, "action": "move_up", "reason": "struggling with conversation"},
  --     {"stair": 5, "action": "add_vocab", "words": ["greetings", "farewells"]}
  --   ],
  --   "title_update": "Your 60-Day Journey to Conversational Spanish for Mexico",
  --   "engagement_notes": "User responds well to scenario-based learning"
  -- }

  -- Content changes applied
  content_changes JSONB,
  -- Example: {
  --   "vocabulary_added": ["hola", "adios", "gracias"],
  --   "scenarios_adjusted": ["cafe_ordering"],
  --   "difficulty_changes": {"reading": "decreased", "speaking": "maintained"}
  -- }

  -- Aggregated metrics
  metrics JSONB,
  -- Example: {
  --   "sessions_completed": 7,
  --   "total_practice_minutes": 180,
  --   "vocabulary_growth": 25,
  --   "conversation_count": 3,
  --   "streak_days": 5
  -- }

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one analysis per type per day per user
  UNIQUE(user_id, analysis_type, analysis_date)
);

-- Indexes for learning analysis
CREATE INDEX IF NOT EXISTS idx_learning_analysis_user_id ON learning_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_analysis_type ON learning_analysis(analysis_type);
CREATE INDEX IF NOT EXISTS idx_learning_analysis_date ON learning_analysis(analysis_date DESC);
CREATE INDEX IF NOT EXISTS idx_learning_analysis_user_date ON learning_analysis(user_id, analysis_date DESC);

-- RLS for learning analysis
ALTER TABLE learning_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own learning analysis" ON learning_analysis
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning analysis" ON learning_analysis
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning analysis" ON learning_analysis
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- Voice Exposure History Table
-- Tracks which voices/accents the user has practiced with
-- ============================================================================
CREATE TABLE IF NOT EXISTS voice_exposure_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  voice_id TEXT NOT NULL,                  -- ElevenLabs voice ID
  accent TEXT NOT NULL,                    -- Accent type
  exposure_count INTEGER DEFAULT 1,        -- Number of times used
  total_duration_seconds INTEGER DEFAULT 0, -- Total conversation time with this voice
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one record per user per voice
  UNIQUE(user_id, voice_id)
);

-- Indexes for voice exposure
CREATE INDEX IF NOT EXISTS idx_voice_exposure_user_id ON voice_exposure_history(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_exposure_accent ON voice_exposure_history(accent);
CREATE INDEX IF NOT EXISTS idx_voice_exposure_last_used ON voice_exposure_history(last_used_at DESC);

-- RLS for voice exposure history
ALTER TABLE voice_exposure_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own voice exposure" ON voice_exposure_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own voice exposure" ON voice_exposure_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own voice exposure" ON voice_exposure_history
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- Updated at trigger for tables that need it
-- ============================================================================
-- Reuse existing trigger function if available, or create it
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_accent_preferences_updated_at
  BEFORE UPDATE ON user_accent_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voice_exposure_updated_at
  BEFORE UPDATE ON voice_exposure_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Helper function to get user's preferred accent for a language
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_preferred_accent(p_user_id UUID, p_language TEXT)
RETURNS TEXT AS $$
DECLARE
  v_accent TEXT;
BEGIN
  SELECT primary_accent INTO v_accent
  FROM user_accent_preferences
  WHERE user_id = p_user_id AND target_language = p_language;

  RETURN v_accent;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Helper function to record voice exposure
-- ============================================================================
CREATE OR REPLACE FUNCTION record_voice_exposure(
  p_user_id UUID,
  p_voice_id TEXT,
  p_accent TEXT,
  p_duration_seconds INTEGER
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO voice_exposure_history (user_id, voice_id, accent, exposure_count, total_duration_seconds, last_used_at)
  VALUES (p_user_id, p_voice_id, p_accent, 1, p_duration_seconds, NOW())
  ON CONFLICT (user_id, voice_id)
  DO UPDATE SET
    exposure_count = voice_exposure_history.exposure_count + 1,
    total_duration_seconds = voice_exposure_history.total_duration_seconds + p_duration_seconds,
    last_used_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
