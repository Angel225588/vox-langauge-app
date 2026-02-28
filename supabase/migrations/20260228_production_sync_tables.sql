-- =============================================================================
-- Production Sync Tables Migration
-- 2026-02-28
--
-- Creates cloud-sync tables for data currently stored only locally:
--   1. practice_scores     — practice session scores (AsyncStorage → Supabase)
--   2. user_streak_data    — streaks & points (SQLite → Supabase)
--   3. user_consents       — GDPR audit trail for consent records
--   4. Storage bucket policies for recordings & tts-cache
--
-- Local sources:
--   - lib/db/competencyMetrics.ts  (practice scores in AsyncStorage)
--   - lib/db/sqlite.ts             (streak_data table in SQLite)
--   - lib/privacy/consentManager.ts (consent flags in AsyncStorage)
-- =============================================================================


-- =============================================================================
-- 1. practice_scores — cloud sync for practice session scores
--
-- Mirrors PracticeScore from lib/db/competencyMetrics.ts.
-- Replaces the AsyncStorage array (vox_practice_scores_{userId}).
-- Voice conversation scores remain in conversation_sessions.feedback;
-- this table covers reading, writing, listening, and conversation practice.
-- =============================================================================

CREATE TABLE IF NOT EXISTS practice_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Practice type matches PracticeType from competencyMetrics.ts
  practice_type TEXT NOT NULL CHECK (practice_type IN ('reading', 'writing', 'listening', 'conversation')),

  -- Four KPI scores (0-100 scale, matching Vox core metrics)
  articulation REAL DEFAULT 0,
  fluency REAL DEFAULT 0,
  communication REAL DEFAULT 0,
  scenario REAL DEFAULT 0,

  -- Composite overall score (average of measured KPIs)
  overall_score REAL NOT NULL DEFAULT 0,

  -- Flexible extra data (passage title, prompt text, lesson context, etc.)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- When the practice session was completed (client timestamp)
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Row creation timestamp (server timestamp)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_practice_scores_user_id
  ON practice_scores(user_id);

