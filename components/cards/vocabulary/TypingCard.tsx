/**
 * TypingCard V2 - Visual Translation Card
 *
 * Hero image with word overlay, bottom input that animates with keyboard.
 *
 * Design:
 * - Category badge: TOP RIGHT (absolute position)
 * - Question: H2 heading, clean (no container)
 * - Hero image with translation word overlay
 * - Text input at BOTTOM, animates up with keyboard
 * - Check button inline with input
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,

  Platform,
  KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  ZoomIn,
  useAnimatedStyle,
  useAnimatedKeyboard,
  withSpring,
  withSequence,
  withDelay,
  useSharedValue,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/designSystem';
import { useHaptics } from '@/hooks/useHaptics';
import { DarkOverlay, AnswerFeedbackOverlay } from '@/components/ui';
import { useVocabCard } from './hooks/useVocabCard';
import { getTargetSpeechLang } from './speechLang';
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
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const keyboard = useAnimatedKeyboard();
  const speechLang = getTargetSpeechLang();

  const [input, setInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSuccessCelebration, setShowSuccessCelebration] = useState(false);

  const { trackHintUsed, complete } = useVocabCard({
    variant: 'typing',
    onComplete,
  });

  // Animation values
  const checkButtonScale = useSharedValue(1);

  // Animated style for bottom input area - moves up with keyboard
  const inputContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            keyboard.height.value,
            [0, 400],
            [0, -keyboard.height.value + insets.bottom]
          ),
        },
      ],
    };
  });

  const checkButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkButtonScale.value }],
  }));

  const handleShowHint = useCallback(() => {
    haptics.light();
    trackHintUsed();
    setShowHint(true);
  }, [haptics, trackHintUsed]);

  const handleSubmit = useCallback(() => {
    if (!input.trim()) return;

    const userAnswer = input.toLowerCase().trim();
    const correctAnswer = item.word.toLowerCase().trim();

    // Typo tolerance with Levenshtein
    let correct = userAnswer === correctAnswer;
    if (!correct) {
      const distance = levenshteinDistance(userAnswer, correctAnswer);
      correct = distance <= 1;
    }

    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      haptics.success();
      setShowSuccessCelebration(true);
      // Auto-dismiss celebration and complete after delay
      setTimeout(() => {
        setShowSuccessCelebration(false);
        complete(true, input);
      }, 1800);
    } else {
      haptics.doubleError();
    }
  }, [input, item.word, haptics, complete]);

  const handleContinue = useCallback(() => {
    complete(false, input);
  }, [complete, input]);

  const showWrongAnswer = showResult && !isCorrect;
  const hasInput = input.trim().length > 0;

  return (
    <View style={styles.container}>
      {/* Category Badge - TOP RIGHT (Absolute, respects safe area) */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={[styles.categoryBadge, { top: insets.top + spacing.sm }]}
      >
        <LinearGradient
          colors={colors.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.categoryGradient}
        >
          <Text style={styles.categoryText}>
            {item.category?.toUpperCase() || 'TRANSLATION'}
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Main Content Area - respects safe area */}
      <View style={[styles.contentArea, { paddingTop: insets.top + spacing.xl }]}>
        {/* Question: What's the word? Show the translation/meaning prominently */}
        <Animated.Text
          entering={FadeInDown.duration(400).delay(100)}
          style={styles.questionHeading}
        >
          Type this word:
        </Animated.Text>

        {/* Translation shown as plain text — no card/frame */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(200)}
          style={styles.translationArea}
        >
          <Text style={styles.translationLabel}>TRANSLATE TO {(speechLang.split('-')[0] || 'FR').toUpperCase()}</Text>
          <Text style={styles.translationWord}>{item.translation}</Text>
          {item.examples?.[0] && (
            <Text style={styles.translationContext}>e.g. "{item.examples[0].text}"</Text>
          )}
        </Animated.View>

        {/* Character hint */}
        {!showResult && (
          <Animated.Text
            entering={FadeIn.duration(300).delay(400)}
            style={styles.charHint}
          >
            {item.word.length} letters
          </Animated.Text>
        )}
      </View>

      {/* Bottom Input Area - Animates with keyboard */}
      <Animated.View
        style={[
          styles.bottomInputArea,
          inputContainerStyle,
          { paddingBottom: insets.bottom + spacing.md },
        ]}
      >
        {/* Input Row with Check Button */}
        <View style={styles.inputRow}>
          <View style={styles.inputWrapper}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={
                showHint
                  ? `Hint: ${item.word.substring(0, 2)}...`
                  : 'Type your answer...'
              }
              placeholderTextColor={showHint ? colors.accent.orange : colors.text.tertiary}
              autoCapitalize="none"
              autoCorrect={false}
              style={[
                styles.textInput,
                showResult && {
                  borderColor: isCorrect ? colors.success.DEFAULT : colors.error.DEFAULT,
                },
              ]}
              editable={!showResult}
              onSubmitEditing={handleSubmit}
            />

            {/* Hint button inside input */}
            {!showHint && !showResult && (
              <TouchableOpacity
                onPress={handleShowHint}
                style={styles.hintButtonInline}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="bulb-outline" size={20} color={colors.accent.orange} />
              </TouchableOpacity>
            )}
          </View>

          {/* Check Button - Always visible */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!hasInput || (showResult && isCorrect)}
            activeOpacity={0.8}
            onPressIn={() => {
              checkButtonScale.value = withSpring(0.95);
            }}
            onPressOut={() => {
              checkButtonScale.value = withSpring(1);
            }}
            style={styles.checkButtonContainer}
          >
            <Animated.View style={[styles.checkButton, checkButtonAnimatedStyle]}>
              <LinearGradient
                colors={
                  hasInput && !showResult
                    ? colors.gradients.success
                    : [colors.background.elevated, colors.background.card]
                }
                style={styles.checkButtonGradient}
              >
                <Ionicons
                  name={showResult && isCorrect ? 'checkmark' : 'arrow-forward'}
                  size={24}
                  color={hasInput && !showResult ? colors.text.primary : colors.text.tertiary}
                />
              </LinearGradient>
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Skip Button */}
        {!showResult && onSkip && (
          <TouchableOpacity
            onPress={onSkip}
            activeOpacity={0.7}
            style={styles.skipButton}
          >
            <Text style={styles.skipText}>Skip this word</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Overlays for wrong answer */}
      <DarkOverlay visible={showWrongAnswer} opacity={0.3} />
      <AnswerFeedbackOverlay
        visible={showWrongAnswer}
        title="Spelling Tip"
        explanation={`The correct spelling is "${item.word}"`}
        correctAnswer={item.word}
        onContinue={handleContinue}
      />

      {/* Success Celebration Overlay - Duolingo style */}
      {showSuccessCelebration && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.successOverlay}
        >
          {/* Success Card */}
          <Animated.View
            entering={ZoomIn.duration(300).springify()}
            style={styles.successCard}
          >
            {/* Big Checkmark */}
            <Animated.View
              entering={ZoomIn.duration(400).delay(100).springify()}
              style={styles.successIconContainer}
            >
              <LinearGradient
                colors={colors.gradients.success}
                style={styles.successIconGradient}
              >
                <Ionicons name="checkmark" size={48} color={colors.text.primary} />
              </LinearGradient>
            </Animated.View>

            {/* Celebration Text */}
            <Animated.Text
              entering={FadeInUp.duration(300).delay(200)}
              style={styles.successTitle}
            >
              Excellent!
            </Animated.Text>

            <Animated.Text
              entering={FadeInUp.duration(300).delay(300)}
              style={styles.successSubtitle}
            >
              You spelled it correctly
            </Animated.Text>

            {/* Word Display */}
            <Animated.View
              entering={FadeInUp.duration(300).delay(400)}
              style={styles.successWordContainer}
            >
              <Text style={styles.successWord}>{item.word}</Text>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  // Category Badge - Top Right (top is set dynamically with insets)
  categoryBadge: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 100,
  },
  categoryGradient: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    letterSpacing: 0.5,
  },

  // Content Area (paddingTop is set dynamically with insets)
  contentArea: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'flex-start',
  },

  // H2 Question Heading - Clean
  questionHeading: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },

  // Translation area — plain text, no card/frame
  translationArea: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  translationLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary.light,
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  translationWord: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  translationContext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Character hint
  charHint: {
    textAlign: 'center',
    marginTop: spacing.lg,
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },

  // Bottom Input Area
  bottomInputArea: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },

  // Input Row
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  textInput: {
    backgroundColor: colors.background.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingRight: spacing['3xl'],
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  hintButtonInline: {
    position: 'absolute',
    right: spacing.md,
    top: '50%',
    transform: [{ translateY: -10 }],
    padding: spacing.xs,
  },

  // Check Button
  checkButtonContainer: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  checkButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  checkButtonGradient: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
  },

  // Skip Button
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  skipText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
  },

  // Success Celebration Overlay - Duolingo style
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16, 185, 129, 0.15)', // Success green tint
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  successCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius['2xl'],
    padding: spacing['2xl'],
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    borderWidth: 2,
    borderColor: colors.success.DEFAULT,
    ...shadows.lg,
  },
  successIconContainer: {
    marginBottom: spacing.lg,
  },
  successIconGradient: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.success.DEFAULT,
    marginBottom: spacing.xs,
  },
  successSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  successWordContainer: {
    backgroundColor: colors.success.DEFAULT + '20',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  successWord: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.success.DEFAULT,
    letterSpacing: 1,
  },
});
