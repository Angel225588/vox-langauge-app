/**
 * ComparisonCardV2 Component
 *
 * Flip card design for comparing similar-sounding words.
 * Responsive design with breakpoints for different screen sizes.
 *
 * Design principles:
 * - MAX 2 items per card (no scrolling!)
 * - Front: word + phonetics + audio buttons
 * - Back: definition + example + example audio
 * - Smooth 3D flip animation on tap
 * - NOT for direct translations!
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScaledSize } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';
import { Icon } from '@/components/ui/Icon';

// =============================================================================
// RESPONSIVE HELPERS
// =============================================================================

const getScreenSize = () => Dimensions.get('window');

// Breakpoints
const BREAKPOINTS = {
  small: 360,   // Small phones
  medium: 390,  // iPhone 13/14
  large: 428,   // iPhone 14 Pro Max
};

// Get responsive values based on screen width
const getResponsiveValues = (screenWidth: number) => {
  const isSmall = screenWidth < BREAKPOINTS.small;
  const isMedium = screenWidth >= BREAKPOINTS.small && screenWidth < BREAKPOINTS.large;

  return {
    // Card height - taller for better hierarchy and touch targets
    cardHeight: isSmall ? 220 : isMedium ? 250 : 270,

    // Font sizes
    wordSize: isSmall ? 24 : isMedium ? 28 : 32,
    wordSmallSize: isSmall ? 18 : isMedium ? 20 : 22,
    phoneticSize: isSmall ? 14 : isMedium ? 15 : 16,
    definitionSize: isSmall ? 14 : isMedium ? 15 : 16,
    exampleSize: isSmall ? 15 : isMedium ? 16 : 17,
    translationSize: isSmall ? 14 : isMedium ? 15 : 16,
    tipSize: isSmall ? 12 : isMedium ? 13 : 14,

    // Spacing
    cardPadding: isSmall ? spacing.sm : spacing.md,
    audioButtonSize: isSmall ? 52 : isMedium ? 56 : 60,
  };
};

// =============================================================================
// TYPES
// =============================================================================

export interface ComparisonExample {
  text: string;
  translation: string;
}

export interface ComparisonItemV2 {
  label: string;
  word: string;
  phonetic?: string;
  nativeApprox?: string;
  definition?: string;
  example?: ComparisonExample;
}

export interface ComparisonCardV2Props {
  items: ComparisonItemV2[];
  type: 'verb-tense' | 'homophone' | 'similar-words' | 'formal-informal' | 'regional';
  onComplete: (quality: 'again' | 'got-it') => void;
  language?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const TYPE_THEMES: Record<ComparisonCardV2Props['type'], {
  gradient: readonly [string, string];
  accent: string;
}> = {
  'verb-tense': {
    gradient: colors.gradients.primary,
    accent: colors.primary.DEFAULT,
  },
  'homophone': {
    gradient: colors.gradients.warning,
    accent: colors.warning.DEFAULT,
  },
  'similar-words': {
    gradient: colors.gradients.accent,
    accent: colors.accent.cyan,
  },
  'formal-informal': {
    gradient: colors.gradients.secondary,
    accent: colors.secondary.DEFAULT,
  },
  'regional': {
    gradient: ['#9333EA', '#C084FC'] as const,
    accent: '#A855F7',
  },
};

const LABEL_GRADIENTS: readonly (readonly [string, string])[] = [
  colors.gradients.primary,
  colors.gradients.secondary,
];

// Tips to help users understand the difference
const TYPE_TIPS: Record<ComparisonCardV2Props['type'], string> = {
  'verb-tense': '💡 Same verb, different time! Use context to pick the right one.',
  'homophone': '💡 They sound exactly the same! Only the context and spelling differ.',
  'similar-words': '💡 Similar sounds but different meanings. Pay attention to the subtle difference!',
  'formal-informal': '💡 Same meaning, different tone. Choose based on who you\'re talking to.',
  'regional': '💡 Both are correct! It depends on where you are (US vs UK).',
};

// =============================================================================
// FLIP CARD COMPONENT
// =============================================================================

interface FlipCardProps {
  item: ComparisonItemV2;
  index: number;
  onPlayAudio: (text: string, speed: 'normal' | 'slow') => void;
  isPlaying: string | null;
  theme: typeof TYPE_THEMES[keyof typeof TYPE_THEMES];
  responsive: ReturnType<typeof getResponsiveValues>;
}

function FlipCard({ item, index, onPlayAudio, isPlaying, theme, responsive }: FlipCardProps) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const flipProgress = useSharedValue(0);

  const handleFlip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newFlipped = !isFlipped;
    setIsFlipped(newFlipped);
    flipProgress.value = withTiming(newFlipped ? 1 : 0, {
      duration: 350,
      easing: Easing.out(Easing.cubic),
    });
    if (!newFlipped) {
      setShowTranslation(false);
    }
  }, [isFlipped, flipProgress]);

  const handleRevealTranslation = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowTranslation(true);
  }, []);

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

  const labelGradient = LABEL_GRADIENTS[index % LABEL_GRADIENTS.length];

  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(index * 100).springify()}
      style={[styles.flipCardContainer, { height: responsive.cardHeight }]}
    >
      {/* FRONT OF CARD */}
      <Animated.View style={[styles.cardFace, frontAnimatedStyle]}>
        <TouchableOpacity
          onPress={handleFlip}
          activeOpacity={0.95}
          style={styles.cardTouchable}
        >
          {/* Label Badge */}
          <View style={styles.labelBadgeContainer}>
            <LinearGradient
              colors={labelGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.labelBadge}
            >
              <Text style={styles.labelText}>{item.label}</Text>
            </LinearGradient>
          </View>

          {/* Flip hint */}
          <View style={styles.flipHintContainer}>
            <Icon name="sync-outline" size="sm" color="tertiary" />
          </View>

          {/* Main Content */}
          <View style={styles.cardContentFront}>
            <Text style={[styles.word, { fontSize: responsive.wordSize }]}>
              {item.word}
            </Text>

            {item.phonetic && (
              <Text style={[styles.phonetic, { fontSize: responsive.phoneticSize }]}>
                {item.phonetic}
              </Text>
            )}

            {item.nativeApprox && (
              <Text style={[styles.nativeApprox, { fontSize: responsive.phoneticSize }]}>
                sounds like "{item.nativeApprox}"
              </Text>
            )}

            {/* Audio Buttons */}
            <View style={styles.audioButtonsRow}>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onPlayAudio(item.word, 'normal');
                }}
                activeOpacity={0.85}
              >
                <View style={[
                  styles.audioButtonSolid,
                  {
                    backgroundColor: theme.accent,
                    width: responsive.audioButtonSize,
                    height: responsive.audioButtonSize,
                  }
                ]}>
                  <Icon
                    name={isPlaying === `${item.word}-normal` ? 'pause' : 'play'}
                    size="lg"
                    color="white"
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onPlayAudio(item.word, 'slow');
                }}
                activeOpacity={0.85}
              >
                <View style={[
                  styles.audioButtonSolid,
                  styles.audioButtonSlow,
                  {
                    width: responsive.audioButtonSize,
                    height: responsive.audioButtonSize,
                  }
                ]}>
                  <Text style={{ fontSize: responsive.audioButtonSize * 0.45 }}>🐢</Text>
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.tapHintText}>tap to see details</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* BACK OF CARD */}
      <Animated.View style={[styles.cardFace, backAnimatedStyle]}>
        <TouchableOpacity
          onPress={handleFlip}
          activeOpacity={0.95}
          style={styles.cardTouchable}
        >
          {/* Label Badge */}
          <View style={styles.labelBadgeContainer}>
            <LinearGradient
              colors={labelGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.labelBadge}
            >
              <Text style={styles.labelText}>{item.label}</Text>
            </LinearGradient>
          </View>

          {/* Flip hint */}
          <View style={styles.flipHintContainer}>
            <Icon name="sync-outline" size="sm" color="tertiary" />
          </View>

          {/* Back Content */}
          <View style={[styles.cardContentBack, { padding: responsive.cardPadding }]}>
            <Text style={[styles.wordSmall, { fontSize: responsive.wordSmallSize }]}>
              {item.word}
            </Text>

            {item.definition && (
              <Text style={[styles.definition, { fontSize: responsive.definitionSize }]}>
                {item.definition}
              </Text>
            )}

            {item.example && (
              <View style={styles.exampleContainer}>
                <View style={styles.exampleHeader}>
                  <Text style={styles.exampleLabel}>EXAMPLE</Text>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      onPlayAudio(item.example!.text, 'normal');
                    }}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.exampleAudioButton, { backgroundColor: theme.accent }]}>
                      <Icon
                        name={isPlaying === `${item.example.text}-normal` ? 'pause' : 'volume-high'}
                        size="sm"
                        color="white"
                      />
                    </View>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.exampleText, { fontSize: responsive.exampleSize }]}>
                  "{item.example.text}"
                </Text>

                {/* Translation - HIDDEN by default */}
                {showTranslation ? (
                  <Text style={[styles.exampleTranslation, { fontSize: responsive.translationSize }]}>
                    {item.example.translation}
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleRevealTranslation();
                    }}
                    activeOpacity={0.7}
                    style={styles.revealTranslationButton}
                  >
                    <Icon name="eye-outline" size="sm" color="secondary" />
                    <Text style={[styles.revealTranslationText, { fontSize: responsive.translationSize }]}>
                      Show translation
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <Text style={styles.tapHintText}>tap to flip back</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ComparisonCardV2({
  items,
  type,
  onComplete,
  language = 'en-US',
}: ComparisonCardV2Props) {
  const insets = useSafeAreaInsets();
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  // Get responsive values
  const screenWidth = getScreenSize().width;
  const responsive = useMemo(() => getResponsiveValues(screenWidth), [screenWidth]);

  const theme = TYPE_THEMES[type];

  const handlePlayAudio = useCallback(async (text: string, speed: 'normal' | 'slow') => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const audioKey = `${text}-${speed}`;
      setPlayingAudio(audioKey);

      await Speech.speak(text, {
        language,
        rate: speed === 'slow' ? 0.5 : 0.85,
        pitch: 1.0,
      });

      setPlayingAudio(null);
    } catch (error) {
      console.error('Error playing audio:', error);
      setPlayingAudio(null);
    }
  }, [language]);

  const handleComplete = useCallback((quality: 'again' | 'got-it') => {
    Haptics.notificationAsync(
      quality === 'got-it'
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning
    );
    onComplete(quality);
  }, [onComplete]);

  const typeLabel = type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Fixed Type Badge - Top Right */}
      <View style={styles.typeBadgeContainer}>
        <LinearGradient
          colors={theme.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.typeBadge}
        >
          <Text style={styles.typeBadgeText}>{typeLabel}</Text>
        </LinearGradient>
      </View>

      {/* Tip at top - sets context before interaction */}
      <View style={styles.tipContainer}>
        <Text style={[styles.tipText, { fontSize: responsive.tipSize }]}>
          {TYPE_TIPS[type]}
        </Text>
      </View>

      {/* Cards Container - fills available space */}
      <View style={styles.cardsContainer}>
        {items.slice(0, 2).map((item, index) => (
          <FlipCard
            key={`${item.label}-${item.word}-${index}`}
            item={item}
            index={index}
            onPlayAudio={handlePlayAudio}
            isPlaying={playingAudio}
            theme={theme}
            responsive={responsive}
          />
        ))}
      </View>

      {/* Fixed Bottom Actions */}
      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + spacing.sm }]}>
        <TouchableOpacity
          onPress={() => handleComplete('again')}
          activeOpacity={0.85}
          style={styles.actionButton}
        >
          <LinearGradient
            colors={colors.gradients.error}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.actionButtonGradient}
          >
            <Icon name="refresh" size="lg" color="primary" />
            <Text style={styles.actionButtonText}>Again</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleComplete('got-it')}
          activeOpacity={0.85}
          style={styles.actionButton}
        >
          <LinearGradient
            colors={colors.gradients.success}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.actionButtonGradient}
          >
            <Icon name="checkmark-circle" size="lg" color="primary" />
            <Text style={styles.actionButtonText}>Got it</Text>
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
    backgroundColor: colors.background.primary,
  },

  // Type Badge - aligned with card edges
  typeBadgeContainer: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 100,
  },
  typeBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  typeBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Cards Container
  cardsContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    justifyContent: 'center',
    gap: spacing.sm,
  },

  // Flip Card - full width within container
  flipCardContainer: {
    width: '100%',
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTouchable: {
    flex: 1,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },

  // Label Badge
  labelBadgeContainer: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    zIndex: 10,
  },
  labelBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  labelText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Flip Hint
  flipHintContainer: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    opacity: 0.4,
  },

  // Front Content
  cardContentFront: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  word: {
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 2,
  },
  phonetic: {
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  nativeApprox: {
    fontWeight: typography.fontWeight.medium,
    color: colors.accent.cyan,
    marginBottom: spacing.sm,
  },

  // Audio Buttons
  audioButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  audioButtonSolid: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
  },
  audioButtonSlow: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },

  // Tap Hint
  tapHintText: {
    fontSize: 11,
    color: colors.text.tertiary,
    opacity: 0.5,
  },

  // Back Content
  cardContentBack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xl,
  },
  wordSmall: {
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  definition: {
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: 20,
    paddingHorizontal: spacing.xs,
  },

  // Tip container - at top of screen
  tipContainer: {
    marginHorizontal: spacing.md,
    marginTop: spacing['3xl'],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  tipText: {
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Example - takes full width
  exampleContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  exampleLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.tertiary,
    letterSpacing: 1,
  },
  exampleAudioButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
  },
  exampleText: {
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
    lineHeight: 22,
  },
  exampleTranslation: {
    color: colors.text.secondary,
    lineHeight: 20,
  },
  revealTranslationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 2,
  },
  revealTranslationText: {
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },

  // Bottom Actions
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.background.primary,
  },
  actionButton: {
    flex: 1,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  actionButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
});

export default ComparisonCardV2;
