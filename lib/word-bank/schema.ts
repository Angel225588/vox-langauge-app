/**
 * Word Bank Schema Definitions
 *
 * SQLite schema for the Word Bank system - offline-first vocabulary storage
 * with spaced repetition (SM-2 algorithm) support.
 */

import * as SQLite from 'expo-sqlite';

// ============================================================================
// CONSTANTS - Column Names (Type-Safe References)
// ============================================================================

export const WORD_BANK_TABLE = 'word_bank';

export const WordBankColumns = {
  // Primary Key
  ID: 'id',

  // Core Word Data
  WORD: 'word',
  TRANSLATION: 'translation',
  PHONETIC: 'phonetic',
  AUDIO_URL: 'audio_url',
  IMAGE_URL: 'image_url',

  // Categorization
  CATEGORY: 'category',
  CEFR_LEVEL: 'cefr_level',
  PART_OF_SPEECH: 'part_of_speech',

  // Learning State (SM-2 Algorithm)
  MASTERY_SCORE: 'mastery_score',
  PRIORITY: 'priority',
  EASE_FACTOR: 'ease_factor',
  INTERVAL: 'interval',
  REPETITIONS: 'repetitions',
  NEXT_REVIEW_DATE: 'next_review_date',
  LAST_REVIEW_DATE: 'last_review_date',

  // History
  TIMES_CORRECT: 'times_correct',
  TIMES_INCORRECT: 'times_incorrect',
  ERROR_TYPES: 'error_types', // JSON array

  // Source & Context
  SOURCE: 'source',
  MILESTONE_TAGS: 'milestone_tags', // JSON array
  EXAMPLE_SENTENCES: 'example_sentences', // JSON array

  // Timestamps
  ADDED_AT: 'added_at',
  UPDATED_AT: 'updated_at',
} as const;

// ============================================================================
// SQL STATEMENTS
// ============================================================================

/**
 * Main word_bank table creation SQL
 */
export const CREATE_WORD_BANK_TABLE = `
  CREATE TABLE IF NOT EXISTS ${WORD_BANK_TABLE} (
    ${WordBankColumns.ID} TEXT PRIMARY KEY,
    ${WordBankColumns.WORD} TEXT NOT NULL,
    ${WordBankColumns.TRANSLATION} TEXT NOT NULL,
    ${WordBankColumns.PHONETIC} TEXT,
    ${WordBankColumns.AUDIO_URL} TEXT,
    ${WordBankColumns.IMAGE_URL} TEXT,

    -- Categorization
    ${WordBankColumns.CATEGORY} TEXT NOT NULL DEFAULT 'general',
    ${WordBankColumns.CEFR_LEVEL} TEXT NOT NULL DEFAULT 'A1',
    ${WordBankColumns.PART_OF_SPEECH} TEXT DEFAULT 'other',

    -- Learning State (SM-2)
    ${WordBankColumns.MASTERY_SCORE} REAL DEFAULT 0,
    ${WordBankColumns.PRIORITY} REAL DEFAULT 5,
    ${WordBankColumns.EASE_FACTOR} REAL DEFAULT 2.5,
    ${WordBankColumns.INTERVAL} INTEGER DEFAULT 0,
    ${WordBankColumns.REPETITIONS} INTEGER DEFAULT 0,
    ${WordBankColumns.NEXT_REVIEW_DATE} TEXT,
    ${WordBankColumns.LAST_REVIEW_DATE} TEXT,

    -- History
    ${WordBankColumns.TIMES_CORRECT} INTEGER DEFAULT 0,
    ${WordBankColumns.TIMES_INCORRECT} INTEGER DEFAULT 0,
    ${WordBankColumns.ERROR_TYPES} TEXT,

    -- Source & Context
    ${WordBankColumns.SOURCE} TEXT NOT NULL DEFAULT 'manual',
    ${WordBankColumns.MILESTONE_TAGS} TEXT,
    ${WordBankColumns.EXAMPLE_SENTENCES} TEXT,

    -- Timestamps
    ${WordBankColumns.ADDED_AT} TEXT NOT NULL,
    ${WordBankColumns.UPDATED_AT} TEXT NOT NULL
  );
`;

/**
 * Performance indexes for common queries
 */
export const CREATE_INDEXES = [
  // Priority-based queries (high priority words first)
  `CREATE INDEX IF NOT EXISTS idx_word_bank_priority
   ON ${WORD_BANK_TABLE}(${WordBankColumns.PRIORITY} DESC);`,

  // Spaced repetition queries (find due cards)
  `CREATE INDEX IF NOT EXISTS idx_word_bank_next_review
   ON ${WORD_BANK_TABLE}(${WordBankColumns.NEXT_REVIEW_DATE});`,

  // Category filtering
  `CREATE INDEX IF NOT EXISTS idx_word_bank_category
   ON ${WORD_BANK_TABLE}(${WordBankColumns.CATEGORY});`,

  // CEFR level filtering
  `CREATE INDEX IF NOT EXISTS idx_word_bank_cefr
   ON ${WORD_BANK_TABLE}(${WordBankColumns.CEFR_LEVEL});`,

  // Source tracking
  `CREATE INDEX IF NOT EXISTS idx_word_bank_source
   ON ${WORD_BANK_TABLE}(${WordBankColumns.SOURCE});`,

  // Mastery-based queries
  `CREATE INDEX IF NOT EXISTS idx_word_bank_mastery
   ON ${WORD_BANK_TABLE}(${WordBankColumns.MASTERY_SCORE});`,
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if word_bank table exists
 */
export async function tableExists(db: SQLite.SQLiteDatabase): Promise<boolean> {
  try {
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count
       FROM sqlite_master
       WHERE type='table' AND name=?;`,
      [WORD_BANK_TABLE]
    );

    return (result?.count ?? 0) > 0;
  } catch (error) {
    console.error('Error checking if word_bank table exists:', error);
    return false;
  }
}

/**
 * Get table row count
 */
export async function getRowCount(db: SQLite.SQLiteDatabase): Promise<number> {
  try {
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM ${WORD_BANK_TABLE};`
    );
    return result?.count ?? 0;
  } catch (error) {
    console.error('Error getting word_bank row count:', error);
    return 0;
  }
}

