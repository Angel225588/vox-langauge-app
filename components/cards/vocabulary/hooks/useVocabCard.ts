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
  },
  lastVariantShown: VocabCardVariant | null
): VocabCardVariant {
  // First time seeing word: always Introduction
  if (!cardVariantsCompleted.introduction) {
    return 'introduction';
  }

  // Low mastery: prioritize Listening
  if (masteryScore < 50 && !cardVariantsCompleted.listening) {
    return 'listening';
  }

  // Medium mastery: introduce Typing
  if (masteryScore >= 30 && !cardVariantsCompleted.typing) {
    return 'typing';
  }

  // Review: rotate variants, avoid repetition
  const variants: VocabCardVariant[] = ['introduction', 'listening', 'typing'];
  const available = variants.filter((v) => v !== lastVariantShown);
  return available[Math.floor(Math.random() * available.length)];
}
