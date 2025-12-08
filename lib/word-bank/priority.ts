/**
 * Word Bank Priority Algorithm
 *
 * Calculates priority scores for words to determine which need practice most.
 * Priority formula: (milestoneUrgency × 0.3) + (weaknessScore × 0.4) +
 *                   (recencyPenalty × 0.2) + (cefrMatch × 0.1)
 *
 * Output: Priority score from 0-10 (normalized)
 */

import type {
  BankWord,
  CEFRLevel,
  PriorityFactors,
  PriorityResult,
  PriorityWeights,
} from './types';

// ============================================================================
// Constants
// ============================================================================

/**
 * Default weights for priority calculation
 * These determine the relative importance of each factor
 */
export const PRIORITY_WEIGHTS: PriorityWeights = {
  milestoneUrgency: 0.3, // 30% - Importance for user's current goals
  weaknessScore: 0.4, // 40% - How often user gets this wrong (highest weight)
  recencyPenalty: 0.2, // 20% - How long since last review
  cefrMatch: 0.1, // 10% - Match with user's current level
};

/**
 * CEFR level hierarchy for calculating level differences
 */
const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/**
 * Default milestone urgency when no milestone is specified
 */
const DEFAULT_MILESTONE_URGENCY = 50;

// ============================================================================
// Main Priority Calculation
// ============================================================================

/**
 * Calculate priority score for a word based on multiple factors
 *
 * @param factors - Individual factor scores (each 0-100)
 * @param weights - Optional custom weights (defaults to PRIORITY_WEIGHTS)
 * @returns Priority score from 0-10
 *
 * @example
 * ```typescript
 * const priority = calculatePriority({
 *   milestoneUrgency: 80,
 *   weaknessScore: 60,
 *   recencyPenalty: 90,
 *   cefrMatch: 100
 * });
 * // Returns: 7.2 (on 0-10 scale)
 * ```
 */
export function calculatePriority(
  factors: PriorityFactors,
  weights: PriorityWeights = PRIORITY_WEIGHTS
): number {
  // Validate inputs
  validateFactors(factors);
  validateWeights(weights);

  // Calculate weighted sum (result is 0-100)
  const weightedSum =
    factors.milestoneUrgency * weights.milestoneUrgency +
    factors.weaknessScore * weights.weaknessScore +
    factors.recencyPenalty * weights.recencyPenalty +
    factors.cefrMatch * weights.cefrMatch;

  // Normalize to 0-10 scale
  const normalizedScore = weightedSum / 10;

  // Round to 1 decimal place
  return Math.round(normalizedScore * 10) / 10;
}

// ============================================================================
// Factor Calculations
// ============================================================================

/**
 * Calculate weakness score based on correct/incorrect attempts
 *
 * Logic:
 * - If no attempts: return 50 (neutral - needs practice but not urgent)
 * - Formula: (timesIncorrect / totalAttempts) * 100
 * - Higher score = more practice needed
 * - Capped at 0-100
 *
 * @param timesCorrect - Number of correct attempts
 * @param timesIncorrect - Number of incorrect attempts
 * @returns Weakness score (0-100)
 *
 * @example
 * ```typescript
 * calculateWeaknessScore(0, 0);    // Returns: 50 (no data)
 * calculateWeaknessScore(10, 0);   // Returns: 0 (perfect)
 * calculateWeaknessScore(0, 10);   // Returns: 100 (needs practice)
 * calculateWeaknessScore(7, 3);    // Returns: 30 (70% correct)
 * ```
 */
export function calculateWeaknessScore(
  timesCorrect: number,
  timesIncorrect: number
): number {
  // Validate inputs
  if (timesCorrect < 0 || timesIncorrect < 0) {
    throw new Error('Attempt counts cannot be negative');
  }

  const totalAttempts = timesCorrect + timesIncorrect;

  // No attempts yet - return neutral score
  if (totalAttempts === 0) {
    return 50;
  }

  // Calculate error rate as percentage
  const errorRate = (timesIncorrect / totalAttempts) * 100;

  // Ensure result is within bounds
  return Math.min(100, Math.max(0, errorRate));
}

