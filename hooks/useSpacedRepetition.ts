/**
 * useSpacedRepetition Hook
 *
 * React hook that wraps the SM-2 spaced repetition algorithm
 * and integrates with the database for progress tracking.
 */

import { useState, useCallback } from 'react';
import {
  calculateSM2,
  simpleToReviewQuality,
  isDueForReview,
  getDaysUntilReview,
  initializeSM2,
  SM2Result,
} from '@/lib/spaced-repetition/sm2';
import {
  updateFlashcardProgress,
  getOrCreateProgress,
} from '@/lib/db/flashcards';
import {
  UserFlashcardProgress,
  SimpleQuality,
  ReviewQuality,
} from '@/types/flashcard';

interface UseSpacedRepetitionProps {
  userId: string;
  flashcardId: string;
}

interface UseSpacedRepetitionReturn {
  progress: UserFlashcardProgress | null;
  loading: boolean;
  error: string | null;

  // Check if card is due
  isDue: boolean;
  daysUntilNextReview: number;

  // Submit a review
  submitReview: (quality: SimpleQuality) => Promise<void>;

  // Get or initialize progress
  loadProgress: () => Promise<void>;

  // Calculate what next review would be (without saving)
  previewNextReview: (quality: SimpleQuality) => SM2Result;
}

/**
 * Hook for managing spaced repetition progress for a single flashcard
 */
export function useSpacedRepetition({
  userId,
  flashcardId,
}: UseSpacedRepetitionProps): UseSpacedRepetitionReturn {
  const [progress, setProgress] = useState<UserFlashcardProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load or create progress for this flashcard
   */
  const loadProgress = useCallback(async () => {
    if (!userId || !flashcardId) {
      setError('Missing userId or flashcardId');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const flashcardProgress = await getOrCreateProgress(userId, flashcardId);
      setProgress(flashcardProgress);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to load progress';
      setError(errorMessage);
      console.error('Error loading progress:', e);
    } finally {
      setLoading(false);
    }
  }, [userId, flashcardId]);

  /**
   * Submit a review and update progress
   */
  const submitReview = useCallback(
    async (quality: SimpleQuality) => {
      if (!userId || !flashcardId) {
        throw new Error('Missing userId or flashcardId');
      }

      setLoading(true);
      setError(null);

      try {
        // Convert simple quality to ReviewQuality enum
        const reviewQuality = simpleToReviewQuality(quality);

        // Update progress in database (calculates SM-2 internally)
        const updatedProgress = await updateFlashcardProgress(
          userId,
          flashcardId,
          reviewQuality
        );

        setProgress(updatedProgress);

        console.log(`✅ Review submitted: ${quality} (${reviewQuality})`);
        console.log(
          `📅 Next review: ${updatedProgress.next_review} (${getDaysUntilReview(updatedProgress.next_review)} days)`
        );
      } catch (e) {
        const errorMessage =
          e instanceof Error ? e.message : 'Failed to submit review';
        setError(errorMessage);
        console.error('Error submitting review:', e);
        throw e; // Re-throw so caller can handle
      } finally {
        setLoading(false);
      }
    },
    [userId, flashcardId]
  );

  /**
   * Preview what the next review would be without saving
   * Useful for showing users "what happens if I click this"
   */
  const previewNextReview = useCallback(
    (quality: SimpleQuality): SM2Result => {
      const reviewQuality = simpleToReviewQuality(quality);

      // Use current progress or defaults
      const currentProgress = progress || {
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
      };

      return calculateSM2({
        quality: reviewQuality,
        easeFactor: currentProgress.ease_factor,
        interval: currentProgress.interval,
        repetitions: currentProgress.repetitions,
      });
    },
    [progress]
  );

  // Calculate derived values
  const isDue = progress ? isDueForReview(progress.next_review) : true;
  const daysUntilNextReview = progress
    ? getDaysUntilReview(progress.next_review)
    : 0;

  return {
    progress,
    loading,
    error,
    isDue,
    daysUntilNextReview,
    submitReview,
    loadProgress,
    previewNextReview,
  };
}

/**
 * Helper hook for batch operations on multiple flashcards
 */
interface UseBatchSpacedRepetitionProps {
  userId: string;
  flashcardIds: string[];
}

interface FlashcardProgressMap {
  [flashcardId: string]: UserFlashcardProgress;
}

interface UseBatchSpacedRepetitionReturn {
  progressMap: FlashcardProgressMap;
  loading: boolean;
  error: string | null;
  loadAllProgress: () => Promise<void>;
  getDueCount: () => number;
}

/**
 * Hook for managing progress for multiple flashcards at once
 * Useful for session screens that need to check multiple cards
 */
export function useBatchSpacedRepetition({
  userId,
  flashcardIds,
}: UseBatchSpacedRepetitionProps): UseBatchSpacedRepetitionReturn {
  const [progressMap, setProgressMap] = useState<FlashcardProgressMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load progress for all flashcard IDs
   */
  const loadAllProgress = useCallback(async () => {
    if (!userId || flashcardIds.length === 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const progressPromises = flashcardIds.map((id) =>
        getOrCreateProgress(userId, id)
      );

      const allProgress = await Promise.all(progressPromises);

      // Convert array to map for easier lookup
      const map: FlashcardProgressMap = {};
      allProgress.forEach((progress) => {
        map[progress.flashcard_id] = progress;
      });

      setProgressMap(map);
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : 'Failed to load progress';
      setError(errorMessage);
      console.error('Error loading batch progress:', e);
    } finally {
      setLoading(false);
    }
  }, [userId, flashcardIds]);

  /**
   * Get count of cards that are due for review
   */
  const getDueCount = useCallback(() => {
    return Object.values(progressMap).filter((progress) =>
      isDueForReview(progress.next_review)
    ).length;
  }, [progressMap]);

  return {
    progressMap,
    loading,
    error,
    loadAllProgress,
    getDueCount,
  };
}
