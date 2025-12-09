/**
 * VocabularyCardFlow - Card Sequence Orchestrator
 *
 * Manages the progression through different vocabulary card types for effective learning.
 * Flow: Introduction → AudioQuiz → Listening → Speaking → (optional) Typing
 *
 * Features:
 * - Progress indicator showing current step
 * - Smooth transitions between cards
 * - Back button to exit flow
 * - Results tracking per card
 * - Configurable flow sequence
 *
 * Design inspiration: Revolut flows, Duolingo lessons, premium UX
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  Layout,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius } from '@/constants/designSystem';
import { BackButton } from '@/components/ui';
import { IntroductionCard } from './IntroductionCard';
import { AudioQuizCard } from './AudioQuizCard';
import { ListeningCard } from './ListeningCard';
import { SpeakingCard } from './SpeakingCard';
import { TypingCard } from './TypingCard';
import { getFlowSequence } from './hooks/useVocabCard';
import type { VocabularyItem, VocabCardVariant, VocabCardResult } from '@/types/vocabulary';

interface VocabularyCardFlowProps {
  /** The vocabulary item to practice */
  item: VocabularyItem;
  /** Called when the entire flow is completed */
  onComplete: (results: VocabCardResult[]) => void;
  /** Called when user exits the flow early */
  onExit: () => void;
  /** Custom flow sequence (defaults to full flow) */
  sequence?: VocabCardVariant[];
  /** Whether to include all card types or just essentials */
  fullFlow?: boolean;
}

export function VocabularyCardFlow({
  item,
  onComplete,
  onExit,
  sequence: customSequence,
  fullFlow = true,
}: VocabularyCardFlowProps) {
  // Determine the flow sequence
  const sequence = useMemo(() => {
    if (customSequence) return customSequence;
    return getFlowSequence(!!item.imageUrl, fullFlow);
  }, [customSequence, item.imageUrl, fullFlow]);

  // Current position in the flow
  const [currentIndex, setCurrentIndex] = useState(0);

  // Results from each card
  const [results, setResults] = useState<VocabCardResult[]>([]);

  // Current card variant
  const currentVariant = sequence[currentIndex];

  // Handle card completion
  const handleCardComplete = useCallback((result: VocabCardResult) => {
    const newResults = [...results, result];
    setResults(newResults);

    // Check if this is the last card
    if (currentIndex >= sequence.length - 1) {
      onComplete(newResults);
    } else {
      // Move to next card
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, sequence.length, results, onComplete]);

  // Handle skip (treat as completed but mark accordingly)
  const handleSkip = useCallback(() => {
    const skipResult: VocabCardResult = {
      variant: currentVariant,
      correct: false,
      timeSpent: 0,
      audioReplays: 0,
      hintUsed: false,
    };

    const newResults = [...results, skipResult];
    setResults(newResults);

    // Check if this is the last card
    if (currentIndex >= sequence.length - 1) {
      onComplete(newResults);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, currentVariant, sequence.length, results, onComplete]);

  // Render the current card based on variant
  const renderCard = useCallback(() => {
    const commonProps = {
      item,
      onComplete: handleCardComplete,
      onSkip: handleSkip,
    };

    switch (currentVariant) {
      case 'introduction':
        return <IntroductionCard {...commonProps} />;
      case 'audioQuiz':
        return <AudioQuizCard {...commonProps} />;
      case 'listening':
        return <ListeningCard {...commonProps} />;
      case 'speaking':
        return <SpeakingCard {...commonProps} />;
      case 'typing':
        return <TypingCard {...commonProps} />;
      default:
        return <IntroductionCard {...commonProps} />;
    }
  }, [currentVariant, item, handleCardComplete, handleSkip]);

  // Progress calculation
  const progress = (currentIndex + 1) / sequence.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button and Progress */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={styles.header}
      >
        <BackButton onPress={onExit} />

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View
              layout={Layout.springify()}
              style={[
                styles.progressFill,
                { width: `${progress * 100}%` },
              ]}
            />
          </View>
          <View style={styles.stepIndicators}>
            {sequence.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.stepDot,
                  index <= currentIndex && styles.stepDotActive,
                  index === currentIndex && styles.stepDotCurrent,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Spacer for symmetry */}
        <View style={styles.headerSpacer} />
      </Animated.View>

      {/* Card Container */}
      <Animated.View
        key={currentIndex}
        entering={SlideInRight.duration(300)}
        exiting={SlideOutLeft.duration(200)}
        style={styles.cardContainer}
      >
        {renderCard()}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: borderRadius.full,
  },
  stepIndicators: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.elevated,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  stepDotActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  stepDotCurrent: {
    width: 10,
    height: 10,
    backgroundColor: colors.primary.light,
    borderColor: colors.primary.light,
  },
  headerSpacer: {
    width: 44, // Same width as BackButton for symmetry
  },
  cardContainer: {
    flex: 1,
  },
});

export default VocabularyCardFlow;
