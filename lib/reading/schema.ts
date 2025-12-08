/**
 * Reading Sessions Schema Definitions
 *
 * SQLite schema for the Reading/Teleprompter system - offline-first
 * reading practice storage with analysis and feedback.
 */

import * as SQLite from 'expo-sqlite';

// ============================================================================
// CONSTANTS - Column Names (Type-Safe References)
// ============================================================================

export const READING_SESSIONS_TABLE = 'reading_sessions';

export const ReadingSessionColumns = {
  // Primary Key
  ID: 'id',

  // User & Timestamps
  USER_ID: 'user_id',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',

  // Content Information
  SOURCE_TYPE: 'source_type',
  SOURCE_ID: 'source_id',
  TEXT: 'text',
  TITLE: 'title',
  DIFFICULTY: 'difficulty',

  // Recording Data
  RECORDING_URI: 'recording_uri',
  RECORDING_DURATION_MS: 'recording_duration_ms',

  // Analysis Results
  TRANSCRIPTION: 'transcription',
  WORDS_EXPECTED: 'words_expected',
  WORDS_SPOKEN: 'words_spoken',
  ARTICULATION_SCORE: 'articulation_score',
  FLUENCY_SCORE: 'fluency_score',
  OVERALL_SCORE: 'overall_score',

  // Problem Words & Feedback (JSON)
  PROBLEM_WORDS: 'problem_words', // JSON array
  FEEDBACK: 'feedback', // JSON object

  // User Controls
  IS_PUBLIC: 'is_public',
  IS_DELETED: 'is_deleted',
} as const;

// ============================================================================
// SQL STATEMENTS
// ============================================================================

/**
 * Main reading_sessions table creation SQL
 */
export const CREATE_READING_SESSIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS ${READING_SESSIONS_TABLE} (
    ${ReadingSessionColumns.ID} TEXT PRIMARY KEY,
    ${ReadingSessionColumns.USER_ID} TEXT NOT NULL,
    ${ReadingSessionColumns.CREATED_AT} TEXT NOT NULL,
    ${ReadingSessionColumns.UPDATED_AT} TEXT NOT NULL,

    -- Content Information
    ${ReadingSessionColumns.SOURCE_TYPE} TEXT NOT NULL,
    ${ReadingSessionColumns.SOURCE_ID} TEXT,
    ${ReadingSessionColumns.TEXT} TEXT NOT NULL,
    ${ReadingSessionColumns.TITLE} TEXT,
    ${ReadingSessionColumns.DIFFICULTY} TEXT NOT NULL,

    -- Recording Data
    ${ReadingSessionColumns.RECORDING_URI} TEXT,
    ${ReadingSessionColumns.RECORDING_DURATION_MS} INTEGER DEFAULT 0,

    -- Analysis Results
    ${ReadingSessionColumns.TRANSCRIPTION} TEXT,
    ${ReadingSessionColumns.WORDS_EXPECTED} INTEGER DEFAULT 0,
    ${ReadingSessionColumns.WORDS_SPOKEN} INTEGER DEFAULT 0,
    ${ReadingSessionColumns.ARTICULATION_SCORE} REAL DEFAULT 0,
    ${ReadingSessionColumns.FLUENCY_SCORE} REAL DEFAULT 0,
    ${ReadingSessionColumns.OVERALL_SCORE} REAL DEFAULT 0,

    -- Problem Words & Feedback (stored as JSON)
    ${ReadingSessionColumns.PROBLEM_WORDS} TEXT DEFAULT '[]',
    ${ReadingSessionColumns.FEEDBACK} TEXT,

    -- User Controls
    ${ReadingSessionColumns.IS_PUBLIC} INTEGER DEFAULT 0,
    ${ReadingSessionColumns.IS_DELETED} INTEGER DEFAULT 0
  );
`;

/**
 * Performance indexes for common queries
 */
export const CREATE_INDEXES = [
  // User-based queries (get all sessions for a user)
  `CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_id
   ON ${READING_SESSIONS_TABLE}(${ReadingSessionColumns.USER_ID});`,

  // Date-based queries (recent sessions, date ranges)
  `CREATE INDEX IF NOT EXISTS idx_reading_sessions_created_at
   ON ${READING_SESSIONS_TABLE}(${ReadingSessionColumns.CREATED_AT} DESC);`,

  // Source type filtering
  `CREATE INDEX IF NOT EXISTS idx_reading_sessions_source_type
   ON ${READING_SESSIONS_TABLE}(${ReadingSessionColumns.SOURCE_TYPE});`,

  // Difficulty filtering
  `CREATE INDEX IF NOT EXISTS idx_reading_sessions_difficulty
   ON ${READING_SESSIONS_TABLE}(${ReadingSessionColumns.DIFFICULTY});`,

  // Score-based queries (high scores, progress tracking)
  `CREATE INDEX IF NOT EXISTS idx_reading_sessions_overall_score
   ON ${READING_SESSIONS_TABLE}(${ReadingSessionColumns.OVERALL_SCORE});`,

  // Composite index for user + date queries (most common)
  `CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_date
   ON ${READING_SESSIONS_TABLE}(${ReadingSessionColumns.USER_ID}, ${ReadingSessionColumns.CREATED_AT} DESC);`,

  // Exclude deleted sessions efficiently
  `CREATE INDEX IF NOT EXISTS idx_reading_sessions_deleted
   ON ${READING_SESSIONS_TABLE}(${ReadingSessionColumns.IS_DELETED});`,
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if reading_sessions table exists
 */
export async function tableExists(db: SQLite.SQLiteDatabase): Promise<boolean> {
  try {
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count
       FROM sqlite_master
       WHERE type='table' AND name=?;`,
      [READING_SESSIONS_TABLE]
    );

    return (result?.count ?? 0) > 0;
  } catch (error) {
    console.error('Error checking if reading_sessions table exists:', error);
    return false;
  }
}

