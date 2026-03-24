/**
 * IntroductionCardV2 - Premium New Word Card
 *
 * FRONT: Image with word/phonetic overlay + translate icon + Play + Slow audio
 * BACK (flip): Definition (target language) + Examples with audio + translate toggle
 *
 * Features:
 * - Custom image from gallery (camera icon top-right)
 * - Play (normal speed) + Slow (🐢) audio buttons
 * - Translate icon to peek at translation without flipping
 * - Tap card to flip → definition + examples
 * - Again / Got it buttons fixed at bottom with interval preview
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Easing,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';
import { Icon } from '@/components/ui/Icon';
import { useVocabCard } from './hooks/useVocabCard';
import { calculateSM2 } from '@/lib/spaced-repetition/sm2';
import { ReviewQuality } from '@/types/flashcard';
import type { VocabCardProps } from '@/types/vocabulary';

// =============================================================================
// CONSTANTS
// =============================================================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT * 0.68;

const getResponsiveValues = (screenWidth: number) => {
  const isSmall = screenWidth < 360;
  const isMedium = screenWidth >= 360 && screenWidth < 428;

  return {
    wordSize: isSmall ? 36 : isMedium ? 42 : 48,
    wordBackSize: isSmall ? 28 : isMedium ? 32 : 36,
    phoneticSize: isSmall ? 16 : isMedium ? 18 : 20,
    definitionSize: isSmall ? 16 : isMedium ? 17 : 18,
    exampleSize: isSmall ? 17 : isMedium ? 18 : 20,
    audioButtonSize: isSmall ? 56 : isMedium ? 60 : 64,
    cardPadding: isSmall ? spacing.md : spacing.lg,
  };
};

// Format interval for display
function formatInterval(days: number): string {
  if (days === 0) return '< 1 min';
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.round(days / 7)} week${days >= 14 ? 's' : ''}`;
  return `${Math.round(days / 30)} month${days >= 60 ? 's' : ''}`;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function IntroductionCardV2({ item, onComplete, onSkip }: VocabCardProps) {
  const insets = useSafeAreaInsets();
  const responsive = useMemo(() => getResponsiveValues(SCREEN_WIDTH), []);

  // State
  const [isFlipped, setIsFlipped] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showExampleTranslations, setShowExampleTranslations] = useState<boolean[]>([false, false]);
  const [isPlayingWord, setIsPlayingWord] = useState(false);
  const [isPlayingExample, setIsPlayingExample] = useState<number | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [customImageUri, setCustomImageUri] = useState<string | null>(null);

  // The display image — custom from gallery or item's default
  const displayImageUri = customImageUri || item.imageUrl;

  // Animation
  const flipProgress = useSharedValue(0);

  // Vocab card hook
  const { trackAudioPlay, complete } = useVocabCard({
    variant: 'introduction',
    onComplete,
  });

  // Calculate preview intervals for buttons
  const intervals = useMemo(() => {
    const againResult = calculateSM2({
      quality: ReviewQuality.FORGOT,
      easeFactor: item.easeFactor || 2.5,
      interval: item.interval || 0,
      repetitions: item.repetitions || 0,
    });

    const gotItResult = calculateSM2({
      quality: ReviewQuality.GOOD,
      easeFactor: item.easeFactor || 2.5,
      interval: item.interval || 0,
      repetitions: item.repetitions || 0,
    });

    return {
      again: againResult.interval,
      gotIt: gotItResult.interval,
    };
  }, [item.easeFactor, item.interval, item.repetitions]);

  // Cleanup sound
  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [sound]);

  // Auto-play BOTH audios (normal then slow) when card first appears
  useEffect(() => {
    const playBothAudios = async () => {
      await new Promise(resolve => setTimeout(resolve, 600));
      await playWordAudio(false);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await playWordAudio(true);
    };
    playBothAudios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================================================
  // AUDIO FUNCTIONS
  // ==========================================================================

  const playWordAudio = useCallback(async (slow = false) => {
    trackAudioPlay();
    setIsPlayingWord(true);
    const rate = slow ? 0.5 : 0.85;

    if (item.audioUrl && !slow) {
      try {
        if (sound) await sound.unloadAsync();
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: item.audioUrl },
          { shouldPlay: true, rate: 1.0, shouldCorrectPitch: true },
          (status) => {
            if (status.isLoaded && status.didJustFinish) setIsPlayingWord(false);
          }
        );
        setSound(newSound);
      } catch {
        Speech.speak(item.word, {
          rate,
          onDone: () => setIsPlayingWord(false),
          onError: () => setIsPlayingWord(false),
        });
      }
    } else {
      Speech.speak(item.word, {
        rate,
        onDone: () => setIsPlayingWord(false),
        onError: () => setIsPlayingWord(false),
      });
    }
  }, [item, sound, trackAudioPlay]);

  const playExampleAudio = useCallback(async (index: number) => {
    const example = item.examples?.[index];
    if (!example) return;

    trackAudioPlay();
    setIsPlayingExample(index);

    if (example.audioUrl) {
      try {
        if (sound) await sound.unloadAsync();
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: example.audioUrl },
          { shouldPlay: true, rate: 0.85, shouldCorrectPitch: true },
          (status) => {
            if (status.isLoaded && status.didJustFinish) setIsPlayingExample(null);
          }
        );
        setSound(newSound);
      } catch {
        Speech.speak(example.text, {
          rate: 0.85,
          onDone: () => setIsPlayingExample(null),
          onError: () => setIsPlayingExample(null),
        });
      }
    } else {
      Speech.speak(example.text, {
        rate: 0.85,
        onDone: () => setIsPlayingExample(null),
        onError: () => setIsPlayingExample(null),
      });
    }
  }, [item.examples, sound, trackAudioPlay]);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleFlip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newFlipped = !isFlipped;
    setIsFlipped(newFlipped);
    flipProgress.value = withTiming(newFlipped ? 1 : 0, {
      duration: 350,
      easing: Easing.out(Easing.cubic),
    });

    if (newFlipped && item.examples?.[0]) {
      setTimeout(() => playExampleAudio(0), 500);
    }
  }, [isFlipped, flipProgress, item.examples, playExampleAudio]);

  const handlePlayWord = useCallback((slow = false) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isPlayingWord) {
      Speech.stop();
      setIsPlayingWord(false);
      return;
    }
    playWordAudio(slow);
  }, [isPlayingWord, playWordAudio]);

  const handleToggleTranslation = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowTranslation(prev => !prev);
  }, []);

  const handleToggleExampleTranslation = useCallback((index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowExampleTranslations(prev => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  }, []);

  // Pick custom image from gallery (lazy load to avoid native module crash in Expo Go)
  const handlePickImage = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const ImagePicker = require('expo-image-picker');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCustomImageUri(result.assets[0].uri);
      }
    } catch (err) {
      console.warn('[IntroCard] Image picker not available:', err);
      // Silently fail — gallery feature not available in Expo Go
    }
  }, []);

  const handleAgain = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    complete(false);
  }, [complete]);

  const handleGotIt = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    complete(true);
  }, [complete]);

  // ==========================================================================
  // ANIMATIONS
  // ==========================================================================

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 0.5, 1], [0, 90, 90]);
    const opacity = interpolate(flipProgress.value, [0, 0.4], [1, 0]);
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }],
      opacity,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 0.5, 1], [-90, -90, 0]);
    const opacity = interpolate(flipProgress.value, [0.6, 1], [0, 1]);
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }],
      opacity,
    };
  });

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <View style={styles.container}>
      {/* Card Area */}
      <View style={styles.cardArea}>
        {/* ================================================================ */}
        {/* FRONT OF CARD - Full Image with Overlay */}
        {/* ================================================================ */}
        <Animated.View style={[styles.card, frontAnimatedStyle]}>
          <Pressable onPress={handleFlip} style={styles.cardPressable}>
            {/* Full Background Image */}
            {displayImageUri ? (
              <Image
                source={{ uri: displayImageUri }}
                style={styles.fullImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.noImageBackground} />
            )}

            {/* Gradient Overlay */}
            <LinearGradient
              colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.85)']}
              style={styles.frontOverlay}
            >
              {/* Top Row: Category + Gallery + Flip hint */}
              <View style={styles.topRow}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
                <View style={styles.topActions}>
                  {/* Custom image from gallery */}
                  <TouchableOpacity
                    onPress={(e) => { e.stopPropagation(); handlePickImage(); }}
                    style={styles.topIconBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="camera-outline" size={18} color="rgba(255,255,255,0.7)" />
                  </TouchableOpacity>
                  {/* Flip indicator */}
                  <Ionicons name="sync-outline" size={16} color="rgba(255,255,255,0.4)" />
                </View>
              </View>

              {/* Spacer */}
              <View style={styles.spacer} />

              {/* Word + Phonetic + Translation Icon */}
              <View style={styles.frontContent}>
                <Text style={[styles.wordFront, { fontSize: responsive.wordSize }]}>
                  {item.word}
                </Text>
                {item.phonetic && (
                  <Text style={[styles.phoneticFront, { fontSize: responsive.phoneticSize }]}>
                    /{item.phonetic}/
                  </Text>
                )}

                {/* Translate button — peek at translation */}
                <TouchableOpacity
                  onPress={(e) => { e.stopPropagation(); handleToggleTranslation(); }}
                  style={styles.translateBtn}
                >
                  <Ionicons
                    name={showTranslation ? 'language' : 'language-outline'}
                    size={20}
                    color={showTranslation ? colors.accent.purple : 'rgba(255,255,255,0.8)'}
                  />
                  {showTranslation ? (
                    <Animated.Text entering={FadeIn.duration(200)} style={styles.translationFront}>
                      {item.translation}
                    </Animated.Text>
                  ) : (
                    <Text style={styles.translationHint}>translate</Text>
                  )}
                </TouchableOpacity>

                {/* Audio Buttons */}
                <View style={styles.audioRow}>
                  <TouchableOpacity
                    onPress={(e) => { e.stopPropagation(); handlePlayWord(false); }}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.audioBtn, styles.audioBtnPlay, { width: responsive.audioButtonSize, height: responsive.audioButtonSize }]}>
                      <Icon name={isPlayingWord ? 'pause' : 'play'} size="lg" color="white" />
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={(e) => { e.stopPropagation(); handlePlayWord(true); }}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.audioBtn, styles.audioBtnSlow, { width: responsive.audioButtonSize, height: responsive.audioButtonSize }]}>
                      <Text style={{ fontSize: responsive.audioButtonSize * 0.4 }}>🐢</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <Text style={styles.hint}>tap card to see meaning</Text>
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* ================================================================ */}
        {/* BACK OF CARD - Entire card clickable */}
        {/* ================================================================ */}
        <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
          <Pressable onPress={handleFlip} style={styles.cardPressable}>
            <ScrollView
              style={styles.backScrollView}
              contentContainerStyle={styles.backScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Image with Word Overlay */}
              {displayImageUri && (
                <View style={styles.backImageContainer}>
                  <Image
                    source={{ uri: displayImageUri }}
                    style={styles.backImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.backImageOverlay}
                  >
                    <Text style={[styles.wordBack, { fontSize: responsive.wordBackSize }]}>
                      {item.word}
                    </Text>
                    {item.phonetic && (
                      <Text style={styles.phoneticBack}>/{item.phonetic}/</Text>
                    )}
                  </LinearGradient>
                </View>
              )}

              {/* Definition Section - In TARGET language */}
              <View style={[styles.section, { padding: responsive.cardPadding }]}>
                <Text style={styles.sectionLabel}>DEFINITION</Text>
                <Text style={[styles.definitionText, { fontSize: responsive.definitionSize }]}>
                  {item.definition || `${item.partOfSpeech ? `(${item.partOfSpeech}) ` : ''}${item.translation}`}
                </Text>
              </View>

              {/* Examples - Show both if available */}
              {item.examples?.slice(0, 2).map((example, idx) => (
                <Animated.View
                  key={idx}
                  entering={FadeInDown.duration(300).delay(idx * 100)}
                  style={[styles.section, { paddingHorizontal: responsive.cardPadding }]}
                >
                  <View style={styles.exampleHeader}>
                    <Text style={styles.sectionLabel}>EXAMPLE {idx + 1}</Text>
                    <View style={styles.exampleActions}>
                      <TouchableOpacity
                        onPress={(e) => { e.stopPropagation(); handleToggleExampleTranslation(idx); }}
                        style={styles.smallIconBtn}
                      >
                        <Icon
                          name={showExampleTranslations[idx] ? 'eye' : 'eye-outline'}
                          size="sm"
                          color="tertiary"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={(e) => { e.stopPropagation(); playExampleAudio(idx); }}
                        style={styles.exampleAudioBtn}
                      >
                        <Icon
                          name={isPlayingExample === idx ? 'pause' : 'volume-high'}
                          size="sm"
                          color="white"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={[styles.exampleText, { fontSize: responsive.exampleSize }]}>
                    "{example.text}"
                  </Text>
                  {showExampleTranslations[idx] && (
                    <Animated.Text entering={FadeIn.duration(200)} style={styles.exampleTranslation}>
                      {example.translation}
                    </Animated.Text>
                  )}
                </Animated.View>
              ))}

              {/* Flip hint at bottom */}
              <Text style={styles.hintBack}>tap anywhere to flip back</Text>
            </ScrollView>
          </Pressable>
        </Animated.View>
      </View>

      {/* ================================================================ */}
      {/* BOTTOM ACTIONS - With Interval Preview */}
      {/* ================================================================ */}
      <View style={[styles.actions, { paddingBottom: insets.bottom + spacing.sm }]}>
        <TouchableOpacity onPress={handleAgain} activeOpacity={0.85} style={styles.btnAgain}>
          <LinearGradient
            colors={colors.gradients.error}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.btnInner}
          >
            <View style={styles.btnContent}>
              <View style={styles.btnMain}>
                <Icon name="refresh" size="md" color="white" />
                <Text style={styles.btnText}>Again</Text>
              </View>
              <Text style={styles.btnInterval}>{formatInterval(intervals.again)}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleGotIt} activeOpacity={0.85} style={styles.btnGotIt}>
          <LinearGradient
            colors={colors.gradients.success}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.btnInner}
          >
            <View style={styles.btnContent}>
              <View style={styles.btnMain}>
                <Icon name="checkmark" size="md" color="white" />
                <Text style={styles.btnText}>Got it</Text>
              </View>
              <Text style={styles.btnInterval}>{formatInterval(intervals.gotIt)}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  cardArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  card: {
    position: 'absolute',
    width: '100%',
    height: CARD_HEIGHT,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  cardBack: {
    backgroundColor: colors.background.card,
  },
  cardPressable: {
    flex: 1,
  },

  // Front - Full image with overlay
  fullImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  noImageBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: colors.background.elevated,
  },
  frontOverlay: {
    flex: 1,
    padding: spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  topIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  spacer: {
    flex: 1,
  },
  frontContent: {
    alignItems: 'center',
  },
  wordFront: {
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  phoneticFront: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
    marginTop: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  translateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  translationFront: {
    color: colors.accent.purple,
    fontSize: 18,
    fontWeight: typography.fontWeight.semibold,
  },
  translationHint: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  audioRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  audioBtn: {
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioBtnPlay: {
    backgroundColor: colors.primary.DEFAULT,
  },
  audioBtnSlow: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  hint: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    marginTop: spacing.lg,
  },

  // Back
  backScrollView: {
    flex: 1,
  },
  backScrollContent: {
    paddingBottom: spacing.xl,
  },
  backImageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
  },
  backImage: {
    width: '100%',
    height: '100%',
  },
  backImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  wordBack: {
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  phoneticBack: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 2,
  },

  // Sections
  section: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.tertiary,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  definitionText: {
    color: colors.text.primary,
    lineHeight: 26,
    fontWeight: typography.fontWeight.medium,
  },

  // Examples
  exampleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  exampleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  smallIconBtn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exampleAudioBtn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exampleText: {
    color: colors.text.primary,
    fontStyle: 'italic',
    lineHeight: 28,
    fontWeight: typography.fontWeight.medium,
  },
  exampleTranslation: {
    color: colors.text.tertiary,
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: spacing.sm,
    paddingLeft: spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: colors.accent.purple,
  },

  hintBack: {
    textAlign: 'center',
    color: colors.text.tertiary,
    fontSize: 12,
    opacity: 0.6,
    marginTop: spacing.lg,
    paddingBottom: spacing.md,
  },

  // Bottom Actions with Intervals
  actions: {
    flexDirection: 'row',
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  btnAgain: {
    flex: 1,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  btnGotIt: {
    flex: 1,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  btnInner: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  btnContent: {
    alignItems: 'center',
  },
  btnMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  btnText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  btnInterval: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
});

export default IntroductionCardV2;
