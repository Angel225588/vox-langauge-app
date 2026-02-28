/**
 * Competency Metrics Persistence Layer
 *
 * Stores and retrieves practice scores from all modes (voice, reading, writing, listening).
 * Voice scores come from conversation_sessions.feedback JSONB.
 * Practice scores stored via AsyncStorage (lightweight, no migration needed).
 *
 * Sync strategy: Local-first with best-effort Supabase sync.
 * - AsyncStorage is the primary store (works offline)
 * - After saving locally, attempts non-blocking sync to Supabase `practice_scores` table
 * - `syncPracticeScores()` bulk-uploads unsynced entries
 * - `loadCloudScores()` merges cloud + local scores (dedup by completedAt)
 *
 * Used by: competency dashboard, practice tab KPIs, trend engine.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/db/supabase';

// =============================================================================
// Types
// =============================================================================

export type PracticeType = 'conversation' | 'reading' | 'writing' | 'listening';

export interface PracticeScore {
  id: string;
  userId: string;
  type: PracticeType;
  /** Articulation score 0-100 (pronunciation clarity) */
  articulation: number;
  /** Fluency score 0-100 (flow, pauses, filler words) */
  fluency: number;
  /** Communication score 0-100 (idea expression) */
  communication: number;
  /** Scenario score 0-100 (real-world situation handling) */
  scenario: number;
  /** Overall composite score 0-100 */
  overallScore: number;
  completedAt: string;
  /** Whether this score has been synced to Supabase */
  synced?: boolean;
  /** Optional metadata (passed through to Supabase JSONB) */
  metadata?: Record<string, unknown>;
}

export interface ScoreTrend {
  kpi: string;
  current: number;
  previous: number;
  delta: number;
  direction: 'improving' | 'stable' | 'declining';
}

export interface CompetencySnapshot {
  /** Current averages across all practice types */
  averages: {
    articulation: number;
    fluency: number;
    communication: number;
    scenario: number;
    overall: number;
  };
  /** Trends compared to previous period */
  trends: ScoreTrend[];
  /** CEFR level based on scores */
  cefrLevel: string;
  /** Progress to next CEFR level (0-100) */
  cefrProgress: number;
  /** Total sessions completed */
  totalSessions: number;
  /** Recent score history */
  recentScores: PracticeScore[];
  /** Per-type breakdown */
  byType: Record<PracticeType, { avg: number; count: number }>;
}

// =============================================================================
// Storage Keys
// =============================================================================

const SCORES_KEY = 'vox_practice_scores';

// =============================================================================
// Save Operations
// =============================================================================

/**
 * Save a practice score from any mode.
 *
 * Saves locally first (always succeeds), then attempts background sync to Supabase.
 * The score is marked as unsynced until Supabase confirms the upload.
 */
export async function savePracticeScore(
  userId: string,
  type: PracticeType,
  scores: {
    articulation?: number;
    fluency?: number;
    communication?: number;
    scenario?: number;
  },
  metadata?: Record<string, unknown>
): Promise<PracticeScore> {
  const articulation = scores.articulation ?? 0;
  const fluency = scores.fluency ?? 0;
  const communication = scores.communication ?? 0;
  const scenario = scores.scenario ?? 0;

  // Only average KPIs that were actually measured (non-zero)
  const measured = [articulation, fluency, communication, scenario].filter(v => v > 0);
  const overallScore = measured.length > 0 ? Math.round(measured.reduce((a, b) => a + b, 0) / measured.length) : 0;

  const score: PracticeScore = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId,
    type,
    articulation,
    fluency,
    communication,
    scenario,
    overallScore,
    completedAt: new Date().toISOString(),
    synced: false,
    metadata: metadata ?? {},
  };

  // Append to local storage
  const existing = await getStoredScores(userId);
  existing.push(score);
  // Keep last 200 scores max
  const trimmed = existing.slice(-200);
  await AsyncStorage.setItem(`${SCORES_KEY}_${userId}`, JSON.stringify(trimmed));

  // Best-effort background sync — fire-and-forget, never blocks the caller
  syncScoreToCloud(score)
    .then((synced) => {
      if (synced) {
        markScoreSynced(userId, score.id).catch(() => {});
      }
    })
    .catch(() => {
      // Silently skip — will be retried on next syncPracticeScores() call
    });

  return score;
}

// =============================================================================
// Query Operations
// =============================================================================

/**
 * Get all stored practice scores for a user.
 */
async function getStoredScores(userId: string): Promise<PracticeScore[]> {
  try {
    const raw = await AsyncStorage.getItem(`${SCORES_KEY}_${userId}`);
    if (!raw) return [];
    return JSON.parse(raw) as PracticeScore[];
  } catch {
    return [];
  }
}

/**
 * Get score history for a user, optionally filtered by days.
 */