/**
 * Get table row count
 */
export async function getRowCount(db: SQLite.SQLiteDatabase): Promise<number> {
  try {
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM ${READING_SESSIONS_TABLE};`
    );
    return result?.count ?? 0;
  } catch (error) {
    console.error('Error getting reading_sessions row count:', error);
    return 0;
  }
}

/**
 * Get count excluding deleted sessions
 */
export async function getActiveRowCount(db: SQLite.SQLiteDatabase): Promise<number> {
  try {
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count
       FROM ${READING_SESSIONS_TABLE}
       WHERE ${ReadingSessionColumns.IS_DELETED} = 0;`
    );
    return result?.count ?? 0;
  } catch (error) {
    console.error('Error getting active reading_sessions count:', error);
    return 0;
  }
}

/**
 * Initialize reading_sessions table and indexes
 * This is idempotent - safe to call multiple times
 */
export async function initializeReadingSessionsTable(
  db: SQLite.SQLiteDatabase
): Promise<void> {
  try {
    console.log('Initializing reading_sessions table...');

    // Create table
    await db.execAsync(CREATE_READING_SESSIONS_TABLE);
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

    const count = await getActiveRowCount(db);
    console.log(`Reading sessions table initialized successfully (${count} active sessions)`);
  } catch (error) {
    console.error('Failed to initialize reading_sessions table:', error);
    throw error;
  }
}

/**
 * Drop reading_sessions table (for testing/development only)
 * WARNING: This deletes all data!
 */
export async function dropReadingSessionsTable(
  db: SQLite.SQLiteDatabase
): Promise<void> {
  try {
    console.warn('Dropping reading_sessions table - ALL DATA WILL BE LOST');
    await db.execAsync(`DROP TABLE IF EXISTS ${READING_SESSIONS_TABLE};`);
    console.log('Table dropped successfully');
  } catch (error) {
    console.error('Failed to drop reading_sessions table:', error);
    throw error;
  }
}

/**
 * Clear all sessions (soft delete)
 * Marks all sessions as deleted instead of removing them
 */
export async function softDeleteAllSessions(
  db: SQLite.SQLiteDatabase,
  userId?: string
): Promise<number> {
  try {
    let query = `UPDATE ${READING_SESSIONS_TABLE}
                 SET ${ReadingSessionColumns.IS_DELETED} = 1,
                     ${ReadingSessionColumns.UPDATED_AT} = ?`;
    const params: any[] = [new Date().toISOString()];

    if (userId) {
      query += ` WHERE ${ReadingSessionColumns.USER_ID} = ?`;
      params.push(userId);
    }

    const result = await db.runAsync(query, params);
    const deletedCount = result.changes ?? 0;
    console.log(`Soft deleted ${deletedCount} sessions`);
    return deletedCount;
  } catch (error) {
    console.error('Failed to soft delete sessions:', error);
    throw error;
  }
}

/**
 * Permanently delete all soft-deleted sessions older than specified days
 * Use for data cleanup/maintenance
 */
export async function permanentlyDeleteOldSessions(
  db: SQLite.SQLiteDatabase,
  daysOld: number = 30
): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffISO = cutoffDate.toISOString();

    const result = await db.runAsync(
      `DELETE FROM ${READING_SESSIONS_TABLE}
       WHERE ${ReadingSessionColumns.IS_DELETED} = 1
       AND ${ReadingSessionColumns.UPDATED_AT} < ?;`,
      [cutoffISO]
    );

    const deletedCount = result.changes ?? 0;
    console.log(`Permanently deleted ${deletedCount} old sessions`);
    return deletedCount;
  } catch (error) {
    console.error('Failed to permanently delete old sessions:', error);
    throw error;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate word count from text
 */
export function calculateWordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Estimate reading duration based on word count
 * Assumes average reading speed of ~150 words per minute
 */
export function estimateReadingDuration(wordCount: number): number {
  const WORDS_PER_MINUTE = 150;
  return Math.ceil((wordCount / WORDS_PER_MINUTE) * 60); // Returns seconds
}

/**
 * Calculate overall score from articulation and fluency
 * Weighted average: 60% articulation, 40% fluency
 */
export function calculateOverallScore(
  articulationScore: number,
  fluencyScore: number
): number {
  return Math.round(articulationScore * 0.6 + fluencyScore * 0.4);
}

/**
 * Validate score is within 0-100 range
 */
export function validateScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}
