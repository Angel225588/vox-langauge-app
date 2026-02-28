/**
 * Sync Service — Cloud Sync for SQLite Data
 *
 * Handles bidirectional sync between local SQLite and Supabase for:
 * - Streak data (points, streaks, practice dates)
 * - Flashcard progress (FSRS + SM-2 review state)
 *
 * Design principles:
 * - Best-effort, non-blocking — never throws, logs warnings
 * - Conflict resolution: highest values win (points, streaks), latest date wins
 * - Auth-gated: skips sync silently if no authenticated user
 * - Idempotent: safe to call repeatedly
 */

import { supabase } from '@/lib/db/supabase';
import { dbManager } from '@/lib/db/database';

// =============================================================================
// Types
// =============================================================================

interface SyncResult {
  success: boolean;
  synced: number;
  errors: string[];
}

interface StreakRow {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_practice_date: number | null;
  total_points: number;
  last_sync_at: string | null;
}

interface FlashcardProgressRow {
  id: string;
  user_id: string;
  flashcard_id: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review: string;
  total_reviews: number;
  correct_count: number;
  incorrect_count: number;
  last_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  algorithm: 'sm2' | 'fsrs';
  fsrs_stability: number | null;
  fsrs_difficulty: number | null;
  fsrs_elapsed_days: number | null;
  fsrs_scheduled_days: number | null;
  fsrs_reps: number | null;
  fsrs_lapses: number | null;
  fsrs_state: number | null;
  fsrs_last_review: string | null;
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Get the authenticated user ID, or null if not signed in.
 */
async function getAuthUserId(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Convert SQLite integer day (days since epoch) to ISO date string.
 * The streak_data table stores last_practice_date as days since epoch.
 */
function daysSinceEpochToISO(days: number): string {
  return new Date(days * 86400000).toISOString();
}

/**
 * Convert ISO date string to days since epoch for SQLite storage.
 */
function isoToDaysSinceEpoch(iso: string): number {
  return Math.floor(new Date(iso).getTime() / 86400000);
}

// =============================================================================
// Streak Data Sync
// =============================================================================

/**
 * Upload local streak data to Supabase `user_streak_data` table.
 *
 * Conflict resolution on upsert:
 * - total_points: GREATEST(local, cloud)
 * - longest_streak: GREATEST(local, cloud)
 * - last_practice_date: latest date wins
 * - current_streak: taken from whichever side has the latest last_practice_date
 */
export async function syncStreakData(): Promise<SyncResult> {
  const result: SyncResult = { success: false, synced: 0, errors: [] };

  try {
    const userId = await getAuthUserId();
    if (!userId) {
      result.success = true; // Not an error — just not signed in
      return result;
    }

    const db = await dbManager.getDatabase();

    // Read local streak data
    const local = await db.getFirstAsync<StreakRow>(
      'SELECT * FROM streak_data WHERE user_id = ?',
      [userId]
    );

    if (!local) {
      result.success = true; // No local data to sync
      return result;
    }

    // Fetch existing cloud data to do intelligent merge
    const { data: cloud, error: fetchError } = await supabase
      .from('user_streak_data')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      result.errors.push(`Fetch cloud streak failed: ${fetchError.message}`);
      console.warn('[SyncService] Failed to fetch cloud streak data:', fetchError.message);
      return result;
    }

    // Merge: take highest values
    const mergedTotalPoints = Math.max(
      local.total_points,
      cloud?.total_points ?? 0
    );
    const mergedLongestStreak = Math.max(
      local.longest_streak,
      cloud?.longest_streak ?? 0
    );

    // For current_streak and last_practice_date: latest date wins
    let mergedCurrentStreak = local.current_streak;
    let mergedLastPracticeDate = local.last_practice_date
      ? daysSinceEpochToISO(local.last_practice_date)
      : null;

    if (cloud?.last_practice_date) {
      const localDate = local.last_practice_date
        ? new Date(local.last_practice_date * 86400000)
        : new Date(0);
      const cloudDate = new Date(cloud.last_practice_date);

      if (cloudDate > localDate) {
        mergedCurrentStreak = cloud.current_streak;
        mergedLastPracticeDate = cloud.last_practice_date;
      }
    }

    // Upsert to Supabase
    const now = new Date().toISOString();
    const { error: upsertError } = await supabase
      .from('user_streak_data')
      .upsert(
        {
          user_id: userId,
          total_points: mergedTotalPoints,
          current_streak: mergedCurrentStreak,
          longest_streak: mergedLongestStreak,
          last_practice_date: mergedLastPracticeDate,
          updated_at: now,
        },
        { onConflict: 'user_id' }
      );

    if (upsertError) {
      result.errors.push(`Upsert streak failed: ${upsertError.message}`);
      console.warn('[SyncService] Failed to upsert streak data:', upsertError.message);
      return result;
    }

    // Update local sync timestamp
    await db.runAsync(
      'UPDATE streak_data SET last_sync_at = ?, synced = 1 WHERE user_id = ?',
      [now, userId]
    );

    result.success = true;
    result.synced = 1;
    console.log('[SyncService] Streak data synced successfully');
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(`Streak sync exception: ${msg}`);
    console.warn('[SyncService] Streak sync exception:', msg);
  }

  return result;
}

/**
 * Download streak data from Supabase and merge with local SQLite.
 *
 * Takes the higher values: max points, max streak, latest practice date.
 * Updates local SQLite with the merged result.
 */
export async function loadCloudStreakData(): Promise<SyncResult> {
  const result: SyncResult = { success: false, synced: 0, errors: [] };

  try {
    const userId = await getAuthUserId();
    if (!userId) {
      result.success = true;
      return result;
    }

    // Fetch cloud data
    const { data: cloud, error: fetchError } = await supabase
      .from('user_streak_data')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError) {
      result.errors.push(`Fetch cloud streak failed: ${fetchError.message}`);
      console.warn('[SyncService] Failed to fetch cloud streak data:', fetchError.message);
      return result;
    }

    if (!cloud) {
      result.success = true; // No cloud data to load
      return result;
    }

    const db = await dbManager.getDatabase();

    // Read local streak data
    const local = await db.getFirstAsync<StreakRow>(
      'SELECT * FROM streak_data WHERE user_id = ?',
      [userId]
    );

    // Merge: take highest values
    const mergedTotalPoints = Math.max(
      local?.total_points ?? 0,
      cloud.total_points ?? 0
    );
    const mergedLongestStreak = Math.max(
      local?.longest_streak ?? 0,
      cloud.longest_streak ?? 0
    );

    // For current_streak and last_practice_date: latest date wins
    let mergedCurrentStreak = cloud.current_streak ?? 0;
    let mergedLastPracticeDay: number | null = cloud.last_practice_date
      ? isoToDaysSinceEpoch(cloud.last_practice_date)
      : null;

    if (local?.last_practice_date != null) {
      const localDate = new Date(local.last_practice_date * 86400000);
      const cloudDate = cloud.last_practice_date
        ? new Date(cloud.last_practice_date)
        : new Date(0);

      if (localDate > cloudDate) {
        mergedCurrentStreak = local.current_streak;
        mergedLastPracticeDay = local.last_practice_date;
      }
    }

    const now = new Date().toISOString();

    if (local) {
      // Update existing local row with merged values
      await db.runAsync(
        `UPDATE streak_data
         SET total_points = ?, current_streak = ?, longest_streak = ?,
             last_practice_date = ?, synced = 1, last_sync_at = ?
         WHERE user_id = ?`,
        [
          mergedTotalPoints,
          mergedCurrentStreak,
          mergedLongestStreak,
          mergedLastPracticeDay,
          now,
          userId,
        ]
      );
    } else {
      // Insert cloud data into local SQLite
      await db.runAsync(
        `INSERT INTO streak_data
         (user_id, total_points, current_streak, longest_streak, last_practice_date, synced, last_sync_at)
         VALUES (?, ?, ?, ?, ?, 1, ?)`,
        [
          userId,
          mergedTotalPoints,
          mergedCurrentStreak,
          mergedLongestStreak,
          mergedLastPracticeDay,
          now,
        ]
      );
    }

    result.success = true;
    result.synced = 1;
    console.log('[SyncService] Cloud streak data loaded and merged');
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(`Load cloud streak exception: ${msg}`);
    console.warn('[SyncService] Load cloud streak exception:', msg);
  }

