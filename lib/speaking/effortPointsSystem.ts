/**
 * Effort-Based Points System
 *
 * Philosophy: The more you TRY, the more you LEARN, the more points you GET.
 *
 * Key Principles:
 * 1. Every attempt earns points (just for trying!)
 * 2. More mistakes = more learning opportunities = bonus points
 * 3. Practicing problem words earns extra points
 * 4. Streaks multiply your earnings
 * 5. Harder content = more points
 *
 * This encourages users to:
 * - Practice often (even when struggling)
 * - Tackle difficult content
 * - Keep coming back daily
 * - Focus on their weak areas
 */

import type {
  EffortPoints,
  PointsConfig,
  HonestFeedback,
  GoalWord,
  Milestone,
} from './speakingFeedbackTypes';

// ============================================================================
// Default Points Configuration
// ============================================================================

export const DEFAULT_POINTS_CONFIG: PointsConfig = {
  // Base points for attempting
  baseAttemptPoints: 10,

  // Points per word you try to say (regardless of accuracy!)
  pointsPerWordAttempted: 2,

  // BONUS points for each mistake (yes, mistakes earn points!)
  // Philosophy: Mistakes = learning opportunities
  pointsPerMistake: 5,

  // Cap on mistake bonus (to prevent gaming)
  maxMistakeBonus: 50,

  // Streak bonus: multiply points by (1 + streak * multiplier)
  streakMultiplier: 0.1, // 10% per day

  // Max streak bonus (100% = double points)
  maxStreakMultiplier: 2.0,

  // Bonus for practicing your focus/problem words
  focusWordPoints: 15,

  // Difficulty multipliers
  difficultyMultipliers: {
    beginner: 1.0,
    intermediate: 1.5,
    advanced: 2.0,
  },
};

// ============================================================================
// Points Calculation
// ============================================================================

/**
 * Calculate effort points for a speaking session
 *
 * @param feedback - The honest feedback from the session
 * @param options - Additional context for calculation
 * @returns Effort points breakdown
 *
 * @example
 * ```ts
 * const points = calculateEffortPoints(feedback, {
 *   currentStreak: 5,
 *   difficulty: 'intermediate',
 *   focusWordsPracticed: ['restaurant', 'necessary'],
 * });
 *
 * console.log(points.totalPoints); // 85
 * console.log(points.breakdown);
 * // "10 base + 40 words + 25 mistakes + 22 streak bonus + 30 focus words = 127 points"
 * ```
 */
export function calculateEffortPoints(
  feedback: HonestFeedback,
  options: {
    currentStreak?: number;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    focusWordsPracticed?: string[];
    problemWordsPracticed?: string[];
    config?: Partial<PointsConfig>;
  } = {}
): EffortPoints {
  const config = { ...DEFAULT_POINTS_CONFIG, ...options.config };
  const {
    currentStreak = 0,
    difficulty = 'intermediate',
    focusWordsPracticed = [],
    problemWordsPracticed = [],
  } = options;

  // ==========================================
  // 1. Base Attempt Points (just for trying!)
  // ==========================================
  const attemptPoints = config.baseAttemptPoints;

  // ==========================================
  // 2. Completion Points (based on words attempted)
  // ==========================================
  const wordsAttempted = feedback.wordsTotal;
  const completionPoints = wordsAttempted * config.pointsPerWordAttempted;

  // ==========================================
  // 3. Mistake Points (BONUS for learning opportunities!)
  // ==========================================
  const mistakeCount = feedback.wordsTotal - feedback.wordsCorrect;
  const rawMistakePoints = mistakeCount * config.pointsPerMistake;
  const mistakePoints = Math.min(rawMistakePoints, config.maxMistakeBonus);

  // ==========================================
  // 4. Streak Bonus
  // ==========================================
  const streakMultiplier = Math.min(
    1 + currentStreak * config.streakMultiplier,
    config.maxStreakMultiplier
  );
  const baseTotal = attemptPoints + completionPoints + mistakePoints;
  const streakBonus = Math.round(baseTotal * (streakMultiplier - 1));

  // ==========================================
  // 5. Focus Word Bonus
  // ==========================================
  const uniqueFocusWords = new Set([
    ...focusWordsPracticed,
    ...problemWordsPracticed,
  ]);
  const focusWordBonus = uniqueFocusWords.size * config.focusWordPoints;

  // ==========================================
  // 6. Difficulty Bonus
  // ==========================================
  const difficultyMultiplier = config.difficultyMultipliers[difficulty];
  const difficultyBonus = Math.round(
    (attemptPoints + completionPoints) * (difficultyMultiplier - 1)
  );

  // ==========================================
  // Total Calculation
  // ==========================================
  const totalPoints = Math.round(
    attemptPoints +
    completionPoints +
    mistakePoints +
    streakBonus +
    focusWordBonus +
    difficultyBonus
  );

  // Build breakdown string
  const breakdownParts: string[] = [];
  breakdownParts.push(`${attemptPoints} (trying)`);
  breakdownParts.push(`${completionPoints} (${wordsAttempted} words)`);
  if (mistakePoints > 0) {
    breakdownParts.push(`${mistakePoints} (${mistakeCount} learning opportunities!)`);
  }
  if (streakBonus > 0) {
    breakdownParts.push(`${streakBonus} (${currentStreak}-day streak)`);
  }
  if (focusWordBonus > 0) {
    breakdownParts.push(`${focusWordBonus} (focus words)`);
  }
  if (difficultyBonus > 0) {
    breakdownParts.push(`${difficultyBonus} (${difficulty} difficulty)`);
  }

  const breakdown = breakdownParts.join(' + ') + ` = ${totalPoints} points`;

  return {
    attemptPoints,
    completionPoints,
    mistakePoints,
    streakBonus,
    focusWordBonus,
    difficultyBonus,
    totalPoints,
    breakdown,
  };
}

