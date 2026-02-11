-- ============================================================================
-- VOX LIBRARY — Scenario-first content database
-- Migration: 20260211_vox_library
--
-- Creates 5 content tables + 1 user preference table:
--   vox_scenarios, vox_vocabulary, vox_grammar_points,
--   vox_scenario_vocabulary, vox_scenario_grammar,
--   user_vox_categories
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. vox_scenarios — Real-world scenario templates
-- ---------------------------------------------------------------------------
CREATE TABLE vox_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Tagging
  profession_tags TEXT[] NOT NULL DEFAULT '{}',
  context_type TEXT NOT NULL,
  cefr_levels TEXT[] NOT NULL,
  language_pairs TEXT[] NOT NULL DEFAULT '{}',

  -- Scenario content
  key_phrases JSONB NOT NULL DEFAULT '[]',
  ai_persona JSONB,
  objectives TEXT[] NOT NULL DEFAULT '{}',
  estimated_minutes INTEGER NOT NULL DEFAULT 15,

  -- Relationships
  prerequisite_scenario_ids UUID[] DEFAULT '{}',
  related_scenario_ids UUID[] DEFAULT '{}',

  -- Metadata
  difficulty_weight REAL NOT NULL DEFAULT 1.0,
  popularity_score REAL NOT NULL DEFAULT 0.0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vox_scenarios_profession ON vox_scenarios USING GIN (profession_tags);
CREATE INDEX idx_vox_scenarios_context ON vox_scenarios (context_type);
CREATE INDEX idx_vox_scenarios_cefr ON vox_scenarios USING GIN (cefr_levels);
CREATE INDEX idx_vox_scenarios_language ON vox_scenarios USING GIN (language_pairs);
CREATE INDEX idx_vox_scenarios_active ON vox_scenarios (is_active) WHERE is_active = true;

-- ---------------------------------------------------------------------------
-- 2. vox_vocabulary — Vocabulary items per language pair
-- ---------------------------------------------------------------------------
CREATE TABLE vox_vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Word data
  word TEXT NOT NULL,
  translation TEXT NOT NULL,
  pronunciation TEXT,
  native_approximation TEXT,
  audio_url TEXT,

  -- Language
  language_pair TEXT NOT NULL,
  target_language TEXT NOT NULL,
  native_language TEXT NOT NULL,

  -- Classification
  part_of_speech TEXT NOT NULL DEFAULT 'other',
  cefr_level TEXT NOT NULL DEFAULT 'A1',
  difficulty TEXT NOT NULL DEFAULT 'medium',
  category TEXT NOT NULL DEFAULT 'general',

  -- Tags for lookup
  profession_tags TEXT[] NOT NULL DEFAULT '{}',
  topic_tags TEXT[] NOT NULL DEFAULT '{}',

  -- Usage examples
  example_sentence TEXT,
  example_translation TEXT,
  usage_notes TEXT,
  memory_tip TEXT,

  -- Metadata
  frequency_rank INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(word, language_pair)
);

CREATE INDEX idx_vox_vocab_language_pair ON vox_vocabulary (language_pair);
CREATE INDEX idx_vox_vocab_cefr ON vox_vocabulary (cefr_level);
CREATE INDEX idx_vox_vocab_profession ON vox_vocabulary USING GIN (profession_tags);
CREATE INDEX idx_vox_vocab_topic ON vox_vocabulary USING GIN (topic_tags);
CREATE INDEX idx_vox_vocab_category ON vox_vocabulary (category);
CREATE INDEX idx_vox_vocab_frequency ON vox_vocabulary (frequency_rank) WHERE frequency_rank IS NOT NULL;
CREATE INDEX idx_vox_vocab_pos ON vox_vocabulary (part_of_speech);
CREATE INDEX idx_vox_vocab_active ON vox_vocabulary (is_active) WHERE is_active = true;

-- ---------------------------------------------------------------------------
-- 3. vox_grammar_points — Grammar rules per target language
-- ---------------------------------------------------------------------------
CREATE TABLE vox_grammar_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  explanation TEXT NOT NULL,

  -- Language
  target_language TEXT NOT NULL,

  -- Classification
  cefr_level TEXT NOT NULL DEFAULT 'A1',
  grammar_category TEXT NOT NULL,

  -- Examples and common mistakes (JSONB arrays)
  examples JSONB NOT NULL DEFAULT '[]',
  common_mistakes JSONB NOT NULL DEFAULT '[]',

  -- Tags for scenario linking
  scenario_tags TEXT[] NOT NULL DEFAULT '{}',

  -- Sequencing
  prerequisite_grammar_ids UUID[] DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vox_grammar_language ON vox_grammar_points (target_language);
