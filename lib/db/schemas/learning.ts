/**
 * Database Schemas for Vox Language App Learning Path System
 *
 * This file contains TypeScript interfaces and SQL migration comments
 * for the complete learning path system including paths, sections, stairs,
 * lessons, AI memory, calibration, and progress tracking.
 */

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

/**
 * Learning Path - User's personalized learning journey
 */
export interface LearningPath {
  id: string;
  user_id: string;
  target_language: string;
  native_language: string;
  motivation: string;
  motivation_custom?: string | null;
  proficiency_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  timeline: string;
  path_title: string;
  path_description: string;
  total_sections: number;
  current_section: number;
  created_at: string;
  updated_at: string;
}

/**
 * Section - Groups of 5-7 stairs representing a learning phase
 */
export interface Section {
  id: string;
  path_id: string;
  section_number: number;
  title: string;
  description: string;
  status: 'locked' | 'active' | 'completed';
  stairs_count: number;
  created_at: string;
}

/**
 * Stair - Individual milestone within a section
 */
export interface Stair {
  id: string;
  section_id: string;
  order: number;
  title: string;
  emoji: string;
  description: string;
  vocabulary_count: number;
  estimated_days: number;
  skills_required: string[]; // JSON array
  skills_unlocked: string[]; // JSON array
  status: 'locked' | 'current' | 'completed';
  lessons_count: number; // default 5
  created_at: string;
  completed_at?: string | null;
}

/**
 * Mini Lesson - Individual lessons within a stair (5 per stair)
 */
export interface MiniLesson {
  id: string;
  stair_id: string;
  order: number;
  type: 'vocabulary' | 'flashcards' | 'writing' | 'reading' | 'conversation';
  title: string;
  description: string;
  content: Record<string, any>; // JSON - lesson-specific data
  min_messages?: number | null; // for conversation type
  status: 'locked' | 'current' | 'completed';
  created_at: string;
  completed_at?: string | null;
}

/**
 * User AI Memory - AI's personalized memory for each user (like claude.md)
 */
export interface UserAIMemory {
  id: string;
  user_id: string;
  native_language: string;
  target_language: string;
  original_motivation: string;
  original_stakes?: string | null;
  current_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  strengths: string[]; // JSON array
  weaknesses: string[]; // JSON array
  preferred_topics: string[]; // JSON array
  total_vocab_learned: number;
  vocab_mastery_rate: number; // 0-100
  conversation_confidence: number; // 0-100
  ai_observations: string[]; // JSON array of AI notes
  recommended_focus: string[]; // JSON array of focus areas
  calibrations_completed: number;
  sections_completed: number;
  created_at: string;
  updated_at: string;
}

/**
 * Calibrator Results - Results from calibration tests
 */
export interface CalibratorResult {
  id: string;
  user_id: string;
  section_id: string;
  listening_score: number; // 0-100
  speaking_score: number; // 0-100
  comprehension_score: number; // 0-100
  overall_score: number; // 0-100
  strengths_identified: Record<string, any>; // JSON object
  weaknesses_identified: Record<string, any>; // JSON object
  recommendations: Record<string, any>; // JSON object
  created_at: string;
}

/**
 * Lesson Progress - Track user progress within individual lessons
 */
export interface LessonProgress {
  id: string;
  user_id: string;
  mini_lesson_id: string;
  cards_total: number;
  cards_completed: number;
  cards_good: number; // cards marked as "good"
  cards_again: number; // cards marked as "again"
  messages_sent?: number | null; // for conversation lessons
  score: number; // 0-100
  time_spent_seconds: number;
  status: 'in_progress' | 'completed';
  started_at: string;
  completed_at?: string | null;
}

// ============================================================================
// DATABASE INSERTION TYPES (omit auto-generated fields)
// ============================================================================

export type LearningPathInsert = Omit<LearningPath, 'id' | 'created_at' | 'updated_at'>;
export type SectionInsert = Omit<Section, 'id' | 'created_at'>;
export type StairInsert = Omit<Stair, 'id' | 'created_at' | 'completed_at'>;
export type MiniLessonInsert = Omit<MiniLesson, 'id' | 'created_at' | 'completed_at'>;
export type UserAIMemoryInsert = Omit<UserAIMemory, 'id' | 'created_at' | 'updated_at'>;
export type CalibratorResultInsert = Omit<CalibratorResult, 'id' | 'created_at'>;
export type LessonProgressInsert = Omit<LessonProgress, 'id' | 'started_at' | 'completed_at'>;

