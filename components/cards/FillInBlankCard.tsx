/**
 * Fill In Blank Card Component
 *
 * Grammar-in-context exercise where users select the correct word to complete a sentence.
 *
 * Features:
 * - Displays sentence with [BLANK] placeholder
 * - Shows selected word inline in the sentence
 * - Multiple choice options
 * - Grammar explanation when incorrect
 * - Dual highlighting (correct in green, incorrect in red)
 * - Visual feedback and haptic responses
 * - Auto-advances after selection (1.5s delay)
 *
 * Learning Objective: Reinforce grammar in authentic sentence context
 *
 * REFACTORED: Now uses shared UI components for consistency
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';

// Shared UI components
import { DarkOverlay, AnswerOption, AnswerFeedbackOverlay } from '@/components/ui';
import { useHaptics } from '@/hooks/useHaptics';

interface FillInBlankCardProps {
  sentence: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
  onNext: (result?: any) => void;
}

export function FillInBlankCard({
  sentence,
  options,
  correct_answer,
  explanation,
  onNext,
}: FillInBlankCardProps) {
  const haptics = useHaptics();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (index: number) => {
    const isCorrect = correct_answer === index;

    if (isCorrect) {
      haptics.success();
    } else {
      haptics.doubleError();
    }

    setSelectedIndex(index);
    setShowResult(true);

    if (isCorrect) {
      setTimeout(() => {
        onNext({ correct: true, points: 15 });
        setSelectedIndex(null);
        setShowResult(false);
      }, 1500);
    }
  };

  const handleContinue = () => {
    onNext({ correct: false, points: 5 });
    setSelectedIndex(null);
    setShowResult(false);
  };

  const parts = sentence.split('[BLANK]');
  const selectedWord = selectedIndex !== null ? options[selectedIndex] : null;
  const showWrongAnswer = showResult && selectedIndex !== correct_answer;

  const getOptionState = (index: number) => {
    if (!showResult) return 'default';
    if (correct_answer === index) return 'correct';
    if (selectedIndex === index) return 'wrong';
    return 'default';
  };

  // Determine the color for the selected word
  const getSelectedWordColor = () => {
    if (!showResult) return colors.accent.purple;
    return correct_answer === selectedIndex ? colors.success.DEFAULT : colors.error.DEFAULT;
  };

  return (
    <View style={styles.container}>
      <DarkOverlay visible={showWrongAnswer} zIndex={1} />

      <View style={[styles.content, showWrongAnswer && styles.contentDimmed]}>
        {/* Header */}
        <Animated.Text
          entering={FadeInDown.duration(400)}
          style={styles.header}
        >
          Fill in the blank
        </Animated.Text>

        {/* Sentence with blank */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(200)}
          style={styles.sentenceCard}
        >
          <Text style={styles.sentenceText}>
            {parts[0]}
            {selectedWord ? (
              <Text style={[styles.selectedWord, { color: getSelectedWordColor() }]}>
                {selectedWord}
              </Text>
            ) : (
              <Text style={styles.blankPlaceholder}>_______</Text>
            )}
            {parts[1]}
          </Text>
        </Animated.View>

        {/* Options */}
        {options.map((option, index) => (
          <AnswerOption
            key={index}
            text={option}
            onPress={() => handleSelect(index)}
            disabled={showResult}
            state={getOptionState(index)}
            entranceDelay={100 * (index + 1) + 300}
            hapticFeedback={false}
          />
        ))}
      </View>

      {/* Feedback overlay */}
      <AnswerFeedbackOverlay
        visible={showWrongAnswer}
        title="Grammar Tip"
        explanation={explanation}
        onContinue={handleContinue}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  contentDimmed: {
    opacity: 0.5,
  },
  header: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  sentenceCard: {
    backgroundColor: colors.background.card,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xl + spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  sentenceText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: typography.fontSize.lg * 1.5,
  },
  selectedWord: {
    fontWeight: typography.fontWeight.bold,
    textDecorationLine: 'underline',
  },
  blankPlaceholder: {
    color: colors.text.tertiary,
    textDecorationLine: 'underline',
  },
});