/**
 * Calculate recency penalty based on last review date and interval
 *
 * Logic:
 * - If never reviewed: return 100 (highest priority - needs first review)
 * - If overdue (past next review date): return 100 (urgent)
 * - If recently reviewed: return lower value based on progress through interval
 * - Formula: min(100, (daysSinceReview / interval) * 100)
 *
 * @param lastReviewDate - ISO date string of last review (null if never reviewed)
 * @param interval - Days between reviews (from SM-2 algorithm)
 * @returns Recency penalty score (0-100)
 *
 * @example
 * ```typescript
 * calculateRecencyPenalty(null, 0);              // Returns: 100 (never reviewed)
 * calculateRecencyPenalty('2025-12-01', 7);      // Returns: ~40 (3 days into 7-day interval)
 * calculateRecencyPenalty('2025-11-20', 7);      // Returns: 100 (overdue)
 * ```
 */
export function calculateRecencyPenalty(
  lastReviewDate: string | null,
  interval: number
): number {
  // Validate interval
  if (interval < 0) {
    throw new Error('Interval cannot be negative');
  }

  // Never reviewed - highest priority
  if (!lastReviewDate || interval === 0) {
    return 100;
  }

  try {
    const now = new Date();
    const lastReview = new Date(lastReviewDate);

    // Invalid date
    if (isNaN(lastReview.getTime())) {
      return 100;
    }

    // Calculate days since last review
    const daysSinceReview = Math.floor(
      (now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24)
    );

    // If overdue, return max penalty
    if (daysSinceReview >= interval) {
      return 100;
    }

    // Calculate penalty based on progress through interval
    // More time passed = higher penalty
    const penalty = (daysSinceReview / interval) * 100;

    return Math.min(100, Math.max(0, penalty));
  } catch (error) {
    // If date parsing fails, assume needs review
    return 100;
  }
}

/**
 * Calculate CEFR level match score
 *
 * Logic:
 * - Exact match: 100 (perfect for user's level)
 * - One level away: 75 (still appropriate)
 * - Two levels away: 50 (somewhat appropriate)
 * - Three+ levels away: 25 (less appropriate)
 *
 * @param wordLevel - CEFR level of the word
 * @param userLevel - User's current CEFR level
 * @returns CEFR match score (0-100)
 *
 * @example
 * ```typescript
 * calculateCefrMatch('B1', 'B1');  // Returns: 100 (exact match)
 * calculateCefrMatch('B2', 'B1');  // Returns: 75 (one level up)
 * calculateCefrMatch('A1', 'B1');  // Returns: 50 (two levels down)
 * calculateCefrMatch('C2', 'A2');  // Returns: 25 (four levels up)
 * ```
 */
export function calculateCefrMatch(
  wordLevel: CEFRLevel,
  userLevel: CEFRLevel
): number {
  const wordIndex = CEFR_LEVELS.indexOf(wordLevel);
  const userIndex = CEFR_LEVELS.indexOf(userLevel);

  // Invalid levels
  if (wordIndex === -1 || userIndex === -1) {
    return 50; // Return neutral score
  }

  const levelDifference = Math.abs(wordIndex - userIndex);

  switch (levelDifference) {
    case 0:
      return 100; // Exact match
    case 1:
      return 75; // One level away
    case 2:
      return 50; // Two levels away
    default:
      return 25; // Three or more levels away
  }
}

/**
 * Calculate milestone urgency score
 *
 * Currently returns a default value. In the future, this will calculate
 * urgency based on:
 * - How many of user's milestone words this is
 * - How close the milestone deadline is
 * - How important the milestone is to the user
 *
 * @param milestoneTags - Array of milestone tags for this word
 * @param currentMilestone - User's current active milestone (optional)
 * @returns Milestone urgency score (0-100)
 *
 * @example
 * ```typescript
 * calculateMilestoneUrgency(['travel', 'food'], 'travel');  // Returns: 100 (matches current)
 * calculateMilestoneUrgency(['work'], 'travel');            // Returns: 50 (doesn't match)
 * calculateMilestoneUrgency([], undefined);                 // Returns: 50 (no milestone)
 * ```
 */
export function calculateMilestoneUrgency(
  milestoneTags: string[],
  currentMilestone?: string
): number {
  // No current milestone - return default
  if (!currentMilestone) {
    return DEFAULT_MILESTONE_URGENCY;
  }

  // Check if word is tagged with current milestone
  const isRelevant = milestoneTags.includes(currentMilestone);

  // Relevant to current milestone = high urgency
  // Not relevant = default urgency
  return isRelevant ? 100 : 50;
}

