/**
 * Reading Sessions Storage Operations
 *
 * SQLite CRUD operations for the Reading/Teleprompter system.
 * Offline-first with full analysis and feedback support.
 */

import * as SQLite from 'expo-sqlite';
import { dbManager } from '../db/database';
import {
  READING_SESSIONS_TABLE,
  ReadingSessionColumns,
  calculateWordCount,
  calculateOverallScore,
  validateScore,
} from './schema';
import {
  ReadingSession,
  CreateSessionInput,
  UpdateSessionInput,
  SessionFilter,
  ReadingStats,
  ProblemWord,
  ReadingFeedback,
  SourceType,
  ReadingDifficulty,
} from './types';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a unique ID for new sessions
 */
function generateId(): string {
  return `reading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get current ISO date string
 */
function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Convert database row to ReadingSession object
 */
function rowToSession(row: any): ReadingSession {
  return {
    id: row.id,
    userId: row.user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sourceType: row.source_type as SourceType,
    sourceId: row.source_id || undefined,
    text: row.text,
    title: row.title || undefined,
    difficulty: row.difficulty as ReadingDifficulty,
    recordingUri: row.recording_uri || undefined,
    recordingDurationMs: row.recording_duration_ms || 0,
    transcription: row.transcription || undefined,
    wordsExpected: row.words_expected || 0,
    wordsSpoken: row.words_spoken || 0,
    articulationScore: row.articulation_score || 0,
    fluencyScore: row.fluency_score || 0,
    overallScore: row.overall_score || 0,
    problemWords: row.problem_words ? JSON.parse(row.problem_words) : [],
    isPublic: row.is_public === 1,
    isDeleted: row.is_deleted === 1,
    feedback: row.feedback ? JSON.parse(row.feedback) : undefined,
  };
}

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Create a new reading session
 */
export async function createSession(
  input: CreateSessionInput
): Promise<ReadingSession> {
  const db = await dbManager.getDatabase();
  const now = nowISO();
  const id = generateId();

  // Calculate word count from text
  const wordsExpected = calculateWordCount(input.text);

  const session: ReadingSession = {
    id,
    userId: input.userId,
    createdAt: now,
    updatedAt: now,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    text: input.text,
    title: input.title,
    difficulty: input.difficulty,
    recordingUri: input.recordingUri,
    recordingDurationMs: input.recordingDurationMs || 0,
    transcription: undefined,
    wordsExpected,
    wordsSpoken: 0,
    articulationScore: 0,
    fluencyScore: 0,
    overallScore: 0,
    problemWords: [],
    isPublic: input.isPublic || false,
    isDeleted: false,
    feedback: undefined,
  };

  await db.runAsync(
    `INSERT INTO ${READING_SESSIONS_TABLE} (
      ${ReadingSessionColumns.ID},
      ${ReadingSessionColumns.USER_ID},
      ${ReadingSessionColumns.CREATED_AT},
      ${ReadingSessionColumns.UPDATED_AT},
      ${ReadingSessionColumns.SOURCE_TYPE},
      ${ReadingSessionColumns.SOURCE_ID},
      ${ReadingSessionColumns.TEXT},
      ${ReadingSessionColumns.TITLE},
      ${ReadingSessionColumns.DIFFICULTY},
      ${ReadingSessionColumns.RECORDING_URI},
      ${ReadingSessionColumns.RECORDING_DURATION_MS},
      ${ReadingSessionColumns.TRANSCRIPTION},
      ${ReadingSessionColumns.WORDS_EXPECTED},
      ${ReadingSessionColumns.WORDS_SPOKEN},
      ${ReadingSessionColumns.ARTICULATION_SCORE},
      ${ReadingSessionColumns.FLUENCY_SCORE},
      ${ReadingSessionColumns.OVERALL_SCORE},
      ${ReadingSessionColumns.PROBLEM_WORDS},
      ${ReadingSessionColumns.FEEDBACK},
      ${ReadingSessionColumns.IS_PUBLIC},
      ${ReadingSessionColumns.IS_DELETED}
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      session.id,
      session.userId,
      session.createdAt,
      session.updatedAt,
      session.sourceType,
      session.sourceId || null,
      session.text,
      session.title || null,
      session.difficulty,
      session.recordingUri || null,
      session.recordingDurationMs,
      session.transcription || null,
      session.wordsExpected,
      session.wordsSpoken,
      session.articulationScore,
      session.fluencyScore,
      session.overallScore,
      JSON.stringify(session.problemWords),
      session.feedback ? JSON.stringify(session.feedback) : null,
      session.isPublic ? 1 : 0,
      session.isDeleted ? 1 : 0,
    ]
  );

  console.log(`Created reading session: "${session.title || session.id}"`);
  return session;
}

