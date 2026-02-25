/**
 * Activity Tracker — Aggregates ALL timestamped activity into a daily map.
 *
 * Sources (all run in Promise.all with 90-day cutoff):
 * - conversation_sessions.started_at  → Supabase
 * - PracticeScore.completedAt         → AsyncStorage (max 200)
 * - flashcard_reviews.reviewed_at     → SQLite
 *
 * Used by: Activity Dashboard (heatmap, retention chart, stat strip).
 */

import { getRecentSessions } from '@/lib/db/conversations';
import { getScoreHistory } from '@/lib/db/competencyMetrics';
import { getFlashcardReviewsInRange } from '@/lib/db/flashcards';

// ─── Types ───

export interface ActivityDay {
  date: string;              // 'YYYY-MM-DD'
  sessions: number;          // total activity sessions that day
  conversationCount: number;
  practiceCount: number;
  flashcardCount: number;
  totalTimeSeconds: number;  // cumulative seconds
  avgScore: number;          // average overall score (0-100, 0 if no scored sessions)
}

export interface ActivitySummary {
  /** Day-by-day map keyed by 'YYYY-MM-DD' */
  days: Map<string, ActivityDay>;
  /** Total unique days with any activity */
  totalDays: number;
  /** Total cumulative time in seconds */
  totalTimeSeconds: number;
  /** Longest consecutive streak */
  bestStreak: number;
  /** Current consecutive streak (includes today) */
  currentStreak: number;
  /** Weekly average scores for retention chart (oldest first) */
  weeklyScores: { weekLabel: string; avg: number }[];
}

// ─── Intensity Scale ───
// 0: no activity
// 1: 1 session → 20% opacity
// 2: 2-3 sessions → 40%
// 3: 4-5 sessions → 65%
// 4: 6+ sessions → 90%

export function calculateIntensity(sessions: number): 0 | 1 | 2 | 3 | 4 {
  if (sessions === 0) return 0;
  if (sessions === 1) return 1;
  if (sessions <= 3) return 2;
  if (sessions <= 5) return 3;
  return 4;
}

// ─── Streak Computation ───

