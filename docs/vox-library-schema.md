# Vox Library Schema Design

> Scenario-first content database for the Vox Language App.
> Designed by schema-designer agent, 2026-02-11.

---

## 1. Architecture Overview

The **Vox Library** is a curated, read-only content database that stores scenarios, vocabulary, grammar points, and phrases. It replaces the current approach where AI generates all content from scratch. Instead:

1. **Vox Library provides the raw materials** -- tagged scenarios, vocabulary, and grammar organized by profession/context/CEFR level/language pair.
2. **Onboarding selections query the library** -- user's profession + scenarios + level + language pair yields a filtered content set.
3. **AI personalizes and sequences** -- the AI reorders, adjusts examples, adds context, and stitches content into a learning path. It no longer invents vocabulary from nothing.

### Data Flow

```
Onboarding Selections
  (profession, scenarios[], level, language_pair)
        |
        v
  Vox Library Query
  (filtered scenarios + vocabulary + grammar)
        |
        v
  AI Personalization Layer
  (reorder, adapt examples, fill gaps, create conversation prompts)
        |
        v
  Generated Learning Path
  (stairs with tagged content from library + AI personalization)
        |
        v
  FSRS Integration
  (vocabulary items enter word_bank with library_vocab_id link)
```

### Storage Strategy

| Layer | Storage | Purpose |
|-------|---------|---------|
| Vox Library (read-only content) | **Supabase** only | Curated by the Vox team, synced to all users |
| User learning paths | **Supabase** + SQLite cache | Cloud-first, offline-readable |
| Word bank (FSRS state) | **SQLite** (primary) + Supabase sync | Offline-first spaced repetition |
| User progress | **Supabase** + SQLite sync | Cloud-first with offline tracking |

The Vox Library tables are **server-side only** (no SQLite mirror needed). The app queries them during path generation and stair content loading, then caches the results in the existing `staircase_steps` JSONB columns.

---

## 2. Database Tables

### 2.1 `vox_scenarios` -- Scenario Templates

Each row is a real-world scenario that becomes a learning stair.

```sql
CREATE TABLE vox_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  slug TEXT UNIQUE NOT NULL,                     -- e.g., 'ordering_at_restaurant'
  title TEXT NOT NULL,                            -- e.g., 'Ordering at a Restaurant'
  description TEXT NOT NULL,                      -- 2-3 sentence setup

  -- Tagging
  profession_tags TEXT[] NOT NULL DEFAULT '{}',   -- e.g., {'hospitality', 'general'}
  context_type TEXT NOT NULL,                     -- 'business' | 'social' | 'daily_life' | 'travel' | 'professional' | 'emergency'
  cefr_levels TEXT[] NOT NULL,                    -- e.g., {'A1', 'A2', 'B1'} -- which levels this scenario suits
  language_pairs TEXT[] NOT NULL DEFAULT '{}',    -- e.g., {'en-es', 'en-fr'} -- which pairs have content

  -- Scenario content (language-agnostic structure)
  key_phrases JSONB NOT NULL DEFAULT '[]',        -- [{phrase, translation, language_pair, when_to_use}]
  ai_persona JSONB,                               -- {role, personality, background, speaking_style}
  objectives TEXT[] NOT NULL DEFAULT '{}',         -- What the user should accomplish
  estimated_minutes INTEGER NOT NULL DEFAULT 15,

  -- Relationships
  prerequisite_scenario_ids UUID[] DEFAULT '{}',  -- Scenarios that should come first
  related_scenario_ids UUID[] DEFAULT '{}',       -- For suggesting "next up"

  -- Metadata
  difficulty_weight REAL NOT NULL DEFAULT 1.0,    -- Relative difficulty multiplier
  popularity_score REAL NOT NULL DEFAULT 0.0,     -- For ranking (updated periodically)
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_vox_scenarios_profession ON vox_scenarios USING GIN (profession_tags);
CREATE INDEX idx_vox_scenarios_context ON vox_scenarios (context_type);
CREATE INDEX idx_vox_scenarios_cefr ON vox_scenarios USING GIN (cefr_levels);
CREATE INDEX idx_vox_scenarios_language ON vox_scenarios USING GIN (language_pairs);
CREATE INDEX idx_vox_scenarios_active ON vox_scenarios (is_active) WHERE is_active = true;
```

