-- TTS Audio Cache Table for Supabase
-- Stores metadata for cached TTS audio files
-- Audio files stored in Supabase Storage bucket 'tts-cache'

-- Create the tts_cache table
CREATE TABLE IF NOT EXISTS tts_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Cache key (unique identifier for this audio)
  cache_key TEXT NOT NULL UNIQUE,

  -- Content info
  text TEXT NOT NULL,
  language TEXT NOT NULL, -- 'en', 'es', 'fr', 'de', 'it', 'pt'
  content_type TEXT NOT NULL CHECK (content_type IN ('word', 'phrase', 'sentence')),

  -- Audio info
  storage_path TEXT NOT NULL, -- Path in Supabase Storage
  duration_ms INTEGER, -- Audio duration in milliseconds
  file_size_bytes INTEGER, -- File size for bandwidth estimation

  -- Voice settings used (for cache invalidation if we change voices)
  voice_name TEXT NOT NULL, -- e.g., 'es-ES-Neural2-A'
  voice_provider TEXT NOT NULL DEFAULT 'google', -- 'google', 'elevenlabs', etc.
  speaking_rate REAL NOT NULL DEFAULT 1.0,

  -- Usage tracking (for analytics and cleanup)
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- For monthly refresh, set to NOW() + 30 days

  -- Source tracking
  is_curated BOOLEAN NOT NULL DEFAULT FALSE, -- Part of our curated vocabulary
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL -- NULL = system-generated
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_tts_cache_cache_key ON tts_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_tts_cache_language ON tts_cache(language);
CREATE INDEX IF NOT EXISTS idx_tts_cache_content_type ON tts_cache(content_type);
CREATE INDEX IF NOT EXISTS idx_tts_cache_expires_at ON tts_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_tts_cache_usage ON tts_cache(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_tts_cache_language_type ON tts_cache(language, content_type);

-- Enable RLS but allow public read access (audio is not sensitive)
ALTER TABLE tts_cache ENABLE ROW LEVEL SECURITY;

-- Anyone can read cached audio (it's shared content)
CREATE POLICY "Public read access for tts_cache" ON tts_cache
  FOR SELECT USING (TRUE);

-- Only authenticated users can create cache entries
-- (prevents abuse, but allows user-generated content to be cached)
CREATE POLICY "Authenticated users can insert tts_cache" ON tts_cache
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Only system (service role) or creator can update
CREATE POLICY "Users can update own cache entries" ON tts_cache
  FOR UPDATE USING (auth.uid() = created_by OR created_by IS NULL);

-- Function to increment usage count
CREATE OR REPLACE FUNCTION increment_tts_usage(p_cache_key TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE tts_cache
  SET
    usage_count = usage_count + 1,
    last_used_at = NOW()
  WHERE cache_key = p_cache_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get or create cache entry
-- Returns the storage_path if exists, NULL if needs generation
CREATE OR REPLACE FUNCTION get_tts_cache(
  p_text TEXT,
  p_language TEXT,
  p_content_type TEXT DEFAULT 'word'
)
RETURNS TABLE (
  storage_path TEXT,
  cache_key TEXT,
  needs_generation BOOLEAN
) AS $$
DECLARE
  v_cache_key TEXT;
  v_storage_path TEXT;
BEGIN
  -- Generate cache key (lowercase, trimmed)
  v_cache_key := p_language || ':' || p_content_type || ':' || LOWER(TRIM(p_text));

  -- Check if valid cache exists
  SELECT tc.storage_path INTO v_storage_path
  FROM tts_cache tc
  WHERE tc.cache_key = v_cache_key
    AND (tc.expires_at IS NULL OR tc.expires_at > NOW());

  IF v_storage_path IS NOT NULL THEN
    -- Update usage stats
    PERFORM increment_tts_usage(v_cache_key);

    RETURN QUERY SELECT v_storage_path, v_cache_key, FALSE;
  ELSE
    RETURN QUERY SELECT NULL::TEXT, v_cache_key, TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup function for expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_tts_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM tts_cache
  WHERE expires_at IS NOT NULL AND expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Storage bucket for TTS cache (run in Supabase Dashboard > Storage)
-- Note: This needs to be done via the Supabase Dashboard:
-- 1. Go to Storage > Create new bucket
-- 2. Name: 'tts-cache'
-- 3. Public bucket: YES (audio files are not sensitive)
-- 4. File size limit: 500KB (most TTS audio is small)
-- 5. Allowed MIME types: audio/mpeg, audio/mp3

-- Storage policies for tts-cache bucket (PUBLIC READ)
-- These need to be created via Dashboard or admin client:

-- Allow public read access to all cached audio
-- CREATE POLICY "Public read access" ON storage.objects
--   FOR SELECT USING (bucket_id = 'tts-cache');

-- Allow authenticated users to upload (with path restrictions)
-- CREATE POLICY "Authenticated upload" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'tts-cache' AND
--     auth.role() = 'authenticated'
--   );

COMMENT ON TABLE tts_cache IS 'Shared cache for TTS audio to reduce API costs. Audio stored in tts-cache bucket.';
COMMENT ON COLUMN tts_cache.cache_key IS 'Unique key: language:content_type:lowercase_text';
COMMENT ON COLUMN tts_cache.is_curated IS 'TRUE for pre-generated vocabulary, FALSE for user-generated';
