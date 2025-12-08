/**
 * AnswerOption Component
 *
 * A reusable quiz answer button with correct/incorrect visual states.
 * Used in multiple choice cards: AudioCard, ImageQuizCard, MultipleChoiceCard, FillInBlankCard.
 *
 * Features:
 * - Three states: default, correct (green), wrong (red)
 * - Checkmark (✓) or X (✗) indicators when revealed
 * - Animated shadows and glow effects
 * - Built-in haptic feedback
 * - Staggered entrance animation support
 *
 * @example
 * ```tsx
 * // Basic usage in a quiz
 * {options.map((option, index) => (
 *   <AnswerOption
 *     key={index}
 *     text={option}
 *     onPress={() => handleSelect(index)}
 *     disabled={showResult}
 *     state={
 *       showResult && correctAnswer === index
 *         ? 'correct'
 *         : showResult && selectedIndex === index
 *           ? 'wrong'
 *           : 'default'
 *     }
 *   />
 * ))}
 *
 * // With entrance animation delay
 * <AnswerOption
 *   text="Option A"
 *   onPress={handlePress}
 *   entranceDelay={100}
 * />
 * ```
 */

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';
import { useHaptics } from '@/hooks/useHaptics';

export type AnswerOptionState = 'default' | 'correct' | 'wrong';

export interface AnswerOptionProps {
  /** The text to display in the option */
  text: string;
  /** Called when option is pressed */
  onPress: () => void;
  /** Whether the option is disabled (e.g., after answer revealed) */
  disabled?: boolean;
  /** Visual state: 'default', 'correct', or 'wrong' */
  state?: AnswerOptionState;
  /** Delay for entrance animation in ms. Default: 0 */
  entranceDelay?: number;
  /** Whether to show entrance animation. Default: true */
  animate?: boolean;
  /** Whether to trigger haptic feedback on press. Default: true */
  hapticFeedback?: boolean;
  /** Test ID for testing */
  testID?: string;
}

export function AnswerOption({
  text,
  onPress,
  disabled = false,
  state = 'default',
  entranceDelay = 0,
  animate = true,
  hapticFeedback = true,
  testID,
}: AnswerOptionProps) {
  const haptics = useHaptics();

  const handlePress = () => {
    if (hapticFeedback) {
      haptics.light();
    }
    onPress();
  };

  const isCorrect = state === 'correct';
  const isWrong = state === 'wrong';
  const isRevealed = isCorrect || isWrong;

  // Dynamic styles based on state
  const backgroundColor = isCorrect
    ? colors.success.DEFAULT
    : isWrong
      ? colors.error.DEFAULT
      : colors.background.card;

  const borderColor = isRevealed ? 'transparent' : colors.border.light;

  const shadowColor = isCorrect
    ? colors.success.DEFAULT
    : isWrong
      ? colors.error.DEFAULT
      : '#000';

  const shadowOpacity = isRevealed ? 0.4 : 0.1;
  const elevation = isRevealed ? 4 : 2;

  const content = (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
      testID={testID}
      style={[
        styles.button,
        {
          backgroundColor,
          borderColor,
          shadowColor,
          shadowOpacity,
          elevation,
        },
      ]}
    >
      <View style={styles.content}>
        {isCorrect && <Text style={styles.icon}>✓</Text>}
        {isWrong && <Text style={styles.icon}>✗</Text>}
        <Text style={styles.text}>{text}</Text>
      </View>
    </TouchableOpacity>
  );

  // Wrap in animated view if animation is enabled
  if (animate) {
    return (
      <Animated.View
        entering={FadeInDown.duration(400).delay(entranceDelay).springify()}
      >
        {content}
      </Animated.View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  icon: {
    fontSize: 20,
    color: colors.text.primary,
  },
  text: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
  },
});
