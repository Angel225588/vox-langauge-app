/**
 * Quiz Card Component (Unified)
 *
 * A premium quiz card supporting both image-based and translation-based quiz modes.
 * Follows the Vox Language design system with proper animations and accessibility.
 *
 * Modes:
 * - 'image': Displays full-width image and asks "What is this?"
 * - 'translation': Shows optional centered image and asks "Which word means "{translation}"?"
 *
 * Features:
 * - Premium image presentation with gradient overlay and loading states
 * - Mode indicator chip showing current quiz type
 * - Staggered entrance animations with spring physics
 * - Dual highlighting: green for correct answer, red for incorrect selection
 * - Success celebration animation with scale bounce
 * - Explanation overlay when user answers incorrectly
 * - Full haptic feedback (success/error)
 * - Auto-advances on correct answer
 * - Accessible with screen reader support
 *
 * Learning Objective: Test vocabulary recognition and translation comprehension
 *
 * @example
 * <QuizCard
 *   mode="image"
 *   word="dog"
 *   image_url="https://..."
 *   options={['dog', 'cat', 'house', 'car']}
 *   correct_answer={0}
 *   explanation="A dog is a furry pet"
 *   onComplete={(correct) => handleNext()}
 * />
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';

// Shared UI components
import { DarkOverlay, AnswerOption, AnswerFeedbackOverlay } from '@/components/ui';
import { useHaptics } from '@/hooks/useHaptics';

interface QuizCardProps {
  /** Quiz mode - determines layout and question text */
  mode: 'image' | 'translation';
  /** The word being tested */
  word: string;
  /** Translation (required for 'translation' mode) */
  translation?: string;
  /** Image URL to display */
  image_url?: string;
  /** Array of 4 answer options */
  options: string[];
  /** Index of the correct answer (0-3) */
  correct_answer: number;
  /** Explanation shown when user answers incorrectly */
  explanation?: string;
  /** Callback when quiz is completed */
  onComplete: (correct: boolean) => void;
}

// Mode configuration
const MODE_CONFIG = {
  image: {
    emoji: '🖼️',
    label: 'Image Quiz',
    question: 'What is this?',
    feedbackTitle: 'Vocabulary Tip',
    autoAdvanceDelay: 1500,
  },
  translation: {
    emoji: '🔤',
    label: 'Translation',
    question: (translation: string) => `Which word means "${translation}"?`,
    feedbackTitle: 'Translation Tip',
    autoAdvanceDelay: 2000,
  },
};

