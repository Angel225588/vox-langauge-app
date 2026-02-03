/**
 * Milestones System
 *
 * Gamification through achievable milestones that:
 * 1. Reward consistent practice (streaks)
 * 2. Celebrate total effort (attempts, words practiced)
 * 3. Track improvement (from mistakes to mastery)
 * 4. Align with user goals (goal-specific milestones)
 *
 * Milestones are tiered: Bronze → Silver → Gold → Platinum
 */

import type {
  Milestone,
  MilestoneType,
  MilestoneProgress,
  LearningGoalCategory,
} from './speakingFeedbackTypes';

// ============================================================================
// Milestone Definitions
// ============================================================================

/**
 * All available milestones
 */
export const MILESTONES: Milestone[] = [
  // ==========================================
  // ATTEMPTS - Celebrating trying
  // ==========================================
  {
    id: 'attempts_1',
    name: 'First Step',
    description: 'Complete your first speaking practice',
    type: 'attempts',
    targetValue: 1,
    currentValue: 0,
    isAchieved: false,
    pointsAwarded: 50,
    icon: 'footprints',
    tier: 'bronze',
  },
  {
    id: 'attempts_10',
    name: 'Getting Started',
    description: 'Complete 10 speaking practices',
    type: 'attempts',
    targetValue: 10,
    currentValue: 0,
    isAchieved: false,
    pointsAwarded: 100,
    icon: 'rocket',
    tier: 'bronze',
  },
  {
    id: 'attempts_50',
    name: 'Dedicated Learner',
    description: 'Complete 50 speaking practices',
    type: 'attempts',
    targetValue: 50,
    currentValue: 0,
    isAchieved: false,
    pointsAwarded: 250,
    icon: 'star',
    tier: 'silver',
  },
  {
    id: 'attempts_100',
    name: 'Century Club',
    description: 'Complete 100 speaking practices',
    type: 'attempts',
    targetValue: 100,
    currentValue: 0,
    isAchieved: false,
    pointsAwarded: 500,
    icon: 'trophy',
    tier: 'gold',
  },
  {
    id: 'attempts_500',
    name: 'Practice Master',
    description: 'Complete 500 speaking practices',
    type: 'attempts',
    targetValue: 500,
    currentValue: 0,
    isAchieved: false,
    pointsAwarded: 2000,
    icon: 'crown',
    tier: 'platinum',
  },

  // ==========================================
  // STREAKS - Celebrating consistency
  // ==========================================
  {
    id: 'streak_3',
    name: 'Three Day Streak',
    description: 'Practice 3 days in a row',
    type: 'streak',
    targetValue: 3,
    currentValue: 0,
    isAchieved: false,
    pointsAwarded: 75,
    icon: 'fire',
    tier: 'bronze',
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Practice 7 days in a row',
    type: 'streak',
    targetValue: 7,
    currentValue: 0,
    isAchieved: false,
    pointsAwarded: 200,
    icon: 'flame',
    tier: 'silver',
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Practice 30 days in a row',
    type: 'streak',
    targetValue: 30,
    currentValue: 0,
    isAchieved: false,
    pointsAwarded: 1000,
    icon: 'calendar-check',
    tier: 'gold',
  },
  {
    id: 'streak_100',
    name: 'Unstoppable',
    description: 'Practice 100 days in a row',
    type: 'streak',
    targetValue: 100,
    currentValue: 0,
    isAchieved: false,
    pointsAwarded: 5000,
    icon: 'infinity',
    tier: 'platinum',
  },

  // ==========================================
  // WORDS PRACTICED - Celebrating volume
  // ==========================================
  {
    id: 'words_100',
    name: 'Word Explorer',
    description: 'Practice saying 100 words',
    type: 'words_practiced',
    targetValue: 100,
    currentValue: 0,
    isAchieved: false,
    pointsAwarded: 50,
    icon: 'book-open',
    tier: 'bronze',
  },
  {
    id: 'words_1000',
    name: 'Word Collector',
    description: 'Practice saying 1,000 words',
    type: 'words_practiced',
    targetValue: 1000,
    currentValue: 0,
    isAchieved: false,
    pointsAwarded: 300,
    icon: 'library',
    tier: 'silver',
  },
  {
    id: 'words_10000',
    name: 'Word Champion',
    description: 'Practice saying 10,000 words',
    type: 'words_practiced',
    targetValue: 10000,
    currentValue: 0,
    isAchieved: false,
    pointsAwarded: 1500,
    icon: 'graduation-cap',
    tier: 'gold',
  },

  // ==========================================
  // WORDS MASTERED - Celebrating improvement
  // ==========================================
  {
    id: 'mastered_10',
    name: 'First Masteries',
    description: 'Master 10 words (3+ correct in a row)',
    type: 'words_mastered',
    targetValue: 10,
    currentValue: 0,
    isAchieved: false,
    pointsAwarded: 150,
    icon: 'check-circle',
    tier: 'bronze',
  },
  {
    id: 'mastered_50',
    name: 'Building Vocabulary',
    description: 'Master 50 words',
    type: 'words_mastered',
    targetValue: 50,
    currentValue: 0,
    isAchieved: false,
    pointsAwarded: 500,
    icon: 'award',
    tier: 'silver',
  },
  {
    id: 'mastered_200',
    name: 'Vocabulary Expert',
    description: 'Master 200 words',
    type: 'words_mastered',
    targetValue: 200,
    currentValue: 0,
    isAchieved: false,
    pointsAwarded: 2000,
    icon: 'medal',
    tier: 'gold',
  },

  // ==========================================
  // MISTAKES LEARNED - Celebrating growth from errors
  // ==========================================
  {
    id: 'mistakes_learned_5',
    name: 'Learning from Mistakes',
    description: 'Turn 5 mistakes into correct answers',
    type: 'mistakes_learned',
    targetValue: 5,
    currentValue: 0,
    isAchieved: false,
    pointsAwarded: 100,
    icon: 'refresh-cw',
    tier: 'bronze',
  },
  {
    id: 'mistakes_learned_25',
    name: 'Growth Mindset',
    description: 'Turn 25 mistakes into correct answers',
    type: 'mistakes_learned',
    targetValue: 25,
    currentValue: 0,
    isAchieved: false,
    pointsAwarded: 400,
    icon: 'trending-up',
    tier: 'silver',
  },
  {
    id: 'mistakes_learned_100',
    name: 'Mistake Master',
    description: 'Turn 100 mistakes into correct answers',
    type: 'mistakes_learned',
    targetValue: 100,
    currentValue: 0,
    isAchieved: false,
    pointsAwarded: 1500,
    icon: 'zap',
    tier: 'gold',
  },

  // ==========================================
  // ACCURACY ACHIEVED - Celebrating performance
  // ==========================================
  {
    id: 'accuracy_70',
    name: 'Accuracy Seeker',
    description: 'Achieve 70%+ accuracy in a session',
    type: 'accuracy_achieved',
    targetValue: 70,
    currentValue: 0,
    isAchieved: false,
    pointsAwarded: 50,
    icon: 'target',
    tier: 'bronze',
  },
  {
    id: 'accuracy_85',
    name: 'Precision Speaker',
    description: 'Achieve 85%+ accuracy in a session',
    type: 'accuracy_achieved',
    targetValue: 85,
    currentValue: 0,
    isAchieved: false,
    pointsAwarded: 100,
    icon: 'crosshair',
    tier: 'silver',
  },
  {
    id: 'accuracy_95',
    name: 'Near Perfect',
    description: 'Achieve 95%+ accuracy in a session',
    type: 'accuracy_achieved',
    targetValue: 95,
    currentValue: 0,
    isAchieved: false,
    pointsAwarded: 250,
    icon: 'bullseye',
    tier: 'gold',
  },
  {
    id: 'accuracy_100',
    name: 'Flawless',
    description: 'Achieve 100% accuracy in a session',
    type: 'accuracy_achieved',
    targetValue: 100,
    currentValue: 0,
    isAchieved: false,
    pointsAwarded: 500,
    icon: 'sparkles',
    tier: 'platinum',
  },

  // ==========================================
  // MINUTES PRACTICED - Celebrating time invested
  // ==========================================
  {
    id: 'minutes_30',
    name: 'Half Hour Hero',
    description: 'Practice for 30 total minutes',
    type: 'minutes_practiced',
    targetValue: 30,
    currentValue: 0,
    isAchieved: false,
    pointsAwarded: 75,
    icon: 'clock',
    tier: 'bronze',
  },
  {
    id: 'minutes_300',
    name: 'Five Hour Focus',
    description: 'Practice for 5 total hours',
    type: 'minutes_practiced',
    targetValue: 300,
    currentValue: 0,
    isAchieved: false,
    pointsAwarded: 500,
    icon: 'hourglass',
    tier: 'silver',
  },
  {
    id: 'minutes_1000',
    name: 'Time Investor',
    description: 'Practice for 16+ total hours',
    type: 'minutes_practiced',
    targetValue: 1000,
    currentValue: 0,
    isAchieved: false,
    pointsAwarded: 1500,
    icon: 'timer',
    tier: 'gold',
  },

  // ==========================================
  // IMPROVEMENT - Celebrating progress
  // ==========================================
  {
    id: 'improvement_10',
    name: 'Getting Better',
    description: 'Improve accuracy by 10% on a passage',
    type: 'improvement',
    targetValue: 10,
    currentValue: 0,
    isAchieved: false,
    pointsAwarded: 150,
    icon: 'arrow-up',
    tier: 'bronze',
  },
  {
    id: 'improvement_25',
    name: 'Big Leap',
    description: 'Improve accuracy by 25% on a passage',
    type: 'improvement',
    targetValue: 25,
    currentValue: 0,
    isAchieved: false,
    pointsAwarded: 400,
    icon: 'arrow-up-circle',
    tier: 'silver',
  },
];

