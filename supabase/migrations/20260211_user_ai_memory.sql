-- User AI Memory table
-- Stores personalized AI learning context per user as JSONB.
-- The memory_data column holds the full UserAIMemory object so nested
-- structures (calibration_history, insights, observations) persist without
-- requiring separate tables for each sub-object.

CREATE TABLE IF NOT EXISTS user_ai_memory (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup by user
-- (primary key already provides this, but explicit for clarity in code reviews)

-- RLS: users can only access their own memory
ALTER TABLE user_ai_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own AI memory"
  ON user_ai_memory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI memory"
  ON user_ai_memory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI memory"
  ON user_ai_memory FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
