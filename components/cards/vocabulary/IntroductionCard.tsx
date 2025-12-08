/**
 * IntroductionCard - New Word/Phrase Card
 *
 * First encounter with a vocabulary word. Progressive reveal pattern:
 * 1. Category badge at top
 * 2. Image (if available)
 * 3. Word + phonetic + audio controls
 * 4. Tap "Translation" button to reveal meaning
 * 5. Examples expand below
 * 6. Fixed button at bottom
 *
 * Design inspiration:
 * - Vocabulary card.png reference (toggle-based reveal)
 * - Premium apps: Revolut depth, Claude elegance
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  interpolate,
  Extrapolate,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows, neomorphism } from '@/constants/designSystem';
import { useHaptics } from '@/hooks/useHaptics';
import { useVocabCard } from './hooks/useVocabCard';
import type { VocabCardProps } from '@/types/vocabulary';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function IntroductionCard({ item, onComplete, onSkip }: VocabCardProps) {
  const haptics = useHaptics();
  const [showTranslation, setShowTranslation] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const { trackAudioPlay, complete } = useVocabCard({
    variant: 'introduction',
    onComplete,
  });

  // Animation values
  const translationProgress = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const audioButtonScale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Pulse animation when playing
  useEffect(() => {
    if (isPlaying) {
      pulseScale.value = withRepeat(
        withTiming(1.15, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      pulseScale.value = withSpring(1);
    }
  }, [isPlaying]);

  const handlePlayAudio = useCallback(async (slow = false) => {
    haptics.light();
    trackAudioPlay();
    audioButtonScale.value = withSpring(0.9, {}, () => {
      audioButtonScale.value = withSpring(1);
    });

    const rate = slow ? 0.6 : 1.0;
    setPlaybackRate(rate);

    if (isPlaying && sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);

    if (item.audioUrl) {
      try {
        if (sound) await sound.unloadAsync();
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: item.audioUrl },
          { shouldPlay: true, rate, shouldCorrectPitch: true },
          (status) => {
            if (status.isLoaded && status.didJustFinish) setIsPlaying(false);
          }
        );
        setSound(newSound);
      } catch {
        Speech.speak(item.word, {
          rate: slow ? 0.5 : 0.8,
          onDone: () => setIsPlaying(false),
          onError: () => setIsPlaying(false),
        });
      }
    } else {
      Speech.speak(item.word, {
        rate: slow ? 0.5 : 0.8,
        onDone: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    }
  }, [sound, isPlaying, item, haptics, trackAudioPlay]);

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
    complete(true);
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

  const audioButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: audioButtonScale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: isPlaying ? 0.5 : 0,
  }));

  return (
    <View style={styles.container}>
      {/* Category Badge at Top */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={styles.categoryContainer}
      >
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </Animated.View>

      {/* Scrollable Content Area */}
      <View style={styles.contentArea}>
        {/* Image (if available) */}
        {item.imageUrl && (
          <Animated.View
            entering={FadeIn.duration(500).delay(100)}
            style={styles.imageContainer}
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          </Animated.View>
        )}

        {/* Word Display */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(200)}
          style={styles.wordContainer}
        >
          <Text style={styles.word}>{item.word}</Text>

          {item.phonetic && (
            <Text style={styles.phonetic}>/{item.phonetic}/</Text>
          )}
        </Animated.View>

        {/* Audio Controls - Below Phonetic */}
        <Animated.View
          entering={FadeIn.duration(400).delay(300)}
          style={styles.audioControlsContainer}
        >
          <View style={styles.audioControls}>
            {/* Pulse background */}
            <Animated.View style={[styles.pulseBg, pulseStyle]} />

            {/* Normal speed button */}
            <Animated.View style={audioButtonStyle}>
              <TouchableOpacity
                onPress={() => handlePlayAudio(false)}
                activeOpacity={0.8}
                style={[
                  styles.audioButton,
                  isPlaying && playbackRate === 1.0 && styles.audioButtonActive,
                ]}
              >
                <Text style={styles.playIcon}>▶</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Slow speed button */}
            <TouchableOpacity
              onPress={() => handlePlayAudio(true)}
              activeOpacity={0.8}
              style={[
                styles.audioButton,
                isPlaying && playbackRate < 1.0 && styles.audioButtonActive,
              ]}
            >
              <Text style={styles.playIcon}>▶</Text>
              <View style={styles.slowBadge}>
                <Text style={styles.slowBadgeText}>🐢</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Translation Toggle Button / Revealed Translation */}
        <Animated.View
          entering={FadeIn.duration(400).delay(400)}
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
      </View>

      {/* Fixed Bottom Actions */}
      <View style={styles.bottomActions}>
        {showTranslation ? (
          <>
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

            <TouchableOpacity
              onPress={handleMarkAsKnown}
              activeOpacity={0.7}
              style={styles.skipButton}
            >
              <Text style={styles.skipButtonText}>I already know this</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.bottomPlaceholder} />
        )}
      </View>
    </View>
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
    paddingHorizontal: spacing.lg,
  },
  imageContainer: {
    alignSelf: 'center',
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  image: {
    width: SCREEN_WIDTH - spacing.lg * 4,
    height: 180,
    borderRadius: borderRadius.xl,
  },
  wordContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  word: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  phonetic: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  audioControlsContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius['2xl'],
    padding: spacing.sm,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
    position: 'relative',
  },
  pulseBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: borderRadius['2xl'],
    backgroundColor: colors.primary.DEFAULT,
  },
  audioButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  audioButtonActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.light,
  },
  playIcon: {
    fontSize: 18,
    color: colors.primary.DEFAULT,
  },
  slowBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.full,
    padding: 2,
  },
  slowBadgeText: {
    fontSize: 10,
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
    marginBottom: spacing.sm,
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
  bottomActions: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  continueButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.glow.primary,
    marginBottom: spacing.sm,
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
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  skipButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
  },
  bottomPlaceholder: {
    height: 80,
  },
});
