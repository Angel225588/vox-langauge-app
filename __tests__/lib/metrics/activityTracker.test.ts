/**
 * Tests for activityTracker pure helpers.
 * These are pure functions — no mocking required for the logic,
 * but we mock the native dependencies to avoid import chain issues.
 */

// Mock native dependencies
jest.mock('@/lib/db/conversations', () => ({
  getRecentSessions: jest.fn().mockResolvedValue([]),
}));
jest.mock('@/lib/db/competencyMetrics', () => ({
  getScoreHistory: jest.fn().mockResolvedValue([]),
}));
jest.mock('@/lib/db/flashcards', () => ({
  getFlashcardReviewsInRange: jest.fn().mockResolvedValue([]),
}));

import {
  calculateIntensity,
  computeStreaks,
  computeRetentionByWeek,
  toDateKey,
  type ActivityDay,
} from '@/lib/metrics/activityTracker';

// ─── Helper ───

function makeDay(date: string, sessions: number, avgScore = 0): ActivityDay {
  return {
    date,
    sessions,
    conversationCount: 0,
    practiceCount: 0,
    flashcardCount: 0,
    totalTimeSeconds: 0,
    avgScore,
  };
}

// ─── toDateKey ───

describe('toDateKey', () => {
  it('formats date as YYYY-MM-DD', () => {
    expect(toDateKey(new Date('2026-02-15T10:30:00Z'))).toBe('2026-02-15');
  });

  it('pads single-digit months and days', () => {
    expect(toDateKey(new Date('2026-01-05T00:00:00Z'))).toBe('2026-01-05');
  });
});

// ─── calculateIntensity ───

describe('calculateIntensity', () => {
  it('returns 0 for no activity', () => {
    expect(calculateIntensity(0)).toBe(0);
  });

  it('returns 1 for exactly 1 session', () => {
    expect(calculateIntensity(1)).toBe(1);
  });

  it('returns 2 for 2-3 sessions', () => {
    expect(calculateIntensity(2)).toBe(2);
    expect(calculateIntensity(3)).toBe(2);
  });

  it('returns 3 for 4-5 sessions', () => {
    expect(calculateIntensity(4)).toBe(3);
    expect(calculateIntensity(5)).toBe(3);
  });

  it('returns 4 for 6+ sessions', () => {
    expect(calculateIntensity(6)).toBe(4);
    expect(calculateIntensity(100)).toBe(4);
  });
});

// ─── computeStreaks ───

describe('computeStreaks', () => {
  it('returns 0/0 for empty map', () => {
    const result = computeStreaks(new Map());
    expect(result.bestStreak).toBe(0);
    expect(result.currentStreak).toBe(0);
  });

  it('returns 0/0 for map with only zero-session days', () => {
    const days = new Map<string, ActivityDay>();
    days.set('2026-02-10', makeDay('2026-02-10', 0));
    days.set('2026-02-11', makeDay('2026-02-11', 0));
    const result = computeStreaks(days);
    expect(result.bestStreak).toBe(0);
    expect(result.currentStreak).toBe(0);
  });

  it('finds best streak across gaps', () => {
    const days = new Map<string, ActivityDay>();
    // 3-day streak
    days.set('2026-01-10', makeDay('2026-01-10', 1));
    days.set('2026-01-11', makeDay('2026-01-11', 2));
    days.set('2026-01-12', makeDay('2026-01-12', 1));
    // gap
    // 2-day streak
    days.set('2026-01-20', makeDay('2026-01-20', 3));
    days.set('2026-01-21', makeDay('2026-01-21', 1));

    const result = computeStreaks(days);
    expect(result.bestStreak).toBe(3);
  });

  it('detects current streak including today', () => {
    const today = toDateKey(new Date());
    const yesterday = toDateKey(new Date(Date.now() - 86400000));
    const twoDaysAgo = toDateKey(new Date(Date.now() - 2 * 86400000));

    const days = new Map<string, ActivityDay>();
    days.set(twoDaysAgo, makeDay(twoDaysAgo, 1));
    days.set(yesterday, makeDay(yesterday, 2));
    days.set(today, makeDay(today, 1));

    const result = computeStreaks(days);
    expect(result.currentStreak).toBe(3);
  });

  it('detects current streak from yesterday (user hasn\'t studied today yet)', () => {
    const yesterday = toDateKey(new Date(Date.now() - 86400000));
    const twoDaysAgo = toDateKey(new Date(Date.now() - 2 * 86400000));

    const days = new Map<string, ActivityDay>();
    days.set(twoDaysAgo, makeDay(twoDaysAgo, 1));
    days.set(yesterday, makeDay(yesterday, 2));

    const result = computeStreaks(days);
    expect(result.currentStreak).toBe(2);
  });

  it('returns 0 current streak if last activity was 2+ days ago', () => {
    const threeDaysAgo = toDateKey(new Date(Date.now() - 3 * 86400000));

    const days = new Map<string, ActivityDay>();
    days.set(threeDaysAgo, makeDay(threeDaysAgo, 5));

    const result = computeStreaks(days);
    expect(result.currentStreak).toBe(0);
    expect(result.bestStreak).toBe(1);
  });
});

// ─── computeRetentionByWeek ───

describe('computeRetentionByWeek', () => {
  it('returns correct number of weeks', () => {
    const days = new Map<string, ActivityDay>();
    const result = computeRetentionByWeek(days, 4);
    expect(result).toHaveLength(4);
  });

  it('returns 0 avg for empty weeks', () => {
    const days = new Map<string, ActivityDay>();
    const result = computeRetentionByWeek(days, 2);
    expect(result.every(w => w.avg === 0)).toBe(true);
  });

  it('computes averages for weeks with data', () => {
    const days = new Map<string, ActivityDay>();
    // Add data for last 3 days
    for (let i = 0; i < 3; i++) {
      const date = toDateKey(new Date(Date.now() - i * 86400000));
      days.set(date, makeDay(date, 1, 80));
    }

    const result = computeRetentionByWeek(days, 2);
    // The most recent week should have avg of 80
    const lastWeek = result[result.length - 1];
    expect(lastWeek.avg).toBe(80);
  });

  it('each entry has weekLabel and avg', () => {
    const days = new Map<string, ActivityDay>();
    const result = computeRetentionByWeek(days, 3);
    for (const week of result) {
      expect(week).toHaveProperty('weekLabel');
      expect(week).toHaveProperty('avg');
      expect(typeof week.weekLabel).toBe('string');
      expect(typeof week.avg).toBe('number');
    }
  });
});
