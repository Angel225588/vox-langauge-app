/**
 * useConversationFeedback Hook
 *
 * Convenience hook for capturing and storing conversation feedback
 * after a voice call completes. Integrates with the conversation analyzer.
 *
 * @example
 * ```tsx
 * const { captureFeedback, isSaving, lastFeedback } = useConversationFeedback();
 *
 * const handleCallComplete = async (result: VoiceCallCompletionResult) => {
 *   if (result.success) {
 *     await captureFeedback({
 *       session: result,
 *       scenarioId: 'cafe_ordering',
 *       voice: selectedVoice,
 *     });
 *   }
 *   // Continue to feedback screen...
 * };
 * ```
 */

import { useState, useCallback } from 'react';
import { analyzeConversation, ConversationFeedback, getQuickFeedbackSummary } from './conversationAnalyzer';
import type { ElevenLabsVoiceConfig, ConversationSession, ElevenLabsMessage } from '@/lib/voice/elevenLabsTypes';
import type { AccentType, SupportedLanguage } from '@/lib/voice/types';

// =============================================================================
// Types
// =============================================================================

/** Input for capturing feedback */
export interface CaptureFeedbackInput {
  /** Session ID from ElevenLabs */
  sessionId: string;
  /** Scenario that was practiced */
  scenarioId: string;
  /** Voice configuration used */
  voice: ElevenLabsVoiceConfig;
  /** Conversation messages (transcript) */
  messages: ElevenLabsMessage[];
  /** Duration in seconds */
  durationSeconds: number;
  /** Points earned (if any) */
  pointsEarned?: number;
  /** Target language being learned */
  targetLanguage: SupportedLanguage;
}

/** Quick feedback summary for UI display */
export interface QuickFeedback {
  fluencyLevel: string;
  confidence: string;
  topSuggestion: string;
  vocabularyCount: number;
}

/** Return type from the hook */
export interface UseConversationFeedbackReturn {
  /** Capture and analyze feedback from a completed conversation */
  captureFeedback: (input: CaptureFeedbackInput) => Promise<ConversationFeedback>;
  /** Whether feedback is currently being saved */
  isSaving: boolean;
  /** Last captured feedback (useful for displaying results) */
  lastFeedback: ConversationFeedback | null;
  /** Quick summary of last feedback for UI */
  lastQuickSummary: QuickFeedback | null;
  /** Any error that occurred */
  error: Error | null;
  /** Clear the last feedback */
  clearFeedback: () => void;
}

// =============================================================================
// Hook Implementation
// =============================================================================

/**
 * Hook for capturing and managing conversation feedback
 */
export function useConversationFeedback(): UseConversationFeedbackReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<ConversationFeedback | null>(null);
  const [lastQuickSummary, setLastQuickSummary] = useState<QuickFeedback | null>(null);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Capture and analyze feedback from a completed conversation
   */
  const captureFeedback = useCallback(async (input: CaptureFeedbackInput): Promise<ConversationFeedback> => {
    setIsSaving(true);
    setError(null);

    try {
      // Build a session object for the analyzer
      const session: ConversationSession = {
        id: input.sessionId,
        startTime: Date.now() - (input.durationSeconds * 1000),
        endTime: Date.now(),
        messages: input.messages,
        scenario: input.scenarioId,
        accent: input.voice.accent || 'en-american',
        voiceId: input.voice.elevenLabsVoiceId,
        duration: input.durationSeconds,
        turnCount: input.messages.filter(m => m.role === 'user').length,
        avgWordsPerTurn: 0, // Will be calculated by analyzer
        pointsEarned: input.pointsEarned || 0,
      };

      // Analyze the conversation
      const feedback = analyzeConversation(
        session,
        input.scenarioId,
        input.voice.elevenLabsVoiceId,
        input.voice.accent || 'en-american',
        input.targetLanguage
      );

      // Generate quick summary for UI
      const quickSummary = getQuickFeedbackSummary(feedback);

      // Store in state
      setLastFeedback(feedback);
      setLastQuickSummary(quickSummary);

      // TODO: Save to database (when Supabase is connected)
      // await saveFeedbackToDatabase(feedback);

      console.log('[ConversationFeedback] Captured:', {
        sessionId: feedback.sessionId,
        fluency: feedback.aiObservations.fluencyScore,
        turns: feedback.userTurns,
        vocabulary: feedback.aiObservations.vocabularyUsed.length,
      });

      return feedback;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('[ConversationFeedback] Error:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  /**
   * Clear the last feedback
   */
  const clearFeedback = useCallback(() => {
    setLastFeedback(null);
    setLastQuickSummary(null);
    setError(null);
  }, []);

  return {
    captureFeedback,
    isSaving,
    lastFeedback,
    lastQuickSummary,
    error,
    clearFeedback,
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Create feedback input from VoiceCallCompletionResult
 *
 * Convenience function to transform the onComplete result into
 * the format needed for captureFeedback.
 */
export function createFeedbackInput(
  result: {
    success: boolean;
    messages?: ElevenLabsMessage[];
    transcript?: ElevenLabsMessage[];
    duration: number;
  },
  sessionId: string,
  scenarioId: string,
  voice: ElevenLabsVoiceConfig,
  targetLanguage: SupportedLanguage
): CaptureFeedbackInput | null {
  // Only capture feedback for successful sessions with messages
  const messages = result.transcript || result.messages || [];

  if (!result.success || messages.length < 2) {
    return null;
  }

  return {
    sessionId,
    scenarioId,
    voice,
    messages: messages as ElevenLabsMessage[],
    durationSeconds: result.duration,
    targetLanguage,
  };
}

// =============================================================================
// Export
// =============================================================================

export default useConversationFeedback;
