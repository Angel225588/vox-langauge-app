/**
 * Speaking Feedback System
 *
 * Complete speaking practice feedback system with:
 * - Honest, balanced AI feedback (Gemini)
 * - Effort-based points (more tries = more points!)
 * - Goal-based word targeting
 * - Milestone tracking
 *
 * @example
 * ```ts
 * import {
 *   processSpeakingSession,
 *   getSessionCelebration,
 *   getInitialUserState,
 *   GOAL_WORD_BANKS,
 *   MILESTONES,
 * } from '@/lib/speaking';
 *
 * // Process a speaking session
 * const result = await processSpeakingSession(input, userState);
 *
 * // Get celebration data for UI
 * const celebration = getSessionCelebration(result);
 * ```
 */

// Main entry point
export {
  processSpeakingSession,
  getSessionCelebration,
  getInitialUserState,
} from './speakingFeedbackEngine';

// Gemini AI analyzer
export {
  analyzeSpeakingWithGemini,
  convertToHonestFeedback,
} from './geminiSpeakingAnalyzer';

// Effort points system
export {
  calculateEffortPoints,
  getPointsMotivation,
  getMistakeEncouragement,
  getPointsForLevel,
  calculateLevel,
  getLevelTitle,
  checkDailyGoalProgress,
  DAILY_GOALS,
  DEFAULT_POINTS_CONFIG,
} from './effortPointsSystem';

// Milestones system
export {
  checkMilestones,
  getMilestoneProgress,
  getMilestoneCelebration,
  getNextMilestoneToFocus,
  getInitialMilestones,
  createGoalMilestones,
  MILESTONES,
} from './milestonesSystem';

// Goal word system
export {
  getSessionWords,
  updateWordStats,
  getWordsNeedingPractice,
  getGoalMasteryProgress,
  createDefaultGoalConfig,
  GOAL_WORD_BANKS,
} from './goalWordSystem';

// Types
export type {
  // Feedback types
  FeedbackMode,
  IssueSeverity,
  WordAnalysis,
  HonestFeedback,

  // Points types
  EffortPoints,
  PointsConfig,

  // Goal types
  LearningGoalCategory,
  GoalWord,
  GoalWordConfig,

  // Milestone types
  MilestoneType,
  Milestone,
  MilestoneProgress,

  // Session types
  SpeakingSessionResult,
  GeminiSpeakingInput,
  GeminiSpeakingAnalysis,
} from './speakingFeedbackTypes';

export type { CommitmentLevel } from './effortPointsSystem';

// React hook
export { useSpeakingFeedback } from './useSpeakingFeedback';
