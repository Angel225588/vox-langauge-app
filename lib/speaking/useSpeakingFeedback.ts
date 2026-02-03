/**
 * React Hook: useSpeakingFeedback
 *
 * Hook for integrating the speaking feedback system into React components.
 * Manages state, processing, and provides UI-ready data.
 *
 * @example
 * ```tsx
 * function SpeakingPractice() {
 *   const {
 *     processSession,
 *     result,
 *     isProcessing,
 *     celebration,
 *     userProgress,
 *   } = useSpeakingFeedback();
 *
 *   const handleComplete = async (transcription) => {
 *     await processSession({
 *       expectedText: "Hello world",
 *       transcription,
 *       audioDurationMs: 3000,
 *       difficulty: 'beginner',
 *     });
 *   };
 *
 *   if (result) {
 *     return <ResultsScreen result={result} celebration={celebration} />;
 *   }
 * }
 * ```
 */

import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  processSpeakingSession,
  getSessionCelebration,
  getInitialUserState,
  calculateLevel,
  getLevelTitle,
  checkDailyGoalProgress,
  type CommitmentLevel,
} from './index';
import type {
  SpeakingSessionResult,
  Milestone,
  GoalWordConfig,
  LearningGoalCategory,
} from './speakingFeedbackTypes';
import type { TranscriptionResult } from '../reading/speechToText';

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  USER_STATE: '@vox/speaking/user_state',
  TOTAL_POINTS: '@vox/speaking/total_points',
  DAILY_POINTS: '@vox/speaking/daily_points',
  DAILY_SESSIONS: '@vox/speaking/daily_sessions',
  LAST_PRACTICE_DATE: '@vox/speaking/last_practice_date',
  STREAK: '@vox/speaking/streak',
  GOAL_CONFIG: '@vox/speaking/goal_config',
};

// ============================================================================
// Types
// ============================================================================

interface UserProgress {
  totalPoints: number;
  level: number;
  levelTitle: string;
  levelProgress: number;
  currentStreak: number;
  todayPoints: number;
  todaySessions: number;
  dailyGoalProgress: number;
  dailyGoalReached: boolean;
}

interface ProcessSessionInput {
  expectedText: string;
  transcription: TranscriptionResult;
  audioDurationMs: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  userGoal?: LearningGoalCategory;
  previousAccuracy?: number;
}

interface UseSpeakingFeedbackReturn {
  // State
  result: SpeakingSessionResult | null;
  isProcessing: boolean;
  error: string | null;

  // Celebration data
  celebration: {
    pointsMessage: string;
    mistakeMessage: string;
    milestoneMessages: Array<{ title: string; message: string; emoji: string }>;
    overallTone: 'celebrate' | 'encourage' | 'support';
  } | null;

  // User progress
  userProgress: UserProgress;

  // Actions
  processSession: (input: ProcessSessionInput) => Promise<SpeakingSessionResult>;
  resetResult: () => void;
  loadUserState: () => Promise<void>;

  // Goal configuration
  goalConfig: GoalWordConfig | null;
  setUserGoal: (goal: LearningGoalCategory) => Promise<void>;