CREATE INDEX IF NOT EXISTS idx_practice_scores_user_completed
  ON practice_scores(user_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_practice_scores_practice_type
  ON practice_scores(practice_type);

CREATE INDEX IF NOT EXISTS idx_practice_scores_user_type
  ON practice_scores(user_id, practice_type, completed_at DESC);

-- RLS
ALTER TABLE practice_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own practice scores"
  ON practice_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own practice scores"
  ON practice_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own practice scores"
  ON practice_scores FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own practice scores"
  ON practice_scores FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE practice_scores IS 'Cloud-synced practice session scores. Mirrors PracticeScore from lib/db/competencyMetrics.ts.';
COMMENT ON COLUMN practice_scores.practice_type IS 'Type of practice: reading, writing, listening, or conversation.';
COMMENT ON COLUMN practice_scores.metadata IS 'Flexible JSONB for extra context (passage title, prompt, lesson ID, etc.)';
COMMENT ON COLUMN practice_scores.completed_at IS 'Client-reported completion time (may differ from created_at due to offline sync).';


-- =============================================================================
-- 2. user_streak_data — cloud sync for streak and points
--
-- Mirrors the SQLite streak_data table from lib/db/sqlite.ts.
-- One row per user (UNIQUE on user_id). Synced from device on connectivity.
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_streak_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Points & streaks (matching SQLite schema)
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,

  -- ISO date string for last practice day (matches SQLite convention)
  last_practice_date TEXT,

  -- Auto-updated timestamp
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on user_id (also covered by UNIQUE constraint, explicit for clarity)
CREATE INDEX IF NOT EXISTS idx_user_streak_data_user_id
  ON user_streak_data(user_id);

-- RLS
ALTER TABLE user_streak_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streak data"
  ON user_streak_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak data"
  ON user_streak_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak data"
  ON user_streak_data FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger: auto-update updated_at on row change
-- Reuses the update_updated_at_column() function from 20231213_reading_sessions.sql
CREATE TRIGGER update_user_streak_data_updated_at
  BEFORE UPDATE ON user_streak_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE user_streak_data IS 'Cloud-synced streak and points data. One row per user. Mirrors SQLite streak_data table.';
COMMENT ON COLUMN user_streak_data.last_practice_date IS 'ISO date string (YYYY-MM-DD) or epoch-day integer as text, matching SQLite convention.';
COMMENT ON COLUMN user_streak_data.total_points IS 'Cumulative points from all practice activities. Single source of truth synced from device.';


-- =============================================================================
-- 3. user_consents — GDPR audit trail for consent records
--
-- Mirrors ConsentType from lib/privacy/consentManager.ts.
-- Provides a server-side audit trail with timestamps, IP, and user agent.
-- Local AsyncStorage remains the fast check; this table is the legal record.
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Consent type matches ConsentType from consentManager.ts
  consent_type TEXT NOT NULL CHECK (consent_type IN ('voice_recording', 'privacy_policy', 'terms_of_service')),

  -- Current consent state
  granted BOOLEAN NOT NULL DEFAULT false,

  -- Audit timestamps
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,

  -- Audit metadata (populated by client or edge function)
  ip_address TEXT,
  user_agent TEXT,

  -- Row creation timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One consent record per user per type
  UNIQUE(user_id, consent_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_consents_user_id
  ON user_consents(user_id);

CREATE INDEX IF NOT EXISTS idx_user_consents_user_type
  ON user_consents(user_id, consent_type);

CREATE INDEX IF NOT EXISTS idx_user_consents_granted
  ON user_consents(granted)
  WHERE granted = TRUE;

-- RLS
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

-- Users can view their own consent records
CREATE POLICY "Users can view own consents"
  ON user_consents FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own consent records
CREATE POLICY "Users can insert own consents"
  ON user_consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own consent records (grant or revoke)
CREATE POLICY "Users can update own consents"
  ON user_consents FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own consent records (GDPR right to erasure)
CREATE POLICY "Users can delete own consents"
  ON user_consents FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE user_consents IS 'GDPR audit trail for user consent records. One row per user per consent type. Legal record of consent grant/revocation.';
COMMENT ON COLUMN user_consents.consent_type IS 'Type of consent: voice_recording, privacy_policy, or terms_of_service.';
COMMENT ON COLUMN user_consents.granted_at IS 'Timestamp when consent was most recently granted. NULL if never granted.';
COMMENT ON COLUMN user_consents.revoked_at IS 'Timestamp when consent was most recently revoked. NULL if never revoked.';
COMMENT ON COLUMN user_consents.ip_address IS 'Client IP at time of consent action. For GDPR audit trail.';
COMMENT ON COLUMN user_consents.user_agent IS 'Client user agent at time of consent action. For GDPR audit trail.';


-- =============================================================================
-- 4. Storage bucket policies
--
-- The recordings bucket was referenced (commented out) in 20231213_reading_sessions.sql.
-- The tts-cache bucket was referenced (commented out) in 20240107_tts_cache.sql.
-- This migration activates proper policies for both buckets.
--
-- NOTE: Buckets themselves must be created via Supabase Dashboard or admin client:
--   INSERT INTO storage.buckets (id, name, public) VALUES ('recordings', 'recordings', false);
--   INSERT INTO storage.buckets (id, name, public) VALUES ('tts-cache', 'tts-cache', true);
-- =============================================================================

-- ---------------------------------------------------------------------------
-- recordings bucket — private, users can read/write their own folder
-- Folder structure: recordings/{user_id}/...
-- ---------------------------------------------------------------------------

-- Allow users to upload recordings to their own folder
CREATE POLICY "Users can upload own recordings"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'recordings'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to read their own recordings
CREATE POLICY "Users can read own recordings"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'recordings'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update their own recordings
CREATE POLICY "Users can update own recordings"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'recordings'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own recordings
CREATE POLICY "Users can delete own recordings"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'recordings'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- tts-cache bucket — public read, authenticated write
-- Audio files are shared content (not sensitive), anyone can read.
-- Only authenticated users can upload to prevent abuse.
-- ---------------------------------------------------------------------------

-- Public read access for all cached TTS audio
CREATE POLICY "Public read access for tts-cache"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tts-cache');

-- Authenticated users can upload TTS cache files
CREATE POLICY "Authenticated users can upload tts-cache"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'tts-cache'
    AND auth.role() = 'authenticated'
  );

-- Authenticated users can update TTS cache files
CREATE POLICY "Authenticated users can update tts-cache"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'tts-cache'
    AND auth.role() = 'authenticated'
  );


-- =============================================================================
-- Done. Summary of changes:
--
-- Tables created:
--   - practice_scores (4 RLS policies, 4 indexes)
--   - user_streak_data (3 RLS policies, 1 index, 1 trigger)
--   - user_consents (4 RLS policies, 3 indexes, UNIQUE constraint)
--
-- Storage policies created:
--   - recordings bucket: INSERT, SELECT, UPDATE, DELETE (user-scoped)
--   - tts-cache bucket: SELECT (public), INSERT + UPDATE (authenticated)
--
-- Prerequisites (run via Dashboard or admin client BEFORE this migration):
--   INSERT INTO storage.buckets (id, name, public) VALUES ('recordings', 'recordings', false);
--   INSERT INTO storage.buckets (id, name, public) VALUES ('tts-cache', 'tts-cache', true);
-- =============================================================================
