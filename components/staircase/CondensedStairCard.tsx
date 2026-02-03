/**
 * CondensedStairCard Component
 *
 * A compact 80px height stair card for the learning path.
 * Features a two-line layout:
 * - Line 1: Emoji + "Order. Title" + Status icon
 * - Line 2: Progress bar
 *
 * Design rationale:
 * - Reduces vertical space by ~33% (80px vs 120px)
 * - Inline order number in title for cleaner hierarchy
 * - Progress bar replaces text stats for visual compactness
 * - Status indicated by both icon and border/glow
 */

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
  useSharedValue,
} from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, animation } from '@/constants/designSystem';
import { StairForDisplay } from '@/hooks/useLearningPath';

// Component height - reduced from 120px to 80px
const CARD_HEIGHT = 80;

interface CondensedStairCardProps {
  stair: StairForDisplay;
  index: number;
  isRevealed?: boolean;
  onPress: () => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export function CondensedStairCard({
  stair,
  index,
  isRevealed = true,
  onPress,
}: CondensedStairCardProps) {
  // Animation values
  const revealProgress = useSharedValue(isRevealed ? 1 : 0);

  // Update animation when isRevealed changes
  useEffect(() => {
    if (isRevealed) {
      revealProgress.value = withSpring(1, {
        damping: animation.spring.default.damping,
        stiffness: animation.spring.default.stiffness,
      });
    } else {
      revealProgress.value = 0;
    }
  }, [isRevealed]);

  // Card scale animation
  const cardAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(revealProgress.value, [0, 1], [0.95, 1]);
    const opacity = interpolate(revealProgress.value, [0, 0.5, 1], [0, 0.5, 1]);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  // Status helpers
  const isLocked = stair.status === 'locked';
  const isCurrent = stair.status === 'current';
  const isCompleted = stair.status === 'completed';

  // Get background colors based on status
  const getBackgroundColor = () => {
    if (isCurrent) return 'rgba(0, 54, 255, 0.15)'; // Primary blue tint
    if (isCompleted) return 'rgba(16, 185, 129, 0.1)'; // Success green tint
    return 'rgba(255, 255, 255, 0.03)'; // Subtle for locked
  };

  // Get border color based on status
  const getBorderColor = () => {
    if (isCurrent) return colors.primary.DEFAULT;
    if (isCompleted) return colors.success.DEFAULT;
    return 'rgba(255, 255, 255, 0.1)';
  };

  // Get progress bar fill percentage
  const getProgressPercent = () => {
    if (isCompleted) return 100;
    if (isCurrent) return 35; // Could be dynamic based on actual progress
    return 0;
  };

  // Get progress bar gradient
  const getProgressGradient = (): readonly [string, string] => {
    if (isCompleted) return colors.gradients.success;
    if (isCurrent) return colors.gradients.primary;
    return ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'];
  };

  // Get status icon
  const getStatusIcon = () => {
    if (isCompleted) return '✓';
    if (isCurrent) return '👑';
    return '🔒';
  };

  // Status icon background color
  const getStatusIconBg = () => {
    if (isCompleted) return 'rgba(16, 185, 129, 0.2)';
    if (isCurrent) return 'rgba(0, 54, 255, 0.2)';
    return 'rgba(255, 255, 255, 0.1)';
  };

  return (
    <Animated.View style={[styles.container, cardAnimatedStyle]}>
      <AnimatedTouchableOpacity
        onPress={onPress}
        disabled={isLocked}
        activeOpacity={0.85}
        style={[
          styles.touchable,
          {
            borderColor: getBorderColor(),
            borderWidth: isCurrent ? 2 : 1,
            opacity: isLocked ? 0.5 : 1,
          },
        ]}
      >
        <View
          style={[
            styles.cardContent,
            { backgroundColor: getBackgroundColor() },
          ]}
        >
          {/* Line 1: Emoji + Order.Title + Status Icon */}
          <View style={styles.topRow}>
            {/* Emoji */}
            <Text style={styles.emoji}>{stair.emoji}</Text>

            {/* Order + Title */}
            <Text
              style={styles.title}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {stair.order}. {stair.title}
            </Text>

            {/* Status Icon */}
            <View style={[styles.statusIcon, { backgroundColor: getStatusIconBg() }]}>
              <Text style={styles.statusIconText}>{getStatusIcon()}</Text>
            </View>
          </View>

          {/* Line 2: Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={getProgressGradient()}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.progressFill,
                  { width: `${getProgressPercent()}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Glow effect for current stair */}
        {isCurrent && (
          <View style={styles.glowOverlay} pointerEvents="none" />
        )}
      </AnimatedTouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm, // Reduced from md (16px) to sm (8px)
  },
  touchable: {
    borderRadius: borderRadius.lg, // Slightly smaller radius for compact card
    overflow: 'hidden',
  },
  cardContent: {
    height: CARD_HEIGHT,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
  },
  glowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: borderRadius.lg,
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  // Line 1
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emoji: {
    fontSize: 28,
    marginRight: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  statusIcon: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  statusIconText: {
    fontSize: 14,
  },

  // Line 2 - Progress Bar
  progressContainer: {
    paddingLeft: 36 + spacing.sm, // Align with title (emoji width + margin)
    paddingRight: 28 + spacing.sm, // Account for status icon
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
});

export default CondensedStairCard;
