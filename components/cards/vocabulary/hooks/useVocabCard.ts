/**
 * useVocabCard Hook
 *
 * Manages state and logic for vocabulary cards including:
 * - Audio playback tracking
 * - Time tracking for AI analysis
 * - Hint usage tracking
 * - Result calculation
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import type { VocabCardVariant, VocabCardResult } from '@/types/vocabulary';

interface UseVocabCardOptions {
  variant: VocabCardVariant;
  onComplete: (result: VocabCardResult) => void;
}

export function useVocabCard({ variant, onComplete }: UseVocabCardOptions) {
  const [audioReplays, setAudioReplays] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  // Reset timer when variant changes
  useEffect(() => {
    startTimeRef.current = Date.now();
    setAudioReplays(0);
    setHintUsed(false);
  }, [variant]);

  const trackAudioPlay = useCallback(() => {
    setAudioReplays((prev) => prev + 1);
  }, []);

  const trackHintUsed = useCallback(() => {
    setHintUsed(true);
  }, []);

  const complete = useCallback(
    (correct: boolean, userInput?: string) => {
      const timeSpent = Date.now() - startTimeRef.current;

      const result: VocabCardResult = {
        variant,
        correct,
        timeSpent,
        audioReplays,
        hintUsed,
        userInput,
      };

      onComplete(result);
    },
    [variant, audioReplays, hintUsed, onComplete]
  );

  return {
    audioReplays,
    hintUsed,
    trackAudioPlay,
    trackHintUsed,
    complete,
    timeElapsed: () => Date.now() - startTimeRef.current,
  };
}

/**
 * Select the next card variant based on mastery and history
 */
export function selectNextVariant(
  masteryScore: number,
  cardVariantsCompleted: {
    introduction: boolean;
    listening: boolean;
    typing: boolean;
    speaking: boolean;
    audioQuiz: boolean;
  },
  lastVariantShown: VocabCardVariant | null
): VocabCardVariant {
  // First time seeing word: always Introduction
  if (!cardVariantsCompleted.introduction) {
    return 'introduction';
  }

  // Low mastery: prioritize audio recognition (audioQuiz)
  if (masteryScore < 30 && !cardVariantsCompleted.audioQuiz) {
    return 'audioQuiz';
  }

  // Low-medium mastery: Listening (write what you hear)
  if (masteryScore < 50 && !cardVariantsCompleted.listening) {
    return 'listening';
  }

  // Medium mastery: introduce Typing (active recall)
  if (masteryScore >= 30 && masteryScore < 70 && !cardVariantsCompleted.typing) {
    return 'typing';
  }

  // Higher mastery: Speaking practice
  if (masteryScore >= 50 && !cardVariantsCompleted.speaking) {
    return 'speaking';
  }

  // Review: rotate variants, avoid repetition
  const variants: VocabCardVariant[] = ['introduction', 'listening', 'typing', 'speaking', 'audioQuiz'];
  const available = variants.filter((v) => v !== lastVariantShown);
  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Get the recommended flow sequence for a vocabulary item
 * Returns an ordered array of card variants to show
 */
export function getFlowSequence(
  hasImage: boolean = false,
  includeAll: boolean = true
): VocabCardVariant[] {
  const baseSequence: VocabCardVariant[] = [
    'introduction',  // 1. See the word, examples, translation
    'audioQuiz',     // 2. Listen & select (recognition)
    'listening',     // 3. Listen & write (recall)
    'speaking',      // 4. Listen & speak (production)
  ];

  if (!includeAll) {
    // Short flow - just introduction and one practice
    return ['introduction', 'audioQuiz'];
  }

  // Optional: Add typing for writing practice
  baseSequence.push('typing');

  return baseSequence;
}