### 2.2 `vox_vocabulary` -- Vocabulary Items

Every word/phrase in the library, tagged for lookup. Words exist per language pair.

```sql
CREATE TABLE vox_vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Word data
  word TEXT NOT NULL,                            -- Target language word/phrase
  translation TEXT NOT NULL,                     -- Native language translation
  pronunciation TEXT,                            -- IPA or phonetic guide
  native_approximation TEXT,                     -- Approximate pronunciation in native script
  audio_url TEXT,                                -- Pre-recorded audio (optional)

  -- Language
  language_pair TEXT NOT NULL,                   -- e.g., 'en-es' (native-target)
  target_language TEXT NOT NULL,                 -- e.g., 'es'
  native_language TEXT NOT NULL,                 -- e.g., 'en'

  -- Classification
  part_of_speech TEXT NOT NULL DEFAULT 'other',  -- noun, verb, adjective, adverb, phrase, other
  cefr_level TEXT NOT NULL DEFAULT 'A1',         -- A1-C2
  difficulty TEXT NOT NULL DEFAULT 'medium',     -- easy, medium, hard
  category TEXT NOT NULL DEFAULT 'general',      -- universal, field-specific, survival

  -- Tags for lookup
  profession_tags TEXT[] NOT NULL DEFAULT '{}',  -- e.g., {'healthcare', 'general'}
  topic_tags TEXT[] NOT NULL DEFAULT '{}',       -- e.g., {'greetings', 'food', 'emergencies'}

  -- Usage examples
  example_sentence TEXT,                         -- In target language
  example_translation TEXT,                      -- In native language
  usage_notes TEXT,                              -- When/how to use this word
  memory_tip TEXT,                               -- Mnemonic or association

  -- Metadata
  frequency_rank INTEGER,                        -- Word frequency rank (lower = more common)
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Uniqueness: one entry per word per language pair
  UNIQUE(word, language_pair)
);

-- Indexes
CREATE INDEX idx_vox_vocab_language_pair ON vox_vocabulary (language_pair);
CREATE INDEX idx_vox_vocab_cefr ON vox_vocabulary (cefr_level);
CREATE INDEX idx_vox_vocab_profession ON vox_vocabulary USING GIN (profession_tags);
CREATE INDEX idx_vox_vocab_topic ON vox_vocabulary USING GIN (topic_tags);
CREATE INDEX idx_vox_vocab_category ON vox_vocabulary (category);
CREATE INDEX idx_vox_vocab_frequency ON vox_vocabulary (frequency_rank) WHERE frequency_rank IS NOT NULL;
CREATE INDEX idx_vox_vocab_pos ON vox_vocabulary (part_of_speech);
CREATE INDEX idx_vox_vocab_active ON vox_vocabulary (is_active) WHERE is_active = true;
```

### 2.3 `vox_grammar_points` -- Grammar Rules

Grammar concepts tagged by level and scenario context.

