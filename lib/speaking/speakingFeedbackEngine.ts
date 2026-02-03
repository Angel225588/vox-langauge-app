/**
 * Speaking Feedback Engine
 *
 * Main orchestration module that combines:
 * - Gemini AI analysis (honest feedback)
 * - Effort-based points system
 * - Goal-based word targeting
 * - Milestone tracking
 *
 * This is the main entry point for processing speaking practice results.
 */

import { analyzeSpeakingWithGemini, convertToHonestFeedback } from './geminiSpeakingAnalyzer';
import { calculateEffortPoints, getPointsMotivation, getMistakeEncouragement } from './effortPointsSystem';
import { checkMilestones, getMilestoneProgress, getMilestoneCelebration, getInitialMilestones } from './milestonesSystem';
import { updateWordStats, getWordsNeedingPractice } from './goalWordSystem';
import type {
  SpeakingSessionResult,
  GeminiSpeakingInput,
  HonestFeedback,
  EffortPoints,
  Milestone,
  MilestoneProgress,
  GoalWord,
  GoalWordConfig,
  FeedbackMode,
  LearningGoalCategory,
} from './speakingFeedbackTypes';
import type { TranscriptionResult } from '../reading/speechToText';

// ============================================================================
// Main Processing Function
// ============================================================================

/**
 * Process a speaking practice session
 *
 * This is the main entry point that:
 * 1. Analyzes speech with Gemini AI
 * 2. Generates honest, balanced feedback
 * 3. Calculates effort-based points
 * 4. Updates milestones
 * 5. Tracks goal word progress
 *
 * @param input - Session input data
 * @param userState - User's current state (streak, milestones, etc.)
 * @returns Complete session result with feedback, points, and milestones
 *
 * @example
 * ```ts
 * const result = await processSpeakingSession({
 *   expectedText: "The quick brown fox jumps over the lazy dog",
 *   transcription: whisperResult,
 *   audioDurationMs: 5000,
 *   difficulty: 'intermediate',
 *   userGoal: 'daily_conversation',
 * }, {
 *   currentStreak: 5,
 *   milestones: userMilestones,
 *   totalAttempts: 42,
 *   // ... more state
 * });
 *
 * console.log(result.feedback.honestSummary);
 * console.log(result.points.totalPoints);
 * console.log(result.milestonesAchieved);
 * ```
 */
