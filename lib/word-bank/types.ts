/**
 * Word Bank Types
 *
 * Complete TypeScript type definitions for the Vox Word Bank system.
 * This system manages vocabulary learning with spaced repetition (SM-2 algorithm)
 * and priority-based review scheduling.
 */

// ============================================================================
// Enums and Type Aliases
// ============================================================================

/**
 * CEFR (Common European Framework of Reference) proficiency levels
 */
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/**
 * Grammatical categories for words
 */
export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase' | 'other';

/**
 * Source of word addition to the bank
 */
export type WordSource = 'lesson' | 'reading' | 'manual' | 'error' | 'ai_conversation';

/**
 * Types of errors that can occur during learning
 */
export type ErrorType = 'spelling' | 'pronunciation' | 'meaning' | 'grammar' | 'usage';

// ============================================================================
// Core Word Entity
// ============================================================================

/**
 * Main word entity in the Word Bank system
 *
 * Represents a vocabulary word with all its learning metadata,
 * including spaced repetition state (SM-2 algorithm) and categorization.
 */
export interface BankWord {
  /** Unique identifier for the word */
  id: string;

  /** Target language word */
  word: string;

  /** Native language translation */
  translation: string;

  /** IPA pronunciation guide (optional) */
  phonetic?: string;

  /** Path or URL to audio pronunciation file (optional) */
  audioUrl?: string;

  /** Path or URL to associated image (optional) */
  imageUrl?: string;

  // Categorization
  /** Category for grouping (e.g., 'food', 'travel', 'verbs') */
  category: string;

  /** CEFR proficiency level */
  cefrLevel: CEFRLevel;

  /** Grammatical part of speech */
  partOfSpeech: PartOfSpeech;

  // Learning State (SM-2 Algorithm Fields)
  /** Learning mastery score (0-100) */
  masteryScore: number;

  /** Calculated priority for review (0-10) */
  priority: number;

  /** SM-2 ease factor (default 2.5, affects interval growth) */
  easeFactor: number;

  /** Days until next review (SM-2 interval) */
  interval: number;

  /** Consecutive correct answers (SM-2 repetitions) */
  repetitions: number;

  /** ISO date string for next scheduled review */
  nextReviewDate: string;

  /** ISO date string of last review (optional) */
  lastReviewDate?: string;

  // Performance History
  /** Total number of correct answers */
  timesCorrect: number;

  /** Total number of incorrect answers */
  timesIncorrect: number;

  /** Array of error types encountered */
  errorTypes: ErrorType[];

  // Source and Context
  /** Source of word addition */
  source: WordSource;

  /** Tags for milestone/goal association */
  milestoneTags: string[];

  /** Example sentences demonstrating usage */
  exampleSentences: string[];

  // Timestamps
  /** ISO date string when word was added */
  addedAt: string;

  /** ISO date string when word was last updated */
  updatedAt: string;
}

// ============================================================================
// Priority Calculation Types
// ============================================================================

/**
 * Individual factors that contribute to priority calculation
 * All scores range from 0-100
 */
export interface PriorityFactors {
  /** Urgency based on milestone deadlines (0-100) */
  milestoneUrgency: number;

  /** Score based on error rate and mastery (0-100) */
  weaknessScore: number;

  /** Penalty for recently reviewed words (0-100) */
  recencyPenalty: number;

  /** Match with user's current CEFR level (0-100) */
  cefrMatch: number;
}

/**
 * Weight multipliers for each priority factor
 * Should sum to 1.0 for normalized priority scores
 */
export interface PriorityWeights {
  /** Weight for milestone urgency (default: 0.3) */
  milestoneUrgency: number;

  /** Weight for weakness score (default: 0.4) */
  weaknessScore: number;

  /** Weight for recency penalty (default: 0.2) */
  recencyPenalty: number;

  /** Weight for CEFR level match (default: 0.1) */
  cefrMatch: number;
}

