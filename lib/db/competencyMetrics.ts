/**
 * Competency Metrics Persistence Layer
 *
 * Stores and retrieves practice scores from all modes (voice, reading, writing, listening).
 * Voice scores come from conversation_sessions.feedback JSONB.
 * Practice scores stored via AsyncStorage (lightweight, no migration needed).
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
 */
export async function savePracticeScore(
  userId: string,
  type: PracticeType,
  scores: {
    articulation?: number;
    fluency?: number;
    communication?: number;
    scenario?: number;
  }
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
  };

  // Append to local storage
  const existing = await getStoredScores(userId);
  existing.push(score);
  // Keep last 200 scores max
  const trimmed = existing.slice(-200);
  await AsyncStorage.setItem(`${SCORES_KEY}_${userId}`, JSON.stringify(trimmed));

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