  return result;
}

// =============================================================================
// Flashcard Progress Sync
// =============================================================================

/**
 * Upload local flashcard progress to Supabase `user_flashcard_progress` table.
 *
 * Only syncs rows where updated_at > last_sync_at (dirty rows).
 * The Supabase table already has FSRS columns from migration 20260211_fsrs_schema.sql.
 *
 * After successful upload, updates local last_sync_at timestamps.
 */
export async function syncFlashcardProgress(): Promise<SyncResult> {
  const result: SyncResult = { success: false, synced: 0, errors: [] };

  try {
    const userId = await getAuthUserId();
    if (!userId) {
      result.success = true;
      return result;
    }

    const db = await dbManager.getDatabase();

    // Find dirty rows: updated_at > last_sync_at (or last_sync_at is NULL)
    const dirtyRows = await db.getAllAsync<FlashcardProgressRow & { last_sync_at: string | null }>(
      `SELECT * FROM user_flashcard_progress
       WHERE user_id = ?
         AND (last_sync_at IS NULL OR updated_at > last_sync_at)`,
      [userId]
    );

    if (dirtyRows.length === 0) {
      result.success = true;
      return result;
    }

    console.log(`[SyncService] Syncing ${dirtyRows.length} flashcard progress rows...`);

    // Batch upsert in chunks of 50 to avoid payload limits
    const BATCH_SIZE = 50;
    const syncedIds: string[] = [];

    for (let i = 0; i < dirtyRows.length; i += BATCH_SIZE) {
      const batch = dirtyRows.slice(i, i + BATCH_SIZE);

      const supabaseRows = batch.map((row) => ({
        id: row.id,
        user_id: row.user_id,
        flashcard_id: row.flashcard_id,
        ease_factor: row.ease_factor,
        interval: row.interval,
        repetitions: row.repetitions,
        next_review: row.next_review,
        total_reviews: row.total_reviews,
        correct_count: row.correct_count,
        incorrect_count: row.incorrect_count,
        last_reviewed_at: row.last_reviewed_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        algorithm: row.algorithm,
        fsrs_stability: row.fsrs_stability,
        fsrs_difficulty: row.fsrs_difficulty,
        fsrs_elapsed_days: row.fsrs_elapsed_days,
        fsrs_scheduled_days: row.fsrs_scheduled_days,
        fsrs_reps: row.fsrs_reps,
        fsrs_lapses: row.fsrs_lapses,
        fsrs_state: row.fsrs_state,
        fsrs_last_review: row.fsrs_last_review,
      }));

      const { error } = await supabase
        .from('user_flashcard_progress')
        .upsert(supabaseRows, { onConflict: 'id' });

      if (error) {
        result.errors.push(`Batch ${i / BATCH_SIZE + 1} failed: ${error.message}`);
        console.warn(
          `[SyncService] Flashcard progress batch ${i / BATCH_SIZE + 1} failed:`,
          error.message
        );
        // Continue with remaining batches — partial sync is better than no sync
      } else {
        syncedIds.push(...batch.map((r) => r.id));
      }
    }

    // Update last_sync_at for successfully synced rows
    if (syncedIds.length > 0) {
      const now = new Date().toISOString();

      // Update in batches to avoid SQLite parameter limits (999 max)
      for (let i = 0; i < syncedIds.length; i += 500) {
        const idBatch = syncedIds.slice(i, i + 500);
        const placeholders = idBatch.map(() => '?').join(',');
        await db.runAsync(
          `UPDATE user_flashcard_progress SET last_sync_at = ? WHERE id IN (${placeholders})`,
          [now, ...idBatch]
        );
      }
    }

    result.success = result.errors.length === 0;
    result.synced = syncedIds.length;
    console.log(
      `[SyncService] Flashcard progress synced: ${syncedIds.length}/${dirtyRows.length} rows`
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(`Flashcard sync exception: ${msg}`);
    console.warn('[SyncService] Flashcard sync exception:', msg);
  }

  return result;
}

// =============================================================================
// Full Sync
// =============================================================================

/**
 * Perform a full bidirectional sync for all local data.
 *
 * Sequence:
 * 1. Load cloud streak data (download + merge)
 * 2. Sync streak data (upload merged result)
 * 3. Sync flashcard progress (upload dirty rows)
 *
 * Returns a summary of all sync operations.
 * Safe to call from app startup, settings screen, or on-demand.
 */
export async function performFullSync(): Promise<{
  streak: SyncResult;
  flashcards: SyncResult;
  totalSynced: number;
  allSuccessful: boolean;
}> {
  console.log('[SyncService] Starting full sync...');
  const startTime = Date.now();

  // 1. Load cloud streak data first (merge remote into local)
  const cloudStreakResult = await loadCloudStreakData();

  // 2. Then sync merged local streak data back to cloud
  const streakResult = await syncStreakData();

  // Combine streak results — success only if both steps succeeded
  const combinedStreak: SyncResult = {
    success: cloudStreakResult.success && streakResult.success,
    synced: cloudStreakResult.synced + streakResult.synced,
    errors: [...cloudStreakResult.errors, ...streakResult.errors],
  };

  // 3. Sync flashcard progress
  const flashcardsResult = await syncFlashcardProgress();

  const totalSynced = combinedStreak.synced + flashcardsResult.synced;
  const allSuccessful = combinedStreak.success && flashcardsResult.success;

  const elapsed = Date.now() - startTime;
  console.log(
    `[SyncService] Full sync completed in ${elapsed}ms — ` +
    `${totalSynced} items synced, ${allSuccessful ? 'all successful' : 'some errors'}`
  );

  if (!allSuccessful) {
    const allErrors = [...combinedStreak.errors, ...flashcardsResult.errors];
    console.warn('[SyncService] Sync errors:', allErrors);
  }

  return {
    streak: combinedStreak,
    flashcards: flashcardsResult,
    totalSynced,
    allSuccessful,
  };
}
