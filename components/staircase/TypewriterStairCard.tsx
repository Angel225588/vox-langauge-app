/**
 * TypewriterStairCard Component
 *
 * A stair card that reveals content with a typewriter animation.
 * Creates the effect that AI is writing each card in real-time.
 *
 * Features:
 * - Card scales in (0.95 -> 1.0) with spring animation
 * - Title types in character by character (40ms per char)
 * - Description types in after title completes (25ms per char)
 * - Stats row fades in after description completes
 * - Emoji bounces in when card reveals
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StairIcon } from '@/lib/utils/stairIcon';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  interpolate,
  useSharedValue,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, animation } from '@/constants/designSystem';
import { StairForDisplay } from '@/hooks/useLearningPath';
import { useTypewriter } from '@/hooks/useTypewriter';

// Component height constant (same as CompactStairCard)
const CARD_HEIGHT = 120;

// Typewriter speeds
const TITLE_SPEED = 40;       // 40ms per character for title
const DESCRIPTION_SPEED = 25; // 25ms per character for description

interface TypewriterStairCardProps {
  stair: StairForDisplay;
  index: number;
  isRevealing: boolean;
  onRevealComplete?: () => void;
  onPress: () => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export function TypewriterStairCard({
  stair,
  index,
  isRevealing,
  onRevealComplete,
  onPress,
}: TypewriterStairCardProps) {
  // Track animation phases
  const [phase, setPhase] = useState<'idle' | 'title' | 'description' | 'stats' | 'complete'>('idle');

  // Animation shared values
  const cardScale = useSharedValue(0.95);
  const emojiScale = useSharedValue(0);
  const statsOpacity = useSharedValue(0);

  // Title typewriter
  const {
    displayText: titleText,
    isComplete: titleComplete,
  } = useTypewriter(stair.title, {
    speed: TITLE_SPEED,
    enabled: phase === 'title' || phase === 'description' || phase === 'stats' || phase === 'complete',
    onComplete: () => {
      setPhase('description');
    },
  });

  // Description typewriter
  const {
    displayText: descriptionText,
    isComplete: descriptionComplete,
  } = useTypewriter(stair.description, {
    speed: DESCRIPTION_SPEED,
    enabled: phase === 'description' || phase === 'stats' || phase === 'complete',
    onComplete: () => {
      setPhase('stats');
    },
  });

  // Handle reveal start
  useEffect(() => {
    if (isRevealing && phase === 'idle') {
      // Start the reveal animation
      setPhase('title');

      // Scale in the card
      cardScale.value = withSpring(1, {
        damping: animation.spring.default.damping,
        stiffness: animation.spring.default.stiffness,
      });

      // Bounce in the emoji
      emojiScale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withDelay(
          100,
          withSpring(1.2, {
            damping: animation.spring.bouncy.damping,
            stiffness: animation.spring.bouncy.stiffness,
          })
        ),
        withSpring(1, {
          damping: animation.spring.default.damping,
          stiffness: animation.spring.default.stiffness,
        })
      );
    }
  }, [isRevealing, phase]);

  // Handle stats fade in
  useEffect(() => {
    if (phase === 'stats') {
      statsOpacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });

      // Mark complete after stats fade in
      const timeout = setTimeout(() => {
        setPhase('complete');
        onRevealComplete?.();
      }, 350);

      return () => clearTimeout(timeout);
    }
  }, [phase, onRevealComplete]);

  // Card scale animation
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  // Emoji bounce animation
  const emojiAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
    opacity: emojiScale.value > 0 ? 1 : 0,
  }));

  // Stats fade animation
  const statsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
  }));

  // Get gradient colors based on status
  const getGradientColors = (): readonly [string, string] => {
    if (stair.status === 'completed') {
      return colors.gradients.success;
    }
    if (stair.status === 'current') {
      return colors.gradients.primary;
    }
    return ['#2A2F45', '#343A52'] as const;
  };

  const isLocked = stair.status === 'locked';
  const isCurrent = stair.status === 'current';

  // Show cursor when typing
  const showTitleCursor = phase === 'title' && !titleComplete;
  const showDescriptionCursor = phase === 'description' && !descriptionComplete;

  return (
    <Animated.View style={[styles.container, cardAnimatedStyle]}>
      <AnimatedTouchableOpacity
        onPress={onPress}
        disabled={isLocked}
        activeOpacity={0.9}
        style={[
          styles.touchable,
          {
            borderWidth: isCurrent ? 2 : 1,
            borderColor: isCurrent
              ? colors.gradients.primary[0]
              : isLocked
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(255, 255, 255, 0.2)',
            opacity: isLocked ? 0.5 : 1,
          },
        ]}
      >
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradient,
            isCurrent && styles.gradientGlow,
          ]}
        >
          {/* Order Number Badge (top right) */}
          <View style={styles.orderBadge}>
            <Text style={styles.orderBadgeText}>{stair.order}</Text>
          </View>

          {/* Status Icon (top left) - Crown or Lock */}
          {isCurrent && (
            <View style={styles.statusIcon}>
              <Text style={styles.statusIconEmoji}>{'👑'}</Text>
            </View>
          )}
          {isLocked && (
            <View style={[styles.statusIcon, styles.lockedIcon]}>
              <Text style={styles.statusIconEmoji}>{'🔒'}</Text>
            </View>
          )}

          {/* Main Content Row */}
          <View style={styles.contentRow}>
            {/* Emoji with bounce animation */}
            <Animated.View style={[styles.emojiContainer, emojiAnimatedStyle]}>
              <StairIcon value={stair.emoji} size={28} fontSize={28} />
            </Animated.View>

            {/* Text Content */}
            <View style={styles.textContainer}>
              {/* Title - Typewriter effect */}
              <View style={styles.titleRow}>
                <Text
                  style={styles.title}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {titleText}
                  {showTitleCursor && <Text style={styles.cursor}>|</Text>}
                </Text>
              </View>

              {/* Description - Typewriter effect */}
              <View style={styles.descriptionRow}>
                <Text
                  style={styles.description}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {descriptionText}
                  {showDescriptionCursor && <Text style={styles.cursor}>|</Text>}
                </Text>
              </View>

              {/* Stats Row - Fades in */}
              <Animated.View style={[styles.statsRow, statsAnimatedStyle]}>
                <View style={styles.statItem}>
                  <Text style={styles.statEmoji}>{'📝'}</Text>
                  <Text style={styles.statText}>{stair.vocabulary_count} words</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statEmoji}>{'⏱️'}</Text>
                  <Text style={styles.statText}>{stair.estimated_days} days</Text>
                </View>
              </Animated.View>
            </View>
          </View>
        </LinearGradient>
      </AnimatedTouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  touchable: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  gradient: {
    height: CARD_HEIGHT,
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  gradientGlow: {
    shadowColor: colors.glow.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  orderBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderBadgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  statusIcon: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusIconEmoji: {
    fontSize: 18,
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  emojiContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  emoji: {
    fontSize: 36,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  descriptionRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
    minHeight: 32, // Reserve space for 2 lines
  },
  description: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    lineHeight: 16,
  },
  cursor: {
    color: colors.primary.light,
    fontWeight: typography.fontWeight.normal,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  statText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
});

export default TypewriterStairCard;
