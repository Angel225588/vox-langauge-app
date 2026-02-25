/**
 * useActivityData — Hook for the Activity Dashboard.
 *
 * Same pattern as useUserMetrics.ts:
 * - Fetches on mount
 * - 5-min in-memory cache
 * - Exposes refresh() for pull-to-refresh
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getActivitySummary, type ActivitySummary } from '@/lib/metrics/activityTracker';
import { getDueFlashcardCount } from '@/lib/db/flashcards';

export interface ActivityData {
  summary: ActivitySummary;
  dueFlashcards: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const EMPTY_SUMMARY: ActivitySummary = {
  days: new Map(),
  totalDays: 0,
  totalTimeSeconds: 0,
  bestStreak: 0,
  currentStreak: 0,
  weeklyScores: [],
};

export function useActivityData() {
  const { user } = useAuth();
  const [data, setData] = useState<ActivityData>({
    summary: EMPTY_SUMMARY,
    dueFlashcards: 0,
  });
  const [loading, setLoading] = useState(true);
  const lastFetchRef = useRef<number>(0);

  const refresh = useCallback(async (force = false) => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    // Respect cache unless forced
    const now = Date.now();
    if (!force && now - lastFetchRef.current < CACHE_TTL_MS) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [summary, dueFlashcards] = await Promise.all([
        getActivitySummary(user.id, 90),
        getDueFlashcardCount(user.id),
      ]);

      setData({ summary, dueFlashcards });
      lastFetchRef.current = Date.now();
    } catch (err) {
      console.warn('[useActivityData] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refresh(true);
  }, [refresh]);

  return {
    data,
    loading,
    refresh: () => refresh(true),
  };
}
