/**
 * VocabularyCardFlow - Card Sequence Orchestrator
 *
 * Manages the progression through different vocabulary card types for effective learning.
 * Flow: Introduction → AudioQuiz → Listening → Speaking → (optional) Typing
 *
 * Features:
 * - Full-screen cards (each card handles its own safe areas)
 * - Smooth slide transitions between cards
 * - Results tracking per card
 * - Configurable flow sequence
 *
 * Design inspiration: Premium immersive card experience
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import { colors } from '@/constants/designSystem';
import { IntroductionCardV2 } from './IntroductionCardV2';
import { AudioQuizCard } from './AudioQuizCard';
import { ListeningCard } from './ListeningCard';
import { SpeakingCard } from '@/components/cards/SpeakingCard';
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

  // Handle "I can't speak" - switch to typing card
  const handleCantSpeak = useCallback(() => {
    // Find typing card in sequence
    const typingIndex = sequence.indexOf('typing');

    if (typingIndex !== -1 && typingIndex > currentIndex) {
      // Skip directly to typing card
      setCurrentIndex(typingIndex);
    } else if (!sequence.includes('typing')) {
      // Typing not in sequence, treat as skip and add typing
      const skipResult: VocabCardResult = {
        variant: currentVariant,
        correct: false,
        timeSpent: 0,
        audioReplays: 0,
        hintUsed: false,
      };
      const newResults = [...results, skipResult];
      setResults(newResults);

      // Move to next card (or complete if last)
      if (currentIndex >= sequence.length - 1) {
        onComplete(newResults);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    } else {
      // Typing is before current (already passed), just skip
      handleSkip();
    }
  }, [sequence, currentIndex, currentVariant, results, onComplete, handleSkip]);

  // Handle speaking card completion (adapts practice card to flow)
  const handleSpeakingComplete = useCallback(() => {
    const result: VocabCardResult = {
      variant: 'speaking',
      correct: true, // Speaking is always counted as success if completed
      timeSpent: 0,
      audioReplays: 0,
      hintUsed: false,
    };
    handleCardComplete(result);
  }, [handleCardComplete]);

  // Render the current card based on variant
  const renderCard = useCallback(() => {
    const commonProps = {
      item,
      onComplete: handleCardComplete,
      onSkip: handleSkip,
    };

    switch (currentVariant) {
      case 'introduction':
        return <IntroductionCardV2 {...commonProps} />;
      case 'audioQuiz':
        return <AudioQuizCard {...commonProps} />;
      case 'listening':
        return <ListeningCard {...commonProps} />;
      case 'speaking':
        // Use practice tab's SpeakingCard with adapted props
        return (
          <SpeakingCard
            word={item.word}
            translation={item.translation}
            phonetic={item.phonetic}
            audio_url={item.audioUrl}
            expressionType={item.partOfSpeech}
            onComplete={handleSpeakingComplete}
            onCantSpeak={handleCantSpeak}
          />
        );
      case 'typing':
        return <TypingCard {...commonProps} />;
      default:
        return <IntroductionCardV2 {...commonProps} />;
    }
  }, [currentVariant, item, handleCardComplete, handleSkip, handleCantSpeak, handleSpeakingComplete]);

  return (
    <View style={styles.container}>
      {/* Card Container - Full screen, cards handle their own safe areas */}
      <Animated.View
        key={currentIndex}
        entering={SlideInRight.duration(300)}
        exiting={SlideOutLeft.duration(200)}
        style={styles.cardContainer}
      >
        {renderCard()}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  cardContainer: {
    flex: 1,
  },
});

export default VocabularyCardFlow;
