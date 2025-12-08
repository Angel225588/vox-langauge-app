/**
 * Premium Skeleton Loading Components for Vox Language App
 *
 * Reusable skeleton loaders with shimmer animation for the vocabulary system.
 * Features smooth animations using react-native-reanimated and LinearGradient.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '@/constants/designSystem';

// ============================================================================
// Shimmer Animation Hook
// ============================================================================

/**
 * Custom hook for shimmer animation
 * Creates a left-to-right sweep effect
 */
function useShimmer() {
  const translateX = useSharedValue(-1);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.ease,
      }),
      -1, // Infinite loop
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value * 200 }],
    };
  });

  return animatedStyle;
}

// ============================================================================
// Base Shimmer Box Component
// ============================================================================

interface ShimmerBoxProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

/**
 * Base shimmer box component with animated gradient
 */
function ShimmerBox({ width = '100%', height = 20, borderRadius: radius = borderRadius.sm, style }: ShimmerBoxProps) {
  const shimmerStyle = useShimmer();

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: colors.background.elevated,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, shimmerStyle]}>
        <LinearGradient
          colors={[
            'transparent',
            'rgba(255, 255, 255, 0.1)',
            'rgba(255, 255, 255, 0.15)',
            'rgba(255, 255, 255, 0.1)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

// ============================================================================
// WordCard Skeleton
// ============================================================================

/**
 * Skeleton loader matching WordCard layout
 * Shows: priority badge, word/translation, CEFR badge, mastery emoji, category/mastery text
 */
export function WordCardSkeleton() {
  return (
    <View style={skeletonStyles.wordCard}>
      {/* Header section */}
      <View style={skeletonStyles.wordCardHeader}>
        {/* Left section - Priority badge + word */}
        <View style={skeletonStyles.wordCardLeft}>
          {/* Priority badge */}
          <ShimmerBox width={32} height={32} borderRadius={borderRadius.sm} />

          {/* Word and translation */}
          <View style={skeletonStyles.wordCardTexts}>
            <ShimmerBox width={120} height={20} borderRadius={4} style={{ marginBottom: 4 }} />
            <ShimmerBox width={90} height={16} borderRadius={4} />
          </View>
        </View>

        {/* Right section - CEFR badge + emoji */}
        <View style={skeletonStyles.wordCardRight}>
          <ShimmerBox width={40} height={24} borderRadius={8} />
          <ShimmerBox width={20} height={20} borderRadius={borderRadius.full} />
        </View>
      </View>

      {/* Footer section */}
      <View style={skeletonStyles.wordCardFooter}>
        <ShimmerBox width={150} height={12} borderRadius={4} />
      </View>
    </View>
  );
}

// ============================================================================
// CategoryCard Skeleton
// ============================================================================

/**
 * Skeleton loader matching CategoryGrid card layout
 * Shows: emoji, category name, word count, progress bar, mastery percentage
 */
export function CategoryCardSkeleton() {
  return (
    <View style={skeletonStyles.categoryCard}>
      <View style={skeletonStyles.categoryCardContent}>
        {/* Category header - emoji and name */}
        <View style={skeletonStyles.categoryHeader}>
          <ShimmerBox width={40} height={40} borderRadius={borderRadius.sm} />
          <ShimmerBox width={80} height={18} borderRadius={4} style={{ marginTop: spacing.sm }} />
        </View>

        {/* Stats - word count */}
        <View style={skeletonStyles.categoryStats}>
          <ShimmerBox width={60} height={14} borderRadius={4} />
        </View>

        {/* Progress section */}
        <View style={skeletonStyles.categoryProgress}>
          {/* Progress bar */}
          <ShimmerBox width="100%" height={6} borderRadius={borderRadius.full} style={{ marginBottom: spacing.xs }} />
          {/* Mastery text */}
          <ShimmerBox width={70} height={12} borderRadius={4} />
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// StatsBar Skeleton
// ============================================================================

/**
 * Skeleton loader matching the 3 stat cards layout
 * Shows: Total Words, Due for Review, Avg Mastery
 */
export function StatsBarSkeleton() {
  return (
    <View style={skeletonStyles.statsBar}>
      {/* Stat Card 1 */}
      <View style={skeletonStyles.statCard}>
        <ShimmerBox width={60} height={24} borderRadius={4} style={{ marginBottom: 4 }} />
        <ShimmerBox width={70} height={12} borderRadius={4} />
      </View>

      {/* Stat Card 2 */}
      <View style={skeletonStyles.statCard}>
        <ShimmerBox width={50} height={24} borderRadius={4} style={{ marginBottom: 4 }} />
        <ShimmerBox width={80} height={12} borderRadius={4} />
      </View>

      {/* Stat Card 3 */}
      <View style={skeletonStyles.statCard}>
        <ShimmerBox width={55} height={24} borderRadius={4} style={{ marginBottom: 4 }} />
        <ShimmerBox width={75} height={12} borderRadius={4} />
      </View>
    </View>
  );
}

// ============================================================================
// WordList Skeleton
// ============================================================================

/**
 * Skeleton loader showing 5 WordCardSkeleton items
 * Used while loading the word list view
 */
export function WordListSkeleton() {
  return (
    <View style={skeletonStyles.wordList}>
      <WordCardSkeleton />
      <WordCardSkeleton />
      <WordCardSkeleton />
      <WordCardSkeleton />
      <WordCardSkeleton />
    </View>
  );
}

// ============================================================================
// CategoryGrid Skeleton
// ============================================================================

/**
 * Skeleton loader showing 6 CategoryCardSkeleton items in a grid
 * Used while loading the category grid view
 */
export function CategoryGridSkeleton() {
  return (
    <View style={skeletonStyles.categoryGrid}>
      <CategoryCardSkeleton />
      <CategoryCardSkeleton />
      <CategoryCardSkeleton />
      <CategoryCardSkeleton />
      <CategoryCardSkeleton />
      <CategoryCardSkeleton />
    </View>
  );
}

// ============================================================================
// Styles
// ============================================================================

const skeletonStyles = StyleSheet.create({
  // WordCard Skeleton
  wordCard: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  wordCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  wordCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  wordCardTexts: {
    flex: 1,
  },
  wordCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  wordCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // CategoryCard Skeleton
  categoryCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  categoryCardContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  categoryHeader: {
    gap: spacing.xs,
  },
  categoryStats: {
    marginTop: spacing.sm,
  },
  categoryProgress: {
    gap: spacing.xs,
  },

  // StatsBar Skeleton
  statsBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },

  // WordList Skeleton
  wordList: {
    padding: spacing.md,
  },

  // CategoryGrid Skeleton
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    padding: spacing.md,
  },
});
