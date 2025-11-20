/**
 * SM-2 Spaced Repetition Algorithm Implementation
 *
 * The SM-2 algorithm is used to calculate optimal review intervals for flashcards.
 * Reference: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 *
 * How it works:
 * 1. Each card has an ease factor (EF), interval, and repetition count
 * 2. After each review, user rates quality (0-5)
 * 3. Algorithm calculates next review date based on quality
 * 4. Higher quality = longer interval before next review
 * 5. Lower quality = reset interval to 1 day
 */

import { ReviewQuality, SimpleQuality } from '@/types/flashcard';

/**
 * SM-2 calculation result
 */
export interface SM2Result {
  easeFactor: number; // New ease factor (min 1.3)
  interval: number; // Days until next review
  repetitions: number; // Number of successful repetitions
  nextReview: Date; // Calculated next review date
}

/**
 * Input for SM-2 calculation
 */
export interface SM2Input {
  quality: ReviewQuality; // Quality rating (1-5)
  easeFactor: number; // Current ease factor (default 2.5)
  interval: number; // Current interval in days (default 0)
  repetitions: number; // Current repetition count (default 0)
}

/**
 * Default values for new flashcards
 */
export const SM2_DEFAULTS = {
  EASE_FACTOR: 2.5,
  MIN_EASE_FACTOR: 1.3,
  INTERVAL: 0,
  REPETITIONS: 0,
};

/**
 * Calculate next review using SM-2 algorithm
 *
 * @param input - Current SM-2 state and quality rating
 * @returns New SM-2 state with next review date
 */
export function calculateSM2(input: SM2Input): SM2Result {
  const { quality, easeFactor, interval, repetitions } = input;

  let newEaseFactor = easeFactor;
  let newInterval = interval;
  let newRepetitions = repetitions;

  // Calculate new ease factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  newEaseFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Ensure ease factor doesn't go below minimum
  if (newEaseFactor < SM2_DEFAULTS.MIN_EASE_FACTOR) {
    newEaseFactor = SM2_DEFAULTS.MIN_EASE_FACTOR;
  }

  // Calculate new interval based on quality
  if (quality < 3) {
    // Quality < 3: Forgot or hard - reset to beginning
    newRepetitions = 0;
    newInterval = 1; // Review again tomorrow
  } else {
    // Quality >= 3: Good, Easy, or Perfect
    if (repetitions === 0) {
      newInterval = 1; // First successful review - review tomorrow
    } else if (repetitions === 1) {
      newInterval = 6; // Second successful review - review in 6 days
    } else {
      // Subsequent reviews: multiply previous interval by ease factor
      newInterval = Math.round(interval * newEaseFactor);
    }
    newRepetitions += 1;
  }

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);
  nextReview.setHours(0, 0, 0, 0); // Set to start of day

  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReview,
  };
}

/**
 * Convert simplified quality to ReviewQuality enum
 * Used for UI simplification (3 buttons instead of 5)
 *
 * @param quality - Simple quality rating
 * @returns ReviewQuality enum value
 */
export function simpleToReviewQuality(quality: SimpleQuality): ReviewQuality {
  switch (quality) {
    case 'forgot':
      return ReviewQuality.FORGOT; // 1 - Complete blackout
    case 'remembered':
      return ReviewQuality.GOOD; // 3 - Correct with difficulty
    case 'easy':
      return ReviewQuality.PERFECT; // 5 - Perfect response
  }
}

/**
 * Check if a flashcard is due for review
 *
 * @param nextReview - Next scheduled review date (ISO string or Date)
 * @returns true if card is due for review
 */
export function isDueForReview(nextReview: string | Date): boolean {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Compare dates only, ignore time

  const reviewDate =
    typeof nextReview === 'string' ? new Date(nextReview) : nextReview;
  reviewDate.setHours(0, 0, 0, 0);

  return reviewDate <= now;
}

/**
 * Get number of days until next review
 *
 * @param nextReview - Next scheduled review date
 * @returns Number of days (can be negative if overdue)
 */
export function getDaysUntilReview(nextReview: string | Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const reviewDate =
    typeof nextReview === 'string' ? new Date(nextReview) : nextReview;
  reviewDate.setHours(0, 0, 0, 0);

  const diffMs = reviewDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Initialize SM-2 data for a new flashcard
 *
 * @returns Initial SM-2 state
 */
export function initializeSM2(): SM2Result {
  return {
    easeFactor: SM2_DEFAULTS.EASE_FACTOR,
    interval: SM2_DEFAULTS.INTERVAL,
    repetitions: SM2_DEFAULTS.REPETITIONS,
    nextReview: new Date(), // Due immediately for new cards
  };
}