export function computeStreaks(days: Map<string, ActivityDay>): {
  bestStreak: number;
  currentStreak: number;
} {
  if (days.size === 0) return { bestStreak: 0, currentStreak: 0 };

  // Build sorted array of active dates
  const activeDates = Array.from(days.keys())
    .filter(d => days.get(d)!.sessions > 0)
    .sort();

  if (activeDates.length === 0) return { bestStreak: 0, currentStreak: 0 };

  let bestStreak = 1;
  let currentRun = 1;

  for (let i = 1; i < activeDates.length; i++) {
    const prev = new Date(activeDates[i - 1]);
    const curr = new Date(activeDates[i]);
    const diffDays = Math.round(
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 1) {
      currentRun++;
      bestStreak = Math.max(bestStreak, currentRun);
    } else {
      currentRun = 1;
    }
  }

  // Current streak: check if the latest active date is today or yesterday
  const today = toDateKey(new Date());
  const yesterday = toDateKey(new Date(Date.now() - 86400000));
  const lastActive = activeDates[activeDates.length - 1];

  let currentStreak = 0;
  if (lastActive === today || lastActive === yesterday) {
    currentStreak = 1;
    // Walk backward from the last active date
    for (let i = activeDates.length - 2; i >= 0; i--) {
      const curr = new Date(activeDates[i + 1]);
      const prev = new Date(activeDates[i]);
      const diffDays = Math.round(
        (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return { bestStreak, currentStreak };
}

// ─── Weekly Retention Scores ───

export function computeRetentionByWeek(
  days: Map<string, ActivityDay>,
  weeksBack: number = 8,
): { weekLabel: string; avg: number }[] {
  const now = new Date();
  const results: { weekLabel: string; avg: number }[] = [];

  for (let w = weeksBack - 1; w >= 0; w--) {
    const weekEnd = new Date(now.getTime() - w * 7 * 86400000);
    const weekStart = new Date(weekEnd.getTime() - 7 * 86400000);

    const scores: number[] = [];
    for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
      const key = toDateKey(d);
      const day = days.get(key);
      if (day && day.avgScore > 0) {
        scores.push(day.avgScore);
      }
    }

    const avg = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    // Label: "Jan 6" format
    const label = weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    results.push({ weekLabel: label, avg });
  }

  return results;
}

// ─── Helpers ───

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getOrCreate(map: Map<string, ActivityDay>, dateKey: string): ActivityDay {
  let day = map.get(dateKey);
  if (!day) {
    day = {
      date: dateKey,
      sessions: 0,
      conversationCount: 0,
      practiceCount: 0,
      flashcardCount: 0,
      totalTimeSeconds: 0,
      avgScore: 0,
    };
    map.set(dateKey, day);
  }
  return day;
}

// ─── Main Aggregation ───

export async function getActivitySummary(
  userId: string,
  daysBack: number = 90,
): Promise<ActivitySummary> {
  const cutoff = new Date(Date.now() - daysBack * 86400000);
  const cutoffISO = cutoff.toISOString();
  const days = new Map<string, ActivityDay>();

  // Fetch all sources in parallel
  const [conversations, practiceScores, flashcardReviews] = await Promise.all([
    getRecentSessions(userId, 500, 0).catch(() => []),
    getScoreHistory(userId, daysBack).catch(() => []),
    getFlashcardReviewsInRange(userId, cutoffISO).catch(() => []),
  ]);

  // 1. Conversation sessions
  for (const session of conversations) {
    const startedAt = (session as any).startedAt || (session as any).started_at;
    if (!startedAt) continue;
    const sessionDate = new Date(startedAt);
    if (sessionDate < cutoff) continue;

    const dateKey = toDateKey(sessionDate);
    const day = getOrCreate(days, dateKey);
    day.sessions++;
    day.conversationCount++;
    day.totalTimeSeconds += (session as any).durationSeconds || (session as any).duration_seconds || 0;

    // Score from feedback
    const feedback = (session as any).feedback;
    if (feedback) {
      const scores = [
        feedback.articulation,
        feedback.fluency,
        feedback.communication,
        feedback.scenario,
      ].filter((s): s is number => typeof s === 'number' && s > 0);
      if (scores.length > 0) {
        const sessionAvg = scores.reduce((a, b) => a + b, 0) / scores.length;
        // Running average
        const prevTotal = day.avgScore * (day.sessions - 1);
        day.avgScore = Math.round((prevTotal + sessionAvg) / day.sessions);
      }
    }
  }

  // 2. Practice scores (reading, writing, listening)
  for (const score of practiceScores) {
    const completedAt = (score as any).completedAt || (score as any).completed_at;
    if (!completedAt) continue;
    const scoreDate = new Date(completedAt);
    if (scoreDate < cutoff) continue;

    const dateKey = toDateKey(scoreDate);
    const day = getOrCreate(days, dateKey);
    day.sessions++;
    day.practiceCount++;

    const overall = (score as any).overallScore || (score as any).overall_score || 0;
    if (overall > 0) {
      const prevTotal = day.avgScore * (day.sessions - 1);
      day.avgScore = Math.round((prevTotal + overall) / day.sessions);
    }
  }

  // 3. Flashcard reviews
  for (const review of flashcardReviews) {
    const reviewedAt = (review as any).reviewed_at || (review as any).reviewedAt;
    if (!reviewedAt) continue;
    const reviewDate = new Date(reviewedAt);
    if (reviewDate < cutoff) continue;

    const dateKey = toDateKey(reviewDate);
    const day = getOrCreate(days, dateKey);
    day.sessions++;
    day.flashcardCount++;
    day.totalTimeSeconds += (review as any).time_spent_seconds || 0;
  }

  // Compute aggregates
  const { bestStreak, currentStreak } = computeStreaks(days);
  const weeklyScores = computeRetentionByWeek(days);

  let totalTimeSeconds = 0;
  let totalDays = 0;
  for (const day of days.values()) {
    if (day.sessions > 0) {
      totalDays++;
      totalTimeSeconds += day.totalTimeSeconds;
    }
  }

  return {
    days,
    totalDays,
    totalTimeSeconds,
    bestStreak,
    currentStreak,
    weeklyScores,
  };
}
