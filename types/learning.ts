/**
 * Comprehensive TypeScript types for the Vox Language App learning path system.
 *
 * This file contains all type definitions for:
 * - Path generation and AI-driven personalization
 * - Learning stairs and mini-lessons
 * - Lesson content (vocabulary, flashcards, writing, reading, conversation)
 * - Progress tracking and calibration
 * - User AI memory and proficiency tracking
 */

// ============================================================================
// PATH GENERATION TYPES
// ============================================================================

/**
 * Input data for generating a personalized learning path.
 * Collected during onboarding to create a tailored curriculum.
 */
export interface PathGenerationInput {
  user_id: string;
  target_language: string;
  native_language: string;
  motivation: string;
  motivation_custom?: string;
  why_now?: string;
  proficiency_level: 'beginner' | 'elementary' | 'intermediate' | 'advanced';
  timeline: '1_month' | '3_months' | '6_months' | '1_year';
  previous_attempts?: string;
  commitment_stakes: string;
}

/**
 * AI-generated personalized learning path structure.
 * Contains the complete curriculum with stairs, vocabulary, and scenarios.
 */
export interface GeneratedPath {
  path_title: string;
  path_description: string;
  total_stairs: number;
  estimated_completion: string;
  stairs: GeneratedStair[];
}

/**
 * A single stair in the generated learning path.
 * Each stair represents a learning milestone with specific vocabulary and skills.
 *
 * Supports skeleton mode: vocabulary/scenarios can be empty arrays for stairs
 * that will have content loaded on-demand as user progresses.
 */
export interface GeneratedStair {
  order: number;
  title: string;
  emoji: string;
  description: string;
  vocabulary: VocabItem[];
  grammar_points: string[];
  scenarios: Scenario[];
  skills_required: string[];
  skills_unlocked: string[];
  estimated_days: number;
  /** Flag indicating if detailed content has been loaded (skeleton stairs start with false) */
  content_loaded?: boolean;
}

// ============================================================================
// SECTION TYPE
// ============================================================================

/**
 * A section in the learning path - groups multiple stairs together.
 * After completing all stairs in a section, the user takes a calibrator test.
 */
export interface Section {
  id: string;
  path_id: string;
  order: number;
  title: string;
  description: string;
  stairs: Stair[];
  stairs_count: number;
  calibrator_test_id?: string;
  status: 'locked' | 'current' | 'completed';
  created_at: string;
  completed_at?: string;
}

// ============================================================================
// STAIR & LESSON TYPES
// ============================================================================

/**
 * Stair completion status.
 * - locked: User hasn't unlocked this stair yet
 * - current: User is actively working on this stair
 * - completed: User has finished all lessons in this stair
 */
export type StairStatus = 'locked' | 'current' | 'completed';

/**
 * Types of mini-lessons available in a stair.
 */
export type LessonType = 'vocabulary' | 'flashcards' | 'writing' | 'reading' | 'conversation';

/**
 * Lesson completion status.
 * - locked: User hasn't unlocked this lesson yet
 * - current: User is actively working on this lesson
 * - completed: User has finished this lesson
 */
export type LessonStatus = 'locked' | 'current' | 'completed';

/**
 * A learning stair - represents a major milestone in the learning path.
 * Contains multiple mini-lessons focused on specific vocabulary and skills.
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
  skills_required: string[];
  skills_unlocked: string[];
  status: StairStatus;
  lessons_count: number;
  lessons?: MiniLesson[];
  created_at: string;
  completed_at?: string;
}

/**
 * A mini-lesson within a stair.
 * Each lesson focuses on a specific learning activity (vocabulary, reading, etc.)
 */
export interface MiniLesson {
  id: string;
  stair_id: string;
  order: number;
  type: LessonType;
  title: string;
  description: string;
  content: LessonContent;
  min_messages?: number;
  status: LessonStatus;
}

// ============================================================================
// LESSON CONTENT TYPES (Discriminated Union)
// ============================================================================

/**
 * Discriminated union of all possible lesson content types.
 * Use the 'type' property to narrow the specific content structure.
 */
export type LessonContent =
  | VocabularyContent
  | FlashcardsContent
  | WritingContent
  | ReadingContent
  | ConversationContent;

/**
 * Content for vocabulary lessons.
 * Focuses on learning new words with translations and example sentences.
 */
export interface VocabularyContent {
  type: 'vocabulary';
  items: VocabItem[];
}

/**
 * Content for flashcard-based lessons.
 * Uses spaced repetition for vocabulary memorization.
 */
export interface FlashcardsContent {
  type: 'flashcards';
  cards: FlashcardItem[];
}

