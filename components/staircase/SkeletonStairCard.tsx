/**
 * SkeletonStairCard Component
 *
 * A skeleton placeholder card that matches the compact stair card design.
 * Features a shimmer animation for loading states in the staircase reveal animation.
 *
 * Uses React Native Reanimated + LinearGradient for smooth shimmer effects.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  FadeIn,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { borderRadius, spacing } from '@/constants/designSystem';

/**
 * Props for the SkeletonStairCard component
 */
interface SkeletonStairCardProps {
  /**
   * Index for staggered entrance animation.
   * Higher index = longer delay before entrance.
   */
  index: number;
  /**
   * When true, stop shimmer and prepare for reveal animation.
   * Used to transition from skeleton to actual content.
   */
  isRevealing?: boolean;
  /**
   * Additional styles for the container
   */
  style?: ViewStyle;
}

// Skeleton appearance constants
const CARD_HEIGHT = 80; // Matches CondensedStairCard height
const SHIMMER_DURATION = 1500;
const ENTRANCE_DELAY_PER_CARD = 100;

// Skeleton colors matching the design system
const SKELETON_BACKGROUND = 'rgba(255, 255, 255, 0.05)';
const SKELETON_ELEMENT = 'rgba(255, 255, 255, 0.08)';

// Shimmer gradient colors (subtle white shimmer)
const SHIMMER_COLORS = [
  'rgba(255, 255, 255, 0)',
  'rgba(255, 255, 255, 0.05)',
  'rgba(255, 255, 255, 0.1)',
  'rgba(255, 255, 255, 0.15)',
  'rgba(255, 255, 255, 0.1)',
  'rgba(255, 255, 255, 0.05)',
  'rgba(255, 255, 255, 0)',
] as const;

/**
 * SkeletonStairCard - Skeleton placeholder for stair cards in the staircase view.
 *
 * Features:
 * - Circular placeholder for order number badge (top right)
 * - Circular placeholder for emoji (left side)
 * - Text placeholder for title (1 line)
 * - Two text placeholders for description (2 lines)
 * - Stats row placeholder at bottom
 * - Smooth shimmer animation that loops continuously
 * - Staggered entrance animation based on index
 *
 * @example
 * // Basic usage
 * <SkeletonStairCard index={0} />
 *
 * @example
 * // With staggered animation for a list
 * {[0, 1, 2].map((_, i) => (
 *   <SkeletonStairCard key={i} index={i} />
 * ))}
 *
 * @example
 * // Preparing for reveal
 * <SkeletonStairCard index={0} isRevealing={true} />
 */
export function SkeletonStairCard({
  index,
  isRevealing = false,
  style,
}: SkeletonStairCardProps) {
  // Shimmer animation value (-1 to 1)
  const shimmerPosition = useSharedValue(-1);

  // Start the shimmer animation
  useEffect(() => {
    if (!isRevealing) {
      shimmerPosition.value = withRepeat(
        withTiming(1, {
          duration: SHIMMER_DURATION,
          easing: Easing.linear,
        }),
        -1, // Infinite loop
        false // Don't reverse
      );
    }
  }, [isRevealing]);

  // Stop shimmer when revealing
  useEffect(() => {
    if (isRevealing) {
      shimmerPosition.value = withTiming(1, {
        duration: SHIMMER_DURATION / 2,
        easing: Easing.out(Easing.ease),
      });
    }
  }, [isRevealing]);

  // Animated style for the shimmer overlay
  const shimmerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            shimmerPosition.value,
            [-1, 1],
            [-350, 350] // Full card width traverse
          ),
        },
      ],
      opacity: isRevealing ? 0 : 1,
    };
  });

  // Staggered entrance delay
  const entranceDelay = index * ENTRANCE_DELAY_PER_CARD;

  return (
    <Animated.View
      entering={FadeIn.duration(400).delay(entranceDelay)}
      style={[styles.container, style]}
    >
      {/* Card background - Condensed layout matching CondensedStairCard */}
      <View style={styles.card}>
        {/* Line 1: Emoji + Title + Status icon placeholders */}
        <View style={styles.topRow}>
          {/* Emoji placeholder */}
          <View style={styles.emojiPlaceholder} />

          {/* Title placeholder (includes order number) */}
          <View style={styles.titlePlaceholder} />

          {/* Status icon placeholder */}
          <View style={styles.statusIconPlaceholder} />
        </View>

        {/* Line 2: Progress bar placeholder */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarPlaceholder} />
        </View>

        {/* Shimmer overlay */}
        <Animated.View style={[styles.shimmerContainer, shimmerAnimatedStyle]}>
          <LinearGradient
            colors={SHIMMER_COLORS}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.shimmerGradient}
          />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm, // Matches CondensedStairCard
  },
  card: {
    height: CARD_HEIGHT,
    borderRadius: borderRadius.lg, // Matches CondensedStairCard
    backgroundColor: SKELETON_BACKGROUND,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },

  // Line 1: Emoji + Title + Status
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  // Emoji placeholder
  emojiPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: SKELETON_ELEMENT,
    marginRight: spacing.sm,
  },

  // Title placeholder (wider, includes order number space)
  titlePlaceholder: {
    flex: 1,
    height: 16,
    borderRadius: 6,
    backgroundColor: SKELETON_ELEMENT,
    marginRight: spacing.sm,
  },

  // Status icon placeholder
  statusIconPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: SKELETON_ELEMENT,
  },

  // Line 2: Progress bar
  progressBarContainer: {
    paddingLeft: 28 + spacing.sm, // Align with title (emoji width + margin)
    paddingRight: 28 + spacing.sm, // Account for status icon
  },
  progressBarPlaceholder: {
    height: 6,
    borderRadius: borderRadius.full,
    backgroundColor: SKELETON_ELEMENT,
  },

  // Shimmer overlay container
  shimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 150,
  },

  // Shimmer gradient
  shimmerGradient: {
    flex: 1,
    width: 150,
  },
});

export default SkeletonStairCard;