```sql
CREATE TABLE vox_grammar_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  slug TEXT UNIQUE NOT NULL,                     -- e.g., 'present_tense_regular_verbs'
  title TEXT NOT NULL,                            -- e.g., 'Present Tense: Regular Verbs'
  explanation TEXT NOT NULL,                      -- Clear grammar explanation

  -- Language
  target_language TEXT NOT NULL,                 -- e.g., 'es' (grammar is per target language)

  -- Classification
  cefr_level TEXT NOT NULL DEFAULT 'A1',         -- A1-C2
  grammar_category TEXT NOT NULL,                -- 'tense', 'mood', 'syntax', 'morphology', 'punctuation'

  -- Examples (JSONB array of {example, translation, breakdown})
  examples JSONB NOT NULL DEFAULT '[]',

  -- Common mistakes (JSONB array of {mistake, correction, explanation})
  common_mistakes JSONB NOT NULL DEFAULT '[]',

  -- Tags for scenario linking
  scenario_tags TEXT[] NOT NULL DEFAULT '{}',    -- Which scenarios commonly use this grammar

  -- Sequencing
  prerequisite_grammar_ids UUID[] DEFAULT '{}',  -- Grammar points that should come first
  sort_order INTEGER NOT NULL DEFAULT 0,         -- Within a CEFR level

  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_vox_grammar_language ON vox_grammar_points (target_language);
CREATE INDEX idx_vox_grammar_cefr ON vox_grammar_points (cefr_level);
CREATE INDEX idx_vox_grammar_category ON vox_grammar_points (grammar_category);
CREATE INDEX idx_vox_grammar_scenario ON vox_grammar_points USING GIN (scenario_tags);
CREATE INDEX idx_vox_grammar_active ON vox_grammar_points (is_active) WHERE is_active = true;
```

### 2.4 `vox_scenario_vocabulary` -- Junction Table

Maps scenarios to their tagged vocabulary. Each scenario has 10-15 vocabulary items.

```sql
CREATE TABLE vox_scenario_vocabulary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  scenario_id UUID NOT NULL REFERENCES vox_scenarios(id) ON DELETE CASCADE,
  vocabulary_id UUID NOT NULL REFERENCES vox_vocabulary(id) ON DELETE CASCADE,

  -- Relationship metadata
  relevance TEXT NOT NULL DEFAULT 'core',        -- 'core' (essential), 'supporting' (nice-to-have), 'advanced' (stretch goal)
  sort_order INTEGER NOT NULL DEFAULT 0,         -- Suggested learning order within scenario

  -- Uniqueness
  UNIQUE(scenario_id, vocabulary_id)
);

-- Indexes
CREATE INDEX idx_sv_scenario ON vox_scenario_vocabulary (scenario_id);
CREATE INDEX idx_sv_vocabulary ON vox_scenario_vocabulary (vocabulary_id);
CREATE INDEX idx_sv_relevance ON vox_scenario_vocabulary (relevance);
```

### 2.5 `vox_scenario_grammar` -- Junction Table

Maps scenarios to their grammar points. Each scenario has 2-3 grammar points.

```sql
CREATE TABLE vox_scenario_grammar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  scenario_id UUID NOT NULL REFERENCES vox_scenarios(id) ON DELETE CASCADE,
  grammar_point_id UUID NOT NULL REFERENCES vox_grammar_points(id) ON DELETE CASCADE,

  -- Relationship metadata
  relevance TEXT NOT NULL DEFAULT 'core',        -- 'core' or 'supporting'
  sort_order INTEGER NOT NULL DEFAULT 0,

  -- Uniqueness
  UNIQUE(scenario_id, grammar_point_id)
);

-- Indexes
CREATE INDEX idx_sg_scenario ON vox_scenario_grammar (scenario_id);
CREATE INDEX idx_sg_grammar ON vox_scenario_grammar (grammar_point_id);
```

---

## 3. TypeScript Types

These types go in a new file `types/voxLibrary.ts`.

