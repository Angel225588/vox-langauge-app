/**
 * IntroductionCard - New Word/Phrase Card
 *
 * First encounter with a vocabulary word. Progressive reveal pattern:
 * 1. Word + phonetic visible immediately
 * 2. Tap "Translation" button to reveal meaning
 * 3. Examples expand below
 *
 * Design inspiration:
 * - Vocabulary card.png reference (toggle-based reveal)
 * - Premium apps: Revolut depth, Claude elegance
 *
 * Features:
 * - Large word display with phonetic
 * - Animated translation reveal (slide down)
 * - Audio controls (normal + slow speed)
 * - Example sentences with staggered animation
 * - Category badge
 * - Swipe/button to continue
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInDown,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows, neomorphism } from '@/constants/designSystem';
import { useHaptics } from '@/hooks/useHaptics';
import { VocabCardBase } from './VocabCardBase';
import { useVocabCard } from './hooks/useVocabCard';
import type { VocabCardProps } from '@/types/vocabulary';

export function IntroductionCard({ item, onComplete, onSkip }: VocabCardProps) {
  const haptics = useHaptics();
  const [showTranslation, setShowTranslation] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  const { trackAudioPlay, complete } = useVocabCard({
    variant: 'introduction',
    onComplete,
  });

  // Animation values
  const translationProgress = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  const handleRevealTranslation = useCallback(() => {
    haptics.light();
    setShowTranslation(true);
    translationProgress.value = withSpring(1, { damping: 15, stiffness: 150 });
  }, [haptics]);

  const handleToggleExamples = useCallback(() => {
    haptics.light();
    setShowExamples(!showExamples);
  }, [showExamples, haptics]);

  const handleContinue = useCallback(() => {
    haptics.medium();
    complete(true); // Introduction cards are always "correct"
  }, [haptics, complete]);

  const handleMarkAsKnown = useCallback(() => {
    haptics.success();
    complete(true);
    onSkip?.();
  }, [haptics, complete, onSkip]);

  const translationStyle = useAnimatedStyle(() => ({
    opacity: translationProgress.value,
    transform: [
      {
        translateY: interpolate(
          translationProgress.value,
          [0, 1],
          [-20, 0],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  const continueButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <VocabCardBase
      item={item}
      variant="introduction"
      onAudioPlay={trackAudioPlay}
    >
      {/* Word Display */}
      <Animated.View
        entering={FadeInDown.duration(500).springify()}
        style={styles.wordContainer}
      >
        <Text style={styles.word}>{item.word}</Text>

        {item.phonetic && (
          <Text style={styles.phonetic}>/{item.phonetic}/</Text>
        )}

        {item.partOfSpeech && (
          <View style={styles.posContainer}>
            <Text style={styles.posText}>{item.partOfSpeech}</Text>
          </View>
        )}
      </Animated.View>

      {/* Translation Toggle Button / Revealed Translation */}
      <Animated.View
        entering={FadeIn.duration(400).delay(300)}
        style={styles.translationSection}
      >
        {!showTranslation ? (
          <TouchableOpacity
            onPress={handleRevealTranslation}
            activeOpacity={0.8}
            style={styles.translationButton}
          >
            <LinearGradient
              colors={neomorphism.gradients.card}
              style={styles.translationButtonInner}
            >
              <Text style={styles.translationButtonText}>Translation</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <Animated.View style={[styles.translationRevealed, translationStyle]}>
            <Text style={styles.translationText}>{item.translation}</Text>

            {/* Examples toggle */}
            {item.examples && item.examples.length > 0 && (
              <TouchableOpacity
                onPress={handleToggleExamples}
                activeOpacity={0.7}
                style={styles.examplesToggle}
              >
                <Text style={styles.examplesToggleText}>
                  {showExamples ? 'Hide examples ▲' : 'Show examples ▼'}
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}
      </Animated.View>

      {/* Examples Section */}
      {showExamples && item.examples && (
        <View style={styles.examplesContainer}>
          {item.examples.map((example, index) => (
            <Animated.View
              key={index}
              entering={FadeInUp.duration(300).delay(index * 100)}
              style={styles.exampleItem}
            >
              <Text style={styles.exampleText}>{example.text}</Text>
              <Text style={styles.exampleTranslation}>{example.translation}</Text>
            </Animated.View>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(500)}
        style={styles.actionsContainer}
      >
        {showTranslation && (
          <>
            {/* Continue Button */}
            <Animated.View style={continueButtonStyle}>
              <TouchableOpacity
                onPress={handleContinue}
                activeOpacity={0.8}
                onPressIn={() => {
                  buttonScale.value = withSpring(0.95);
                }}
                onPressOut={() => {
                  buttonScale.value = withSpring(1);
                }}
                style={styles.continueButton}
              >
                <LinearGradient
                  colors={colors.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.continueButtonGradient}
                >
                  <Text style={styles.continueButtonText}>Got it</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Mark as Known (subtle) */}
            <TouchableOpacity
              onPress={handleMarkAsKnown}
              activeOpacity={0.7}
              style={styles.skipButton}
            >
              <Text style={styles.skipButtonText}>I already know this</Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
    </VocabCardBase>
  );
}

const styles = StyleSheet.create({
  wordContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  word: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  phonetic: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  posContainer: {
    backgroundColor: colors.background.elevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  posText: {
    fontSize: typography.fontSize.sm,
    color: colors.accent.purple,
    fontWeight: typography.fontWeight.medium,
  },
  translationSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  translationButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.sm,
  },
  translationButtonInner: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  translationButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  translationRevealed: {
    alignItems: 'center',
  },
  translationText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.accent.purple,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  examplesToggle: {
    paddingVertical: spacing.sm,
  },
  examplesToggleText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
  },
  examplesContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  exampleItem: {
    backgroundColor: colors.background.elevated,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  exampleText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    fontStyle: 'italic',
  },
  exampleTranslation: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  actionsContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  continueButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.glow.primary,
    width: '100%',
  },
  continueButtonGradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  skipButton: {
    paddingVertical: spacing.sm,
  },
  skipButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
  },
});
