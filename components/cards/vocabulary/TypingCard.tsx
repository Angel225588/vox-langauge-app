/**
 * TypingCard - Active Recall / Translation Card
 *
 * "How do you say X in English?" pattern based on translation card.png
 * Category label at top, button fixed at bottom.
 *
 * Features:
 * - Category badge at top
 * - Clear question header with bell icon
 * - Translation prominently displayed
 * - Neomorphic text input
 * - Hint button (shows first 2 letters)
 * - Typo tolerance
 * - Fixed button at bottom
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { useHaptics } from '@/hooks/useHaptics';
import { DarkOverlay, AnswerFeedbackOverlay } from '@/components/ui';
import { useVocabCard } from './hooks/useVocabCard';
import type { VocabCardProps } from '@/types/vocabulary';

// Levenshtein distance for typo tolerance
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function TypingCard({ item, onComplete, onSkip }: VocabCardProps) {
  const haptics = useHaptics();
  const [input, setInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const { trackHintUsed, complete } = useVocabCard({
    variant: 'typing',
    onComplete,
  });

  // Animation values
  const inputScale = useSharedValue(1);
  const buttonScale = useSharedValue(1);

  const handleShowHint = useCallback(() => {
    haptics.light();
    trackHintUsed();
    setShowHint(true);
  }, [haptics, trackHintUsed]);

  const handleSubmit = useCallback(() => {
    const userAnswer = input.toLowerCase().trim();
    const correctAnswer = item.word.toLowerCase().trim();

    let correct = userAnswer === correctAnswer;
    if (!correct) {
      const distance = levenshteinDistance(userAnswer, correctAnswer);
      correct = distance <= 1;
    }

    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      haptics.success();
      setTimeout(() => complete(true, input), 1500);
    } else {
      haptics.doubleError();
    }
  }, [input, item.word, haptics, complete]);

  const handleContinue = useCallback(() => {
    complete(false, input);
  }, [complete, input]);

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: inputScale.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const showWrongAnswer = showResult && !isCorrect;

  const getInputBorderColor = () => {
    if (!showResult) return 'rgba(99, 102, 241, 0.3)';
    return isCorrect ? colors.success.DEFAULT : colors.error.DEFAULT;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Category Badge at Top */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={styles.categoryContainer}
      >
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </Animated.View>

      {/* Content Area */}
      <View style={styles.contentArea}>
        {/* Question Header */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(100)}
          style={styles.questionHeader}
        >
          <LinearGradient
            colors={[colors.background.card, colors.background.elevated]}
            style={styles.questionHeaderInner}
          >
            <Ionicons name="language" size={20} color={colors.primary.DEFAULT} />
            <Text style={styles.questionText}>How do you say in English?</Text>
          </LinearGradient>
        </Animated.View>

        {/* Translation Display */}
        <Animated.View
          entering={ZoomIn.duration(500).delay(200)}
          style={styles.translationContainer}
        >
          <Text style={styles.translationQuotes}>"</Text>
          <Text style={styles.translation}>{item.translation}</Text>
          <Text style={styles.translationQuotes}>"</Text>
        </Animated.View>

        {/* Input Section */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(300)}
          style={styles.inputSection}
        >
          {/* Hint Button */}
          {!showHint && !showResult && (
            <TouchableOpacity
              onPress={handleShowHint}
              activeOpacity={0.7}
              style={styles.hintButton}
            >
              <Ionicons name="bulb-outline" size={20} color={colors.accent.orange} />
            </TouchableOpacity>
          )}

          <Animated.View style={[inputAnimatedStyle, styles.inputWrapper]}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={
                showHint
                  ? `Hint: ${item.word.substring(0, 2)}...`
                  : 'Type your answer...'
              }
              placeholderTextColor={showHint ? colors.accent.purple : colors.text.tertiary}
              autoCapitalize="none"
              autoCorrect={false}
              style={[
                styles.input,
                {
                  borderColor: getInputBorderColor(),
                  shadowColor: showResult
                    ? isCorrect
                      ? colors.success.DEFAULT
                      : colors.error.DEFAULT
                    : colors.primary.DEFAULT,
                  shadowOpacity: showResult ? 0.5 : 0.2,
                },
              ]}
              editable={!showResult}
              onFocus={() => {
                inputScale.value = withSpring(1.02);
                haptics.light();
              }}
              onBlur={() => {
                inputScale.value = withSpring(1);
              }}
              onSubmitEditing={handleSubmit}
            />
          </Animated.View>

          {/* Character count hint */}
          {!showResult && !showHint && (
            <Text style={styles.charHint}>
              {item.word.length} characters
            </Text>
          )}
        </Animated.View>
      </View>

      {/* Fixed Bottom Actions */}
      <View style={styles.bottomActions}>
        {!showWrongAnswer && (
          <Animated.View style={buttonAnimatedStyle}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!input || (showResult && isCorrect)}
              activeOpacity={0.8}
              onPressIn={() => {
                buttonScale.value = withSpring(0.95);
              }}
              onPressOut={() => {
                buttonScale.value = withSpring(1);
              }}
              style={[
                styles.checkButton,
                (!input || (showResult && isCorrect)) && styles.checkButtonDisabled,
              ]}
            >
              <LinearGradient
                colors={
                  !input || (showResult && isCorrect)
                    ? [colors.background.elevated, colors.background.card]
                    : colors.gradients.primary
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.checkButtonGradient}
              >
                {showResult && isCorrect && (
                  <Ionicons name="checkmark" size={20} color={colors.text.primary} />
                )}
                <Text
                  style={[
                    styles.checkButtonText,
                    (!input || (showResult && isCorrect)) && styles.checkButtonTextDisabled,
                  ]}
                >
                  {showResult && isCorrect ? 'Correct!' : 'Check'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Skip Button */}
        {!showResult && onSkip && (
          <TouchableOpacity
            onPress={onSkip}
            activeOpacity={0.7}
            style={styles.skipButton}
          >
            <Text style={styles.skipButtonText}>Skip this word</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Overlays */}
      <DarkOverlay visible={showWrongAnswer} opacity={0.3} />
      <AnswerFeedbackOverlay
        visible={showWrongAnswer}
        title="Spelling Tip"
        explanation={`The correct spelling is "${item.word}"`}
        correctAnswer={item.word}
        onContinue={handleContinue}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoryContainer: {
    alignItems: 'center',
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  categoryBadge: {
    backgroundColor: colors.background.elevated,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  categoryText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  contentArea: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  questionHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  questionHeaderInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  questionText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  translationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  translationQuotes: {
    fontSize: typography.fontSize['3xl'],
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.normal,
    marginTop: -8,
  },
  translation: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginHorizontal: spacing.sm,
  },
  inputSection: {
    position: 'relative',
  },
  hintButton: {
    position: 'absolute',
    right: 8,
    top: -48,
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
    zIndex: 10,
  },
  inputWrapper: {
    width: '100%',
  },
  input: {
    backgroundColor: colors.background.card,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xl,
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    borderWidth: 2,
    textAlign: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  charHint: {
    textAlign: 'center',
    marginTop: spacing.sm,
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  bottomActions: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  checkButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
    marginBottom: spacing.sm,
  },
  checkButtonDisabled: {
    opacity: 0.7,
  },
  checkButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    gap: spacing.sm,
  },
  checkButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  checkButtonTextDisabled: {
    color: colors.text.tertiary,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  skipButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
  },
});
