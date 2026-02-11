-- =============================================================================
-- Conversation Sessions & Messages
-- Phase 1: Conversation AI Engine (ElevenLabs)
--
-- Stores voice conversation sessions and their transcripts for:
-- - Post-call feedback (articulation, fluency, communication, scenario KPIs)
-- - Conversation history UI
-- - Vocabulary-to-conversation loop (FSRS integration)
-- =============================================================================

-- Conversation sessions table
CREATE TABLE IF NOT EXISTS conversation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Session metadata
  elevenlabs_conversation_id TEXT,  -- ElevenLabs SDK conversation ID
  scenario TEXT NOT NULL DEFAULT 'casual_chat',
  scenario_description TEXT,
  voice_id TEXT,
  accent TEXT,
  proficiency TEXT NOT NULL DEFAULT 'intermediate',
  target_language TEXT NOT NULL DEFAULT 'es',

  -- Timing
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,

  -- Session stats
  turn_count INTEGER DEFAULT 0,
  user_word_count INTEGER DEFAULT 0,
  avg_words_per_turn REAL DEFAULT 0,
  points_earned INTEGER DEFAULT 0,

  -- AI Feedback (populated by post-call analysis)
  feedback JSONB,  -- { articulation, fluency, communication, scenario, summary, strengths, improvements }

  -- Vocabulary loop
  vocab_prep_words JSONB DEFAULT '[]',    -- words shown before call
  vocab_used_words JSONB DEFAULT '[]',    -- words user actually used
  vocab_missed_words JSONB DEFAULT '[]',  -- words user struggled with

  -- Stair linkage (which learning path step triggered this)
  stair_step_id UUID REFERENCES staircase_steps(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Conversation messages table
CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES conversation_sessions(id) ON DELETE CASCADE,

  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  word_count INTEGER DEFAULT 0,
  timestamp_ms BIGINT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_user
  ON conversation_sessions(user_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversation_sessions_stair
  ON conversation_sessions(stair_step_id)
  WHERE stair_step_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversation_messages_session
  ON conversation_messages(session_id, timestamp_ms ASC);

-- RLS Policies
ALTER TABLE conversation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
CREATE POLICY conversation_sessions_select ON conversation_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY conversation_sessions_insert ON conversation_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY conversation_sessions_update ON conversation_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Messages: accessible if user owns the parent session
CREATE POLICY conversation_messages_select ON conversation_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_sessions cs
      WHERE cs.id = conversation_messages.session_id
      AND cs.user_id = auth.uid()
    )
  );

CREATE POLICY conversation_messages_insert ON conversation_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversation_sessions cs
      WHERE cs.id = conversation_messages.session_id
      AND cs.user_id = auth.uid()
    )
  );