// ============================================================================
// Milestone Management
// ============================================================================

/**
 * Get initial milestone state (for new users)
 */
export function getInitialMilestones(): Milestone[] {
  return MILESTONES.map(m => ({ ...m }));
}

/**
 * Check and update milestones based on session data
 */
export function checkMilestones(
  currentMilestones: Milestone[],
  sessionData: {
    totalAttempts: number;
    currentStreak: number;
    totalWordsPracticed: number;
    wordsMastered: number;
    sessionAccuracy: number;
    totalMinutesPracticed: number;
    mistakesLearnedFromCount: number;
    improvementPercent?: number;
  }
): {
  updatedMilestones: Milestone[];
  newlyAchieved: Milestone[];
} {
  const updatedMilestones = currentMilestones.map(m => ({ ...m }));
  const newlyAchieved: Milestone[] = [];

  for (const milestone of updatedMilestones) {
    if (milestone.isAchieved) continue;

    // Update current value based on type
    let newValue = milestone.currentValue;

    switch (milestone.type) {
      case 'attempts':
        newValue = sessionData.totalAttempts;
        break;
      case 'streak':
        newValue = sessionData.currentStreak;
        break;
      case 'words_practiced':
        newValue = sessionData.totalWordsPracticed;
        break;
      case 'words_mastered':
        newValue = sessionData.wordsMastered;
        break;
      case 'accuracy_achieved':
        newValue = sessionData.sessionAccuracy;
        break;
      case 'minutes_practiced':
        newValue = sessionData.totalMinutesPracticed;
        break;
      case 'mistakes_learned':
        newValue = sessionData.mistakesLearnedFromCount;
        break;
      case 'improvement':
        newValue = sessionData.improvementPercent || 0;
        break;
    }

    milestone.currentValue = newValue;

    // Check if newly achieved
    if (newValue >= milestone.targetValue && !milestone.isAchieved) {
      milestone.isAchieved = true;
      milestone.achievedAt = new Date().toISOString();
      newlyAchieved.push(milestone);
    }
  }

  return { updatedMilestones, newlyAchieved };
}

