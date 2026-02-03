/**
 * useVocabFlowProgress Hook
 *
 * Integrates VocabularyCardFlow with:
 * - SM-2 spaced repetition algorithm
 * - Points/rewards system
 * - Progress tracking
 *
 * Usage:
 * const {
 *   handleFlowComplete,
 *   showReward,
 *   rewardData,
 *   dismissReward,
 *   isProcessing,
 *   lastSummary
 * } = useVocabFlowProgress({ userId, itemId });
 *
 * <VocabularyCardFlow
 *   item={item}
 *   onComplete={handleFlowComplete}
 *   onExit={handleExit}
 * />
 *
 * {showReward && (
 *   <RewardEarned
 *     voxEarned={rewardData.points}
 *     skillCurrency={rewardData.skillReward}
 *     multipliers={rewardData.multipliers}
 *     visible={showReward}
 *     onDismiss={dismissReward}
 *   />
 * )}
 */

import { useState, useCallback, useRef } from 'react';
import { useSpacedRepetition } from './useSpacedRepetition';
import {
  generateFlowSummary,
  VocabFlowSummary,
  PointsBreakdown,
  SkillReward,
} from '@/lib/learning/vocabIntegration';
import type { VocabCardResult } from '@/types/vocabulary';

interface UseVocabFlowProgressProps {
  /** Current user ID */
  userId: string;
  /** Vocabulary item ID being practiced */
  itemId: string;
  /** Callback after SM-2 and points are updated */
  onProgressUpdated?: (summary: VocabFlowSummary) => void;
  /** Callback for points update (to sync with global state) */
  onPointsEarned?: (points: number) => void;
}

interface RewardData {
  points: number;
  skillReward: SkillReward | null;
  multipliers: string[];
}

interface UseVocabFlowProgressReturn {
  /** Handler to pass to VocabularyCardFlow.onComplete */
  handleFlowComplete: (results: VocabCardResult[]) => Promise<void>;
  /** Whether to show the reward popup */
  showReward: boolean;
  /** Data for the reward popup */
  rewardData: RewardData;
  /** Dismiss the reward popup */
  dismissReward: () => void;
  /** Whether processing is in progress */
  isProcessing: boolean;
  /** Last flow summary (for debugging/display) */
  lastSummary: VocabFlowSummary | null;
  /** Any error that occurred */
  error: string | null;
  /** SM-2 progress data */
  progress: ReturnType<typeof useSpacedRepetition>['progress'];
  /** Next review date info */
  nextReviewInfo: {
    isDue: boolean;
    daysUntil: number;
  };
}

export function useVocabFlowProgress({
  userId,
  itemId,
  onProgressUpdated,
  onPointsEarned,
}: UseVocabFlowProgressProps): UseVocabFlowProgressReturn {
  // SM-2 hook for spaced repetition
  const {
    progress,
    submitReview,
    isDue,
    daysUntilNextReview,
    error: sm2Error,
  } = useSpacedRepetition({
    userId,
    flashcardId: itemId,
  });

  // Local state
  const [showReward, setShowReward] = useState(false);
  const [rewardData, setRewardData] = useState<RewardData>({
    points: 0,
    skillReward: null,
    multipliers: [],
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSummary, setLastSummary] = useState<VocabFlowSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Prevent duplicate processing
  const processingRef = useRef(false);

  /**
   * Main handler - called when VocabularyCardFlow completes
   */
  const handleFlowComplete = useCallback(
    async (results: VocabCardResult[]) => {
      // Prevent duplicate calls
      if (processingRef.current) {
        console.warn('⚠️ Flow completion already processing, skipping duplicate');
        return;
      }

      processingRef.current = true;
      setIsProcessing(true);
      setError(null);

      try {
        // 1. Generate summary from results
        const summary = generateFlowSummary(results);
        setLastSummary(summary);

        console.log('📊 Flow Summary:', {
          quality: summary.quality.quality,
          accuracy: `${Math.round(summary.quality.accuracy * 100)}%`,
          points: summary.points.totalPoints,
          multipliers: summary.points.multipliers,
        });

        // 2. Update SM-2 progress
        try {
          await submitReview(summary.quality.quality);
          console.log('✅ SM-2 updated:', summary.quality.quality);
        } catch (sm2Err) {
          console.error('❌ SM-2 update failed:', sm2Err);
          // Continue - we still want to show points
        }

        // 3. Prepare reward data
        setRewardData({
          points: summary.points.totalPoints,
          skillReward: summary.skillReward,
          multipliers: summary.points.multipliers,
        });

        // 4. Notify points earned (for global state sync)
        if (onPointsEarned && summary.points.totalPoints > 0) {
          onPointsEarned(summary.points.totalPoints);
        }

        // 5. Show reward popup
        setShowReward(true);

        // 6. Notify callback
        if (onProgressUpdated) {
          onProgressUpdated(summary);
        }

        console.log('🎉 Flow progress updated successfully');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to update progress';
        setError(errorMsg);
        console.error('❌ Flow progress error:', err);
      } finally {
        setIsProcessing(false);
        processingRef.current = false;
      }
    },
    [submitReview, onProgressUpdated, onPointsEarned]
  );

  /**
   * Dismiss the reward popup
   */
  const dismissReward = useCallback(() => {
    setShowReward(false);
  }, []);

  return {
    handleFlowComplete,
    showReward,
    rewardData,
    dismissReward,
    isProcessing,
    lastSummary,
    error: error || sm2Error,
    progress,
    nextReviewInfo: {
      isDue,
      daysUntil: daysUntilNextReview,
    },
  };
}

export default useVocabFlowProgress;