/**
 * Get a single session by ID
 */
export async function getSession(id: string): Promise<ReadingSession | null> {
  const db = await dbManager.getDatabase();

  const row = await db.getFirstAsync(
    `SELECT * FROM ${READING_SESSIONS_TABLE}
     WHERE ${ReadingSessionColumns.ID} = ?`,
    [id]
  );

  if (!row) return null;
  return rowToSession(row);
}

/**
 * Update an existing session
 */
export async function updateSession(
  id: string,
  input: UpdateSessionInput
): Promise<ReadingSession | null> {
  const db = await dbManager.getDatabase();
  const now = nowISO();

  // Build dynamic update query
  const updates: string[] = [];
  const values: any[] = [];

  if (input.title !== undefined) {
    updates.push(`${ReadingSessionColumns.TITLE} = ?`);
    values.push(input.title);
  }
  if (input.difficulty !== undefined) {
    updates.push(`${ReadingSessionColumns.DIFFICULTY} = ?`);
    values.push(input.difficulty);
  }
  if (input.recordingUri !== undefined) {
    updates.push(`${ReadingSessionColumns.RECORDING_URI} = ?`);
    values.push(input.recordingUri);
  }
  if (input.recordingDurationMs !== undefined) {
    updates.push(`${ReadingSessionColumns.RECORDING_DURATION_MS} = ?`);
    values.push(input.recordingDurationMs);
  }
  if (input.transcription !== undefined) {
    updates.push(`${ReadingSessionColumns.TRANSCRIPTION} = ?`);
    values.push(input.transcription);
  }
  if (input.wordsSpoken !== undefined) {
    updates.push(`${ReadingSessionColumns.WORDS_SPOKEN} = ?`);
    values.push(input.wordsSpoken);
  }
  if (input.articulationScore !== undefined) {
    updates.push(`${ReadingSessionColumns.ARTICULATION_SCORE} = ?`);
    values.push(validateScore(input.articulationScore));
  }
  if (input.fluencyScore !== undefined) {
    updates.push(`${ReadingSessionColumns.FLUENCY_SCORE} = ?`);
    values.push(validateScore(input.fluencyScore));
  }
  if (input.overallScore !== undefined) {
    updates.push(`${ReadingSessionColumns.OVERALL_SCORE} = ?`);
    values.push(validateScore(input.overallScore));
  }
  if (input.problemWords !== undefined) {
    updates.push(`${ReadingSessionColumns.PROBLEM_WORDS} = ?`);
    values.push(JSON.stringify(input.problemWords));
  }
  if (input.feedback !== undefined) {
    updates.push(`${ReadingSessionColumns.FEEDBACK} = ?`);
    values.push(JSON.stringify(input.feedback));
  }
  if (input.isPublic !== undefined) {
    updates.push(`${ReadingSessionColumns.IS_PUBLIC} = ?`);
    values.push(input.isPublic ? 1 : 0);
  }
  if (input.isDeleted !== undefined) {
    updates.push(`${ReadingSessionColumns.IS_DELETED} = ?`);
    values.push(input.isDeleted ? 1 : 0);
  }

  // Always update timestamp
  updates.push(`${ReadingSessionColumns.UPDATED_AT} = ?`);
  values.push(now);

  if (updates.length === 1) {
    // Only updated_at, nothing else
    return getSession(id);
  }

  values.push(id);

  await db.runAsync(
    `UPDATE ${READING_SESSIONS_TABLE}
     SET ${updates.join(', ')}
     WHERE ${ReadingSessionColumns.ID} = ?`,
    values
  );

  return getSession(id);
}