```typescript
// ============================================================================
// VOX LIBRARY TYPES
// ============================================================================

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type ContextType =
  | 'business'
  | 'social'
  | 'daily_life'
  | 'travel'
  | 'professional'
  | 'emergency';

export type VocabCategory = 'universal' | 'field-specific' | 'survival';

export type VocabRelevance = 'core' | 'supporting' | 'advanced';

export type GrammarCategory =
  | 'tense'
  | 'mood'
  | 'syntax'
  | 'morphology'
  | 'punctuation';

export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'phrase'
  | 'other';

export type Difficulty = 'easy' | 'medium' | 'hard';

// --- Scenario ---

export interface VoxScenario {
  id: string;
  slug: string;
  title: string;
  description: string;
  profession_tags: string[];
  context_type: ContextType;
  cefr_levels: CEFRLevel[];
  language_pairs: string[];
  key_phrases: ScenarioPhrase[];
  ai_persona: AiPersona | null;
  objectives: string[];
  estimated_minutes: number;
  prerequisite_scenario_ids: string[];
  related_scenario_ids: string[];
  difficulty_weight: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScenarioPhrase {
  phrase: string;
  translation: string;
  language_pair: string;
  when_to_use: string;
}

export interface AiPersona {
  role: string;
  personality: string;
  background: string;
  speaking_style: string;
}

// --- Vocabulary ---

export interface VoxVocabulary {
  id: string;
  word: string;
  translation: string;
  pronunciation: string | null;
  native_approximation: string | null;
  audio_url: string | null;
  language_pair: string;
  target_language: string;
  native_language: string;
  part_of_speech: PartOfSpeech;
  cefr_level: CEFRLevel;
  difficulty: Difficulty;
  category: VocabCategory;
  profession_tags: string[];
  topic_tags: string[];
  example_sentence: string | null;
  example_translation: string | null;
  usage_notes: string | null;
  memory_tip: string | null;
  frequency_rank: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// --- Grammar ---

export interface VoxGrammarPoint {
  id: string;
  slug: string;
  title: string;
  explanation: string;
  target_language: string;
  cefr_level: CEFRLevel;
  grammar_category: GrammarCategory;
  examples: GrammarExample[];
  common_mistakes: GrammarMistake[];
  scenario_tags: string[];
  prerequisite_grammar_ids: string[];
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GrammarExample {
  example: string;
  translation: string;
  breakdown: string;
}

export interface GrammarMistake {
  mistake: string;
  correction: string;
  explanation: string;
}

// --- Junction types (with expanded relations) ---

export interface ScenarioWithContent extends VoxScenario {
  vocabulary: VoxVocabularyTagged[];
  grammar_points: VoxGrammarPointTagged[];
}

export interface VoxVocabularyTagged extends VoxVocabulary {
  relevance: VocabRelevance;
  sort_order: number;
}

export interface VoxGrammarPointTagged extends VoxGrammarPoint {
  relevance: 'core' | 'supporting';
  sort_order: number;
}

// --- Query types ---

export interface VoxLibraryQuery {
  profession: string;
  scenarios: string[];          // scenario slugs selected during onboarding
  cefr_level: CEFRLevel;
  language_pair: string;        // e.g., 'en-es'
  target_language: string;
  native_language: string;
}

export interface VoxLibraryResult {
  scenarios: ScenarioWithContent[];
  additional_vocabulary: VoxVocabulary[];   // Extra vocab matching profession but not tied to selected scenarios
  additional_grammar: VoxGrammarPoint[];    // Extra grammar for the CEFR level
  total_vocab_count: number;
  total_scenario_count: number;
}
```

---

## 4. Query Pattern

### 4.1 The Onboarding-to-Library Flow

When the user completes onboarding, their selections map to a Vox Library query:

```
Onboarding Data:
  profession = 'healthcare'
  scenarios = ['patient_consultations', 'medical_history', 'emergency_communication']
  level = 'intermediate'  (maps to B1)
  language = target: 'es', native: 'en'  (pair: 'en-es')
```

This produces a `VoxLibraryQuery`:
```typescript
{
  profession: 'healthcare',
  scenarios: ['patient_consultations', 'medical_history', 'emergency_communication'],
  cefr_level: 'B1',
  language_pair: 'en-es',
  target_language: 'es',
  native_language: 'en',
}
```

### 4.2 SQL Query Strategy

**Step 1: Fetch matching scenarios with their vocabulary and grammar.**