/**
 * Get milestone progress summary
 */
export function getMilestoneProgress(milestones: Milestone[]): MilestoneProgress {
  const achieved = milestones.filter(m => m.isAchieved);
  const notAchieved = milestones.filter(m => !m.isAchieved);

  // Get recently achieved (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentlyAchieved = achieved.filter(m =>
    m.achievedAt && new Date(m.achievedAt) >= sevenDaysAgo
  );

  // Get upcoming milestones (closest to completion)
  const upcomingMilestones = notAchieved
    .map(m => ({
      ...m,
      progressPercent: m.targetValue > 0 ? (m.currentValue / m.targetValue) * 100 : 0,
    }))
    .sort((a, b) => b.progressPercent - a.progressPercent)
    .slice(0, 5);

  // Group by type
  const milestonesByType: Record<MilestoneType, Milestone[]> = {
    attempts: [],
    streak: [],
    words_practiced: [],
    words_mastered: [],
    accuracy_achieved: [],
    minutes_practiced: [],
    mistakes_learned: [],
    goal_words: [],
    improvement: [],
  };

  for (const milestone of milestones) {
    milestonesByType[milestone.type].push(milestone);
  }

  // Calculate total points from milestones
  const totalMilestonePoints = achieved.reduce((sum, m) => sum + m.pointsAwarded, 0);

  return {
    totalAchieved: achieved.length,
    totalAvailable: milestones.length,
    recentlyAchieved,
    upcomingMilestones,
    milestonesByType,
    totalMilestonePoints,
  };
}