// ============================================================================
// Batch Operations
// ============================================================================

/**
 * Calculate priorities for multiple words
 *
 * @param words - Array of words to calculate priorities for
 * @param userLevel - User's current CEFR level
 * @param currentMilestone - User's current active milestone (optional)
 * @param weights - Optional custom weights
 * @returns Array of priority results with detailed breakdowns
 *
 * @example
 * ```typescript
 * const results = calculatePrioritiesForWords(
 *   words,
 *   'B1',
 *   'travel'
 * );
 * // Returns array of PriorityResult objects
 * ```
 */
export function calculatePrioritiesForWords(
  words: BankWord[],
  userLevel: CEFRLevel,
  currentMilestone?: string,
  weights: PriorityWeights = PRIORITY_WEIGHTS
): PriorityResult[] {
  return words.map((word) => {
    // Calculate individual factors
    const milestoneUrgency = calculateMilestoneUrgency(
      word.milestoneTags,
      currentMilestone
    );
    const weaknessScore = calculateWeaknessScore(
      word.timesCorrect,
      word.timesIncorrect
    );
    const recencyPenalty = calculateRecencyPenalty(
      word.lastReviewDate || null,
      word.interval
    );
    const cefrMatch = calculateCefrMatch(word.cefrLevel, userLevel);

    const factors: PriorityFactors = {
      milestoneUrgency,
      weaknessScore,
      recencyPenalty,
      cefrMatch,
    };

    // Calculate final priority
    const priority = calculatePriority(factors, weights);

    // Calculate individual contributions for breakdown
    const breakdown = {
      milestoneContribution: milestoneUrgency * weights.milestoneUrgency / 10,
      weaknessContribution: weaknessScore * weights.weaknessScore / 10,
      recencyContribution: recencyPenalty * weights.recencyPenalty / 10,
      cefrContribution: cefrMatch * weights.cefrMatch / 10,
    };

    return {
      wordId: word.id,
      priority,
      factors,
      calculatedAt: new Date().toISOString(),
      breakdown,
    };
  });
}

/**
 * Sort words by priority (highest first)
 *
 * @param words - Array of words with priority scores
 * @returns Sorted array (original array is not modified)
 *
 * @example
 * ```typescript
 * const sorted = sortByPriority(words);
 * // Returns words sorted by priority descending (highest first)
 * ```
 */
export function sortByPriority(words: BankWord[]): BankWord[] {
  return [...words].sort((a, b) => b.priority - a.priority);
}

/**
 * Get top N priority words from a collection
 *
 * @param words - Array of words
 * @param count - Number of top priority words to return
 * @returns Top N words sorted by priority
 *
 * @example
 * ```typescript
 * const topWords = getTopPriorityWords(allWords, 10);
 * // Returns 10 highest priority words
 * ```
 */
export function getTopPriorityWords(words: BankWord[], count: number): BankWord[] {
  return sortByPriority(words).slice(0, count);
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate that all factors are within valid range (0-100)
 */
function validateFactors(factors: PriorityFactors): void {
  const { milestoneUrgency, weaknessScore, recencyPenalty, cefrMatch } = factors;

  if (
    milestoneUrgency < 0 ||
    milestoneUrgency > 100 ||
    weaknessScore < 0 ||
    weaknessScore > 100 ||
    recencyPenalty < 0 ||
    recencyPenalty > 100 ||
    cefrMatch < 0 ||
    cefrMatch > 100
  ) {
    throw new Error('All priority factors must be between 0 and 100');
  }
}

/**
 * Validate that weights sum to approximately 1.0
 */
function validateWeights(weights: PriorityWeights): void {
  const sum =
    weights.milestoneUrgency +
    weights.weaknessScore +
    weights.recencyPenalty +
    weights.cefrMatch;

  // Allow small floating point errors
  if (Math.abs(sum - 1.0) > 0.001) {
    throw new Error(
      `Priority weights must sum to 1.0 (got ${sum}). Check PRIORITY_WEIGHTS configuration.`
    );
  }
}