export function QuizCard({
  mode,
  word,
  translation,
  image_url,
  options,
  correct_answer,
  explanation,
  onComplete,
}: QuizCardProps) {
  const haptics = useHaptics();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Animation values for success celebration
  const successScale = useSharedValue(1);

  const config = MODE_CONFIG[mode];

  // Success celebration animation
  const triggerSuccessAnimation = useCallback(() => {
    successScale.value = withSequence(
      withSpring(1.05, { damping: 8, stiffness: 200 }),
      withSpring(1, { damping: 15, stiffness: 150 })
    );
  }, [successScale]);

  const handleSelect = useCallback((index: number) => {
    const isCorrect = correct_answer === index;

    if (isCorrect) {
      haptics.success();
      triggerSuccessAnimation();
    } else {
      haptics.doubleError();
    }

    setSelectedIndex(index);
    setShowResult(true);

    if (isCorrect) {
      setTimeout(() => {
        onComplete(true);
        setSelectedIndex(null);
        setShowResult(false);
      }, config.autoAdvanceDelay);
    }
  }, [correct_answer, haptics, triggerSuccessAnimation, onComplete, config.autoAdvanceDelay]);

  const handleContinue = useCallback(() => {
    onComplete(false);
    setSelectedIndex(null);
    setShowResult(false);
  }, [onComplete]);

  const showWrongAnswer = showResult && selectedIndex !== correct_answer;
  const showCorrectAnswer = showResult && selectedIndex === correct_answer;

  const getOptionState = useCallback((index: number) => {
    if (!showResult) return 'default';
    if (correct_answer === index) return 'correct';
    if (selectedIndex === index) return 'wrong';
    return 'default';
  }, [showResult, correct_answer, selectedIndex]);

  // Animated style for success celebration
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
  }));

  // Determine question text based on mode
  const questionText: string = mode === 'image'
    ? (config.question as string)
    : `Which word means "${translation || ''}"?`;

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      {/* Mode Indicator Chip */}
      <Animated.View
        entering={FadeInDown.duration(300).delay(50)}
        style={styles.modeChip}
      >
        <Text style={styles.modeEmoji}>{config.emoji}</Text>
        <Text style={styles.modeLabel}>{config.label}</Text>
      </Animated.View>

      <View style={styles.content}>
        {/* Image Section */}
        {image_url && mode === 'image' && (
          <Animated.View
            entering={ZoomIn.duration(500).springify()}
            style={styles.imageContainer}
          >
            {imageLoading && !imageError && (
              <View style={styles.imageLoadingOverlay}>
                <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
              </View>
            )}
            <Image
              source={{ uri: image_url }}
              style={styles.imageFullWidth}
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
              accessibilityLabel={`Image showing ${word}`}
            />
            {/* Subtle gradient overlay for depth */}
            <LinearGradient
              colors={['transparent', 'rgba(10, 14, 26, 0.3)']}
              style={styles.imageGradient}
            />
            {/* Success indicator */}
            {showCorrectAnswer && (
              <Animated.View
                entering={ZoomIn.duration(300).springify()}
                style={styles.successBadge}
              >
                <Text style={styles.successIcon}>✓</Text>
              </Animated.View>
            )}
          </Animated.View>
        )}

        {image_url && mode === 'translation' && (
          <Animated.View
            entering={ZoomIn.duration(500).delay(100).springify()}
            style={styles.imageCenteredWrapper}
          >
            <View style={styles.imageCentered}>
              {imageLoading && !imageError && (
                <View style={styles.imageCenteredLoading}>
                  <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
                </View>
              )}
              <Image
                source={{ uri: image_url }}
                style={styles.imageCenteredContent}
                resizeMode="cover"
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
                accessibilityLabel={`Image hint for ${translation}`}
              />
            </View>
          </Animated.View>
        )}

        {/* Question */}
        <Animated.Text
          entering={FadeInUp.duration(400).delay(mode === 'image' ? 300 : 200).springify()}
          style={[
            styles.question,
            mode === 'translation' && styles.questionTranslation
          ]}
          accessibilityRole="text"
          accessibilityLabel={questionText}
        >
          {questionText}
        </Animated.Text>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {options?.map((option, index) => (
            <AnswerOption
              key={`${option}-${index}`}
              text={option}
              onPress={() => handleSelect(index)}
              disabled={showResult}
              state={getOptionState(index)}
              entranceDelay={mode === 'image' ? 100 * (index + 1) + 400 : 100 * (index + 1) + 200}
              hapticFeedback={false}
              testID={`quiz-option-${index}`}
            />
          ))}
        </View>
      </View>

      <DarkOverlay visible={showWrongAnswer} />

      <AnswerFeedbackOverlay
        visible={showWrongAnswer}
        title={config.feedbackTitle}
        explanation={explanation}
        correctAnswer={options[correct_answer]}
        onContinue={handleContinue}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Mode indicator chip at top
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.background.elevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  modeEmoji: {
    fontSize: 16,
  },
  modeLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  // Image container with relative positioning for overlays
  imageContainer: {
    position: 'relative',
    marginBottom: spacing.xl,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    // Premium shadow
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  imageFullWidth: {
    width: '100%',
    height: 220,
    borderRadius: borderRadius.xl,
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  // Success badge on image
  successBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    // Glow effect
    shadowColor: colors.success.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  successIcon: {
    fontSize: 24,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
  },
  // Translation mode: centered image wrapper
  imageCenteredWrapper: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  imageCentered: {
    position: 'relative',
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    // Premium shadow
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  imageCenteredContent: {
    width: 180,
    height: 180,
  },
  imageCenteredLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  // Question text
  question: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  questionTranslation: {
    fontSize: typography.fontSize['2xl'],
    marginBottom: spacing['2xl'],
    // Highlight the translation with subtle styling
    color: colors.text.primary,
  },
  // Options container
  optionsContainer: {
    width: '100%',
  },
});