```sql
-- Get scenarios matching user's selections (by slug)
SELECT s.*,
  -- Embed vocabulary as JSON array
  COALESCE(
    json_agg(DISTINCT jsonb_build_object(
      'vocabulary', v.*,
      'relevance', sv.relevance,
      'sort_order', sv.sort_order
    )) FILTER (WHERE v.id IS NOT NULL),
    '[]'
  ) AS vocabulary,
  -- Embed grammar as JSON array
  COALESCE(
    json_agg(DISTINCT jsonb_build_object(
      'grammar_point', g.*,
      'relevance', sg.relevance,
      'sort_order', sg.sort_order
    )) FILTER (WHERE g.id IS NOT NULL),
    '[]'
  ) AS grammar_points
FROM vox_scenarios s
LEFT JOIN vox_scenario_vocabulary sv ON sv.scenario_id = s.id
LEFT JOIN vox_vocabulary v ON v.id = sv.vocabulary_id
  AND v.language_pair = 'en-es'
  AND v.is_active = true
LEFT JOIN vox_scenario_grammar sg ON sg.scenario_id = s.id
LEFT JOIN vox_grammar_points g ON g.id = sg.grammar_point_id
  AND g.target_language = 'es'
  AND g.is_active = true
WHERE s.slug = ANY(ARRAY['patient_consultations', 'medical_history', 'emergency_communication'])
  AND s.is_active = true
  AND 'en-es' = ANY(s.language_pairs)
  AND 'B1' = ANY(s.cefr_levels)
GROUP BY s.id
ORDER BY s.difficulty_weight ASC;
```

**Step 2: Fetch additional vocabulary for the profession (not already in selected scenarios).**

```sql
SELECT v.*
FROM vox_vocabulary v
WHERE v.language_pair = 'en-es'
  AND v.cefr_level IN ('A2', 'B1')  -- Current level and one below
  AND 'healthcare' = ANY(v.profession_tags)
  AND v.is_active = true
  AND v.id NOT IN (
    SELECT sv.vocabulary_id
    FROM vox_scenario_vocabulary sv
    JOIN vox_scenarios s ON s.id = sv.scenario_id
    WHERE s.slug = ANY(ARRAY['patient_consultations', 'medical_history', 'emergency_communication'])
  )
ORDER BY v.frequency_rank ASC NULLS LAST
LIMIT 50;
```

**Step 3: Fetch additional grammar for the level.**

```sql
SELECT g.*
FROM vox_grammar_points g
WHERE g.target_language = 'es'
  AND g.cefr_level IN ('A2', 'B1')
  AND g.is_active = true
ORDER BY g.sort_order ASC;
```

### 4.3 Supabase Client Query (TypeScript)

```typescript
async function queryVoxLibrary(query: VoxLibraryQuery): Promise<VoxLibraryResult> {
  // 1. Fetch scenarios with embedded vocabulary and grammar
  const { data: scenarios, error } = await supabase
    .from('vox_scenarios')
    .select(`
      *,
      vox_scenario_vocabulary!inner(
        relevance,
        sort_order,
        vox_vocabulary!inner(*)
      ),
      vox_scenario_grammar(
        relevance,
        sort_order,
        vox_grammar_points!inner(*)
      )
    `)
    .in('slug', query.scenarios)
    .contains('language_pairs', [query.language_pair])
    .contains('cefr_levels', [query.cefr_level])
    .eq('is_active', true);

  // 2. Fetch additional profession vocabulary
  const { data: extraVocab } = await supabase
    .from('vox_vocabulary')
    .select('*')
    .eq('language_pair', query.language_pair)
    .in('cefr_level', [query.cefr_level, getPreviousCEFR(query.cefr_level)])
    .contains('profession_tags', [query.profession])
    .eq('is_active', true)
    .order('frequency_rank', { ascending: true, nullsFirst: false })
    .limit(50);

  // 3. Fetch additional grammar
  const { data: extraGrammar } = await supabase
    .from('vox_grammar_points')
    .select('*')
    .eq('target_language', query.target_language)
    .in('cefr_level', [query.cefr_level, getPreviousCEFR(query.cefr_level)])
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  return {
    scenarios: transformScenarios(scenarios),
    additional_vocabulary: extraVocab || [],
    additional_grammar: extraGrammar || [],
    total_vocab_count: countUniqueVocab(scenarios, extraVocab),
    total_scenario_count: scenarios?.length || 0,
  };
}
```

