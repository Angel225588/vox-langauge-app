/**
 * Flashcard Database Utilities
 *
 * Handles all flashcard-related database operations for SQLite (offline-first).
 * Data syncs to Supabase when online.
 */

import {
  Flashcard,
  UserFlashcardProgress,
  FlashcardWithProgress,
  ReviewQuality,
  FlashcardReview,
  ReviewSession,
} from '@/types/flashcard';
import { initializeSM2, calculateSM2, isDueForReview } from '@/lib/spaced-repetition/sm2';
import {
  initializeFSRS,
  reviewCard as fsrsReviewCard,
  type FSRSCardState,
} from '@/lib/spaced-repetition/fsrs';
import { dbManager } from './database';

/**
 * Initialize the flashcard database schema
 * Creates tables if they don't exist
 */
export async function initializeFlashcardDB(): Promise<void> {
  try {
    // Initialize database manager first (singleton pattern)
    await dbManager.initialize();
    const db = await dbManager.getDatabase();

    // Execute each statement separately for better error handling
    await db.execAsync(`
    -- Flashcards table
    CREATE TABLE IF NOT EXISTS flashcards (
      id TEXT PRIMARY KEY,
      word TEXT NOT NULL,
      translation TEXT NOT NULL,
      phonetic TEXT,
      image_url TEXT,
      audio_url TEXT,
      example_sentence TEXT,
      example_translation TEXT,
      category TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      target_language TEXT NOT NULL,
      native_language TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- User flashcard progress table (SM-2 data)
    CREATE TABLE IF NOT EXISTS user_flashcard_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      flashcard_id TEXT NOT NULL,
      ease_factor REAL NOT NULL DEFAULT 2.5,
      interval INTEGER NOT NULL DEFAULT 0,
      repetitions INTEGER NOT NULL DEFAULT 0,
      next_review TEXT NOT NULL,
      total_reviews INTEGER NOT NULL DEFAULT 0,
      correct_count INTEGER NOT NULL DEFAULT 0,
      incorrect_count INTEGER NOT NULL DEFAULT 0,
      last_reviewed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(user_id, flashcard_id),
      FOREIGN KEY (flashcard_id) REFERENCES flashcards(id)
    );

    -- Review sessions table
    CREATE TABLE IF NOT EXISTS review_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      flashcards_reviewed INTEGER NOT NULL DEFAULT 0,
      points_earned INTEGER NOT NULL DEFAULT 0,
      total_time_seconds INTEGER
    );

    -- Flashcard reviews table (individual review records)
    CREATE TABLE IF NOT EXISTS flashcard_reviews (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      flashcard_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      quality INTEGER NOT NULL,
      time_spent_seconds INTEGER NOT NULL,
      card_type TEXT NOT NULL,
      reviewed_at TEXT NOT NULL,
      FOREIGN KEY (session_id) REFERENCES review_sessions(id),
      FOREIGN KEY (flashcard_id) REFERENCES flashcards(id)
    );

    -- Indexes for better query performance
    CREATE INDEX IF NOT EXISTS idx_flashcard_category ON flashcards(category);
    CREATE INDEX IF NOT EXISTS idx_flashcard_difficulty ON flashcards(difficulty);
    CREATE INDEX IF NOT EXISTS idx_progress_user_id ON user_flashcard_progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_progress_next_review ON user_flashcard_progress(next_review);
    CREATE INDEX IF NOT EXISTS idx_reviews_session ON flashcard_reviews(session_id);
  `);

    // FSRS migration — add columns if they don't exist (safe to re-run)
    await addFSRSColumns(db);

    console.log('✅ Flashcard database initialized');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

/**
 * Add FSRS columns to user_flashcard_progress (idempotent).
 * Uses ALTER TABLE ADD COLUMN which is a no-op if column already exists in SQLite.
 */
async function addFSRSColumns(db: any): Promise<void> {
  const columns = [
    "algorithm TEXT NOT NULL DEFAULT 'fsrs'",
    'fsrs_stability REAL DEFAULT 0',
    'fsrs_difficulty REAL DEFAULT 0',
    'fsrs_elapsed_days INTEGER DEFAULT 0',
    'fsrs_scheduled_days INTEGER DEFAULT 0',
    'fsrs_reps INTEGER DEFAULT 0',
    'fsrs_lapses INTEGER DEFAULT 0',
    'fsrs_state INTEGER DEFAULT 0',
    'fsrs_last_review TEXT',
    'last_sync_at TEXT',
  ];

  for (const col of columns) {
    try {
      await db.execAsync(
        `ALTER TABLE user_flashcard_progress ADD COLUMN ${col};`
      );
    } catch {
      // Column already exists — safe to ignore
    }
  }
}

/**
 * Build FSRSCardState from UserFlashcardProgress fields.
 *
 * When migrating SM-2 cards to FSRS, we derive FSRS state from the SM-2
 * interval, ease_factor, and repetitions so that the card's learned state
 * is preserved. Without this, cards that were scheduled days/weeks out
 * under SM-2 would appear "due immediately" after migration.
 */
function progressToFSRSState(progress: UserFlashcardProgress): FSRSCardState {
  if (progress.algorithm === 'fsrs' && progress.fsrs_stability != null) {
    return {
      due: progress.next_review,
      stability: progress.fsrs_stability!,
      difficulty: progress.fsrs_difficulty!,
      elapsed_days: progress.fsrs_elapsed_days!,
      scheduled_days: progress.fsrs_scheduled_days!,
      reps: progress.fsrs_reps!,
      lapses: progress.fsrs_lapses!,
      state: progress.fsrs_state!,
      last_review: progress.fsrs_last_review ?? null,
    };
  }

  // SM-2 card with learned state — migrate preserving scheduling data
  if (progress.interval > 0 && progress.repetitions > 0) {
    return migrateSM2ToFSRS(progress);
  }

  // Truly new card (no SM-2 history) — initialize fresh
  return initializeFSRS();
}

/**
 * Derive FSRS card state from SM-2 fields.
 *
 * Mapping rationale:
 * - stability ← interval * 0.9 (FSRS stability ~ days until 90% retention)
 * - difficulty ← 11 - ease_factor * 3, clamped [1, 10]
 *   (ease 2.5 → difficulty ~3.5; ease 1.3 → difficulty ~7.1)
 * - state ← Review (2) since the card has been successfully learned
 * - reps ← SM-2 repetitions count
 * - lapses ← SM-2 incorrect_count (times forgotten)
 * - scheduled_days ← SM-2 interval (preserves the review schedule)
 * - elapsed_days ← days since last_reviewed_at (or 0 if unknown)
 * - last_review ← SM-2 last_reviewed_at
 * - due ← SM-2 next_review (preserves the scheduled review date)
 */
function migrateSM2ToFSRS(progress: UserFlashcardProgress): FSRSCardState {
  const stability = progress.interval * 0.9;
  const difficulty = Math.max(1, Math.min(10, 11 - progress.ease_factor * 3));

  // Calculate elapsed days since last review
  let elapsedDays = 0;
  if (progress.last_reviewed_at) {
    const lastReview = new Date(progress.last_reviewed_at);
    const now = new Date();
    elapsedDays = Math.max(
      0,
      Math.round((now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24))
    );
  }

  // Ensure next_review is not in the past — if it is, keep the original
  // (the card is overdue and should be reviewed, which is correct behavior)
  const due = progress.next_review;

  return {
    due,
    stability,
    difficulty,
    elapsed_days: elapsedDays,
    scheduled_days: progress.interval,
    reps: progress.repetitions,
    lapses: progress.incorrect_count || 0,
    state: 2, // FSRSState.Review — card has been learned under SM-2
    last_review: progress.last_reviewed_at ?? null,
  };
}

/**
 * Insert sample flashcards (for development/testing)
 */
export async function insertSampleFlashcards(): Promise<void> {
  const db = await dbManager.getDatabase();

  // Check if we already have flashcards
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM flashcards'
  );

  if (result && result.count > 0) {
    console.log('ℹ️  Sample flashcards already exist');
    return;
  }

  const now = new Date().toISOString();

  // Import comprehensive vocabulary
  const { allVocabulary } = await import('./sample-vocabulary');

  // Insert all vocabulary flashcards
  for (const flashcard of allVocabulary) {
    const id = `flashcard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.runAsync(
      `INSERT INTO flashcards (id, word, translation, phonetic, category, difficulty, target_language, native_language, example_sentence, example_translation, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        flashcard.word,
        flashcard.translation,
        flashcard.phonetic || null,
        flashcard.category,
        flashcard.difficulty,
        flashcard.target_language,
        flashcard.native_language,
        flashcard.example_sentence || null,
        flashcard.example_translation || null,
        now,
        now,
      ]
    );
  }

  console.log(`✅ Inserted ${allVocabulary.length} sample flashcards`);
}