// ============================================================================
// Motivational Messages
// ============================================================================

/**
 * Get a motivational message based on points earned
 */
export function getPointsMotivation(points: EffortPoints): string {
  const { totalPoints, mistakePoints, streakBonus, focusWordBonus } = points;

  // Celebrate mistakes as learning
  if (mistakePoints >= 30) {
    return `${totalPoints} points! Those ${Math.floor(mistakePoints / 5)} mistakes? They're ${mistakePoints} bonus points for learning!`;
  }

  // Celebrate streak
  if (streakBonus >= 20) {
    return `${totalPoints} points! Your streak earned you ${streakBonus} bonus points. Keep it going!`;
  }

  // Celebrate focus words
  if (focusWordBonus >= 30) {
    return `${totalPoints} points! Great job practicing your focus words (+${focusWordBonus} bonus)!`;
  }

  // General celebration
  if (totalPoints >= 100) {
    return `Amazing! ${totalPoints} points earned just by practicing!`;
  }

  if (totalPoints >= 50) {
    return `Nice work! ${totalPoints} points added to your total.`;
  }

  return `+${totalPoints} points for practicing!`;
}

/**
 * Get encouragement for mistakes
 */
export function getMistakeEncouragement(mistakeCount: number): string {
  if (mistakeCount === 0) {
    return 'Perfect round! But remember, mistakes earn bonus points too!';
  }

  if (mistakeCount <= 3) {
    return `${mistakeCount} words to practice = ${mistakeCount * 5} bonus points for learning!`;
  }

  if (mistakeCount <= 7) {
    return `${mistakeCount} learning opportunities = ${Math.min(mistakeCount * 5, 50)} bonus points! Every mistake makes you stronger.`;
  }

  return `${mistakeCount} chances to learn! That's ${Math.min(mistakeCount * 5, 50)} bonus points. The more you try, the more you grow!`;
}

// ============================================================================
// Progress Tracking
// ============================================================================

/**
 * Calculate total points needed for each level
 */
export function getPointsForLevel(level: number): number {
  // Exponential curve: each level needs more points
  // Level 1: 100, Level 2: 250, Level 3: 450, etc.
  return Math.round(100 * Math.pow(1.5, level - 1));
}

/**
 * Calculate current level from total points
 */
export function calculateLevel(totalPoints: number): {
  level: number;
  currentLevelPoints: number;
  nextLevelPoints: number;
  progressPercent: number;
} {
  let level = 1;
  let pointsNeeded = getPointsForLevel(1);
  let previousThreshold = 0;

  while (totalPoints >= pointsNeeded) {
    level++;
    previousThreshold = pointsNeeded;
    pointsNeeded += getPointsForLevel(level);
  }

  const currentLevelPoints = totalPoints - previousThreshold;
  const nextLevelPoints = pointsNeeded - previousThreshold;
  const progressPercent = Math.round((currentLevelPoints / nextLevelPoints) * 100);

  return {
    level,
    currentLevelPoints,
    nextLevelPoints,
    progressPercent,
  };
}

/**
 * Get title for a level
 */
export function getLevelTitle(level: number): string {
  const titles: Record<number, string> = {
    1: 'Beginner',
    2: 'Explorer',
    3: 'Learner',
    4: 'Practitioner',
    5: 'Speaker',
    6: 'Conversationalist',
    7: 'Communicator',
    8: 'Articulator',
    9: 'Fluent Speaker',
    10: 'Language Master',
  };

  if (level >= 10) return 'Language Master';
  return titles[level] || `Level ${level}`;
}

// ============================================================================
// Daily Goals
// ============================================================================

/**
 * Daily points goals based on user commitment
 */
export const DAILY_GOALS = {
  casual: { points: 50, sessions: 1, label: 'Casual (5 min)' },
  regular: { points: 100, sessions: 2, label: 'Regular (10 min)' },
  committed: { points: 200, sessions: 3, label: 'Committed (20 min)' },
  intensive: { points: 400, sessions: 5, label: 'Intensive (30+ min)' },
} as const;

export type CommitmentLevel = keyof typeof DAILY_GOALS;

/**
 * Check daily goal progress
 */
export function checkDailyGoalProgress(
  todayPoints: number,
  todaySessions: number,
  commitment: CommitmentLevel
): {
  goalReached: boolean;
  pointsProgress: number;
  sessionsProgress: number;
  pointsRemaining: number;
  sessionsRemaining: number;
  progressPercent: number;
} {
  const goal = DAILY_GOALS[commitment];

  const pointsProgress = Math.min(todayPoints, goal.points);
  const sessionsProgress = Math.min(todaySessions, goal.sessions);

  const pointsRemaining = Math.max(0, goal.points - todayPoints);
  const sessionsRemaining = Math.max(0, goal.sessions - todaySessions);

  const goalReached = todayPoints >= goal.points && todaySessions >= goal.sessions;
  const progressPercent = Math.round(
    ((pointsProgress / goal.points) * 0.7 + (sessionsProgress / goal.sessions) * 0.3) * 100
  );

  return {
    goalReached,
    pointsProgress,
    sessionsProgress,
    pointsRemaining,
    sessionsRemaining,
    progressPercent,
  };
}