export async function getScoreHistory(
  userId: string,
  days?: number
): Promise<PracticeScore[]> {
  const scores = await getStoredScores(userId);

  if (!days) return scores;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString();

  return scores.filter(s => s.completedAt >= cutoffStr);
}

/**
 * Get voice conversation scores from Supabase conversation_sessions.
 */
export async function getVoiceScores(userId: string): Promise<PracticeScore[]> {
  try {
    const { data, error } = await supabase
      .from('conversation_sessions')
      .select('id, feedback, started_at')
      .eq('user_id', userId)
      .not('feedback', 'is', null)
      .order('started_at', { ascending: false })
      .limit(50);

    if (error || !data) return [];

    return data
      .filter((row: any) => row.feedback?.articulation != null)
      .map((row: any) => ({
        id: row.id,
        userId,
        type: 'conversation' as PracticeType,
        articulation: row.feedback.articulation || 0,
        fluency: row.feedback.fluency || 0,
        communication: row.feedback.communication || 0,
        scenario: row.feedback.scenario || 0,
        overallScore: Math.round(
          ((row.feedback.articulation || 0) +
            (row.feedback.fluency || 0) +
            (row.feedback.communication || 0) +
            (row.feedback.scenario || 0)) / 4
        ),
        completedAt: row.started_at,
      }));
  } catch {
    return [];
  }
}

/**
 * Get all scores (practice + voice) merged and sorted.
 */
export async function getAllScores(userId: string): Promise<PracticeScore[]> {
  const [practiceScores, voiceScores] = await Promise.all([
    getStoredScores(userId),
    getVoiceScores(userId),
  ]);

  return [...practiceScores, ...voiceScores].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
}

/**
 * Compute trends by comparing recent period vs previous period.
 */
export async function getScoreTrends(
  userId: string,
  periodDays: number = 7
): Promise<ScoreTrend[]> {
  const allScores = await getAllScores(userId);
  if (allScores.length === 0) return [];

  const now = new Date();
  const recentCutoff = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
  const previousCutoff = new Date(now.getTime() - periodDays * 2 * 24 * 60 * 60 * 1000);

  const recent = allScores.filter(s => new Date(s.completedAt) >= recentCutoff);
  const previous = allScores.filter(
    s => new Date(s.completedAt) >= previousCutoff && new Date(s.completedAt) < recentCutoff
  );

  const kpis = ['articulation', 'fluency', 'communication', 'scenario'] as const;

  return kpis.map(kpi => {
    // Only include scores where this KPI was actually measured (non-zero)
    const recentMeasured = recent.filter(s => s[kpi] > 0);
    const previousMeasured = previous.filter(s => s[kpi] > 0);

    const recentAvg = recentMeasured.length > 0
      ? Math.round(recentMeasured.reduce((sum, s) => sum + s[kpi], 0) / recentMeasured.length)
      : 0;
    const previousAvg = previousMeasured.length > 0
      ? Math.round(previousMeasured.reduce((sum, s) => sum + s[kpi], 0) / previousMeasured.length)
      : 0;

    const delta = recentAvg - previousAvg;
    let direction: ScoreTrend['direction'] = 'stable';
    if (delta > 3) direction = 'improving';
    else if (delta < -3) direction = 'declining';

    return { kpi, current: recentAvg, previous: previousAvg, delta, direction };
  });
}

// =============================================================================
// Supabase Sync — Local-First with Best-Effort Cloud Sync
// =============================================================================

/**
 * Get the current authenticated user ID, or null if not signed in.
 * Used to gate all Supabase operations — unauthenticated users only use local storage.
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
 * Sync a single score to the Supabase `practice_scores` table.
 * Returns true if the upsert succeeded, false otherwise.
 */