CREATE INDEX idx_vox_grammar_cefr ON vox_grammar_points (cefr_level);
CREATE INDEX idx_vox_grammar_category ON vox_grammar_points (grammar_category);
CREATE INDEX idx_vox_grammar_scenario ON vox_grammar_points USING GIN (scenario_tags);
CREATE INDEX idx_vox_grammar_active ON vox_grammar_points (is_active) WHERE is_active = true;

-- ---------------------------------------------------------------------------
-- 4. vox_scenario_vocabulary — Junction: scenarios <-> vocabulary
-- ---------------------------------------------------------------------------
CREATE TABLE vox_scenario_vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  scenario_id UUID NOT NULL REFERENCES vox_scenarios(id) ON DELETE CASCADE,
  vocabulary_id UUID NOT NULL REFERENCES vox_vocabulary(id) ON DELETE CASCADE,

  relevance TEXT NOT NULL DEFAULT 'core',
  sort_order INTEGER NOT NULL DEFAULT 0,

  UNIQUE(scenario_id, vocabulary_id)
);

CREATE INDEX idx_sv_scenario ON vox_scenario_vocabulary (scenario_id);
CREATE INDEX idx_sv_vocabulary ON vox_scenario_vocabulary (vocabulary_id);
CREATE INDEX idx_sv_relevance ON vox_scenario_vocabulary (relevance);

-- ---------------------------------------------------------------------------
-- 5. vox_scenario_grammar — Junction: scenarios <-> grammar points
-- ---------------------------------------------------------------------------
CREATE TABLE vox_scenario_grammar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  scenario_id UUID NOT NULL REFERENCES vox_scenarios(id) ON DELETE CASCADE,
  grammar_point_id UUID NOT NULL REFERENCES vox_grammar_points(id) ON DELETE CASCADE,

  relevance TEXT NOT NULL DEFAULT 'core',
  sort_order INTEGER NOT NULL DEFAULT 0,

  UNIQUE(scenario_id, grammar_point_id)
);

CREATE INDEX idx_sg_scenario ON vox_scenario_grammar (scenario_id);
CREATE INDEX idx_sg_grammar ON vox_scenario_grammar (grammar_point_id);

-- ---------------------------------------------------------------------------
-- 6. user_vox_categories — "Add to my Vox" user preferences
-- ---------------------------------------------------------------------------
CREATE TABLE user_vox_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_slug TEXT NOT NULL,
  category_label TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, category_slug)
);

CREATE INDEX idx_user_vox_categories_user ON user_vox_categories (user_id);

-- ============================================================================
-- ROW-LEVEL SECURITY
-- ============================================================================

-- vox_scenarios: read-only for authenticated users (active rows only)
ALTER TABLE vox_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read active scenarios"
  ON vox_scenarios FOR SELECT
  TO authenticated
  USING (is_active = true);

-- vox_vocabulary: read-only for authenticated users (active rows only)
ALTER TABLE vox_vocabulary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read active vocabulary"
  ON vox_vocabulary FOR SELECT
  TO authenticated
  USING (is_active = true);

-- vox_grammar_points: read-only for authenticated users (active rows only)
ALTER TABLE vox_grammar_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read active grammar"
  ON vox_grammar_points FOR SELECT
  TO authenticated
  USING (is_active = true);

-- vox_scenario_vocabulary: read-only for authenticated users
ALTER TABLE vox_scenario_vocabulary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read scenario vocabulary"
  ON vox_scenario_vocabulary FOR SELECT
  TO authenticated
  USING (true);

-- vox_scenario_grammar: read-only for authenticated users
ALTER TABLE vox_scenario_grammar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read scenario grammar"
  ON vox_scenario_grammar FOR SELECT
  TO authenticated
  USING (true);

-- user_vox_categories: users can read/write their own rows
ALTER TABLE user_vox_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own vox categories"
  ON user_vox_categories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vox categories"
  ON user_vox_categories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vox categories"
  ON user_vox_categories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vox categories"
  ON user_vox_categories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