/**
 * Initialize word_bank table and indexes
 * This is idempotent - safe to call multiple times
 */
export async function initializeWordBankTable(
  db: SQLite.SQLiteDatabase
): Promise<void> {
  try {
    console.log('Initializing word_bank table...');

    // Create table
    await db.execAsync(CREATE_WORD_BANK_TABLE);
    console.log('  Table created successfully');

    // Create all indexes
    for (const indexSQL of CREATE_INDEXES) {
      await db.execAsync(indexSQL);
    }
    console.log(`  ${CREATE_INDEXES.length} indexes created successfully`);

    // Verify table exists
    const exists = await tableExists(db);
    if (!exists) {
      throw new Error('Table creation verification failed');
    }

    const count = await getRowCount(db);
    console.log(`Word bank initialized successfully (${count} words)`);
  } catch (error) {
    console.error('Failed to initialize word_bank table:', error);
    throw error;
  }
}

/**
 * Drop word_bank table (for testing/development only)
 * WARNING: This deletes all data!
 */
export async function dropWordBankTable(
  db: SQLite.SQLiteDatabase
): Promise<void> {
  try {
    console.warn('Dropping word_bank table - ALL DATA WILL BE LOST');
    await db.execAsync(`DROP TABLE IF EXISTS ${WORD_BANK_TABLE};`);
    console.log('Table dropped successfully');
  } catch (error) {
    console.error('Failed to drop word_bank table:', error);
    throw error;
  }
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Word Bank Entry - TypeScript interface matching the schema
 */
export interface WordBankEntry {
  // Primary Key
  id: string;

  // Core Word Data
  word: string;
  translation: string;
  phonetic?: string | null;
  audio_url?: string | null;
  image_url?: string | null;

  // Categorization
  category: string;
  cefr_level: string;
  part_of_speech?: string | null;

  // Learning State (SM-2)
  mastery_score: number;
  priority: number;
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review_date?: string | null;
  last_review_date?: string | null;

  // History
  times_correct: number;
  times_incorrect: number;
  error_types?: string | null; // JSON string of array

  // Source & Context
  source: string;
  milestone_tags?: string | null; // JSON string of array
  example_sentences?: string | null; // JSON string of array

  // Timestamps
  added_at: string;
  updated_at: string;
}

/**
 * Partial entry for inserts (without defaults)
 */
export type WordBankInsert = Omit<
  WordBankEntry,
  | 'mastery_score'
  | 'priority'
  | 'ease_factor'
  | 'interval'
  | 'repetitions'
  | 'times_correct'
  | 'times_incorrect'
> &
  Partial<
    Pick<
      WordBankEntry,
      | 'mastery_score'
      | 'priority'
      | 'ease_factor'
      | 'interval'
      | 'repetitions'
      | 'times_correct'
      | 'times_incorrect'
    >
  >;

/**
 * Error types for tracking common mistakes
 */
export enum WordErrorType {
  PRONUNCIATION = 'pronunciation',
  SPELLING = 'spelling',
  MEANING = 'meaning',
  USAGE = 'usage',
  LISTENING = 'listening',
}

/**
 * CEFR Levels (Common European Framework of Reference for Languages)
 */
export enum CEFRLevel {
  A1 = 'A1', // Beginner
  A2 = 'A2', // Elementary
  B1 = 'B1', // Intermediate
  B2 = 'B2', // Upper Intermediate
  C1 = 'C1', // Advanced
  C2 = 'C2', // Proficient
}

/**
 * Part of Speech categories
 */
export enum PartOfSpeech {
  NOUN = 'noun',
  VERB = 'verb',
  ADJECTIVE = 'adjective',
  ADVERB = 'adverb',
  PRONOUN = 'pronoun',
  PREPOSITION = 'preposition',
  CONJUNCTION = 'conjunction',
  INTERJECTION = 'interjection',
  PHRASE = 'phrase',
  OTHER = 'other',
}

/**
 * Word sources - how the word was added
 */
export enum WordSource {
  MANUAL = 'manual', // User manually added
  LESSON = 'lesson', // From a lesson
  MILESTONE = 'milestone', // From completing a milestone
  AI_GENERATED = 'ai_generated', // AI suggested word
  IMPORT = 'import', // Bulk import
}
