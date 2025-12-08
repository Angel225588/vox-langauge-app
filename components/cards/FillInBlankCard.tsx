/**
 * Fill In Blank Card Component
 *
 * Grammar-in-context exercise where users select the correct word to complete a sentence.
 * Button fixed at bottom.
 *
 * Features:
 * - Displays sentence with [BLANK] placeholder
 * - Shows selected word inline in the sentence
 * - Multiple choice options
 * - Grammar explanation when incorrect
 * - Visual feedback and haptic responses
 * - Fixed button at bottom
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
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
    setSelectedIndex(index);
  };

  const handleConfirm = () => {
    if (selectedIndex === null) return;

    const isCorrect = correct_answer === selectedIndex;

    if (isCorrect) {
      haptics.success();
    } else {
      haptics.doubleError();
    }

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
    if (!showResult) {
      return selectedIndex === index ? 'selected' : 'default';
    }
    if (correct_answer === index) return 'correct';
    if (selectedIndex === index) return 'wrong';
    return 'default';
  };

  const getSelectedWordColor = () => {
    if (!showResult) return colors.accent.purple;
    return correct_answer === selectedIndex ? colors.success.DEFAULT : colors.error.DEFAULT;
  };

  return (
    <View style={styles.container}>
      <DarkOverlay visible={showWrongAnswer} zIndex={1} />

      {/* Content Area */}
      <View style={[styles.contentArea, showWrongAnswer && styles.contentDimmed]}>
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
        <View style={styles.optionsContainer}>
          {options.map((option, index) => (
            <AnswerOption
              key={index}
              text={option}
              onPress={() => handleSelect(index)}
              disabled={showResult}
              state={getOptionState(index)}
              entranceDelay={100 * (index + 1) + 300}
              hapticFeedback={true}
            />
          ))}
        </View>
      </View>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomActions}>
        {!showWrongAnswer && (
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={selectedIndex === null || (showResult && selectedIndex === correct_answer)}
            activeOpacity={0.8}
            style={[
              styles.confirmButton,
              (selectedIndex === null || (showResult && selectedIndex === correct_answer)) &&
                styles.confirmButtonDisabled,
            ]}
          >
            <LinearGradient
              colors={
                selectedIndex === null || (showResult && selectedIndex === correct_answer)
                  ? [colors.background.elevated, colors.background.card]
                  : colors.gradients.primary
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.confirmButtonGradient}
            >
              {showResult && selectedIndex === correct_answer && (
                <Text style={styles.checkIcon}>✓</Text>
              )}
              <Text
                style={[
                  styles.confirmButtonText,
                  (selectedIndex === null || (showResult && selectedIndex === correct_answer)) &&
                    styles.confirmButtonTextDisabled,
                ]}
              >
                {showResult && selectedIndex === correct_answer ? 'Correct!' : 'Confirm'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Feedback overlay */}
      <AnswerFeedbackOverlay
        visible={showWrongAnswer}
        title="Grammar Tip"
        explanation={explanation || `The correct answer is "${options[correct_answer]}"`}
        correctAnswer={options[correct_answer]}
        onContinue={handleContinue}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentArea: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  contentDimmed: {
    opacity: 0.5,
  },
  header: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  sentenceCard: {
    backgroundColor: colors.background.card,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xl,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.border.light,
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
  optionsContainer: {
    gap: spacing.sm,
  },
  bottomActions: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  confirmButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  checkIcon: {
    fontSize: 20,
    color: colors.text.primary,
  },
  confirmButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  confirmButtonTextDisabled: {
    color: colors.text.tertiary,
  },
});
