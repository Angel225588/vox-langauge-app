/**
 * VocabularyPracticeScreen - Complete Vocabulary Practice Experience
 *
 * This screen demonstrates the full integration of:
 * - VocabularyCardFlow (card orchestration)
 * - useVocabFlowProgress (SM-2 + points)
 * - RewardEarned popup
 *
 * Usage:
 * <VocabularyPracticeScreen
 *   item={vocabularyItem}
 *   userId={currentUserId}
 *   onComplete={() => navigation.goBack()}
 * />
 */

import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { VocabularyCardFlow } from './VocabularyCardFlow';
import { RewardEarned } from '@/components/ui/rewards/VoxCounter';
import { useVocabFlowProgress } from '@/hooks/useVocabFlowProgress';
import { colors } from '@/constants/designSystem';
import type { VocabularyItem, VocabCardResult } from '@/types/vocabulary';

interface VocabularyPracticeScreenProps {
  /** The vocabulary item to practice */
  item: VocabularyItem;
  /** Current user ID */
  userId: string;
  /** Called when practice is complete (after reward dismissed) */
  onComplete: () => void;
  /** Called when user exits early */
  onExit?: () => void;
  /** Optional: Sync points to global state */
  onPointsEarned?: (points: number) => void;
  /** Custom flow sequence */
  sequence?: ('introduction' | 'audioQuiz' | 'listening' | 'speaking' | 'typing')[];
  /** Full flow or essentials only */
  fullFlow?: boolean;
}

export function VocabularyPracticeScreen({
  item,
  userId,
  onComplete,
  onExit,
  onPointsEarned,
  sequence,
  fullFlow = true,
}: VocabularyPracticeScreenProps) {
  // Integrate SM-2 and points tracking
  const {
    handleFlowComplete,
    showReward,
    rewardData,
    dismissReward,
    lastSummary,
  } = useVocabFlowProgress({
    userId,
    itemId: item.id,
    onPointsEarned,
    onProgressUpdated: (summary) => {
      console.log('📈 Progress updated:', {
        nextReview: summary.quality.quality,
        points: summary.points.totalPoints,
      });
    },
  });

  // Handle flow completion - show reward, then call onComplete
  const handleComplete = useCallback(
    async (results: VocabCardResult[]) => {
      await handleFlowComplete(results);
      // Note: onComplete will be called after reward is dismissed
    },
    [handleFlowComplete]
  );

  // Handle reward dismissal - then complete
  const handleRewardDismiss = useCallback(() => {
    dismissReward();

    // Log summary for debugging
    if (lastSummary) {
      console.log('🎯 Final Summary:', {
        accuracy: `${Math.round(lastSummary.quality.accuracy * 100)}%`,
        quality: lastSummary.quality.quality,
        totalPoints: lastSummary.points.totalPoints,
        breakdown: {
          base: lastSummary.points.basePoints,
          accuracy: lastSummary.points.accuracyBonus,
          speed: lastSummary.points.speedBonus,
          penalty: lastSummary.points.hintPenalty,
        },
      });
    }

    // Navigate away
    onComplete();
  }, [dismissReward, lastSummary, onComplete]);

  // Handle early exit
  const handleExit = useCallback(() => {
    if (onExit) {
      onExit();
    } else {
      onComplete();
    }
  }, [onExit, onComplete]);

  return (
    <View style={styles.container}>
      {/* Card Flow */}
      <VocabularyCardFlow
        item={item}
        onComplete={handleComplete}
        onExit={handleExit}
        sequence={sequence}
        fullFlow={fullFlow}
      />

      {/* Reward Popup */}
      <RewardEarned
        voxEarned={rewardData.points}
        skillCurrency={rewardData.skillReward || undefined}
        multipliers={rewardData.multipliers}
        visible={showReward}
        onDismiss={handleRewardDismiss}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
});

export default VocabularyPracticeScreen;