/**
 * Get flashcards due for review for a user
 */
export async function getFlashcardsDueForReview(
  userId: string,
  limit: number = 10
): Promise<FlashcardWithProgress[]> {
  const db = await dbManager.getDatabase();
  const now = new Date().toISOString();

  const results = await db.getAllAsync<Flashcard & { progress_id?: string; next_review?: string }>(
    `SELECT
      f.*,
      p.id as progress_id,
      p.next_review
     FROM flashcards f
     LEFT JOIN user_flashcard_progress p ON f.id = p.flashcard_id AND p.user_id = ?
     WHERE p.next_review IS NULL OR p.next_review <= ?
     ORDER BY p.next_review ASC NULLS FIRST
     LIMIT ?`,
    [userId, now, limit]
  );

  return results.map((row) => ({
    ...row,
    isDue: true, // All cards returned are due
  }));
}

/**
 * Get or create progress for a flashcard
 */
export async function getOrCreateProgress(
  userId: string,
  flashcardId: string
): Promise<UserFlashcardProgress> {
  const db = await dbManager.getDatabase();

  // Try to get existing progress
  const existing = await db.getFirstAsync<UserFlashcardProgress>(
    'SELECT * FROM user_flashcard_progress WHERE user_id = ? AND flashcard_id = ?',
    [userId, flashcardId]
  );

  if (existing) {
    return existing;
  }

  // Create new progress with FSRS defaults (new cards always use FSRS)
  const fsrsState = initializeFSRS();
  const id = `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  const newProgress: UserFlashcardProgress = {
    id,
    user_id: userId,
    flashcard_id: flashcardId,
    // Legacy SM-2 fields (kept for backward compat, seeded with defaults)
    ease_factor: 2.5,
    interval: 0,
    repetitions: 0,
    next_review: fsrsState.due,
    // FSRS fields
    algorithm: 'fsrs',
    fsrs_stability: fsrsState.stability,
    fsrs_difficulty: fsrsState.difficulty,
    fsrs_elapsed_days: fsrsState.elapsed_days ?? 0,
    fsrs_scheduled_days: fsrsState.scheduled_days ?? 0,
    fsrs_reps: fsrsState.reps ?? 0,
    fsrs_lapses: fsrsState.lapses ?? 0,
    fsrs_state: fsrsState.state ?? 0,
    fsrs_last_review: fsrsState.last_review ?? null,
    // Tracking
    total_reviews: 0,
    correct_count: 0,
    incorrect_count: 0,
    created_at: now,
    updated_at: now,
  };

  await db.runAsync(
    `INSERT INTO user_flashcard_progress
     (id, user_id, flashcard_id, ease_factor, interval, repetitions, next_review,
      algorithm, fsrs_stability, fsrs_difficulty, fsrs_elapsed_days, fsrs_scheduled_days,
      fsrs_reps, fsrs_lapses, fsrs_state, fsrs_last_review,
      total_reviews, correct_count, incorrect_count, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newProgress.id,
      newProgress.user_id,
      newProgress.flashcard_id,
      newProgress.ease_factor,
      newProgress.interval,
      newProgress.repetitions,
      newProgress.next_review,
      newProgress.algorithm,
      newProgress.fsrs_stability ?? 0,
      newProgress.fsrs_difficulty ?? 0,
      newProgress.fsrs_elapsed_days ?? 0,
      newProgress.fsrs_scheduled_days ?? 0,
      newProgress.fsrs_reps ?? 0,
      newProgress.fsrs_lapses ?? 0,
      newProgress.fsrs_state ?? 0,
      newProgress.fsrs_last_review ?? null,
      newProgress.total_reviews,
      newProgress.correct_count,
      newProgress.incorrect_count,
      newProgress.created_at,
      newProgress.updated_at,
    ]
  );

  return newProgress;
}

