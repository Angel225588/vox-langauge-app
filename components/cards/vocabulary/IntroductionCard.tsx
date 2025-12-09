/**
 * IntroductionCard - New Word/Phrase Card
 *
 * First encounter with a vocabulary word. Progressive reveal pattern:
 * 1. Prominent image at very top (visual context)
 * 2. Category badge
 * 3. Word + phonetic + audio controls
 * 4. Tap "Translation" button to reveal meaning
 * 5. Examples button (separate from translation)
 * 6. Each example has its own translate toggle
 * 7. Fixed button at bottom
 *
 * Design inspiration:
 * - Vocabulary card.png reference (toggle-based reveal)
 * - Premium apps: Revolut depth, Claude elegance
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, ScrollView } from 'react-native';
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
import { Ionicons } from '@expo/vector-icons';
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
  const [visibleExampleTranslations, setVisibleExampleTranslations] = useState<Set<number>>(new Set());
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

  const handleToggleExampleTranslation = useCallback((index: number) => {
    haptics.light();
    setVisibleExampleTranslations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, [haptics]);

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

  const continueButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Prominent Image at Very Top */}
      {item.imageUrl && (
        <Animated.View
          entering={FadeIn.duration(500)}
          style={styles.heroImageContainer}
        >
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          {/* Category badge overlay on image */}
          <View style={styles.categoryOverlay}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Category Badge (when no image) */}
      {!item.imageUrl && (
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={styles.categoryContainer}
        >
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        </Animated.View>
      )}

      {/* Scrollable Content Area */}
      <ScrollView
        style={styles.contentArea}
        contentContainerStyle={styles.contentAreaInner}
        showsVerticalScrollIndicator={false}
      >
        {/* Word Display */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(100)}
          style={styles.wordContainer}
        >
          <Text style={styles.word}>{item.word}</Text>

          {item.phonetic && (
            <Text style={styles.phonetic}>/{item.phonetic}/</Text>
          )}
        </Animated.View>

        {/* Audio Controls - Below Phonetic */}
        <Animated.View
          entering={FadeIn.duration(400).delay(200)}
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
                <Ionicons
                  name={isPlaying && playbackRate === 1.0 ? "pause" : "play"}
                  size={22}
                  color={isPlaying && playbackRate === 1.0 ? colors.text.primary : colors.primary.DEFAULT}
                />
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
              <Ionicons
                name={isPlaying && playbackRate < 1.0 ? "pause" : "play"}
                size={22}
                color={isPlaying && playbackRate < 1.0 ? colors.text.primary : colors.primary.DEFAULT}
              />
              <View style={styles.slowBadge}>
                <Ionicons name="speedometer-outline" size={12} color={colors.text.tertiary} />
              </View>
            </TouchableOpacity>
          </View>
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
                <Ionicons name="language" size={18} color={colors.text.secondary} />
                <Text style={styles.translationButtonText}>Translation</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <Animated.View style={[styles.translationRevealed, translationStyle]}>
              <Text style={styles.translationText}>{item.translation}</Text>
            </Animated.View>
          )}
        </Animated.View>

        {/* Examples Button - Separate from Translation */}
        {item.examples && item.examples.length > 0 && (
          <Animated.View
            entering={FadeIn.duration(400).delay(400)}
            style={styles.examplesSection}
          >
            <TouchableOpacity
              onPress={handleToggleExamples}
              activeOpacity={0.8}
              style={styles.examplesButton}
            >
              <View style={styles.examplesButtonInner}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={18}
                  color={colors.text.secondary}
                />
                <Text style={styles.examplesButtonText}>
                  Examples ({item.examples.length})
                </Text>
                <Ionicons
                  name={showExamples ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={colors.text.tertiary}
                />
              </View>
            </TouchableOpacity>

            {/* Examples List */}
            {showExamples && (
              <View style={styles.examplesContainer}>
                {item.examples.map((example, index) => (
                  <Animated.View
                    key={index}
                    entering={FadeInUp.duration(300).delay(index * 100)}
                    style={styles.exampleItem}
                  >
                    <Text style={styles.exampleText}>{example.text}</Text>

                    {/* Translation toggle for each example */}
                    {visibleExampleTranslations.has(index) ? (
                      <TouchableOpacity
                        onPress={() => handleToggleExampleTranslation(index)}
                        activeOpacity={0.7}
                        style={styles.exampleTranslationContainer}
                      >
                        <Text style={styles.exampleTranslation}>{example.translation}</Text>
                        <Ionicons name="eye-off-outline" size={16} color={colors.text.tertiary} />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => handleToggleExampleTranslation(index)}
                        activeOpacity={0.7}
                        style={styles.translateButton}
                      >
                        <Ionicons name="language" size={16} color={colors.primary.DEFAULT} />
                        <Text style={styles.translateButtonText}>Translate</Text>
                      </TouchableOpacity>
                    )}
                  </Animated.View>
                ))}
              </View>
            )}
          </Animated.View>
        )}
      </ScrollView>

      {/* Fixed Bottom Actions - Always visible, two buttons side by side */}
      <View style={styles.bottomActions}>
        <View style={styles.buttonRow}>
          {/* Study Again / Know This button */}
          <TouchableOpacity
            onPress={handleMarkAsKnown}
            activeOpacity={0.8}
            style={styles.secondaryButton}
          >
            <View style={styles.secondaryButtonInner}>
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.text.secondary} />
              <Text style={styles.secondaryButtonText}>Know it</Text>
            </View>
          </TouchableOpacity>

          {/* Got it / Continue button */}
          <Animated.View style={[continueButtonStyle, styles.primaryButtonWrapper]}>
            <TouchableOpacity
              onPress={showTranslation ? handleContinue : handleRevealTranslation}
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
                <Ionicons
                  name={showTranslation ? "arrow-forward" : "eye-outline"}
                  size={20}
                  color={colors.text.primary}
                />
                <Text style={styles.continueButtonText}>
                  {showTranslation ? 'Got it' : 'Reveal'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroImageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  categoryOverlay: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  categoryContainer: {
    alignItems: 'center',
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  categoryBadge: {
    backgroundColor: 'rgba(30, 30, 35, 0.9)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  categoryText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  contentArea: {
    flex: 1,
  },
  contentAreaInner: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
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
  slowBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.full,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border.light,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    gap: spacing.sm,
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
  },
  examplesSection: {
    marginTop: spacing.lg,
  },
  examplesButton: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  examplesButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  examplesButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    flex: 1,
  },
  examplesContainer: {
    marginTop: spacing.md,
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
    marginBottom: spacing.sm,
    lineHeight: typography.fontSize.base * 1.5,
  },
  exampleTranslationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  exampleTranslation: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    flex: 1,
  },
  translateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  translateButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary.DEFAULT,
    fontWeight: typography.fontWeight.medium,
  },
  bottomActions: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  secondaryButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  primaryButtonWrapper: {
    flex: 1,
  },
  continueButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.glow.primary,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  continueButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
});