/**
 * Delete a session (soft delete by default)
 */
export async function deleteSession(
  id: string,
  permanent: boolean = false
): Promise<boolean> {
  const db = await dbManager.getDatabase();

  if (permanent) {
    // Permanently delete from database
    const result = await db.runAsync(
      `DELETE FROM ${READING_SESSIONS_TABLE}
       WHERE ${ReadingSessionColumns.ID} = ?`,
      [id]
    );
    const deleted = (result.changes ?? 0) > 0;
    if (deleted) {
      console.log(`Permanently deleted session: ${id}`);
    }
    return deleted;
  } else {
    // Soft delete (mark as deleted)
    const updated = await updateSession(id, { isDeleted: true });
    if (updated) {
      console.log(`Soft deleted session: ${id}`);
      return true;
    }
    return false;
  }
}

/**
 * Restore a soft-deleted session
 */
export async function restoreSession(id: string): Promise<ReadingSession | null> {
  return updateSession(id, { isDeleted: false });
}

// ============================================================================
// QUERY OPERATIONS
// ============================================================================

/**
 * Get sessions with optional filtering
 */
export async function getSessions(
  filter?: SessionFilter
): Promise<ReadingSession[]> {
  const db = await dbManager.getDatabase();

  let query = `SELECT * FROM ${READING_SESSIONS_TABLE}`;
  const conditions: string[] = [];
  const values: any[] = [];

  // Apply filters
  if (filter) {
    if (filter.userId) {
      conditions.push(`${ReadingSessionColumns.USER_ID} = ?`);
      values.push(filter.userId);
    }
    if (filter.sourceType) {
      conditions.push(`${ReadingSessionColumns.SOURCE_TYPE} = ?`);
      values.push(filter.sourceType);
    }
    if (filter.difficulty) {
      conditions.push(`${ReadingSessionColumns.DIFFICULTY} = ?`);
      values.push(filter.difficulty);
    }
    if (filter.minScore !== undefined) {
      conditions.push(`${ReadingSessionColumns.OVERALL_SCORE} >= ?`);
      values.push(filter.minScore);
    }
    if (filter.maxScore !== undefined) {
      conditions.push(`${ReadingSessionColumns.OVERALL_SCORE} <= ?`);
      values.push(filter.maxScore);
    }
    if (filter.onlyPublic) {
      conditions.push(`${ReadingSessionColumns.IS_PUBLIC} = 1`);
    }
    if (!filter.includeDeleted) {
      conditions.push(`${ReadingSessionColumns.IS_DELETED} = 0`);
    }
    if (filter.searchQuery) {
      conditions.push(
        `(${ReadingSessionColumns.TITLE} LIKE ? OR ${ReadingSessionColumns.TEXT} LIKE ?)`
      );
      const searchTerm = `%${filter.searchQuery}%`;
      values.push(searchTerm, searchTerm);
    }
    if (filter.dateFrom) {
      conditions.push(`${ReadingSessionColumns.CREATED_AT} >= ?`);
      values.push(filter.dateFrom);
    }
    if (filter.dateTo) {
      conditions.push(`${ReadingSessionColumns.CREATED_AT} <= ?`);
      values.push(filter.dateTo);
    }
  } else {
    // Default: exclude deleted
    conditions.push(`${ReadingSessionColumns.IS_DELETED} = 0`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  // Order by most recent first
  query += ` ORDER BY ${ReadingSessionColumns.CREATED_AT} DESC`;

  if (filter?.limit) {
    query += ` LIMIT ?`;
    values.push(filter.limit);
  }
  if (filter?.offset) {
    query += ` OFFSET ?`;
    values.push(filter.offset);
  }

  const rows = await db.getAllAsync(query, values);
  return rows.map(rowToSession);
}

/**
 * Get recent sessions (most recent first)
 */
export async function getRecentSessions(
  userId: string,
  limit: number = 10
): Promise<ReadingSession[]> {
  return getSessions({ userId, limit, includeDeleted: false });
}

/**
 * Get sessions by source type
 */
export async function getSessionsBySourceType(
  userId: string,
  sourceType: SourceType,
  limit?: number
): Promise<ReadingSession[]> {
  return getSessions({ userId, sourceType, limit, includeDeleted: false });
}

/**
 * Get sessions by difficulty
 */
export async function getSessionsByDifficulty(
  userId: string,
  difficulty: ReadingDifficulty,
  limit?: number
): Promise<ReadingSession[]> {
  return getSessions({ userId, difficulty, limit, includeDeleted: false });
}

/**
 * Search sessions by text or title
 */
export async function searchSessions(
  userId: string,
  query: string,
  limit: number = 50
): Promise<ReadingSession[]> {
  return getSessions({ userId, searchQuery: query, limit, includeDeleted: false });
}

// ============================================================================
// SESSION ANALYSIS OPERATIONS
// ============================================================================

/**
 * Add a problem word to a session
 */
export async function addProblemWordToSession(
  sessionId: string,
  problemWord: ProblemWord
): Promise<ReadingSession | null> {
  const session = await getSession(sessionId);
  if (!session) return null;

  const problemWords = [...session.problemWords, problemWord];
  return updateSession(sessionId, { problemWords });
}

/**
 * Update session scores
 */
export async function updateSessionScores(
  sessionId: string,
  scores: {
    articulationScore: number;
    fluencyScore: number;
    wordsSpoken?: number;
  }
): Promise<ReadingSession | null> {
  const overallScore = calculateOverallScore(
    scores.articulationScore,
    scores.fluencyScore
  );

  return updateSession(sessionId, {
    articulationScore: scores.articulationScore,
    fluencyScore: scores.fluencyScore,
    overallScore,
    wordsSpoken: scores.wordsSpoken,
  });
}

/**
 * Update session feedback
 */
export async function updateSessionFeedback(
  sessionId: string,
  feedback: ReadingFeedback
): Promise<ReadingSession | null> {
  return updateSession(sessionId, { feedback });
}

/**
 * Complete session analysis (update all analysis fields at once)
 */
export async function completeSessionAnalysis(
  sessionId: string,
  analysis: {
    transcription: string;
    wordsSpoken: number;
    articulationScore: number;
    fluencyScore: number;
    problemWords: ProblemWord[];
    feedback: ReadingFeedback;
  }
): Promise<ReadingSession | null> {
  const overallScore = calculateOverallScore(
    analysis.articulationScore,
    analysis.fluencyScore
  );

  return updateSession(sessionId, {
    transcription: analysis.transcription,
    wordsSpoken: analysis.wordsSpoken,
    articulationScore: analysis.articulationScore,
    fluencyScore: analysis.fluencyScore,
    overallScore,
    problemWords: analysis.problemWords,
    feedback: analysis.feedback,
  });
}

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Get aggregate statistics for user's reading sessions
 */
export async function getReadingStats(userId: string): Promise<ReadingStats> {
  const db = await dbManager.getDatabase();

  // Total sessions
  const totalResult = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM ${READING_SESSIONS_TABLE}
     WHERE ${ReadingSessionColumns.USER_ID} = ?
     AND ${ReadingSessionColumns.IS_DELETED} = 0`,
    [userId]
  );
  const totalSessions = totalResult?.count || 0;

  // Total reading time
  const timeResult = await db.getFirstAsync<{ total: number }>(
    `SELECT SUM(${ReadingSessionColumns.RECORDING_DURATION_MS}) as total
     FROM ${READING_SESSIONS_TABLE}
     WHERE ${ReadingSessionColumns.USER_ID} = ?
     AND ${ReadingSessionColumns.IS_DELETED} = 0`,
    [userId]
  );
  const totalReadingMinutes = Math.round((timeResult?.total || 0) / 60000);

  // Average scores
  const scoresResult = await db.getFirstAsync<{
    avgOverall: number;
    avgArticulation: number;
    avgFluency: number;
  }>(
    `SELECT
      AVG(${ReadingSessionColumns.OVERALL_SCORE}) as avgOverall,
      AVG(${ReadingSessionColumns.ARTICULATION_SCORE}) as avgArticulation,
      AVG(${ReadingSessionColumns.FLUENCY_SCORE}) as avgFluency
     FROM ${READING_SESSIONS_TABLE}
     WHERE ${ReadingSessionColumns.USER_ID} = ?
     AND ${ReadingSessionColumns.IS_DELETED} = 0
     AND ${ReadingSessionColumns.OVERALL_SCORE} > 0`,
    [userId]
  );

  const averageScore = Math.round(scoresResult?.avgOverall || 0);
  const averageArticulationScore = Math.round(scoresResult?.avgArticulation || 0);
  const averageFluencyScore = Math.round(scoresResult?.avgFluency || 0);

  // Sessions by difficulty
  const difficultyRows = await db.getAllAsync<{
    difficulty: ReadingDifficulty;
    count: number;
  }>(
    `SELECT ${ReadingSessionColumns.DIFFICULTY} as difficulty, COUNT(*) as count
     FROM ${READING_SESSIONS_TABLE}
     WHERE ${ReadingSessionColumns.USER_ID} = ?
     AND ${ReadingSessionColumns.IS_DELETED} = 0
     GROUP BY ${ReadingSessionColumns.DIFFICULTY}`,
    [userId]
  );

  const sessionsByDifficulty: Record<ReadingDifficulty, number> = {
    beginner: 0,
    intermediate: 0,
    advanced: 0,
  };
  difficultyRows.forEach((row) => {
    sessionsByDifficulty[row.difficulty] = row.count;
  });

  // Sessions by source type
  const sourceRows = await db.getAllAsync<{ source_type: SourceType; count: number }>(
    `SELECT ${ReadingSessionColumns.SOURCE_TYPE} as source_type, COUNT(*) as count
     FROM ${READING_SESSIONS_TABLE}
     WHERE ${ReadingSessionColumns.USER_ID} = ?
     AND ${ReadingSessionColumns.IS_DELETED} = 0
     GROUP BY ${ReadingSessionColumns.SOURCE_TYPE}`,
    [userId]
  );

  const sessionsBySource: Record<SourceType, number> = {
    ai_story: 0,
    user_story: 0,
    lesson: 0,
    imported: 0,
    curated: 0,
  };
  sourceRows.forEach((row) => {
    sessionsBySource[row.source_type] = row.count;
  });

  // Get recent score trend (last 10 sessions)
  const recentSessions = await getSessions({
    userId,
    limit: 10,
    includeDeleted: false,
  });
  const recentScoreTrend = recentSessions
    .reverse()
    .map((s) => s.overallScore)
    .filter((score) => score > 0);

  // Calculate streaks (simplified - would need date logic for real streaks)
  const longestStreak = 0; // TODO: Implement streak calculation
  const currentStreak = 0; // TODO: Implement streak calculation

  return {
    totalSessions,
    totalReadingMinutes,
    averageScore,
    averageArticulationScore,
    averageFluencyScore,
    sessionsByDifficulty,
    sessionsBySource,
    uniqueProblemWords: 0, // TODO: Implement problem words aggregation
    topProblemWords: [], // TODO: Implement problem words aggregation
    recentScoreTrend,
    longestStreak,
    currentStreak,
  };
}

/**
 * Get session count for user
 */
export async function getSessionCount(userId: string): Promise<number> {
  const db = await dbManager.getDatabase();
  const result = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM ${READING_SESSIONS_TABLE}
     WHERE ${ReadingSessionColumns.USER_ID} = ?
     AND ${ReadingSessionColumns.IS_DELETED} = 0`,
    [userId]
  );
  return result?.count || 0;
}

/**
 * Check if user has any sessions
 */
export async function hasAnySessions(userId: string): Promise<boolean> {
  const count = await getSessionCount(userId);
  return count > 0;
}
