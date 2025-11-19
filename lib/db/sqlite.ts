import * as SQLite from 'expo-sqlite';

// Open database
export const db = SQLite.openDatabaseSync('vox-language.db');

/**
 * Initialize local SQLite database for offline support
 * Tables mirror Supabase structure but optimized for offline-first operation
 */
export async function initializeDatabase() {
  try {
    // Create lessons table (for offline access)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS lessons (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        sequence INTEGER NOT NULL,
        content TEXT NOT NULL,
        downloaded_at INTEGER DEFAULT (strftime('%s', 'now')),
        synced INTEGER DEFAULT 1
      );
    `);

    // Create flashcards table (for offline access)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS flashcards (
        id TEXT PRIMARY KEY,
        lesson_id TEXT NOT NULL,
        front_text TEXT NOT NULL,
        back_text TEXT NOT NULL,
        image_url TEXT,
        audio_url TEXT,
        phonetics TEXT,
        examples TEXT,
        category TEXT NOT NULL,
        local_image_path TEXT,
        local_audio_path TEXT,
        downloaded_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (lesson_id) REFERENCES lessons(id)
      );
    `);

    // Create user_progress table (offline tracking, synced later)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        lesson_id TEXT NOT NULL,
        points INTEGER DEFAULT 0,
        completed INTEGER DEFAULT 0,
        completed_at INTEGER,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        synced INTEGER DEFAULT 0
      );
    `);

    // Create flashcard_reviews table (spaced repetition data)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS flashcard_reviews (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        flashcard_id TEXT NOT NULL,
        ease_factor REAL DEFAULT 2.5,
        interval INTEGER DEFAULT 0,
        repetitions INTEGER DEFAULT 0,
        next_review INTEGER NOT NULL,
        last_reviewed INTEGER,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        synced INTEGER DEFAULT 0,
        UNIQUE(user_id, flashcard_id)
      );
    `);

    // Create streak_data table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS streak_data (
        user_id TEXT PRIMARY KEY,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_practice_date INTEGER,
        total_points INTEGER DEFAULT 0,
        synced INTEGER DEFAULT 0
      );
    `);

    // Create downloaded_media table (track what's downloaded)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS downloaded_media (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        local_path TEXT NOT NULL,
        type TEXT NOT NULL,
        size INTEGER,
        downloaded_at INTEGER DEFAULT (strftime('%s', 'now'))
      );
    `);

    console.log('SQLite database initialized successfully');
  } catch (error) {
    console.error('Error initializing SQLite database:', error);
    throw error;
  }
}

/**
 * Get due flashcards for review (works offline)
 */
export async function getDueFlashcards(userId: string): Promise<any[]> {
  const now = Math.floor(Date.now() / 1000);

  const result = await db.getAllAsync(`
    SELECT f.*, fr.ease_factor, fr.interval, fr.repetitions, fr.next_review
    FROM flashcards f
    LEFT JOIN flashcard_reviews fr ON f.id = fr.flashcard_id AND fr.user_id = ?
    WHERE fr.next_review <= ? OR fr.next_review IS NULL
    ORDER BY fr.next_review ASC
    LIMIT 20
  `, [userId, now]);

  return result;
}

/**
 * Save flashcard review (offline)
 */
export async function saveFlashcardReview(
  userId: string,
  flashcardId: string,
  easeFactor: number,
  interval: number,
  repetitions: number,
  nextReview: number
) {
  const id = `${userId}_${flashcardId}`;
  const now = Math.floor(Date.now() / 1000);

  await db.runAsync(`
    INSERT INTO flashcard_reviews (id, user_id, flashcard_id, ease_factor, interval, repetitions, next_review, last_reviewed, synced)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    ON CONFLICT(user_id, flashcard_id) DO UPDATE SET
      ease_factor = excluded.ease_factor,
      interval = excluded.interval,
      repetitions = excluded.repetitions,
      next_review = excluded.next_review,
      last_reviewed = excluded.last_reviewed,
      synced = 0
  `, [id, userId, flashcardId, easeFactor, interval, repetitions, nextReview, now]);
}

/**
 * Update user progress (offline)
 */
export async function updateUserProgress(
  userId: string,
  lessonId: string,
  points: number,
  completed: boolean = false
) {
  const id = `${userId}_${lessonId}_${Date.now()}`;
  const now = Math.floor(Date.now() / 1000);

  await db.runAsync(`
    INSERT INTO user_progress (id, user_id, lesson_id, points, completed, completed_at, synced)
    VALUES (?, ?, ?, ?, ?, ?, 0)
  `, [id, userId, lessonId, points, completed ? 1 : 0, completed ? now : null]);

  // Update streak data
  await updateStreakData(userId, points);
}

/**
 * Update streak data (offline)
 */
export async function updateStreakData(userId: string, pointsToAdd: number) {
  const today = Math.floor(Date.now() / 86400000); // Days since epoch

  const streakData: any = await db.getFirstAsync(
    'SELECT * FROM streak_data WHERE user_id = ?',
    [userId]
  );

  if (!streakData) {
    // First practice session
    await db.runAsync(`
      INSERT INTO streak_data (user_id, current_streak, longest_streak, last_practice_date, total_points, synced)
      VALUES (?, 1, 1, ?, ?, 0)
    `, [userId, today, pointsToAdd]);
  } else {
    const lastPracticeDay = streakData.last_practice_date;
    let newStreak = streakData.current_streak;

    if (lastPracticeDay === today) {
      // Same day, just add points
    } else if (lastPracticeDay === today - 1) {
      // Consecutive day, increment streak
      newStreak += 1;
    } else {
      // Streak broken, reset to 1
      newStreak = 1;
    }

    const newLongestStreak = Math.max(streakData.longest_streak, newStreak);
    const newTotalPoints = streakData.total_points + pointsToAdd;

    await db.runAsync(`
      UPDATE streak_data
      SET current_streak = ?, longest_streak = ?, last_practice_date = ?, total_points = ?, synced = 0
      WHERE user_id = ?
    `, [newStreak, newLongestStreak, today, newTotalPoints, userId]);
  }
}

/**
 * Get user streak and points (offline)
 */
export async function getStreakData(userId: string) {
  const result: any = await db.getFirstAsync(
    'SELECT * FROM streak_data WHERE user_id = ?',
    [userId]
  );

  return result || {
    current_streak: 0,
    longest_streak: 0,
    total_points: 0,
  };
}

/**
 * Get unsynced data (for syncing when online)
 */
export async function getUnsyncedData() {
  const reviews = await db.getAllAsync(
    'SELECT * FROM flashcard_reviews WHERE synced = 0'
  );

  const progress = await db.getAllAsync(
    'SELECT * FROM user_progress WHERE synced = 0'
  );

  const streaks = await db.getAllAsync(
    'SELECT * FROM streak_data WHERE synced = 0'
  );

  return { reviews, progress, streaks };
}

/**
 * Mark data as synced
 */
export async function markAsSynced(table: string, ids: string[]) {
  const placeholders = ids.map(() => '?').join(',');
  await db.runAsync(
    `UPDATE ${table} SET synced = 1 WHERE id IN (${placeholders})`,
    ids
  );
}
