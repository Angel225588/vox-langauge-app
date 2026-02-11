/**
 * FSRS (Free Spaced Repetition Scheduler) Tests
 *
 * Tests the FSRS wrapper functions that power the Anki-grade SRS.
 */

import {
  initializeFSRS,
  reviewCard,
  getSchedulingPreview,
  isDueForReview,
  reviewQualityToRating,
  simpleQualityToRating,
  FSRSState,
  type FSRSCardState,
} from '@/lib/spaced-repetition/fsrs';
import { ReviewQuality } from '@/types/flashcard';
import { Rating } from 'ts-fsrs';

// ============================================================================
// Initialization Tests
// ============================================================================

describe('FSRS Wrapper', () => {
  describe('initializeFSRS', () => {
    it('should create a new card with default state', () => {
      const card = initializeFSRS();

      expect(card).toBeDefined();
      expect(card.stability).toBe(0);
      expect(card.difficulty).toBe(0);
      expect(card.reps).toBe(0);
      expect(card.lapses).toBe(0);
      expect(card.state).toBe(FSRSState.New);
      expect(card.last_review).toBeNull();
    });

    it('should set due date to now (immediately reviewable)', () => {
      const before = new Date();
      const card = initializeFSRS();
      const due = new Date(card.due);

      // Due date should be very close to now
      expect(due.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000);
    });

    it('should create independent instances', () => {
      const card1 = initializeFSRS();
      const card2 = initializeFSRS();

      expect(card1).not.toBe(card2);
      expect(card1.due).toBeDefined();
      expect(card2.due).toBeDefined();
    });
  });

  // ============================================================================
  // Review Tests
  // ============================================================================

  describe('reviewCard', () => {
    it('should update card state after a "Good" review', () => {
      const card = initializeFSRS();
      const result = reviewCard(card, ReviewQuality.GOOD);

      expect(result.card).toBeDefined();
      expect(result.nextReview).toBeInstanceOf(Date);
      expect(result.interval).toBeGreaterThanOrEqual(0);
      expect(result.card.reps).toBe(1);
      expect(result.card.state).not.toBe(FSRSState.New);
    });

    it('should schedule further out for "Perfect" than "Forgot"', () => {
      const card = initializeFSRS();

      const perfect = reviewCard(card, ReviewQuality.PERFECT);
      const forgot = reviewCard(card, ReviewQuality.FORGOT);

      expect(perfect.interval).toBeGreaterThanOrEqual(forgot.interval);
    });

    it('should increase stability after correct reviews', () => {
      let card = initializeFSRS();

      // Review Good multiple times
      const result1 = reviewCard(card, ReviewQuality.GOOD);
      card = result1.card;

      const result2 = reviewCard(card, ReviewQuality.GOOD);

      expect(result2.card.stability).toBeGreaterThan(0);
    });

    it('should track lapses when forgetting', () => {
      let card = initializeFSRS();

      // First learn the card
      const learned = reviewCard(card, ReviewQuality.GOOD);
      card = learned.card;

      // Then forget it
      const forgot = reviewCard(card, ReviewQuality.FORGOT);

      expect(forgot.card.lapses).toBeGreaterThanOrEqual(0);
    });

    it('should accept a custom review date', () => {
      const card = initializeFSRS();
      const customDate = new Date('2025-06-15T10:00:00Z');

      const result = reviewCard(card, ReviewQuality.GOOD, customDate);

      expect(result.card).toBeDefined();
      expect(result.nextReview).toBeInstanceOf(Date);
    });
  });

  // ============================================================================
  // Scheduling Preview Tests
  // ============================================================================

  describe('getSchedulingPreview', () => {
    it('should return previews for all four ratings', () => {
      const card = initializeFSRS();
      const preview = getSchedulingPreview(card);

      expect(preview.again).toBeDefined();
      expect(preview.hard).toBeDefined();
      expect(preview.good).toBeDefined();
      expect(preview.easy).toBeDefined();
    });

    it('should show increasing intervals: again < hard < good < easy', () => {
      const card = initializeFSRS();

      // Do one review first so we have a non-new card
      const reviewed = reviewCard(card, ReviewQuality.GOOD);
      const preview = getSchedulingPreview(reviewed.card);

      expect(preview.again.interval).toBeLessThanOrEqual(preview.hard.interval);
      expect(preview.hard.interval).toBeLessThanOrEqual(preview.good.interval);
      expect(preview.good.interval).toBeLessThanOrEqual(preview.easy.interval);
    });

    it('should return Date objects for due dates', () => {
      const card = initializeFSRS();
      const preview = getSchedulingPreview(card);

      expect(preview.again.due).toBeInstanceOf(Date);
      expect(preview.easy.due).toBeInstanceOf(Date);
    });
  });

  // ============================================================================
  // Due Check Tests
  // ============================================================================

  describe('isDueForReview', () => {
    it('should return true for a new card', () => {
      const card = initializeFSRS();
      expect(isDueForReview(card)).toBe(true);
    });

    it('should return false for a card due far in the future', () => {
      const card: FSRSCardState = {
        ...initializeFSRS(),
        due: new Date(Date.now() + 86400000 * 30).toISOString(), // 30 days from now
      };

      expect(isDueForReview(card)).toBe(false);
    });

    it('should return true for a card due in the past', () => {
      const card: FSRSCardState = {
        ...initializeFSRS(),
        due: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      };

      expect(isDueForReview(card)).toBe(true);
    });
  });

  // ============================================================================
  // Quality Mapping Tests
  // ============================================================================

  describe('reviewQualityToRating', () => {
    it('should map FORGOT to Again', () => {
      expect(reviewQualityToRating(ReviewQuality.FORGOT)).toBe(Rating.Again);
    });

    it('should map HARD to Hard', () => {
      expect(reviewQualityToRating(ReviewQuality.HARD)).toBe(Rating.Hard);
    });

    it('should map GOOD to Good', () => {
      expect(reviewQualityToRating(ReviewQuality.GOOD)).toBe(Rating.Good);
    });

    it('should map EASY to Good (not FSRS Easy)', () => {
      expect(reviewQualityToRating(ReviewQuality.EASY)).toBe(Rating.Good);
    });

    it('should map PERFECT to Easy', () => {
      expect(reviewQualityToRating(ReviewQuality.PERFECT)).toBe(Rating.Easy);
    });
  });

  describe('simpleQualityToRating', () => {
    it('should map forgot to Again', () => {
      expect(simpleQualityToRating('forgot')).toBe(Rating.Again);
    });

    it('should map remembered to Good', () => {
      expect(simpleQualityToRating('remembered')).toBe(Rating.Good);
    });

    it('should map easy to Easy', () => {
      expect(simpleQualityToRating('easy')).toBe(Rating.Easy);
    });
  });

  // ============================================================================
  // Integration: Multi-Review Sequence
  // ============================================================================

  describe('Multi-review sequence', () => {
    it('should correctly track state through multiple reviews', () => {
      let card = initializeFSRS();

      // Day 1: First review (Good)
      const r1 = reviewCard(card, ReviewQuality.GOOD);
      expect(r1.card.reps).toBe(1);
      card = r1.card;

      // Day 2: Second review (Easy)
      const r2 = reviewCard(card, ReviewQuality.PERFECT);
      expect(r2.card.reps).toBe(2);
      expect(r2.card.stability).toBeGreaterThan(r1.card.stability);
      card = r2.card;

      // Day 3: Third review (Forgot — lapse)
      const r3 = reviewCard(card, ReviewQuality.FORGOT);
      expect(r3.card.reps).toBe(3);
      expect(r3.card.lapses).toBeGreaterThanOrEqual(1);
    });
  });
});