---

## 5. Integration with Existing Systems

### 5.1 FSRS Integration

When vocabulary from the Vox Library enters the user's word bank for spaced repetition, the `word_bank` table gets a new column linking back to the library:

```sql
-- Migration v3: Add library link to word_bank
ALTER TABLE word_bank ADD COLUMN library_vocab_id UUID;
-- No FK constraint (word_bank is SQLite, vox_vocabulary is Supabase)
-- The ID is used for deduplication and analytics only
```

This enables:
- **Deduplication**: If the same word appears in multiple scenarios, it's one word_bank entry.
- **Analytics**: Track which library words users struggle with most (feeds back to improve library).
- **Re-encounter tracking**: The existing `addOrReinforceWord` pattern works perfectly -- encountering a library word in a new scenario reinforces it.

### 5.2 Path Generation Changes

The current path generation flow changes from:

```
CURRENT:  Onboarding -> AI generates everything from scratch -> Store
```

to:

```
NEW:      Onboarding -> Query Vox Library -> AI personalizes library content -> Store
```

Specifically:
1. **Skeleton generation** stays the same (AI creates stair order/titles) but is informed by the library's scenario list.
2. **Stair content generation** changes: instead of AI inventing vocabulary, it receives library vocabulary and scenarios, then personalizes (reorders, adds context, adjusts difficulty).
3. **Fallback path** uses library content directly instead of hardcoded `UNIVERSAL_VOCAB` / `FIELD_VOCAB` dictionaries.

### 5.3 Mapping SCENARIOS_BY_CONTEXT to vox_scenarios

The existing `SCENARIOS_BY_CONTEXT` in `hooks/useOnboardingV2.ts` maps directly to `vox_scenarios` slugs:

| Onboarding Scenario ID | vox_scenarios slug | profession_tag |
|------------------------|-------------------|----------------|
| `pitching_ideas` | `pitching_ideas` | `business` |
| `patient_consultations` | `patient_consultations` | `healthcare` |
| `client_intake` | `client_intake` | `legal` |
| `classroom_participation` | `classroom_participation` | `student` |
| etc. | etc. | etc. |

The slugs in `SCENARIOS_BY_CONTEXT` become the `slug` column in `vox_scenarios`. The onboarding UI does not change -- it still shows the same scenario picker. The difference is that behind the scenes, those scenario IDs now query a content database instead of being passed to AI as free-text hints.

### 5.4 Vocabulary-to-Conversation Loop

The Vox Library strengthens the existing vocabulary-to-conversation loop:

```
Vox Library vocab (tagged to scenario)
       |
       v
Pre-call vocab review (FSRS flashcards)
       |
       v
AI Conversation Call (scenario from library, persona from library)
       |
       v
Post-call analysis
       |
       v
word_bank update (used words = Good, missed = Again)
       |
       v
FSRS schedules next review
```

The library provides the **scenario prompt** and **AI persona** directly, so conversation calls are more consistent and targeted.

---

## 6. Scalability Plan

### Initial Seed (Phase 1)

| Content | Count | Source |
|---------|-------|--------|
| Scenarios | 60 (10 professions x 6 scenarios each) | From existing SCENARIOS_BY_CONTEXT |
| Vocabulary (en-es) | ~900 (60 scenarios x 15 words) | From existing UNIVERSAL_VOCAB + FIELD_VOCAB + AI expansion |
| Vocabulary (en-fr) | ~900 | From existing UNIVERSAL_VOCAB_FR + AI expansion |
| Grammar points (es) | ~30 (6 CEFR levels x 5 points) | From existing getStairGrammarPoints + expansion |
| Grammar points (fr) | ~30 | New content |

