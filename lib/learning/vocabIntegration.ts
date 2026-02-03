/**
 * Vocabulary Flow Integration
 *
 * Utility functions and types for integrating vocabulary card flows
 * with the SM-2 spaced repetition algorithm and points system.
 *
 * This bridges the gap between:
 * - VocabularyCardFlow (card orchestration)
 * - useSpacedRepetition (SM-2 algorithm)
 * - Points/rewards system
 */

import type { VocabCardResult, VocabCardVariant } from '@/types/vocabulary';
import type { SimpleQuality } from '@/types/flashcard';

// ============================================================================
// POINTS CONFIGURATION
// ============================================================================

/**
 * Base points per card variant
 * Speaking gets most points (hardest), introduction gets least (passive)
 */
export const POINTS_BY_VARIANT: Record<VocabCardVariant, number> = {
  introduction: 5,   // Passive learning
  audioQuiz: 10,     // Recognition
  listening: 15,     // Comprehension + typing
  typing: 12,        // Active recall
  speaking: 20,      // Production (hardest)
};

/**
 * Bonus multipliers
 */
export const BONUS_CONFIG = {
  /** Bonus for 100% accuracy (all cards correct) */
  perfectAccuracy: 0.30, // +30%
  /** Bonus for high accuracy (>=80%) */
  highAccuracy: 0.15,    // +15%
  /** Bonus for fast completion (under 30s average per card) */
  speedBonus: 0.20,      // +20%
  /** Penalty for using hints */
  hintPenalty: 0.10,     // -10% per hint
  /** Bonus for no audio replays (didn't need repetition) */
  noReplayBonus: 0.05,   // +5%
};

// ============================================================================
// QUALITY CALCULATION
// ============================================================================

export interface QualityAnalysis {
  quality: SimpleQuality;
  accuracy: number;         // 0-1
  correctCount: number;
  totalCards: number;
  avgTimePerCard: number;   // ms
  hintsUsed: number;
  totalReplays: number;
}

/**
 * Calculate SM-2 quality rating from vocabulary card results
 *
 * Quality mapping:
 * - 'easy'       = All correct, fast, no hints (perfect recall)
 * - 'remembered' = Most correct (>=60% accuracy)
 * - 'forgot'     = Less than 60% accuracy (needs review)
 */
export function calculateQualityFromResults(results: VocabCardResult[]): QualityAnalysis {
  if (results.length === 0) {
    return {
      quality: 'forgot',
      accuracy: 0,
      correctCount: 0,
      totalCards: 0,
      avgTimePerCard: 0,
      hintsUsed: 0,
      totalReplays: 0,
    };
  }

  const correctCount = results.filter(r => r.correct).length;
  const accuracy = correctCount / results.length;
  const totalTime = results.reduce((sum, r) => sum + r.timeSpent, 0);
  const avgTimePerCard = totalTime / results.length;
  const hintsUsed = results.filter(r => r.hintUsed).length;
  const totalReplays = results.reduce((sum, r) => sum + r.audioReplays, 0);

  // Determine quality
  let quality: SimpleQuality;

  if (accuracy === 1.0 && hintsUsed === 0 && avgTimePerCard < 20000) {
    // Perfect: all correct, no hints, under 20s per card
    quality = 'easy';
  } else if (accuracy >= 0.6) {
    // Most correct - normal progression
    quality = 'remembered';
  } else {
    // Less than 60% - needs review
    quality = 'forgot';
  }

  return {
    quality,
    accuracy,
    correctCount,
    totalCards: results.length,
    avgTimePerCard,
    hintsUsed,
    totalReplays,
  };
}

// ============================================================================
// POINTS CALCULATION
// ============================================================================

export interface PointsBreakdown {
  basePoints: number;
  accuracyBonus: number;
  speedBonus: number;
  hintPenalty: number;
  noReplayBonus: number;
  totalPoints: number;
  multipliers: string[];  // For UI display (e.g., "Perfect!", "Speed Bonus")
}

/**
 * Calculate points earned from vocabulary card results
 *
 * Philosophy: Reward TRIALS, not just perfection
 * - Every card attempted earns base points
 * - Bonuses for accuracy and speed
 * - Small penalty for hints (but still reward the attempt)
 */
