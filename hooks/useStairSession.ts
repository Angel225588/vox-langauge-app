/**
 * useStairSession Hook
 *
 * Orchestrates the complete stair session flow:
 * Briefing → Vocabulary → Conversation → Reading → Writing → Summary
 *
 * Manages:
 * - Step progression with navigation guards
 * - Content loading (hybrid: DB + AI)
 * - Result collection from each step
 * - FSRS updates on completion
 * - Word-add tracking (tap-to-learn)
 *
 * @module hooks/useStairSession
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import { loadSessionContent } from '@/lib/services/stairSession';
import { calculateSessionSummary } from '@/lib/services/stairSession';
import { findWordByText, addOrReinforceWord, recordReview } from '@/lib/word-bank/storage';
import { savePracticeScore } from '@/lib/db/competencyMetrics';
import type {
  SessionStep,
  SESSION_STEP_ORDER,
  StairSessionContent,
  StairSessionState,
  SessionStepResults,
  VocabularyStepResult,
  ConversationStepResult,
  ReadingStepResult,
  WritingStepResult,
  SessionSummary,
  SessionVocabItem,
} from '@/types/stairSession';

// ============================================================================
// TYPES
// ============================================================================

export interface UseStairSessionReturn {
  /** Current session state */
  state: StairSessionState;
  /** Current step name */
  currentStep: SessionStep;
  /** Step progress (0.0 - 1.0) */
  progress: number;
  /** Session content (null until loaded) */
  content: StairSessionContent | null;
  /** Calculated summary (available at summary step) */
  summary: SessionSummary | null;
  /** Whether session is complete */
  isComplete: boolean;

  // --- Actions ---
  /** Initialize session and load content */
  startSession: () => Promise<void>;
  /** Advance to the next step */
  nextStep: () => void;
  /** Go back to previous step */
  previousStep: () => void;
  /** Submit results for the current step */
  submitVocabularyResult: (result: VocabularyStepResult) => void;
  submitConversationResult: (result: ConversationStepResult) => void;
  submitReadingResult: (result: ReadingStepResult) => void;
  submitWritingResult: (result: WritingStepResult) => void;
  /** Add a word to personal vocabulary during the session */
  addWordToVocab: (word: string) => void;
  /** Complete the session and apply FSRS updates */
  completeSession: () => Promise<void>;
}

const STEP_ORDER: SessionStep[] = [
  'briefing',
  'vocabulary',
  'conversation',
  'reading',
  'writing',
  'summary',
];

// ============================================================================
// HOOK
// ============================================================================

/**
 * Main hook for orchestrating a stair session.
 *
 * @param stepId - The stair step's UUID
 * @param userId - The user's UUID
 */
