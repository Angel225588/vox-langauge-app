/**
 * Flashcard Database Utilities
 *
 * Handles all flashcard-related database operations for SQLite (offline-first).
 * Data syncs to Supabase when online.
 */

import * as SQLite from 'expo-sqlite';
import {
  Flashcard,
  UserFlashcardProgress,
  FlashcardWithProgress,
  ReviewQuality,
  FlashcardReview,
  ReviewSession,
} from '@/types/flashcard';
import { initializeSM2, calculateSM2, isDueForReview } from '@/lib/spaced-repetition/sm2';

const DB_NAME = 'vox_language.db';

/**
 * Initialize the flashcard database schema
 * Creates tables if they don't exist
 */
export async function initializeFlashcardDB(): Promise<void> {
  try {
    const db = await SQLite.openDatabaseAsync(DB_NAME);

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

    console.log('✅ Flashcard database initialized');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

/**
 * Insert sample flashcards (for development/testing)
 */
export async function insertSampleFlashcards(): Promise<void> {
  const db = await SQLite.openDatabaseAsync(DB_NAME);

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
  const db = await SQLite.openDatabaseAsync(DB_NAME);
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
  const db = await SQLite.openDatabaseAsync(DB_NAME);

  // Try to get existing progress
  const existing = await db.getFirstAsync<UserFlashcardProgress>(
    'SELECT * FROM user_flashcard_progress WHERE user_id = ? AND flashcard_id = ?',
    [userId, flashcardId]
  );

  if (existing) {
    return existing;
  }

  // Create new progress with SM-2 defaults
  const sm2 = initializeSM2();
  const id = `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  const newProgress: UserFlashcardProgress = {
    id,
    user_id: userId,
    flashcard_id: flashcardId,
    ease_factor: sm2.easeFactor,
    interval: sm2.interval,
    repetitions: sm2.repetitions,
    next_review: sm2.nextReview.toISOString(),
    total_reviews: 0,
    correct_count: 0,
    incorrect_count: 0,
    created_at: now,
    updated_at: now,
  };

  await db.runAsync(
    `INSERT INTO user_flashcard_progress (id, user_id, flashcard_id, ease_factor, interval, repetitions, next_review, total_reviews, correct_count, incorrect_count, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newProgress.id,
      newProgress.user_id,
      newProgress.flashcard_id,
      newProgress.ease_factor,
      newProgress.interval,
      newProgress.repetitions,
      newProgress.next_review,
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
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  const progress = await getOrCreateProgress(userId, flashcardId);

  // Calculate new SM-2 values
  const sm2Result = calculateSM2({
    quality,
    easeFactor: progress.ease_factor,
    interval: progress.interval,
    repetitions: progress.repetitions,
  });

  // Update counters
  const isCorrect = quality >= 3;
  const newTotalReviews = progress.total_reviews + 1;
  const newCorrectCount = progress.correct_count + (isCorrect ? 1 : 0);
  const newIncorrectCount = progress.incorrect_count + (isCorrect ? 0 : 1);
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE user_flashcard_progress
     SET ease_factor = ?, interval = ?, repetitions = ?, next_review = ?,
         total_reviews = ?, correct_count = ?, incorrect_count = ?,
         last_reviewed_at = ?, updated_at = ?
     WHERE id = ?`,
    [
      sm2Result.easeFactor,
      sm2Result.interval,
      sm2Result.repetitions,
      sm2Result.nextReview.toISOString(),
      newTotalReviews,
      newCorrectCount,
      newIncorrectCount,
      now,
      now,
      progress.id,
    ]
  );

  // Return updated progress
  return {
    ...progress,
    ease_factor: sm2Result.easeFactor,
    interval: sm2Result.interval,
    repetitions: sm2Result.repetitions,
    next_review: sm2Result.nextReview.toISOString(),
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
  const db = await SQLite.openDatabaseAsync(DB_NAME);
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
  const db = await SQLite.openDatabaseAsync(DB_NAME);
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
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  const id = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO flashcard_reviews (id, session_id, flashcard_id, user_id, quality, time_spent_seconds, card_type, reviewed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, sessionId, flashcardId, userId, quality, timeSpentSeconds, cardType, now]
  );
}