async function syncScoreToCloud(score: PracticeScore): Promise<boolean> {
  try {
    const authUserId = await getAuthUserId();
    if (!authUserId) return false;

    const { error } = await supabase
      .from('practice_scores')
      .upsert(
        {
          id: score.id,
          user_id: authUserId,
          practice_type: score.type,
          articulation: score.articulation,
          fluency: score.fluency,
          communication: score.communication,
          scenario: score.scenario,
          overall_score: score.overallScore,
          metadata: score.metadata ?? {},
          completed_at: score.completedAt,
          created_at: score.completedAt,
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.warn('[CompetencySync] Failed to sync score:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.warn('[CompetencySync] Exception syncing score:', err);
    return false;
  }
}

/**
 * Mark a local score as synced in AsyncStorage.
 */
async function markScoreSynced(userId: string, scoreId: string): Promise<void> {
  try {
    const scores = await getStoredScores(userId);
    const updated = scores.map(s =>
      s.id === scoreId ? { ...s, synced: true } : s
    );
    await AsyncStorage.setItem(`${SCORES_KEY}_${userId}`, JSON.stringify(updated));
  } catch {
    // Non-critical — worst case the score gets re-uploaded on next bulk sync
  }
}

/**
 * Bulk-sync all unsynced local practice scores to Supabase.
 *
 * Call this on app foreground, after sign-in, or periodically.
 * Reads all local scores, filters to unsynced, uploads in batch,
 * then marks each as synced locally.
 *
 * Returns the number of scores successfully synced.
 */
export async function syncPracticeScores(userId: string): Promise<number> {
  try {
    const authUserId = await getAuthUserId();
    if (!authUserId) {
      console.warn('[CompetencySync] No authenticated user — skipping sync');
      return 0;
    }

    const localScores = await getStoredScores(userId);
    const unsynced = localScores.filter(s => !s.synced);

    if (unsynced.length === 0) return 0;

    // Upload in batches of 50 to avoid payload limits
    const BATCH_SIZE = 50;
    let syncedCount = 0;

    for (let i = 0; i < unsynced.length; i += BATCH_SIZE) {
      const batch = unsynced.slice(i, i + BATCH_SIZE);

      const rows = batch.map(score => ({
        id: score.id,
        user_id: authUserId,
        practice_type: score.type,
        articulation: score.articulation,
        fluency: score.fluency,
        communication: score.communication,
        scenario: score.scenario,
        overall_score: score.overallScore,
        metadata: score.metadata ?? {},
        completed_at: score.completedAt,
        created_at: score.completedAt,
      }));

      const { error } = await supabase
        .from('practice_scores')
        .upsert(rows, { onConflict: 'id' });

      if (error) {
        console.warn(`[CompetencySync] Batch sync failed (${batch.length} scores):`, error.message);
        // Stop on first batch failure — remaining will be retried next time
        break;
      }

      // Mark this batch as synced locally
      const syncedIds = new Set(batch.map(s => s.id));
      const allScores = await getStoredScores(userId);
      const updated = allScores.map(s =>
        syncedIds.has(s.id) ? { ...s, synced: true } : s
      );
      await AsyncStorage.setItem(`${SCORES_KEY}_${userId}`, JSON.stringify(updated));

      syncedCount += batch.length;
    }

    if (syncedCount > 0) {
      console.log(`[CompetencySync] Synced ${syncedCount}/${unsynced.length} practice scores`);
    }

    return syncedCount;
  } catch (err) {
    console.warn('[CompetencySync] Exception during bulk sync:', err);
    return 0;
  }
}

/**
 * Load practice scores from Supabase and merge with local scores.
 *
 * Fetches the authenticated user's cloud scores, then deduplicates
 * against local entries by `completedAt` timestamp. Returns a unified
 * list sorted newest-first.
 *
 * Use this after sign-in to pull scores from other devices, or to
 * restore scores after app reinstall.
 */
export async function loadCloudScores(userId: string): Promise<PracticeScore[]> {
  try {
    const authUserId = await getAuthUserId();
    if (!authUserId) {
      // Not signed in — return local only
      return getStoredScores(userId);
    }

    // Fetch cloud scores
    const { data, error } = await supabase
      .from('practice_scores')
      .select('*')
      .eq('user_id', authUserId)
      .order('completed_at', { ascending: false })
      .limit(200);

    if (error) {
      console.warn('[CompetencySync] Failed to load cloud scores:', error.message);
      // Fall back to local only
      return getStoredScores(userId);
    }

    const cloudScores: PracticeScore[] = (data || []).map((row: any) => ({
      id: row.id,
      userId,
      type: row.practice_type as PracticeType,
      articulation: row.articulation ?? 0,
      fluency: row.fluency ?? 0,
      communication: row.communication ?? 0,
      scenario: row.scenario ?? 0,
      overallScore: row.overall_score ?? 0,
      completedAt: row.completed_at,
      synced: true,
      metadata: row.metadata ?? {},
    }));

    // Merge with local scores, dedup by completedAt
    const localScores = await getStoredScores(userId);
    const seenTimestamps = new Set<string>();
    const merged: PracticeScore[] = [];

    // Local scores take priority (they have the most recent state)
    for (const score of localScores) {
      seenTimestamps.add(score.completedAt);
      merged.push(score);
    }

    // Add cloud-only scores (from other devices or post-reinstall)
    for (const score of cloudScores) {
      if (!seenTimestamps.has(score.completedAt)) {
        seenTimestamps.add(score.completedAt);
        merged.push(score);
      }
    }

    // Sort newest first
    merged.sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    // Persist the merged set locally (cap at 200)
    const trimmed = merged.slice(0, 200);
    await AsyncStorage.setItem(`${SCORES_KEY}_${userId}`, JSON.stringify(trimmed));

    console.log(
      `[CompetencySync] Merged scores: ${localScores.length} local + ${cloudScores.length} cloud = ${trimmed.length} total`
    );

    return trimmed;
  } catch (err) {
    console.warn('[CompetencySync] Exception loading cloud scores:', err);
    // Fall back to local only
    return getStoredScores(userId);
  }
}