export function useStairSession(
  stepId: string | undefined,
  userId: string | undefined
): UseStairSessionReturn {
  const [state, setState] = useState<StairSessionState>({
    currentStep: 'briefing',
    stepIndex: 0,
    isLoading: false,
    error: null,
    content: null,
    results: {},
    startedAt: Date.now(),
    wordsAdded: [],
  });

  const summaryRef = useRef<SessionSummary | null>(null);

  // ---- Derived ----
  const progress = useMemo(() => {
    return (state.stepIndex + 1) / STEP_ORDER.length;
  }, [state.stepIndex]);

  const isComplete = state.currentStep === 'summary';

  // ---- Actions ----

  /**
   * Initialize the session by loading content.
   */
  const startSession = useCallback(async () => {
    if (!stepId || !userId) {
      setState((s) => ({ ...s, error: 'Missing step ID or user ID' }));
      return;
    }

    setState((s) => ({ ...s, isLoading: true, error: null, startedAt: Date.now() }));

    try {
      const content = await loadSessionContent(stepId, userId);
      setState((s) => ({
        ...s,
        content,
        isLoading: false,
      }));
    } catch (err) {
      console.error('[useStairSession] Failed to load content:', err);
      setState((s) => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load session content',
      }));
    }
  }, [stepId, userId]);

  /**
   * Advance to the next step.
   */
  const nextStep = useCallback(() => {
    setState((s) => {
      const nextIndex = Math.min(s.stepIndex + 1, STEP_ORDER.length - 1);

      // If advancing to summary, calculate it
      if (STEP_ORDER[nextIndex] === 'summary' && s.content) {
        summaryRef.current = calculateSessionSummary(
          s.results,
          s.content.vocabulary,
          s.wordsAdded,
          s.startedAt
        );
      }

      return {
        ...s,
        stepIndex: nextIndex,
        currentStep: STEP_ORDER[nextIndex],
      };
    });
  }, []);

  /**
   * Go back to the previous step.
   */
  const previousStep = useCallback(() => {
    setState((s) => {
      const prevIndex = Math.max(s.stepIndex - 1, 0);
      return {
        ...s,
        stepIndex: prevIndex,
        currentStep: STEP_ORDER[prevIndex],
      };
    });
  }, []);

  // ---- Step Result Submission ----

  const submitVocabularyResult = useCallback((result: VocabularyStepResult) => {
    setState((s) => ({
      ...s,
      results: { ...s.results, vocabulary: result },
    }));
  }, []);

  const submitConversationResult = useCallback((result: ConversationStepResult) => {
    setState((s) => ({
      ...s,
      results: { ...s.results, conversation: result },
    }));
  }, []);

  const submitReadingResult = useCallback((result: ReadingStepResult) => {
    setState((s) => ({
      ...s,
      results: { ...s.results, reading: result },
    }));
  }, []);

  const submitWritingResult = useCallback((result: WritingStepResult) => {
    setState((s) => ({
      ...s,
      results: { ...s.results, writing: result },
    }));
  }, []);

  /**
   * Track a word being added to personal vocabulary.
   */
  const addWordToVocab = useCallback((word: string) => {
    setState((s) => {
      if (s.wordsAdded.includes(word)) return s;
      return { ...s, wordsAdded: [...s.wordsAdded, word] };
    });
  }, []);

  /**
   * Complete the session — apply FSRS updates and mark stair progress.
   */
  const completeSession = useCallback(async () => {
    if (!stepId || !userId || !summaryRef.current) return;

    const summary = summaryRef.current;

    try {
      // 1. Apply FSRS updates — reinforce/weaken vocabulary in word bank
      const qualityMap: Record<string, number> = { again: 1, hard: 2, good: 3, easy: 5 };

      for (const update of summary.fsrs_updates) {
        const quality = qualityMap[update.quality] ?? 3;
        try {
          const existingWord = await findWordByText(update.word);
          if (existingWord) {
            await recordReview(existingWord.id, quality, update.source);
          } else {
            await addOrReinforceWord({
              word: update.word,
              translation: '',
              source: 'lesson',
              category: 'stair-session',
            });
          }
        } catch (wordErr) {
          console.warn(`[useStairSession] FSRS update failed for "${update.word}":`, wordErr);
        }
      }

      // 2. Save practice scores to competency metrics
      await savePracticeScore(userId, 'conversation' as any, {
        communication: summary.conversation_score || 0,
        scenario: summary.overall_score || 0,
        fluency: summary.reading_score || 0,
        articulation: summary.writing_score || 0,
      });

      console.log('[useStairSession] Session complete:', {
        overall: summary.overall_score,
        totalTime: summary.total_time_seconds,
        vocabAdded: summary.vocab_added,
        fsrsApplied: summary.fsrs_updates.length,
      });
    } catch (err) {
      console.error('[useStairSession] Error completing session:', err);
    }
  }, [stepId, userId]);

  return {
    state,
    currentStep: state.currentStep,
    progress,
    content: state.content,
    summary: summaryRef.current,
    isComplete,

    startSession,
    nextStep,
    previousStep,
    submitVocabularyResult,
    submitConversationResult,
    submitReadingResult,
    submitWritingResult,
    addWordToVocab,
    completeSession,
  };
}

export default useStairSession;