export function calculatePointsFromResults(results: VocabCardResult[]): PointsBreakdown {
  if (results.length === 0) {
    return {
      basePoints: 0,
      accuracyBonus: 0,
      speedBonus: 0,
      hintPenalty: 0,
      noReplayBonus: 0,
      totalPoints: 0,
      multipliers: [],
    };
  }

  // Calculate base points from each card
  let basePoints = 0;
  for (const result of results) {
    basePoints += POINTS_BY_VARIANT[result.variant] || 5;
  }

  // Accuracy analysis
  const correctCount = results.filter(r => r.correct).length;
  const accuracy = correctCount / results.length;

  // Time analysis
  const totalTime = results.reduce((sum, r) => sum + r.timeSpent, 0);
  const avgTimePerCard = totalTime / results.length;

  // Hint analysis
  const hintsUsed = results.filter(r => r.hintUsed).length;

  // Replay analysis
  const totalReplays = results.reduce((sum, r) => sum + r.audioReplays, 0);

  // Calculate bonuses/penalties
  const multipliers: string[] = [];

  // Accuracy bonus
  let accuracyBonus = 0;
  if (accuracy === 1.0) {
    accuracyBonus = basePoints * BONUS_CONFIG.perfectAccuracy;
    multipliers.push('Perfect! 🎯');
  } else if (accuracy >= 0.8) {
    accuracyBonus = basePoints * BONUS_CONFIG.highAccuracy;
    multipliers.push('Great accuracy!');
  }

  // Speed bonus (under 30s average per card)
  let speedBonus = 0;
  if (avgTimePerCard < 30000 && accuracy >= 0.8) {
    speedBonus = basePoints * BONUS_CONFIG.speedBonus;
    multipliers.push('Quick learner ⚡');
  }

  // Hint penalty (small - we still reward the attempt)
  const hintPenalty = hintsUsed * basePoints * BONUS_CONFIG.hintPenalty;

  // No replay bonus (understood on first listen)
  let noReplayBonus = 0;
  if (totalReplays === 0 && accuracy >= 0.8) {
    noReplayBonus = basePoints * BONUS_CONFIG.noReplayBonus;
    multipliers.push('First try! 👂');
  }

  // Calculate total
  const totalPoints = Math.max(
    basePoints, // Always at least base points (reward trials)
    Math.round(basePoints + accuracyBonus + speedBonus - hintPenalty + noReplayBonus)
  );

  return {
    basePoints,
    accuracyBonus: Math.round(accuracyBonus),
    speedBonus: Math.round(speedBonus),
    hintPenalty: Math.round(hintPenalty),
    noReplayBonus: Math.round(noReplayBonus),
    totalPoints,
    multipliers,
  };
}

// ============================================================================
// SKILL CURRENCY CALCULATION
// ============================================================================

export type SkillType = 'fluency' | 'comprehension' | 'expression';

export interface SkillReward {
  type: SkillType;
  amount: number;
}

/**
 * Calculate skill currency earned based on card types completed
 */
export function calculateSkillReward(results: VocabCardResult[]): SkillReward | null {
  // Count cards by category
  const speakingCards = results.filter(r => r.variant === 'speaking').length;
  const listeningCards = results.filter(r =>
    r.variant === 'listening' || r.variant === 'audioQuiz'
  ).length;
  const typingCards = results.filter(r => r.variant === 'typing').length;

  // Determine dominant skill practiced
  if (speakingCards >= listeningCards && speakingCards >= typingCards && speakingCards > 0) {
    return {
      type: 'fluency',
      amount: speakingCards * 2, // 2 fluency points per speaking card
    };
  } else if (listeningCards >= typingCards && listeningCards > 0) {
    return {
      type: 'comprehension',
      amount: listeningCards * 1, // 1 comprehension point per listening card
    };
  } else if (typingCards > 0) {
    return {
      type: 'expression',
      amount: typingCards * 1, // 1 expression point per typing card
    };
  }

  return null;
}

// ============================================================================
// FLOW RESULT SUMMARY
// ============================================================================

export interface VocabFlowSummary {
  quality: QualityAnalysis;
  points: PointsBreakdown;
  skillReward: SkillReward | null;
}

/**
 * Generate complete summary from vocabulary flow results
 * Call this when VocabularyCardFlow completes
 */
export function generateFlowSummary(results: VocabCardResult[]): VocabFlowSummary {
  return {
    quality: calculateQualityFromResults(results),
    points: calculatePointsFromResults(results),
    skillReward: calculateSkillReward(results),
  };
}
