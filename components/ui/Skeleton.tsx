import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, spacing } from '../../constants/designSystem';

/**
 * Skeleton Loader Components
 *
 * A set of animated skeleton loaders with shimmer effect for loading states.
 * Uses design system tokens and React Native Reanimated for smooth animations.
 */

// Base colors for skeleton
const SKELETON_BASE = colors.background.elevated; // #222845
const SKELETON_SHIMMER = '#2A3050'; // Slightly lighter than base

interface SkeletonProps {
  /**
   * Width of the skeleton (number for pixels or string for percentage)
   */
  width?: number | string;
  /**
   * Height of the skeleton (number for pixels or string for percentage)
   */
  height?: number | string;
  /**
   * Border radius of the skeleton
   */
  borderRadius?: number;
  /**
   * Additional styles
   */
  style?: ViewStyle;
}

/**
 * SkeletonBox - Basic rectangle skeleton with shimmer animation
 *
 * @example
 * <SkeletonBox width={200} height={20} />
 * <SkeletonBox width="100%" height={100} borderRadius={16} />
 */
export function SkeletonBox({
  width = '100%',
  height = 20,
  borderRadius: customBorderRadius = borderRadius.sm,
  style,
}: SkeletonProps) {
  const translateX = useSharedValue(-1);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.linear,
      }),
      -1, // Infinite loop
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: translateX.value * 200, // Move 200px from left to right
        },
      ],
    };
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: customBorderRadius,
          backgroundColor: SKELETON_BASE,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.shimmerContainer, animatedStyle]}>
        <LinearGradient
          colors={[
            'rgba(42, 48, 80, 0)',
            'rgba(42, 48, 80, 0.5)',
            'rgba(42, 48, 80, 0.8)',
            'rgba(42, 48, 80, 0.5)',
            'rgba(42, 48, 80, 0)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmer}
        />
      </Animated.View>
    </View>
  );
}

interface SkeletonTextProps {
  /**
   * Number of text lines to display
   */
  lines?: number;
  /**
   * Width of the last line (percentage or number)
   */
  lastLineWidth?: number | string;
  /**
   * Spacing between lines
   */
  lineSpacing?: number;
  /**
   * Height of each line
   */
  lineHeight?: number;
  /**
   * Width of all lines
   */
  width?: number | string;
  /**
   * Additional styles for container
   */
  style?: ViewStyle;
}

/**
 * SkeletonText - Text line skeleton with configurable lines
 *
 * @example
 * <SkeletonText lines={3} />
 * <SkeletonText lines={2} lastLineWidth="60%" lineHeight={16} />
 */
export function SkeletonText({
  lines = 1,
  lastLineWidth = '80%',
  lineSpacing = spacing.sm,
  lineHeight = 16,
  width = '100%',
  style,
}: SkeletonTextProps) {
  return (
    <View style={[styles.textContainer, style]}>
      {Array.from({ length: lines }).map((_, index) => {
        const isLastLine = index === lines - 1;
        const lineWidth = isLastLine && lines > 1 ? lastLineWidth : width;

        return (
          <SkeletonBox
            key={index}
            width={lineWidth}
            height={lineHeight}
            borderRadius={borderRadius.sm / 2}
            style={index > 0 ? { marginTop: lineSpacing } : undefined}
          />
        );
      })}
    </View>
  );
}

interface SkeletonCircleProps {
  /**
   * Diameter of the circle
   */
  size?: number;
  /**
   * Additional styles
   */
  style?: ViewStyle;
}

/**
 * SkeletonCircle - Circular avatar skeleton
 *
 * @example
 * <SkeletonCircle size={48} />
 * <SkeletonCircle size={80} />
 */
export function SkeletonCircle({ size = 48, style }: SkeletonCircleProps) {
  return (
    <SkeletonBox
      width={size}
      height={size}
      borderRadius={borderRadius.full}
      style={style}
    />
  );
}

interface SkeletonCardProps {
  /**
   * Whether to show image area
   */
  showImage?: boolean;
  /**
   * Image height
   */
  imageHeight?: number;
  /**
   * Number of text lines
   */
  lines?: number;
  /**
   * Whether to show avatar
   */
  showAvatar?: boolean;
  /**
   * Additional styles
   */
  style?: ViewStyle;
}

/**
 * SkeletonCard - Pre-composed card skeleton with image + text
 *
 * @example
 * <SkeletonCard />
 * <SkeletonCard showImage={false} lines={2} />
 * <SkeletonCard showAvatar lines={3} imageHeight={200} />
 */
export function SkeletonCard({
  showImage = true,
  imageHeight = 160,
  lines = 3,
  showAvatar = false,
  style,
}: SkeletonCardProps) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.background.card,
          borderRadius: borderRadius.lg,
          padding: spacing.md,
        },
        style,
      ]}
    >
      {/* Image area */}
      {showImage && (
        <SkeletonBox
          width="100%"
          height={imageHeight}
          borderRadius={borderRadius.md}
          style={{ marginBottom: spacing.md }}
        />
      )}

      {/* Avatar and text area */}
      <View style={styles.cardContent}>
        {showAvatar && (
          <SkeletonCircle
            size={40}
            style={{ marginRight: spacing.sm }}
          />
        )}

        <View style={{ flex: 1 }}>
          {/* Title */}
          <SkeletonBox
            width="70%"
            height={20}
            borderRadius={borderRadius.sm / 2}
            style={{ marginBottom: spacing.sm }}
          />

          {/* Description lines */}
          <SkeletonText
            lines={lines}
            lineHeight={14}
            lastLineWidth="60%"
          />
        </View>
      </View>
    </View>
  );
}

/**
 * SkeletonList - Pre-composed list item skeleton
 *
 * @example
 * <SkeletonList count={5} />
 */
interface SkeletonListProps {
  /**
   * Number of list items
   */
  count?: number;
  /**
   * Whether to show avatar
   */
  showAvatar?: boolean;
  /**
   * Whether to show icon/thumbnail
   */
  showThumbnail?: boolean;
  /**
   * Additional styles
   */
  style?: ViewStyle;
}

export function SkeletonList({
  count = 3,
  showAvatar = true,
  showThumbnail = false,
  style,
}: SkeletonListProps) {
  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.listItem,
            index > 0 && { marginTop: spacing.md },
          ]}
        >
          {showAvatar && (
            <SkeletonCircle
              size={48}
              style={{ marginRight: spacing.md }}
            />
          )}

          {showThumbnail && (
            <SkeletonBox
              width={48}
              height={48}
              borderRadius={borderRadius.sm}
              style={{ marginRight: spacing.md }}
            />
          )}

          <View style={{ flex: 1 }}>
            <SkeletonBox
              width="60%"
              height={16}
              borderRadius={borderRadius.sm / 2}
              style={{ marginBottom: spacing.xs }}
            />
            <SkeletonBox
              width="90%"
              height={14}
              borderRadius={borderRadius.sm / 2}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * SkeletonButton - Button skeleton
 *
 * @example
 * <SkeletonButton />
 * <SkeletonButton width={200} height={48} />
 */
interface SkeletonButtonProps {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
}

export function SkeletonButton({
  width = '100%',
  height = 48,
  style,
}: SkeletonButtonProps) {
  return (
    <SkeletonBox
      width={width}
      height={height}
      borderRadius={borderRadius.md}
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
    position: 'relative',
  },
  shimmerContainer: {
    position: 'absolute',
    top: 0,
    left: -200,
    bottom: 0,
    width: 200,
  },
  shimmer: {
    flex: 1,
  },
  textContainer: {
    width: '100%',
  },
  card: {
    width: '100%',
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