/**
 * Update flashcard progress after review
 */
export async function updateFlashcardProgress(
  userId: string,
  flashcardId: string,
  quality: ReviewQuality
): Promise<UserFlashcardProgress> {
  const db = await dbManager.getDatabase();
  const progress = await getOrCreateProgress(userId, flashcardId);

  // Update counters
  const isCorrect = quality >= 3;
  const newTotalReviews = progress.total_reviews + 1;
  const newCorrectCount = progress.correct_count + (isCorrect ? 1 : 0);
  const newIncorrectCount = progress.incorrect_count + (isCorrect ? 0 : 1);
  const now = new Date().toISOString();

  // Use FSRS for all cards (migrate SM-2 cards on first review)
  const currentFSRS = progressToFSRSState(progress);
  const fsrsResult = fsrsReviewCard(currentFSRS, quality);
  const newCard = fsrsResult.card;

  await db.runAsync(
    `UPDATE user_flashcard_progress
     SET algorithm = 'fsrs',
         next_review = ?,
         interval = ?,
         fsrs_stability = ?, fsrs_difficulty = ?,
         fsrs_elapsed_days = ?, fsrs_scheduled_days = ?,
         fsrs_reps = ?, fsrs_lapses = ?, fsrs_state = ?,
         fsrs_last_review = ?,
         total_reviews = ?, correct_count = ?, incorrect_count = ?,
         last_reviewed_at = ?, updated_at = ?
     WHERE id = ?`,
    [
      newCard.due,
      newCard.scheduled_days,
      newCard.stability,
      newCard.difficulty,
      newCard.elapsed_days,
      newCard.scheduled_days,
      newCard.reps,
      newCard.lapses,
      newCard.state,
      newCard.last_review,
      newTotalReviews,
      newCorrectCount,
      newIncorrectCount,
      now,
      now,
      progress.id,
    ]
  );

  return {
    ...progress,
    algorithm: 'fsrs',
    next_review: newCard.due,
    interval: newCard.scheduled_days,
    fsrs_stability: newCard.stability,
    fsrs_difficulty: newCard.difficulty,
    fsrs_elapsed_days: newCard.elapsed_days,
    fsrs_scheduled_days: newCard.scheduled_days,
    fsrs_reps: newCard.reps,
    fsrs_lapses: newCard.lapses,
    fsrs_state: newCard.state,
    fsrs_last_review: newCard.last_review,
    total_reviews: newTotalReviews,
    correct_count: newCorrectCount,
    incorrect_count: newIncorrectCount,
    last_reviewed_at: now,
    updated_at: now,
  };
}