export async function processSpeakingSession(
  input: {
    expectedText: string;
    transcription: TranscriptionResult;
    audioDurationMs: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    userGoal?: LearningGoalCategory;
    previousAccuracy?: number;
    feedbackMode?: FeedbackMode;
  },
  userState: {
    currentStreak: number;
    milestones: Milestone[];
    totalAttempts: number;
    totalWordsPracticed: number;
    wordsMastered: number;
    totalMinutesPracticed: number;
    mistakesLearnedFromCount: number;
    goalWordConfig?: GoalWordConfig;
    proficiencyLevel: 'beginner' | 'intermediate' | 'advanced';
  }
): Promise<SpeakingSessionResult> {
  const sessionId = generateSessionId();
  const timestamp = new Date().toISOString();

  // ==========================================
  // Step 1: AI Analysis with Gemini
  // ==========================================
  const geminiInput: GeminiSpeakingInput = {
    expectedText: input.expectedText,
    transcribedText: input.transcription.text,
    transcriptionWords: input.transcription.words.map(w => ({
      word: w.word,
      start: w.start,
      end: w.end,
      confidence: w.confidence,
    })),
    userGoal: input.userGoal,
    proficiencyLevel: userState.proficiencyLevel,
    targetLanguage: 'English', // TODO: Make configurable
    previousAccuracy: input.previousAccuracy,
  };

  const geminiAnalysis = await analyzeSpeakingWithGemini(geminiInput);

  // ==========================================
  // Step 2: Convert to Honest Feedback
  // ==========================================
  const wpm = calculateWPM(
    input.transcription.words.length,
    input.audioDurationMs
  );

  const technicalMetrics = {
    articulationScore: geminiAnalysis.overallAccuracy,
    fluencyScore: calculateFluencyFromWords(input.transcription.words),
    completionRate: calculateCompletionRate(
      input.expectedText,
      input.transcription.text
    ),
    hesitationCount: countHesitations(input.transcription.words),
    averagePauseDuration: calculateAveragePause(input.transcription.words),
  };

  const feedback = convertToHonestFeedback(geminiAnalysis, wpm, technicalMetrics);

  // ==========================================
  // Step 3: Calculate Effort Points
  // ==========================================
  const focusWordsPracticed = userState.goalWordConfig?.sessionTargetWords
    .filter(w => input.expectedText.toLowerCase().includes(w.word.toLowerCase()))
    .map(w => w.word) || [];

  const problemWordsPracticed = userState.goalWordConfig?.problemWords
    .filter(w => input.expectedText.toLowerCase().includes(w.toLowerCase())) || [];

  const points = calculateEffortPoints(feedback, {
    currentStreak: userState.currentStreak,
    difficulty: input.difficulty,
    focusWordsPracticed,
    problemWordsPracticed,
  });

  // ==========================================
  // Step 4: Check Milestones
  // ==========================================
  const newTotalAttempts = userState.totalAttempts + 1;
  const newTotalWords = userState.totalWordsPracticed + feedback.wordsTotal;
  const newMinutes = userState.totalMinutesPracticed + (input.audioDurationMs / 60000);

  // Calculate improvement if we have previous accuracy
  const improvementPercent = input.previousAccuracy !== undefined
    ? feedback.accuracyPercent - input.previousAccuracy
    : undefined;

  const { updatedMilestones, newlyAchieved } = checkMilestones(
    userState.milestones,
    {
      totalAttempts: newTotalAttempts,
      currentStreak: userState.currentStreak,
      totalWordsPracticed: newTotalWords,
      wordsMastered: userState.wordsMastered,
      sessionAccuracy: feedback.accuracyPercent,
      totalMinutesPracticed: newMinutes,
      mistakesLearnedFromCount: userState.mistakesLearnedFromCount,
      improvementPercent,
    }
  );

  const milestoneProgress = getMilestoneProgress(updatedMilestones);

  // ==========================================
  // Step 5: Update Goal Words
  // ==========================================
  const goalWordsPracticed: GoalWord[] = [];
  const wordsAddedToFocus: string[] = [];

  if (userState.goalWordConfig) {
    for (const goalWord of userState.goalWordConfig.sessionTargetWords) {
      const wordAnalysis = geminiAnalysis.wordAnalysis.find(
        w => w.expected.toLowerCase() === goalWord.word.toLowerCase()
      );

      if (wordAnalysis) {
        const updated = updateWordStats(goalWord, wordAnalysis.isCorrect);
        goalWordsPracticed.push(updated);
      }
    }

    // Add problem words to focus list
    for (const wordAnalysis of geminiAnalysis.wordAnalysis) {
      if (!wordAnalysis.isCorrect && wordAnalysis.severity !== 'minor') {
        const alreadyFocused = userState.goalWordConfig.problemWords.includes(
          wordAnalysis.expected.toLowerCase()
        );
        if (!alreadyFocused) {
          wordsAddedToFocus.push(wordAnalysis.expected);
        }
      }
    }
  }

  // ==========================================
  // Build Final Result
  // ==========================================
  return {
    sessionId,
    timestamp,
    expectedText: input.expectedText,
    transcribedText: input.transcription.text,
    feedback,
    points,
    milestonesAchieved: newlyAchieved,
    milestoneProgress,
    goalWordsPracticed,
    wordsAddedToFocus,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate unique session ID
 */
function generateSessionId(): string {
  return `speaking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate words per minute
 */
function calculateWPM(wordCount: number, durationMs: number): number {
  if (durationMs === 0) return 0;
  const minutes = durationMs / 60000;
  return Math.round(wordCount / minutes);
}

/**
 * Calculate fluency score from word timing
 */
function calculateFluencyFromWords(
  words: Array<{ word: string; start: number; end: number }>
): number {
  if (words.length < 2) return 100;

  // Calculate pauses between words
  const pauses: number[] = [];
  for (let i = 1; i < words.length; i++) {
    const pause = words[i].start - words[i - 1].end;
    if (pause > 0) pauses.push(pause);
  }

  if (pauses.length === 0) return 100;

  // Calculate pause consistency
  const avgPause = pauses.reduce((sum, p) => sum + p, 0) / pauses.length;
  const variance = pauses.reduce((sum, p) => sum + Math.pow(p - avgPause, 2), 0) / pauses.length;
  const stdDev = Math.sqrt(variance);

  // More consistent pauses = higher fluency
  const consistencyScore = Math.max(0, 100 - (stdDev / avgPause) * 50);

  // Fewer long pauses = higher fluency
  const longPauses = pauses.filter(p => p > 1.0).length; // >1 second
  const longPausePenalty = Math.min(30, longPauses * 10);

  return Math.round(Math.max(0, consistencyScore - longPausePenalty));
}

/**
 * Calculate completion rate
 */
function calculateCompletionRate(expected: string, spoken: string): number {
  const expectedWords = expected.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const spokenWords = spoken.toLowerCase().split(/\s+/).filter(w => w.length > 0);

  if (expectedWords.length === 0) return 100;

  let matches = 0;
  for (const exp of expectedWords) {
    const normalized = exp.replace(/[.,!?;:'"]/g, '');
    if (spokenWords.some(s => s.replace(/[.,!?;:'"]/g, '') === normalized)) {
      matches++;
    }
  }

  return Math.round((matches / expectedWords.length) * 100);
}

/**
 * Count hesitations (long pauses)
 */
function countHesitations(
  words: Array<{ word: string; start: number; end: number }>
): number {
  if (words.length < 2) return 0;

  let hesitations = 0;
  for (let i = 1; i < words.length; i++) {
    const pause = words[i].start - words[i - 1].end;
    if (pause > 0.8) { // >800ms considered hesitation
      hesitations++;
    }
  }

  return hesitations;
}

/**
 * Calculate average pause duration
 */
function calculateAveragePause(
  words: Array<{ word: string; start: number; end: number }>
): number {
  if (words.length < 2) return 0;

  const pauses: number[] = [];
  for (let i = 1; i < words.length; i++) {
    const pause = words[i].start - words[i - 1].end;
    if (pause > 0) pauses.push(pause);
  }

  if (pauses.length === 0) return 0;

  const avgPauseSeconds = pauses.reduce((sum, p) => sum + p, 0) / pauses.length;
  return Math.round(avgPauseSeconds * 1000); // Return in ms
}

// ============================================================================
// Utility Exports
// ============================================================================

/**
 * Get celebration data for completed session
 */
export function getSessionCelebration(result: SpeakingSessionResult): {
  pointsMessage: string;
  mistakeMessage: string;
  milestoneMessages: Array<{ title: string; message: string; emoji: string }>;
  overallTone: 'celebrate' | 'encourage' | 'support';
} {
  const pointsMessage = getPointsMotivation(result.points);
  const mistakeCount = result.feedback.wordsTotal - result.feedback.wordsCorrect;
  const mistakeMessage = getMistakeEncouragement(mistakeCount);

  const milestoneMessages = result.milestonesAchieved.map(m =>
    getMilestoneCelebration(m)
  );

  // Determine overall tone
  let overallTone: 'celebrate' | 'encourage' | 'support';
  if (result.feedback.accuracyPercent >= 85 || result.milestonesAchieved.length > 0) {
    overallTone = 'celebrate';
  } else if (result.feedback.accuracyPercent >= 60) {
    overallTone = 'encourage';
  } else {
    overallTone = 'support';
  }

  return {
    pointsMessage,
    mistakeMessage,
    milestoneMessages,
    overallTone,
  };
}

/**
 * Get initial user state for new users
 */
export function getInitialUserState(): {
  currentStreak: number;
  milestones: Milestone[];
  totalAttempts: number;
  totalWordsPracticed: number;
  wordsMastered: number;
  totalMinutesPracticed: number;
  mistakesLearnedFromCount: number;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced';
} {
  return {
    currentStreak: 0,
    milestones: getInitialMilestones(),
    totalAttempts: 0,
    totalWordsPracticed: 0,
    wordsMastered: 0,
    totalMinutesPracticed: 0,
    mistakesLearnedFromCount: 0,
    proficiencyLevel: 'beginner',
  };
}