// ============================================================================
// SQL MIGRATIONS (for Supabase)
// ============================================================================

/*

-- ============================================================================
-- MIGRATION: Create Learning Path System Tables
-- ============================================================================

-- 1. LEARNING PATHS TABLE
-- User's personalized learning journey
CREATE TABLE learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_language TEXT NOT NULL,
  native_language TEXT NOT NULL,
  motivation TEXT NOT NULL,
  motivation_custom TEXT,
  proficiency_level TEXT NOT NULL CHECK (proficiency_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  timeline TEXT NOT NULL,
  path_title TEXT NOT NULL,
  path_description TEXT NOT NULL,
  total_sections INTEGER NOT NULL DEFAULT 0,
  current_section INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for user lookups
CREATE INDEX idx_learning_paths_user_id ON learning_paths(user_id);

-- RLS Policies
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own learning paths"
  ON learning_paths FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning paths"
  ON learning_paths FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning paths"
  ON learning_paths FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================

-- 2. SECTIONS TABLE
-- Groups of 5-7 stairs representing learning phases
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  section_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'active', 'completed')),
  stairs_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(path_id, section_number)
);

-- Index for path lookups
CREATE INDEX idx_sections_path_id ON sections(path_id);
CREATE INDEX idx_sections_status ON sections(status);

-- RLS Policies
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sections of their learning paths"
  ON sections FOR SELECT
  USING (
    path_id IN (
      SELECT id FROM learning_paths WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert sections for their learning paths"
  ON sections FOR INSERT
  WITH CHECK (
    path_id IN (
      SELECT id FROM learning_paths WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update sections of their learning paths"
  ON sections FOR UPDATE
  USING (
    path_id IN (
      SELECT id FROM learning_paths WHERE user_id = auth.uid()
    )
  );

-- ============================================================================

-- 3. STAIRS TABLE
-- Individual milestones within sections
CREATE TABLE stairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  order INTEGER NOT NULL,
  title TEXT NOT NULL,
  emoji TEXT NOT NULL,
  description TEXT NOT NULL,
  vocabulary_count INTEGER NOT NULL DEFAULT 0,
  estimated_days INTEGER NOT NULL DEFAULT 1,
  skills_required JSONB NOT NULL DEFAULT '[]'::jsonb,
  skills_unlocked JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'current', 'completed')),
  lessons_count INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  UNIQUE(section_id, order)
);

-- Indexes
CREATE INDEX idx_stairs_section_id ON stairs(section_id);
CREATE INDEX idx_stairs_status ON stairs(status);
CREATE INDEX idx_stairs_order ON stairs(section_id, order);

-- RLS Policies
ALTER TABLE stairs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view stairs of their sections"
  ON stairs FOR SELECT
  USING (
    section_id IN (
      SELECT s.id FROM sections s
      JOIN learning_paths lp ON s.path_id = lp.id
      WHERE lp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert stairs for their sections"
  ON stairs FOR INSERT
  WITH CHECK (
    section_id IN (
      SELECT s.id FROM sections s
      JOIN learning_paths lp ON s.path_id = lp.id
      WHERE lp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update stairs of their sections"
  ON stairs FOR UPDATE
  USING (
    section_id IN (
      SELECT s.id FROM sections s
      JOIN learning_paths lp ON s.path_id = lp.id
      WHERE lp.user_id = auth.uid()
    )
  );

-- ============================================================================

-- 4. MINI_LESSONS TABLE
-- Individual lessons within stairs (5 per stair)
CREATE TABLE mini_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stair_id UUID NOT NULL REFERENCES stairs(id) ON DELETE CASCADE,
  order INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('vocabulary', 'flashcards', 'writing', 'reading', 'conversation')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  min_messages INTEGER,
  status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'current', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  UNIQUE(stair_id, order)
);

-- Indexes
CREATE INDEX idx_mini_lessons_stair_id ON mini_lessons(stair_id);
CREATE INDEX idx_mini_lessons_type ON mini_lessons(type);
CREATE INDEX idx_mini_lessons_status ON mini_lessons(status);

-- RLS Policies
ALTER TABLE mini_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view mini lessons of their stairs"
  ON mini_lessons FOR SELECT
  USING (
    stair_id IN (
      SELECT st.id FROM stairs st
      JOIN sections s ON st.section_id = s.id
      JOIN learning_paths lp ON s.path_id = lp.id
      WHERE lp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert mini lessons for their stairs"
  ON mini_lessons FOR INSERT
  WITH CHECK (
    stair_id IN (
      SELECT st.id FROM stairs st
      JOIN sections s ON st.section_id = s.id
      JOIN learning_paths lp ON s.path_id = lp.id
      WHERE lp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update mini lessons of their stairs"
  ON mini_lessons FOR UPDATE
  USING (
    stair_id IN (
      SELECT st.id FROM stairs st
      JOIN sections s ON st.section_id = s.id
      JOIN learning_paths lp ON s.path_id = lp.id
      WHERE lp.user_id = auth.uid()
    )
  );

-- ============================================================================

-- 5. USER_AI_MEMORY TABLE
-- AI's personalized memory for each user (like claude.md)
CREATE TABLE user_ai_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  native_language TEXT NOT NULL,
  target_language TEXT NOT NULL,
  original_motivation TEXT NOT NULL,
  original_stakes TEXT,
  current_level TEXT NOT NULL CHECK (current_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  weaknesses JSONB NOT NULL DEFAULT '[]'::jsonb,
  preferred_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_vocab_learned INTEGER NOT NULL DEFAULT 0,
  vocab_mastery_rate INTEGER NOT NULL DEFAULT 0 CHECK (vocab_mastery_rate >= 0 AND vocab_mastery_rate <= 100),
  conversation_confidence INTEGER NOT NULL DEFAULT 0 CHECK (conversation_confidence >= 0 AND conversation_confidence <= 100),
  ai_observations JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommended_focus JSONB NOT NULL DEFAULT '[]'::jsonb,
  calibrations_completed INTEGER NOT NULL DEFAULT 0,
  sections_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for user lookups
CREATE INDEX idx_user_ai_memory_user_id ON user_ai_memory(user_id);

-- RLS Policies
ALTER TABLE user_ai_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI memory"
  ON user_ai_memory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI memory"
  ON user_ai_memory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI memory"
  ON user_ai_memory FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================

-- 6. CALIBRATOR_RESULTS TABLE
-- Results from calibration tests
CREATE TABLE calibrator_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  listening_score INTEGER NOT NULL CHECK (listening_score >= 0 AND listening_score <= 100),
  speaking_score INTEGER NOT NULL CHECK (speaking_score >= 0 AND speaking_score <= 100),
  comprehension_score INTEGER NOT NULL CHECK (comprehension_score >= 0 AND comprehension_score <= 100),
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  strengths_identified JSONB NOT NULL DEFAULT '{}'::jsonb,
  weaknesses_identified JSONB NOT NULL DEFAULT '{}'::jsonb,
  recommendations JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_calibrator_results_user_id ON calibrator_results(user_id);
CREATE INDEX idx_calibrator_results_section_id ON calibrator_results(section_id);
CREATE INDEX idx_calibrator_results_created_at ON calibrator_results(created_at DESC);

-- RLS Policies
ALTER TABLE calibrator_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own calibrator results"
  ON calibrator_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calibrator results"
  ON calibrator_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================

-- 7. LESSON_PROGRESS TABLE
-- Track user progress within individual lessons
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mini_lesson_id UUID NOT NULL REFERENCES mini_lessons(id) ON DELETE CASCADE,
  cards_total INTEGER NOT NULL DEFAULT 0,
  cards_completed INTEGER NOT NULL DEFAULT 0,
  cards_good INTEGER NOT NULL DEFAULT 0,
  cards_again INTEGER NOT NULL DEFAULT 0,
  messages_sent INTEGER,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  UNIQUE(user_id, mini_lesson_id)
);

-- Indexes
CREATE INDEX idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_mini_lesson_id ON lesson_progress(mini_lesson_id);
CREATE INDEX idx_lesson_progress_status ON lesson_progress(status);

-- RLS Policies
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own lesson progress"
  ON lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lesson progress"
  ON lesson_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson progress"
  ON lesson_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for learning_paths
CREATE TRIGGER update_learning_paths_updated_at
  BEFORE UPDATE ON learning_paths
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_ai_memory
CREATE TRIGGER update_user_ai_memory_updated_at
  BEFORE UPDATE ON user_ai_memory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- END MIGRATION
-- ============================================================================

*/