/**
 * Content for writing practice lessons.
 * Provides prompts to practice written composition.
 */
export interface WritingContent {
  type: 'writing';
  prompts: WritingPrompt[];
}

/**
 * Content for reading comprehension lessons.
 * Includes passage and comprehension questions.
 */
export interface ReadingContent {
  type: 'reading';
  passage: string;
  questions: ComprehensionQuestion[];
}

/**
 * Content for conversation practice lessons.
 * AI-driven dialogue practice with specific scenarios and objectives.
 */
export interface ConversationContent {
  type: 'conversation';
  scenario: string;
  ai_persona: string;
  objectives: string[];
  min_messages: number;
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

/**
 * A vocabulary item with translation, pronunciation, and example usage.
 */
export interface VocabItem {
  word: string;
  translation: string;
  pronunciation?: string;
  example_sentence: string;
  example_translation: string;
  part_of_speech: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

/**
 * A flashcard for spaced repetition learning.
 */
export interface FlashcardItem {
  front: string;
  back: string;
  hint?: string;
  audio_url?: string;
}

/**
 * A writing prompt with instructions and target vocabulary.
 */
export interface WritingPrompt {
  instruction: string;
  starter?: string;
  target_length: number;
  key_vocabulary: string[];
}

/**
 * A multiple-choice comprehension question.
 */
export interface ComprehensionQuestion {
  question: string;
  options: string[];
  correct_index: number;
}

/**
 * A conversation scenario with context and key phrases.
 */
export interface Scenario {
  title: string;
  description: string;
  context: string;
  key_phrases: string[];
}

// ============================================================================
// CALIBRATOR TYPES
// ============================================================================

/**
 * A calibration test to assess user's current proficiency.
 * Used to adjust the learning path and identify strengths/weaknesses.
 */
export interface CalibratorTest {
  id: string;
  section_id: string;
  listening_tasks: ListeningTask[];
  speaking_tasks: SpeakingTask[];
  comprehension_tasks: ComprehensionTask[];
}

/**
 * Listening comprehension task for calibration.
 */
export interface ListeningTask {
  id: string;
  audio_url: string;
  question: string;
  options: string[];
  correct_index: number;
}

/**
 * Speaking production task for calibration.
 */
export interface SpeakingTask {
  id: string;
  prompt: string;
  target_length_seconds: number;
  rubric: string[];
}

/**
 * Reading comprehension task for calibration.
 */
export interface ComprehensionTask {
  id: string;
  passage: string;
  questions: ComprehensionQuestion[];
}

/**
 * Results from a calibration test.
 * Provides scores, identified strengths/weaknesses, and AI recommendations.
 */
export interface CalibratorResult {
  listening_score: number;
  speaking_score: number;
  comprehension_score: number;
  overall_score: number;
  strengths_identified: string[];
  weaknesses_identified: string[];
  recommendations: string[];
}

// ============================================================================
// USER AI MEMORY TYPES
// ============================================================================

/**
 * CEFR (Common European Framework of Reference) proficiency levels.
 * A1/A2: Basic, B1/B2: Intermediate, C1/C2: Advanced
 */
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/**
 * AI memory for personalized learning.
 * Tracks user's progress, preferences, strengths, and AI observations
 * to continuously adapt the learning experience.
 */
export interface UserAIMemory {
  id: string;
  user_id: string;
  native_language: string;
  target_language: string;
  original_motivation: string;
  original_stakes: string;
  current_level: CEFRLevel;
  strengths: string[];
  weaknesses: string[];
  preferred_topics: string[];
  total_vocab_learned: number;
  vocab_mastery_rate: number;
  conversation_confidence: number;
  ai_observations: string[];
  recommended_focus: string[];
  calibrations_completed: number;
  sections_completed: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PROGRESS TYPES
// ============================================================================

/**
 * Detailed progress tracking for a single mini-lesson.
 * Records cards completed, messages sent, scores, and time spent.
 */
export interface LessonProgress {
  id: string;
  user_id: string;
  mini_lesson_id: string;
  cards_total: number;
  cards_completed: number;
  cards_good: number;
  cards_again: number;
  messages_sent: number;
  score: number;
  time_spent_seconds: number;
  status: 'in_progress' | 'completed';
  started_at: string;
  completed_at?: string;
}

/**
 * Aggregated progress for an entire stair.
 * Summarizes completion across all lessons in the stair.
 */
export interface StairProgress {
  stair_id: string;
  lessons_completed: number;
  total_lessons: number;
  overall_score: number;
  time_spent_seconds: number;
}
