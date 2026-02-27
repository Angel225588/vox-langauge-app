/**
 * useUserMetrics — Single source of truth for all user metrics
 *
 * Centralizes points, streak, KPIs, and competency snapshot so every
 * screen shows the same numbers. Fetches once, caches in state,
 * exposes a refresh() for pull-to-refresh or post-lesson updates.
 *
 * Used by: Home, Staircase, Practice, Profile, Competency Dashboard.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getCompetencySnapshot } from '@/lib/metrics/competencyEngine';
import { getConversationStats } from '@/lib/db/conversations';
import { getUserMemory } from '@/lib/ai/userMemory';
import { getStreakData } from '@/lib/db/sqlite';
import type { CompetencySnapshot, ScoreTrend } from '@/lib/db/competencyMetrics';

// ─── Types ───

export interface UserMetrics {
  // Points
  totalPoints: number;

  // Streak
  streak: number;

  // 4 Core KPIs (0-100)
  articulation: number;
  fluency: number;
  communication: number;
  scenario: number;

  // Meta
  totalVocab: number;
  dailyPercent: number;
  cefrLevel: string;
  cefrProgress: number;
  totalSessions: number;

  // Trends
  trends: ScoreTrend[];

  // Full snapshot (for dashboard deep-dive)
  snapshot: CompetencySnapshot;
}

const EMPTY_SNAPSHOT: CompetencySnapshot = {
  averages: { articulation: 0, fluency: 0, communication: 0, scenario: 0, overall: 0 },
  trends: [],
  cefrLevel: 'A1',
  cefrProgress: 0,
  totalSessions: 0,
  recentScores: [],
  byType: {
    conversation: { avg: 0, count: 0 },
    reading: { avg: 0, count: 0 },
    writing: { avg: 0, count: 0 },
    listening: { avg: 0, count: 0 },
  },
};

const EMPTY_METRICS: UserMetrics = {
  totalPoints: 0,
  streak: 0,
  articulation: 0,
  fluency: 0,
  communication: 0,
  scenario: 0,
  totalVocab: 0,
  dailyPercent: 0,
  cefrLevel: 'A1',
  cefrProgress: 0,
  totalSessions: 0,
  trends: [],
  snapshot: EMPTY_SNAPSHOT,
};

// ─── Points Formula ───
// Centralized so every screen uses the same calculation.

function calculateTotalPoints(
  conversationSessions: number,
  lessonsCompleted: number,
  practiceSnapshotSessions: number,
): number {
  return (conversationSessions * 50)
    + (lessonsCompleted * 25)
    + (practiceSnapshotSessions * 30);
}

// ─── Daily Percent ───
// Tracks today's lessons as a fraction of 5 daily target.

function calculateDailyPercent(
  lessonsCompletedToday: number,
): number {
  const dailyTarget = 5;
  return Math.min(100, Math.round((lessonsCompletedToday / dailyTarget) * 100));
}

// ─── Hook ───

export function useUserMetrics() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<UserMetrics>(EMPTY_METRICS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [snapshot, stats, memory, streakInfo] = await Promise.all([
        getCompetencySnapshot(user.id),
        getConversationStats(user.id),
        getUserMemory(user.id),
        getStreakData(user.id),
      ]);

      // Calculate lessons completed today from memory's last_lesson_date
      const today = new Date().toISOString().slice(0, 10);
      const lastLessonDate = (memory as any)?.last_lesson_date
        ? new Date((memory as any).last_lesson_date).toISOString().slice(0, 10)
        : null;
      // Use lessons_completed_today if tracked, otherwise fallback
      const lessonsToday = lastLessonDate === today
        ? ((memory as any)?.lessons_completed_today || 1)
        : 0;

      // Use SQLite as single source of truth for points + streak
      // Falls back to formula estimate if SQLite has no data yet
      const sqlitePoints = streakInfo.total_points || 0;
      const conversationSessions = stats?.totalSessions || 0;
      const lessonsCompleted = memory?.total_lessons_completed || 0;
      const formulaPoints = calculateTotalPoints(conversationSessions, lessonsCompleted, snapshot.totalSessions);

      setMetrics({
        totalPoints: Math.max(sqlitePoints, formulaPoints),
        streak: streakInfo.current_streak || memory?.current_streak || 0,
        articulation: snapshot.averages.articulation,
        fluency: snapshot.averages.fluency,
        communication: snapshot.averages.communication,
        scenario: snapshot.averages.scenario,
        totalVocab: memory?.total_vocab_learned || 0,
        dailyPercent: calculateDailyPercent(lessonsToday),
        cefrLevel: snapshot.cefrLevel,
        cefrProgress: snapshot.cefrProgress,
        totalSessions: snapshot.totalSessions,
        trends: snapshot.trends,
        snapshot,
      });
    } catch (err) {
      console.warn('[useUserMetrics] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { metrics, loading, refresh };
}
