-- Reading Sessions Table for Supabase
-- Run this migration in your Supabase SQL editor

-- Create the reading_sessions table
CREATE TABLE IF NOT EXISTS reading_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Content source
  source_type TEXT NOT NULL CHECK (source_type IN ('ai_story', 'user_story', 'lesson', 'imported', 'curated')),
  source_id TEXT,
  title TEXT,
  text TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),

  -- Recording
  recording_url TEXT, -- Supabase Storage URL (nullable - user consent required)
  recording_duration_ms INTEGER,

  -- Transcription
  transcription TEXT,

  -- Scores
  words_expected INTEGER NOT NULL DEFAULT 0,
  words_spoken INTEGER NOT NULL DEFAULT 0,
  articulation_score REAL,
  fluency_score REAL,
  overall_score REAL,
  comprehension_score REAL, -- NEW: Semantic understanding score

  -- Analysis results
  problem_words JSONB, -- Array of ProblemWord objects
  feedback JSONB, -- ReadingFeedback object

  -- Visibility
  is_public BOOLEAN NOT NULL DEFAULT FALSE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_id ON reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_created_at ON reading_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_source_type ON reading_sessions(source_type);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_difficulty ON reading_sessions(difficulty);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_overall_score ON reading_sessions(overall_score);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_date ON reading_sessions(user_id, created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions (unless public)
CREATE POLICY "Users can view own sessions" ON reading_sessions
  FOR SELECT USING (
    auth.uid() = user_id OR is_public = TRUE
  );

-- Users can insert their own sessions
CREATE POLICY "Users can insert own sessions" ON reading_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions" ON reading_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY "Users can delete own sessions" ON reading_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Create Storage bucket for recordings (run in Supabase Dashboard > Storage)
-- Note: This needs to be done via the Supabase Dashboard or supabase-js admin client
-- INSERT INTO storage.buckets (id, name, public) VALUES ('recordings', 'recordings', false);

-- Storage policies for recordings bucket
-- Allow users to upload to their own folder
-- CREATE POLICY "Users can upload own recordings" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'recordings' AND
--     (storage.foldername(name))[1] = auth.uid()::text
--   );

-- Allow users to read their own recordings
-- CREATE POLICY "Users can read own recordings" ON storage.objects
--   FOR SELECT USING (
--     bucket_id = 'recordings' AND
--     (storage.foldername(name))[1] = auth.uid()::text
--   );

-- Allow users to delete their own recordings
-- CREATE POLICY "Users can delete own recordings" ON storage.objects
--   FOR DELETE USING (
--     bucket_id = 'recordings' AND
--     (storage.foldername(name))[1] = auth.uid()::text
--   );

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reading_sessions_updated_at
  BEFORE UPDATE ON reading_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
