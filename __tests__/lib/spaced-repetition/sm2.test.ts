/**
 * SM-2 Spaced Repetition Algorithm Tests
 *
 * Comprehensive test suite covering ease factor calculations, interval progression,
 * quality ratings, edge cases, and utility functions.
 * Quality bar: lib/word-bank/__tests__/priority.test.ts (43 tests)
 */

import {
  calculateSM2,
  simpleToReviewQuality,
  isDueForReview,
  getDaysUntilReview,
  initializeSM2,
  SM2_DEFAULTS,
  SM2Input,
  SM2Result,
} from '@/lib/spaced-repetition/sm2';
import { ReviewQuality, SimpleQuality } from '@/types/flashcard';

// ============================================================================
// Test Helpers
// ============================================================================

function createInput(overrides: Partial<SM2Input> = {}): SM2Input {
  return {
    quality: ReviewQuality.GOOD,
    easeFactor: SM2_DEFAULTS.EASE_FACTOR,
    interval: SM2_DEFAULTS.INTERVAL,
    repetitions: SM2_DEFAULTS.REPETITIONS,
    ...overrides,
  };
}

function getDaysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
}

// ============================================================================
// Ease Factor Calculation Tests
// ============================================================================

describe('SM-2 Algorithm', () => {
  describe('calculateSM2 - Ease Factor', () => {
    it('should increase ease factor for perfect quality (5)', () => {
      const input = createInput({ quality: ReviewQuality.PERFECT });
      const result = calculateSM2(input);

      // EF' = 2.5 + (0.1 - (5-5) * (0.08 + (5-5) * 0.02)) = 2.5 + 0.1 = 2.6
      expect(result.easeFactor).toBe(2.6);
    });

    it('should keep ease factor roughly the same for easy quality (4)', () => {
      const input = createInput({ quality: ReviewQuality.EASY });
      const result = calculateSM2(input);

      // EF' = 2.5 + (0.1 - (5-4) * (0.08 + (5-4) * 0.02)) = 2.5 + 0.1 - 0.1 = 2.5
      expect(result.easeFactor).toBe(2.5);
    });

    it('should decrease ease factor for good quality (3)', () => {
      const input = createInput({ quality: ReviewQuality.GOOD });
      const result = calculateSM2(input);

      // EF' = 2.5 + (0.1 - (5-3) * (0.08 + (5-3) * 0.02)) = 2.5 + 0.1 - 0.24 = 2.36
      expect(result.easeFactor).toBeCloseTo(2.36, 2);
    });

    it('should decrease ease factor significantly for hard quality (2)', () => {
      const input = createInput({ quality: ReviewQuality.HARD });
      const result = calculateSM2(input);

      // EF' = 2.5 + (0.1 - (5-2) * (0.08 + (5-2) * 0.02)) = 2.5 + 0.1 - 0.42 = 2.18
      expect(result.easeFactor).toBeCloseTo(2.18, 2);
    });

    it('should decrease ease factor dramatically for forgot quality (1)', () => {
      const input = createInput({ quality: ReviewQuality.FORGOT });
      const result = calculateSM2(input);

      // EF' = 2.5 + (0.1 - (5-1) * (0.08 + (5-1) * 0.02)) = 2.5 + 0.1 - 0.64 = 1.96
      expect(result.easeFactor).toBeCloseTo(1.96, 2);
    });

    it('should never go below minimum ease factor (1.3)', () => {
      const input = createInput({
        quality: ReviewQuality.FORGOT,
        easeFactor: SM2_DEFAULTS.MIN_EASE_FACTOR,
      });
      const result = calculateSM2(input);

      expect(result.easeFactor).toBe(SM2_DEFAULTS.MIN_EASE_FACTOR);
    });

    it('should clamp to minimum when calculation would go below 1.3', () => {
      // Start with low ease factor and low quality to force below minimum
      const input = createInput({
        quality: ReviewQuality.FORGOT,
        easeFactor: 1.4,
      });
      const result = calculateSM2(input);

      // 1.4 + (0.1 - 0.64) = 1.4 - 0.54 = 0.86 -> clamped to 1.3
      expect(result.easeFactor).toBe(SM2_DEFAULTS.MIN_EASE_FACTOR);
    });
  });

  // ============================================================================
  // Interval Progression Tests
  // ============================================================================

  describe('calculateSM2 - Interval Progression', () => {
    it('should set interval to 1 day on first successful review (rep 0)', () => {
      const input = createInput({
        quality: ReviewQuality.GOOD,
        repetitions: 0,
        interval: 0,
      });
      const result = calculateSM2(input);

      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(1);
    });

    it('should set interval to 6 days on second successful review (rep 1)', () => {
      const input = createInput({
        quality: ReviewQuality.GOOD,
        repetitions: 1,
        interval: 1,
      });
      const result = calculateSM2(input);

      expect(result.interval).toBe(6);
      expect(result.repetitions).toBe(2);
    });

    it('should multiply interval by ease factor on subsequent reviews (rep 2+)', () => {
      const input = createInput({
        quality: ReviewQuality.EASY, // EF stays 2.5
        repetitions: 2,
        interval: 6,
        easeFactor: 2.5,
      });
      const result = calculateSM2(input);

      // interval = round(6 * 2.5) = 15
      expect(result.interval).toBe(15);
      expect(result.repetitions).toBe(3);
    });

    it('should grow intervals exponentially with repeated success', () => {
      let state = {
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
      };

      // Review 1: 0 -> 1 day
      let result = calculateSM2({
        ...state,
        quality: ReviewQuality.EASY,
      });
      expect(result.interval).toBe(1);
      state = {
        easeFactor: result.easeFactor,
        interval: result.interval,
        repetitions: result.repetitions,
      };

      // Review 2: 1 -> 6 days
      result = calculateSM2({
        ...state,
        quality: ReviewQuality.EASY,
      });
      expect(result.interval).toBe(6);
      state = {
        easeFactor: result.easeFactor,
        interval: result.interval,
        repetitions: result.repetitions,
      };

      // Review 3: 6 * 2.5 = 15 days
      result = calculateSM2({
        ...state,
        quality: ReviewQuality.EASY,
      });
      expect(result.interval).toBe(15);

      // Review 4 should be even longer
      state = {
        easeFactor: result.easeFactor,
        interval: result.interval,
        repetitions: result.repetitions,
      };
      result = calculateSM2({
        ...state,
        quality: ReviewQuality.EASY,
      });
      expect(result.interval).toBeGreaterThan(15);
    });

    it('should reset interval to 1 when quality < 3', () => {
      const input = createInput({
        quality: ReviewQuality.HARD,
        repetitions: 5,
        interval: 30,
      });
      const result = calculateSM2(input);

      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(0);
    });

    it('should reset repetitions to 0 when quality < 3', () => {
      const input = createInput({
        quality: ReviewQuality.FORGOT,
        repetitions: 10,
        interval: 90,
      });
      const result = calculateSM2(input);

      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
    });
  });

  // ============================================================================
  // Quality Rating Effects Tests
  // ============================================================================

  describe('calculateSM2 - Quality Rating Effects', () => {
    it('should handle all valid quality ratings (1-5)', () => {
      const qualities = [
        ReviewQuality.FORGOT,
        ReviewQuality.HARD,
        ReviewQuality.GOOD,
        ReviewQuality.EASY,
        ReviewQuality.PERFECT,
      ];

      qualities.forEach((quality) => {
        const input = createInput({ quality });
        const result = calculateSM2(input);

        expect(result.easeFactor).toBeGreaterThanOrEqual(SM2_DEFAULTS.MIN_EASE_FACTOR);
        expect(result.interval).toBeGreaterThanOrEqual(1);
        expect(result.repetitions).toBeGreaterThanOrEqual(0);
        expect(result.nextReview).toBeInstanceOf(Date);
      });
    });

    it('should produce higher ease factor for higher quality', () => {
      const resultGood = calculateSM2(createInput({ quality: ReviewQuality.GOOD }));
      const resultEasy = calculateSM2(createInput({ quality: ReviewQuality.EASY }));
      const resultPerfect = calculateSM2(createInput({ quality: ReviewQuality.PERFECT }));

      expect(resultPerfect.easeFactor).toBeGreaterThan(resultEasy.easeFactor);
      expect(resultEasy.easeFactor).toBeGreaterThan(resultGood.easeFactor);
    });

    it('should produce longer interval with higher ease factor', () => {
      const highEF = calculateSM2(
        createInput({ quality: ReviewQuality.PERFECT, repetitions: 2, interval: 6, easeFactor: 3.0 })
      );
      const lowEF = calculateSM2(
        createInput({ quality: ReviewQuality.PERFECT, repetitions: 2, interval: 6, easeFactor: 1.5 })
      );

      expect(highEF.interval).toBeGreaterThan(lowEF.interval);
    });
  });

  // ============================================================================
  // Edge Cases Tests
  // ============================================================================

  describe('calculateSM2 - Edge Cases', () => {
    it('should handle ease factor at exactly the minimum (1.3)', () => {
      const input = createInput({
        quality: ReviewQuality.GOOD,
        easeFactor: SM2_DEFAULTS.MIN_EASE_FACTOR,
      });
      const result = calculateSM2(input);

      // EF can go below 1.3 in calculation but clamps to 1.3
      expect(result.easeFactor).toBeGreaterThanOrEqual(SM2_DEFAULTS.MIN_EASE_FACTOR);
    });

    it('should handle very high ease factor', () => {
      const input = createInput({
        quality: ReviewQuality.PERFECT,
        easeFactor: 5.0,
        repetitions: 2,
        interval: 6,
      });
      const result = calculateSM2(input);

      // Should still produce valid results
      expect(result.easeFactor).toBe(5.1);
      expect(result.interval).toBe(Math.round(6 * 5.1));
    });

    it('should handle very large intervals', () => {
      const input = createInput({
        quality: ReviewQuality.PERFECT,
        easeFactor: 2.5,
        repetitions: 20,
        interval: 365,
      });
      const result = calculateSM2(input);

      expect(result.interval).toBeGreaterThan(365);
    });

    it('should produce a next review date in the future', () => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const input = createInput({
        quality: ReviewQuality.GOOD,
        repetitions: 0,
      });
      const result = calculateSM2(input);

      expect(result.nextReview.getTime()).toBeGreaterThanOrEqual(now.getTime());
    });

    it('should set next review time to start of day (midnight)', () => {
      const input = createInput({ quality: ReviewQuality.GOOD });
      const result = calculateSM2(input);

      expect(result.nextReview.getHours()).toBe(0);
      expect(result.nextReview.getMinutes()).toBe(0);
      expect(result.nextReview.getSeconds()).toBe(0);
      expect(result.nextReview.getMilliseconds()).toBe(0);
    });
  });

  // ============================================================================
  // Ease Hell Scenario Tests
  // ============================================================================

  describe('calculateSM2 - Ease Hell Scenario', () => {
    it('should bottom out at minimum ease factor after repeated failures', () => {
      let state = {
        easeFactor: SM2_DEFAULTS.EASE_FACTOR,
        interval: 6,
        repetitions: 3,
      };

      // Simulate 10 consecutive failures
      for (let i = 0; i < 10; i++) {
        const result = calculateSM2({
          ...state,
          quality: ReviewQuality.FORGOT,
        });
        state = {
          easeFactor: result.easeFactor,
          interval: result.interval,
          repetitions: result.repetitions,
        };
      }

      expect(state.easeFactor).toBe(SM2_DEFAULTS.MIN_EASE_FACTOR);
      expect(state.interval).toBe(1);
      expect(state.repetitions).toBe(0);
    });

    it('should recover from ease hell with repeated perfect scores', () => {
      let state = {
        easeFactor: SM2_DEFAULTS.MIN_EASE_FACTOR,
        interval: 1,
        repetitions: 0,
      };

      // Simulate 10 consecutive perfect reviews
      for (let i = 0; i < 10; i++) {
        const result = calculateSM2({
          ...state,
          quality: ReviewQuality.PERFECT,
        });
        state = {
          easeFactor: result.easeFactor,
          interval: result.interval,
          repetitions: result.repetitions,
        };
      }

      // After 10 perfect reviews, ease factor should have increased from 1.3
      expect(state.easeFactor).toBeGreaterThan(SM2_DEFAULTS.MIN_EASE_FACTOR);
      // Interval should be substantial
      expect(state.interval).toBeGreaterThan(6);
    });

    it('should have slow recovery from minimum ease factor', () => {
      // Starting from ease hell (1.3), each perfect review adds 0.1
      // After 5 perfect reviews: 1.3 + (5 * 0.1) = 1.8
      let ef = SM2_DEFAULTS.MIN_EASE_FACTOR;
      for (let i = 0; i < 5; i++) {
        const result = calculateSM2(
          createInput({
            quality: ReviewQuality.PERFECT,
            easeFactor: ef,
            repetitions: 2,
            interval: 6,
          })
        );
        ef = result.easeFactor;
      }

      // Should be around 1.8 (1.3 + 5 * 0.1)
      expect(ef).toBeCloseTo(1.8, 1);
    });
  });

  // ============================================================================
  // simpleToReviewQuality Tests
  // ============================================================================

  describe('simpleToReviewQuality', () => {
    it('should map "forgot" to ReviewQuality.FORGOT (1)', () => {
      expect(simpleToReviewQuality('forgot')).toBe(ReviewQuality.FORGOT);
    });

    it('should map "remembered" to ReviewQuality.GOOD (3)', () => {
      expect(simpleToReviewQuality('remembered')).toBe(ReviewQuality.GOOD);
    });

    it('should map "easy" to ReviewQuality.PERFECT (5)', () => {
      expect(simpleToReviewQuality('easy')).toBe(ReviewQuality.PERFECT);
    });
  });

  // ============================================================================
  // isDueForReview Tests
  // ============================================================================

  describe('isDueForReview', () => {
    it('should return true when review date is today', () => {
      const today = new Date();
      expect(isDueForReview(today)).toBe(true);
    });

    it('should return true when review date is in the past', () => {
      const pastDate = getDaysAgo(5);
      expect(isDueForReview(pastDate)).toBe(true);
    });

    it('should return false when review date is in the future', () => {
      const futureDate = getDaysFromNow(5);
      expect(isDueForReview(futureDate)).toBe(false);
    });

    it('should accept ISO string dates', () => {
      const pastDate = getDaysAgo(1).toISOString();
      expect(isDueForReview(pastDate)).toBe(true);

      const futureDate = getDaysFromNow(3).toISOString();
      expect(isDueForReview(futureDate)).toBe(false);
    });

    it('should compare dates only (ignore time of day)', () => {
      const todayMidnight = new Date();
      todayMidnight.setHours(0, 0, 0, 0);

      const todayEvening = new Date();
      todayEvening.setHours(23, 59, 59, 999);

      // Both should be treated as "today" and be due
      expect(isDueForReview(todayMidnight)).toBe(true);
      expect(isDueForReview(todayEvening)).toBe(true);
    });
  });

  // ============================================================================
  // getDaysUntilReview Tests
  // ============================================================================

  describe('getDaysUntilReview', () => {
    it('should return 0 for today', () => {
      const today = new Date();
      expect(getDaysUntilReview(today)).toBe(0);
    });

    it('should return negative for overdue reviews', () => {
      const pastDate = getDaysAgo(3);
      expect(getDaysUntilReview(pastDate)).toBeLessThan(0);
    });

    it('should return positive for future reviews', () => {
      const futureDate = getDaysFromNow(5);
      expect(getDaysUntilReview(futureDate)).toBeGreaterThan(0);
    });

    it('should accept ISO string dates', () => {
      const futureISO = getDaysFromNow(7).toISOString();
      const days = getDaysUntilReview(futureISO);
      expect(days).toBeGreaterThanOrEqual(6);
      expect(days).toBeLessThanOrEqual(7);
    });
  });

  // ============================================================================
  // initializeSM2 Tests
  // ============================================================================

  describe('initializeSM2', () => {
    it('should return default ease factor (2.5)', () => {
      const result = initializeSM2();
      expect(result.easeFactor).toBe(SM2_DEFAULTS.EASE_FACTOR);
    });

    it('should return interval of 0', () => {
      const result = initializeSM2();
      expect(result.interval).toBe(SM2_DEFAULTS.INTERVAL);
    });

    it('should return 0 repetitions', () => {
      const result = initializeSM2();
      expect(result.repetitions).toBe(SM2_DEFAULTS.REPETITIONS);
    });

    it('should return a next review date of today (due immediately)', () => {
      const result = initializeSM2();
      const today = new Date();

      expect(result.nextReview.getFullYear()).toBe(today.getFullYear());
      expect(result.nextReview.getMonth()).toBe(today.getMonth());
      expect(result.nextReview.getDate()).toBe(today.getDate());
    });
  });

  // ============================================================================
  // SM2_DEFAULTS Tests
  // ============================================================================

  describe('SM2_DEFAULTS', () => {
    it('should have standard default values', () => {
      expect(SM2_DEFAULTS.EASE_FACTOR).toBe(2.5);
      expect(SM2_DEFAULTS.MIN_EASE_FACTOR).toBe(1.3);
      expect(SM2_DEFAULTS.INTERVAL).toBe(0);
      expect(SM2_DEFAULTS.REPETITIONS).toBe(0);
    });
  });
});