  // Commitment
  commitment: CommitmentLevel;
  setCommitment: (level: CommitmentLevel) => Promise<void>;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useSpeakingFeedback(): UseSpeakingFeedbackReturn {
  // State
  const [result, setResult] = useState<SpeakingSessionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<UseSpeakingFeedbackReturn['celebration']>(null);

  // User state
  const [userState, setUserState] = useState(getInitialUserState());
  const [totalPoints, setTotalPoints] = useState(0);
  const [todayPoints, setTodayPoints] = useState(0);
  const [todaySessions, setTodaySessions] = useState(0);
  const [goalConfig, setGoalConfig] = useState<GoalWordConfig | null>(null);
  const [commitment, setCommitmentState] = useState<CommitmentLevel>('regular');

  // ==========================================
  // Load user state on mount
  // ==========================================
  const loadUserState = useCallback(async () => {
    try {
      // Load user state
      const storedState = await AsyncStorage.getItem(STORAGE_KEYS.USER_STATE);
      if (storedState) {
        setUserState(JSON.parse(storedState));
      }

      // Load total points
      const storedPoints = await AsyncStorage.getItem(STORAGE_KEYS.TOTAL_POINTS);
      if (storedPoints) {
        setTotalPoints(parseInt(storedPoints, 10));
      }

      // Load daily data
      const lastPracticeDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_PRACTICE_DATE);
      const today = new Date().toDateString();

      if (lastPracticeDate === today) {
        // Same day - load existing daily data
        const dailyPoints = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_POINTS);
        const dailySessions = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_SESSIONS);
        setTodayPoints(dailyPoints ? parseInt(dailyPoints, 10) : 0);
        setTodaySessions(dailySessions ? parseInt(dailySessions, 10) : 0);
      } else {
        // New day - reset daily data
        setTodayPoints(0);
        setTodaySessions(0);
        await AsyncStorage.setItem(STORAGE_KEYS.DAILY_POINTS, '0');
        await AsyncStorage.setItem(STORAGE_KEYS.DAILY_SESSIONS, '0');
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_PRACTICE_DATE, today);

        // Update streak
        if (lastPracticeDate) {
          const lastDate = new Date(lastPracticeDate);
          const todayDate = new Date(today);
          const diffDays = Math.floor(
            (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (diffDays === 1) {
            // Consecutive day - increment streak
            const currentStreak = userState.currentStreak + 1;
            setUserState(prev => ({ ...prev, currentStreak }));
          } else if (diffDays > 1) {
            // Streak broken
            setUserState(prev => ({ ...prev, currentStreak: 0 }));
          }
        }
      }

      // Load goal config
      const storedGoalConfig = await AsyncStorage.getItem(STORAGE_KEYS.GOAL_CONFIG);
      if (storedGoalConfig) {
        setGoalConfig(JSON.parse(storedGoalConfig));
      }
    } catch (err) {
      console.error('[useSpeakingFeedback] Error loading state:', err);
    }
  }, []);

  useEffect(() => {
    loadUserState();
  }, [loadUserState]);

  // ==========================================
  // Process session
  // ==========================================
  const processSession = useCallback(
    async (input: ProcessSessionInput): Promise<SpeakingSessionResult> => {
      setIsProcessing(true);
      setError(null);

      try {
        const sessionResult = await processSpeakingSession(
          {
            ...input,
            feedbackMode: 'balanced',
          },
          {
            ...userState,
            goalWordConfig: goalConfig || undefined,
          }
        );

        // Update points
        const newTotalPoints = totalPoints + sessionResult.points.totalPoints;
        const newTodayPoints = todayPoints + sessionResult.points.totalPoints;
        const newTodaySessions = todaySessions + 1;

        setTotalPoints(newTotalPoints);
        setTodayPoints(newTodayPoints);
        setTodaySessions(newTodaySessions);

        // Update user state
        const updatedUserState = {
          ...userState,
          totalAttempts: userState.totalAttempts + 1,
          totalWordsPracticed: userState.totalWordsPracticed + sessionResult.feedback.wordsTotal,
          milestones: sessionResult.milestoneProgress.milestonesByType
            ? Object.values(sessionResult.milestoneProgress.milestonesByType).flat()
            : userState.milestones,
        };
        setUserState(updatedUserState);

        // Persist to storage
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.TOTAL_POINTS, newTotalPoints.toString()),
          AsyncStorage.setItem(STORAGE_KEYS.DAILY_POINTS, newTodayPoints.toString()),
          AsyncStorage.setItem(STORAGE_KEYS.DAILY_SESSIONS, newTodaySessions.toString()),
          AsyncStorage.setItem(STORAGE_KEYS.USER_STATE, JSON.stringify(updatedUserState)),
        ]);

        // Set result and celebration
        setResult(sessionResult);
        setCelebration(getSessionCelebration(sessionResult));

        return sessionResult;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to process session';
        setError(errorMessage);
        throw err;
      } finally {
        setIsProcessing(false);
      }
    },
    [userState, goalConfig, totalPoints, todayPoints, todaySessions]
  );

  // ==========================================
  // Reset result
  // ==========================================
  const resetResult = useCallback(() => {
    setResult(null);
    setCelebration(null);
    setError(null);
  }, []);

  // ==========================================
  // Set user goal
  // ==========================================
  const setUserGoal = useCallback(async (goal: LearningGoalCategory) => {
    const { createDefaultGoalConfig } = await import('./goalWordSystem');
    const newConfig = createDefaultGoalConfig(goal, goalConfig?.problemWords || []);
    setGoalConfig(newConfig);
    await AsyncStorage.setItem(STORAGE_KEYS.GOAL_CONFIG, JSON.stringify(newConfig));
  }, [goalConfig]);

  // ==========================================
  // Set commitment level
  // ==========================================
  const setCommitment = useCallback(async (level: CommitmentLevel) => {
    setCommitmentState(level);
    // Could persist this too if needed
  }, []);

  // ==========================================
  // Calculate user progress
  // ==========================================
  const levelInfo = calculateLevel(totalPoints);
  const dailyGoalInfo = checkDailyGoalProgress(todayPoints, todaySessions, commitment);

  const userProgress: UserProgress = {
    totalPoints,
    level: levelInfo.level,
    levelTitle: getLevelTitle(levelInfo.level),
    levelProgress: levelInfo.progressPercent,
    currentStreak: userState.currentStreak,
    todayPoints,
    todaySessions,
    dailyGoalProgress: dailyGoalInfo.progressPercent,
    dailyGoalReached: dailyGoalInfo.goalReached,
  };

  return {
    // State
    result,
    isProcessing,
    error,

    // Celebration
    celebration,

    // User progress
    userProgress,

    // Actions
    processSession,
    resetResult,
    loadUserState,

    // Goal configuration
    goalConfig,
    setUserGoal,

    // Commitment
    commitment,
    setCommitment,
  };
}
