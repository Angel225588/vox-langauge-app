/**
 * FSRS (Free Spaced Repetition Scheduler) Wrapper
 *
 * Wraps the ts-fsrs library to provide a consistent API for the Vox app.
 * Maps our existing ReviewQuality (1-5) to FSRS Rating (1-4).
 *
 * FSRS is more accurate than SM-2 for optimal review scheduling.
 * Both algorithms coexist — SM-2 continues to work for existing cards,
 * while new cards and opted-in cards use FSRS.
 *
 * Reference: https://github.com/open-spaced-repetition/ts-fsrs
 */

import {
  fsrs,
  createEmptyCard,
  Rating,
  State,
  type FSRS,
  type Card,
  type RecordLog,
} from 'ts-fsrs';
import { ReviewQuality, type SimpleQuality } from '@/types/flashcard';

// ============================================================================
// Types
// ============================================================================

/**
 * FSRS card state — the fields that must be persisted per word.
 * Mirrors ts-fsrs Card but uses plain types for SQLite storage.
 */
export interface FSRSCardState {
  due: string; // ISO date string — when the card is next due
  stability: number; // Memory stability (higher = more stable)
  difficulty: number; // Card difficulty (higher = harder)
  elapsed_days: number; // Days since last review
  scheduled_days: number; // Days until next scheduled review
  reps: number; // Total review count
  lapses: number; // Number of times the card was forgotten
  state: FSRSState; // Current learning state
  last_review: string | null; // ISO date of last review
}

/**
 * FSRS learning states (mirrors ts-fsrs State enum)
 */
export enum FSRSState {
  New = 0,
  Learning = 1,
  Review = 2,
  Relearning = 3,
}

/**
 * Result from an FSRS review calculation
 */
export interface FSRSReviewResult {
  card: FSRSCardState;
  nextReview: Date;
  interval: number; // Days until next review (for compatibility with SM-2 consumers)
}

// ============================================================================
// Singleton FSRS Instance
// ============================================================================

let _fsrsInstance: FSRS | null = null;

/**
 * Get or create the FSRS scheduler instance.
 * Uses default parameters tuned for language learning.
 */
function getFSRS(): FSRS {
  if (!_fsrsInstance) {
    _fsrsInstance = fsrs({
      request_retention: 0.9, // Target 90% retention
      maximum_interval: 365, // Cap at 1 year between reviews
      enable_fuzz: true, // Add slight randomness to prevent clustering
    });
  }
  return _fsrsInstance;
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Create initial FSRS state for a new card.
 */
export function initializeFSRS(): FSRSCardState {
  const card = createEmptyCard();
  return cardToState(card);
}

/**
 * Calculate the next review for a card given a quality rating.
 *
 * @param currentState - Current FSRS card state (from DB)
 * @param quality - ReviewQuality (1-5) from existing UI
 * @param reviewDate - When the review happened (defaults to now)
 * @returns Updated card state and scheduling info
 */
export function reviewCard(
  currentState: FSRSCardState,
  quality: ReviewQuality,
  reviewDate?: Date,
): FSRSReviewResult {
  const scheduler = getFSRS();
  const now = reviewDate ?? new Date();

  // Convert our persisted state back to a ts-fsrs Card
  const card = stateToCard(currentState);

  // Map ReviewQuality (1-5) to FSRS Rating (1-4)
  const rating = reviewQualityToRating(quality);

  // Get all scheduling options, pick the one for our rating
  const schedulingCards = scheduler.repeat(card, now);
  const result = schedulingCards[rating];

  const newState = cardToState(result.card);

  return {
    card: newState,
    nextReview: new Date(newState.due),
    interval: newState.scheduled_days,
  };
}

/**
 * Get scheduling previews for all possible ratings.
 * Useful for showing the user what each button would do.
 *
 * @param currentState - Current FSRS card state
 * @returns Map of Rating -> next review date
 */
export function getSchedulingPreview(
  currentState: FSRSCardState,
): Record<'again' | 'hard' | 'good' | 'easy', { interval: number; due: Date }> {
  const scheduler = getFSRS();
  const now = new Date();
  const card = stateToCard(currentState);
  const schedulingCards = scheduler.repeat(card, now);

  return {
    again: {
      interval: schedulingCards[Rating.Again].card.scheduled_days,
      due: schedulingCards[Rating.Again].card.due,
    },
    hard: {
      interval: schedulingCards[Rating.Hard].card.scheduled_days,
      due: schedulingCards[Rating.Hard].card.due,
    },
    good: {
      interval: schedulingCards[Rating.Good].card.scheduled_days,
      due: schedulingCards[Rating.Good].card.due,
    },
    easy: {
      interval: schedulingCards[Rating.Easy].card.scheduled_days,
      due: schedulingCards[Rating.Easy].card.due,
    },
  };
}

/**
 * Check if a card is due for review.
 */
export function isDueForReview(state: FSRSCardState): boolean {
  const now = new Date();
  const due = new Date(state.due);
  return due <= now;
}

// ============================================================================
// Quality Mapping
// ============================================================================

/**
 * Map our ReviewQuality (1-5) to FSRS Rating (1-4).
 *
 * ReviewQuality | FSRS Rating | Meaning
 * -------------|-------------|--------
 * 1 (FORGOT)   | Again (1)   | Complete failure
 * 2 (HARD)     | Hard (2)    | Recalled with significant difficulty
 * 3 (GOOD)     | Good (3)    | Recalled with some effort
 * 4 (EASY)     | Good (3)    | Recalled smoothly — maps to Good not Easy
 * 5 (PERFECT)  | Easy (4)    | Instant, effortless recall
 *
 * Note: ReviewQuality 4 maps to Good (not Easy) because FSRS's "Easy"
 * means effortless instant recall, which better matches our "PERFECT" (5).
 */
export function reviewQualityToRating(quality: ReviewQuality): Rating {
  switch (quality) {
    case ReviewQuality.FORGOT:
      return Rating.Again;
    case ReviewQuality.HARD:
      return Rating.Hard;
    case ReviewQuality.GOOD:
      return Rating.Good;
    case ReviewQuality.EASY:
      return Rating.Good; // EASY (4) -> Good, not FSRS Easy
    case ReviewQuality.PERFECT:
      return Rating.Easy;
    default:
      return Rating.Good;
  }
}

/**
 * Map SimpleQuality (3-button UI) to FSRS Rating.
 */
export function simpleQualityToRating(quality: SimpleQuality): Rating {
  switch (quality) {
    case 'forgot':
      return Rating.Again;
    case 'remembered':
      return Rating.Good;
    case 'easy':
      return Rating.Easy;
  }
}

// ============================================================================
// Conversion Helpers
// ============================================================================

/**
 * Convert a ts-fsrs Card to our serializable FSRSCardState.
 */
function cardToState(card: Card): FSRSCardState {
  return {
    due: card.due instanceof Date ? card.due.toISOString() : String(card.due),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state as number as FSRSState,
    last_review: card.last_review
      ? card.last_review instanceof Date
        ? card.last_review.toISOString()
        : String(card.last_review)
      : null,
  };
}

/**
 * Convert our FSRSCardState back to a ts-fsrs Card for calculations.
 */
function stateToCard(state: FSRSCardState): Card {
  return {
    due: new Date(state.due),
    stability: state.stability,
    difficulty: state.difficulty,
    elapsed_days: state.elapsed_days,
    scheduled_days: state.scheduled_days,
    reps: state.reps,
    lapses: state.lapses,
    state: state.state as number as State,
    last_review: state.last_review ? new Date(state.last_review) : undefined,
  } as Card;
}