/**
 * Result of priority calculation for a word
 */
export interface PriorityResult {
  /** ID of the word */
  wordId: string;

  /** Final calculated priority (0-10) */
  priority: number;

  /** Breakdown of contributing factors */
  factors: PriorityFactors;

  /** ISO date string when priority was calculated */
  calculatedAt: string;

  /** Individual contributions to final priority (0-10 scale) */
  breakdown: {
    milestoneContribution: number;
    weaknessContribution: number;
    recencyContribution: number;
    cefrContribution: number;
  };
}

// ============================================================================
// CRUD Input Types
// ============================================================================

/**
 * Input type for adding a new word to the bank
 *
 * Only required fields: word, translation, and source
 * All learning state fields are initialized automatically
 */
export interface AddWordInput {
  /** Target language word */
  word: string;

  /** Native language translation */
  translation: string;

  /** IPA pronunciation guide (optional) */
  phonetic?: string;

  /** Path or URL to audio pronunciation file (optional) */
  audioUrl?: string;

  /** Path or URL to associated image (optional) */
  imageUrl?: string;

  /** Category for grouping (default: 'general') */
  category?: string;

  /** CEFR proficiency level (default: user's current level) */
  cefrLevel?: CEFRLevel;

  /** Grammatical part of speech (default: 'other') */
  partOfSpeech?: PartOfSpeech;

  /** Source of word addition (required) */
  source: WordSource;

  /** Tags for milestone/goal association (optional) */
  milestoneTags?: string[];

  /** Example sentences demonstrating usage (optional) */
  exampleSentences?: string[];
}

/**
 * Input type for updating an existing word
 *
 * All fields are optional - only provided fields will be updated
 * Learning state fields should typically not be updated directly
 */
export interface UpdateWordInput {
  /** Target language word */
  word?: string;

  /** Native language translation */
  translation?: string;

  /** IPA pronunciation guide */
  phonetic?: string;

  /** Path or URL to audio pronunciation file */
  audioUrl?: string;

  /** Path or URL to associated image */
  imageUrl?: string;

  /** Category for grouping */
  category?: string;

  /** CEFR proficiency level */
  cefrLevel?: CEFRLevel;

  /** Grammatical part of speech */
  partOfSpeech?: PartOfSpeech;

  /** Learning mastery score (0-100) */
  masteryScore?: number;

  /** Calculated priority for review (0-10) */
  priority?: number;

  /** SM-2 ease factor */
  easeFactor?: number;

  /** Days until next review */
  interval?: number;

  /** Consecutive correct answers */
  repetitions?: number;

  /** ISO date string for next scheduled review */
  nextReviewDate?: string;

  /** ISO date string of last review */
  lastReviewDate?: string;

  /** Total number of correct answers */
  timesCorrect?: number;

  /** Total number of incorrect answers */
  timesIncorrect?: number;

  /** Array of error types encountered */
  errorTypes?: ErrorType[];

  /** Source of word addition */
  source?: WordSource;

  /** Tags for milestone/goal association */
  milestoneTags?: string[];

  /** Example sentences demonstrating usage */
  exampleSentences?: string[];
}

/**
 * Filter options for querying words from the bank
 *
 * All fields are optional - combine multiple filters for refined queries
 */
export interface WordFilter {
  /** Filter by category */
  category?: string;

  /** Filter by CEFR level */
  cefrLevel?: CEFRLevel;

  /** Filter by source */
  source?: WordSource;

  /** Filter by minimum priority (inclusive) */
  minPriority?: number;

  /** Filter by maximum priority (inclusive) */
  maxPriority?: number;

  /** Filter words that need review (nextReviewDate <= now) */
  needsReview?: boolean;

  /** Search query for word or translation (case-insensitive) */
  searchQuery?: string;

  /** Limit number of results (pagination) */
  limit?: number;

  /** Offset for pagination */
  offset?: number;
}

