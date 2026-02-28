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
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { DarkOverlay, AnswerOption, AnswerFeedbackOverlay } from '@/components/ui';
import { TypeBadge } from '@/components/ui/TypeBadge';
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
  const insets = useSafeAreaInsets();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const buttonScale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

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

  const getOptionState = (index: number): 'default' | 'selected' | 'correct' | 'wrong' => {
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TypeBadge variant="grammar" />
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

        {/* Sentence with blank - standalone without card wrapper */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(200)}
          style={styles.sentenceSection}
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

        {/* Visual separator */}
        <View style={styles.separator} />

        {/* Options label */}
        <Text style={styles.optionsLabel}>Choose the correct word:</Text>

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
      {!showWrongAnswer && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.sm }]}>
          <Animated.View style={buttonAnimatedStyle}>
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={selectedIndex === null || (showResult && selectedIndex === correct_answer)}
              activeOpacity={0.8}
              onPressIn={() => {
                buttonScale.value = withSpring(0.95);
              }}
              onPressOut={() => {
                buttonScale.value = withSpring(1);
              }}
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
                  <Ionicons name="checkmark" size={20} color={colors.text.primary} />
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
          </Animated.View>
        </View>
      )}

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
    position: 'relative',
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
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
  sentenceSection: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  sentenceText: {
    fontSize: typography.fontSize['2xl'],
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: typography.fontSize['2xl'] * 1.6,
    fontWeight: typography.fontWeight.medium,
  },
  selectedWord: {
    fontWeight: typography.fontWeight.bold,
    textDecorationLine: 'underline',
  },
  blankPlaceholder: {
    color: colors.primary.DEFAULT,
    textDecorationLine: 'underline',
    fontWeight: typography.fontWeight.bold,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  optionsLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionsContainer: {
    gap: spacing.sm,
    marginBottom: 100, // Space for fixed footer button
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background.primary,
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
  confirmButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  confirmButtonTextDisabled: {
    color: colors.text.tertiary,
  },
});