/**
 * Get celebration message for newly achieved milestone
 */
export function getMilestoneCelebration(milestone: Milestone): {
  title: string;
  message: string;
  emoji: string;
} {
  const tierEmojis = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎',
  };

  const emoji = tierEmojis[milestone.tier];

  return {
    title: `${emoji} ${milestone.name}!`,
    message: `${milestone.description} (+${milestone.pointsAwarded} points)`,
    emoji,
  };
}

/**
 * Get next milestone to focus on
 */
export function getNextMilestoneToFocus(milestones: Milestone[]): Milestone | null {
  const notAchieved = milestones.filter(m => !m.isAchieved);
  if (notAchieved.length === 0) return null;

  // Find the one closest to completion
  return notAchieved.reduce((closest, current) => {
    const closestProgress = closest.currentValue / closest.targetValue;
    const currentProgress = current.currentValue / current.targetValue;
    return currentProgress > closestProgress ? current : closest;
  });
}

// ============================================================================
// Goal-Specific Milestones
// ============================================================================

/**
 * Create goal-specific milestones based on user's learning goal
 */
export function createGoalMilestones(
  goal: LearningGoalCategory,
  goalWords: string[]
): Milestone[] {
  const goalMilestones: Milestone[] = [];

  const goalDescriptions: Record<LearningGoalCategory, string> = {
    travel: 'travel-related',
    business: 'business',
    academic: 'academic',
    social: 'social',
    professional_interview: 'interview',
    daily_conversation: 'daily conversation',
    public_speaking: 'public speaking',
    custom: 'custom',
  };

  const goalDesc = goalDescriptions[goal];

  // Milestone for mastering a portion of goal words
  if (goalWords.length >= 5) {
    goalMilestones.push({
      id: `goal_${goal}_5`,
      name: `${goalDesc.charAt(0).toUpperCase() + goalDesc.slice(1)} Starter`,
      description: `Master 5 ${goalDesc} words`,
      type: 'goal_words',
      targetValue: 5,
      currentValue: 0,
      isAchieved: false,
      pointsAwarded: 200,
      icon: 'target',
      tier: 'bronze',
    });
  }

  if (goalWords.length >= 20) {
    goalMilestones.push({
      id: `goal_${goal}_20`,
      name: `${goalDesc.charAt(0).toUpperCase() + goalDesc.slice(1)} Speaker`,
      description: `Master 20 ${goalDesc} words`,
      type: 'goal_words',
      targetValue: 20,
      currentValue: 0,
      isAchieved: false,
      pointsAwarded: 500,
      icon: 'award',
      tier: 'silver',
    });
  }

  if (goalWords.length >= 50) {
    goalMilestones.push({
      id: `goal_${goal}_50`,
      name: `${goalDesc.charAt(0).toUpperCase() + goalDesc.slice(1)} Expert`,
      description: `Master 50 ${goalDesc} words`,
      type: 'goal_words',
      targetValue: 50,
      currentValue: 0,
      isAchieved: false,
      pointsAwarded: 1500,
      icon: 'crown',
      tier: 'gold',
    });
  }

  return goalMilestones;
}