// ============================================================================
// Statistics and Analytics
// ============================================================================

/**
 * Aggregate statistics for the entire word bank
 *
 * Provides overview of learning progress and distribution
 */
export interface WordBankStats {
  /** Total number of words in the bank */
  totalWords: number;

  /** Word count breakdown by CEFR level */
  wordsByLevel: Record<CEFRLevel, number>;

  /** Word count breakdown by category */
  wordsByCategory: Record<string, number>;

  /** Number of words needing review (nextReviewDate <= now) */
  wordsNeedingReview: number;

  /** Average mastery score across all words (0-100) */
  averageMastery: number;

  /** Number of words with high mastery (> 70) */
  strongWords: number;

  /** Number of words with low mastery (< 30) */
  weakWords: number;
}

// ============================================================================
// Review Session Types
// ============================================================================

/**
 * Result of a single word review
 *
 * Used to update SM-2 state after user practice
 */
export interface ReviewResult {
  /** ID of the reviewed word */
  wordId: string;

  /** User's performance quality (0-5, SM-2 scale) */
  quality: number;

  /** Whether the answer was correct */
  correct: boolean;

  /** Type of error if incorrect (optional) */
  errorType?: ErrorType;

  /** ISO date string of review */
  reviewedAt: string;
}

/**
 * Configuration for a review session
 */
export interface ReviewSessionConfig {
  /** Maximum number of words to review */
  maxWords: number;

  /** Include only words with priority above this threshold */
  minPriority?: number;

  /** Filter by specific CEFR level */
  cefrLevel?: CEFRLevel;

  /** Filter by specific category */
  category?: string;

  /** Include only words needing review (due for spaced repetition) */
  onlyDueWords?: boolean;
}

/**
 * A review session with selected words
 */
export interface ReviewSession {
  /** Unique session identifier */
  id: string;

  /** Words selected for this session */
  words: BankWord[];

  /** Configuration used to create session */
  config: ReviewSessionConfig;

  /** ISO date string when session was created */
  createdAt: string;

  /** ISO date string when session was completed (optional) */
  completedAt?: string;

  /** Results from completed reviews */
  results: ReviewResult[];
}

// ============================================================================
// Bulk Operations
// ============================================================================

/**
 * Result of a bulk import operation
 */
export interface BulkImportResult {
  /** Number of words successfully imported */
  successCount: number;

  /** Number of words that failed to import */
  failureCount: number;

  /** IDs of successfully imported words */
  importedIds: string[];

  /** Details of any errors that occurred */
  errors: Array<{
    index: number;
    word: string;
    error: string;
  }>;
}

/**
 * Options for bulk export
 */
export interface ExportOptions {
  /** Export format */
  format: 'json' | 'csv';

  /** Include learning state (mastery, intervals, etc.) */
  includeLearningState?: boolean;

  /** Filter to apply before export */
  filter?: WordFilter;
}

// ============================================================================
// Database Types
// ============================================================================

/**
 * Raw database row structure
 *
 * Used for SQLite storage - arrays and objects stored as JSON strings
 */
export interface BankWordRow {
  id: string;
  word: string;
  translation: string;
  phonetic: string | null;
  audioUrl: string | null;
  imageUrl: string | null;
  category: string;
  cefrLevel: CEFRLevel;
  partOfSpeech: PartOfSpeech;
  masteryScore: number;
  priority: number;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
  lastReviewDate: string | null;
  timesCorrect: number;
  timesIncorrect: number;
  errorTypes: string; // JSON array
  source: WordSource;
  milestoneTags: string; // JSON array
  exampleSentences: string; // JSON array
  addedAt: string;
  updatedAt: string;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Type for sorting word queries
 */
export type WordSortField =
  | 'word'
  | 'addedAt'
  | 'priority'
  | 'masteryScore'
  | 'nextReviewDate';

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort configuration
 */
export interface SortConfig {
  field: WordSortField;
  direction: SortDirection;
}