/**
 * Create a new review session
 */
export async function createReviewSession(userId: string): Promise<string> {
  const db = await dbManager.getDatabase();
  const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  await db.runAsync(
    'INSERT INTO review_sessions (id, user_id, started_at, flashcards_reviewed, points_earned) VALUES (?, ?, ?, 0, 0)',
    [id, userId, now]
  );

  return id;
}

/**
 * Update review session stats
 */
export async function updateReviewSession(
  sessionId: string,
  flashcardsReviewed: number,
  pointsEarned: number
): Promise<void> {
  const db = await dbManager.getDatabase();
  const now = new Date().toISOString();

  await db.runAsync(
    'UPDATE review_sessions SET flashcards_reviewed = ?, points_earned = ?, ended_at = ? WHERE id = ?',
    [flashcardsReviewed, pointsEarned, now, sessionId]
  );
}

/**
 * Record a flashcard review
 */
export async function recordFlashcardReview(
  sessionId: string,
  flashcardId: string,
  userId: string,
  quality: ReviewQuality,
  timeSpentSeconds: number,
  cardType: 'learning' | 'listening' | 'speaking'
): Promise<void> {
  const db = await dbManager.getDatabase();
  const id = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO flashcard_reviews (id, session_id, flashcard_id, user_id, quality, time_spent_seconds, card_type, reviewed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, sessionId, flashcardId, userId, quality, timeSpentSeconds, cardType, now]
  );
}

/**
 * Get count of flashcards currently due for review.
 * Cards with next_review <= now are due.
 */
export async function getDueFlashcardCount(userId: string): Promise<number> {
  try {
    const db = await dbManager.getDatabase();
    const now = new Date().toISOString();
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM user_flashcard_progress
       WHERE user_id = ? AND next_review <= ?`,
      [userId, now]
    );
    return result?.count || 0;
  } catch {
    return 0;
  }
}

/**
 * Get flashcard reviews within a date range.
 * Used by the Activity Tracker to aggregate flashcard activity.
 */
export async function getFlashcardReviewsInRange(
  userId: string,
  sinceISO: string,
): Promise<{ reviewed_at: string; time_spent_seconds: number }[]> {
  try {
    const db = await dbManager.getDatabase();
    return await db.getAllAsync<{ reviewed_at: string; time_spent_seconds: number }>(
      `SELECT reviewed_at, time_spent_seconds FROM flashcard_reviews
       WHERE user_id = ? AND reviewed_at >= ?
       ORDER BY reviewed_at ASC`,
      [userId, sinceISO]
    );
  } catch {
    return [];
  }
}