### Growth Targets

| Milestone | Scenarios | Vocabulary | Grammar |
|-----------|-----------|------------|---------|
| Launch | 60 | 1,800 (2 lang pairs) | 60 |
| 3 months | 120 | 3,600 | 90 |
| 6 months | 200+ | 6,000+ (3+ lang pairs) | 120+ |

### Content Pipeline

New content enters the library through:
1. **Manual curation** -- Vox team creates and tags content.
2. **AI-assisted generation** -- AI proposes new vocabulary/scenarios, human reviews and approves.
3. **User feedback loop** -- Words users struggle with get additional examples/tips.

---

## 7. Row-Level Security (RLS)

All Vox Library tables are **read-only for authenticated users**:

```sql
-- All vox_* tables: read-only for authenticated users
ALTER TABLE vox_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read active scenarios"
  ON vox_scenarios FOR SELECT
  TO authenticated
  USING (is_active = true);

ALTER TABLE vox_vocabulary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read active vocabulary"
  ON vox_vocabulary FOR SELECT
  TO authenticated
  USING (is_active = true);

ALTER TABLE vox_grammar_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read active grammar"
  ON vox_grammar_points FOR SELECT
  TO authenticated
  USING (is_active = true);

ALTER TABLE vox_scenario_vocabulary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read scenario vocabulary"
  ON vox_scenario_vocabulary FOR SELECT
  TO authenticated
  USING (true);

ALTER TABLE vox_scenario_grammar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read scenario grammar"
  ON vox_scenario_grammar FOR SELECT
  TO authenticated
  USING (true);
```

Write access is restricted to service role (admin/backend only).

---

## 8. Comparison: Before vs After

| Aspect | Before (Current) | After (Vox Library) |
|--------|-------------------|---------------------|
| Vocabulary source | AI invents from scratch each time | Library provides curated, tagged content |
| Consistency | Same word may get different translations across paths | One canonical entry per word per language pair |
| Scenario content | AI creates scenario prompts ad-hoc | Library stores tested scenario templates with personas |
| Fallback quality | Hardcoded English/Spanish dictionaries | Same library used by AI and fallback paths |
| Profession relevance | AI guesses profession vocab | Vocabulary explicitly tagged by profession |
| FSRS integration | Words added with no source tracking | Words linked to library IDs for dedup + analytics |
| New language pair | Requires new hardcoded vocab catalogs | Add rows to vox_vocabulary with new language_pair |
| Grammar | String arrays per stair | Rich grammar objects with examples and common mistakes |

---

## 9. Migration Path from Current System

The migration is additive -- no existing tables are modified or deleted:

1. **Create Vox Library tables** in Supabase (the 5 tables above).
2. **Seed initial content** by extracting and transforming data from:
   - `SCENARIOS_BY_CONTEXT` (60 scenarios)
   - `UNIVERSAL_VOCAB` + `UNIVERSAL_VOCAB_FR` + `FIELD_VOCAB` (vocabulary)
   - `getStairGrammarPoints` (grammar)
3. **Add `library_vocab_id`** column to `word_bank` SQLite table (migration v3).
4. **Update path generation** to query library first, then pass results to AI.
5. **Keep old fallback** working during transition -- it just uses library content instead of hardcoded dictionaries.

No breaking changes to the existing user-facing flow. The onboarding UI, staircase display, and FSRS system all work exactly as before.

---

## 10. Open Questions for Team Lead

1. **Content seeding priority**: Should we seed en-es first and add en-fr later, or both simultaneously?
2. **"General" profession**: Users who select "other" profession -- should they get all universal scenarios, or a curated general set?
3. **Scenario versioning**: If we update a scenario's vocabulary, should users on existing paths get the updates or keep their original content?
4. **Audio content**: Should `audio_url` in `vox_vocabulary` be populated from launch, or added incrementally?
