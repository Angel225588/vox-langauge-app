/**
 * AnswerFeedbackOverlay Component
 *
 * A bottom sheet overlay that shows feedback when a user answers incorrectly.
 * Displays a tip/explanation and a continue button.
 *
 * Used in: AudioCard, FillInBlankCard, ImageQuizCard, MultipleChoiceCard, TextInputCard
 *
 * Features:
 * - Slides up from bottom with fade animation
 * - Customizable title (e.g., "Listening Tip", "Grammar Tip", "Spelling Tip")
 * - Optional explanation text
 * - Shows correct answer if provided
 * - Continue button with haptic feedback
 * - Consistent error styling with left border accent
 *
 * @example
 * ```tsx
 * // Basic usage
 * <AnswerFeedbackOverlay
 *   visible={showWrongAnswer}
 *   title="Grammar Tip"
 *   explanation="Remember: 'ser' is used for permanent states, 'estar' for temporary ones."
 *   onContinue={handleContinue}
 * />
 *
 * // With correct answer shown
 * <AnswerFeedbackOverlay
 *   visible={showWrongAnswer}
 *   title="Spelling Tip"
 *   explanation="Watch out for double letters!"
 *   correctAnswer="necessary"
 *   onContinue={handleContinue}
 * />
 *
 * // Custom button label
 * <AnswerFeedbackOverlay
 *   visible={showWrongAnswer}
 *   title="Try Again"
 *   onContinue={handleRetry}
 *   buttonLabel="Retry"
 * />
 * ```
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';
import { useHaptics } from '@/hooks/useHaptics';

/** Background color for error feedback cards */
const ERROR_BACKGROUND = '#2D1B1E';

export interface AnswerFeedbackOverlayProps {
  /** Whether the overlay is visible */
  visible: boolean;
  /** Title of the feedback (e.g., "Listening Tip", "Grammar Tip") */
  title: string;
  /** Explanation or tip text */
  explanation?: string;
  /** The correct answer to display (optional) */
  correctAnswer?: string;
  /** Label for correct answer section. Default: "Correct answer:" */
  correctAnswerLabel?: string;
  /** Called when continue button is pressed */
  onContinue: () => void;
  /** Label for the continue button. Default: "Continue" */
  buttonLabel?: string;
  /** Animation delay in ms. Default: 200 */
  animationDelay?: number;
}

export function AnswerFeedbackOverlay({
  visible,
  title,
  explanation,
  correctAnswer,
  correctAnswerLabel = 'Correct answer:',
  onContinue,
  buttonLabel = 'Continue',
  animationDelay = 200,
}: AnswerFeedbackOverlayProps) {
  const haptics = useHaptics();

  if (!visible) return null;

  const handleContinue = () => {
    haptics.medium();
    onContinue();
  };

  const hasContent = explanation || correctAnswer;

  return (
    <Animated.View
      entering={FadeIn.duration(400).delay(animationDelay)}
      style={styles.container}
    >
      <Animated.View
        entering={SlideInDown.duration(400).delay(animationDelay + 100).springify()}
        style={styles.card}
      >
        {/* Tip/Explanation Section */}
        {hasContent && (
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>

            {explanation && (
              <Text style={styles.explanation}>{explanation}</Text>
            )}

            {correctAnswer && (
              <View style={styles.correctAnswerContainer}>
                <Text style={styles.correctAnswerLabel}>{correctAnswerLabel}</Text>
                <Text style={styles.correctAnswer}>{correctAnswer}</Text>
              </View>
            )}
          </View>
        )}

        {/* Continue Button */}
        <View style={[styles.buttonContainer, !hasContent && styles.buttonContainerNoContent]}>
          <TouchableOpacity
            onPress={handleContinue}
            activeOpacity={0.8}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{buttonLabel}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  card: {
    marginHorizontal: spacing.lg,
    backgroundColor: ERROR_BACKGROUND,
    borderRadius: borderRadius.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.error.DEFAULT,
    overflow: 'hidden',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.error.light,
    marginBottom: spacing.sm,
  },
  explanation: {
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    lineHeight: 26,
  },
  correctAnswerContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  correctAnswerLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  correctAnswer: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.success.light,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: 0,
    paddingBottom: spacing.xl,
  },
  buttonContainerNoContent: {
    paddingTop: spacing.lg,
  },
  button: {
    backgroundColor: colors.error.DEFAULT,
    borderWidth: 2,
    borderColor: colors.error.light,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    borderRadius: borderRadius.xl,
    shadowColor: colors.error.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
});
