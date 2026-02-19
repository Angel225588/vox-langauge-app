/**
 * CompactStairCard Component
 *
 * A compact version of the StairCard for the staircase reveal animation.
 * Designed to be ~120px height with truncated content and reveal animations.
 *
 * Features:
 * - Scale animation on reveal (0.95 -> 1.0)
 * - Content fade-in animation (delayed 150ms after scale)
 * - Status indicators (crown for current, lock for locked)
 * - Order number badge (top right)
 * - Stats row with vocabulary count and estimated days
 */

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StairIcon } from '@/lib/utils/stairIcon';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
  useSharedValue,
} from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, animation } from '@/constants/designSystem';
import { StairForDisplay } from '@/hooks/useLearningPath';

// Component height constant
const CARD_HEIGHT = 120;

interface CompactStairCardProps {
  stair: StairForDisplay;
  index: number;
  isRevealed: boolean;
  onPress: () => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export function CompactStairCard({
  stair,
  index,
  isRevealed,
  onPress,
}: CompactStairCardProps) {
  // Animation values
  const revealProgress = useSharedValue(isRevealed ? 1 : 0);

  // Update animation when isRevealed changes
  useEffect(() => {
    if (isRevealed) {
      // Scale animation with spring
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
    return {
      transform: [{ scale }],
    };
  });

  // Content fade animation (delayed 150ms)
  const contentAnimatedStyle = useAnimatedStyle(() => {
    // Content starts fading in after the scale animation begins
    const opacity = interpolate(
      revealProgress.value,
      [0, 0.3, 1], // Start fading at 30% of scale progress
      [0, 0, 1]
    );
    return {
      opacity,
    };
  });

  // Get gradient colors based on status
  const getGradientColors = (): readonly [string, string] => {
    if (stair.status === 'completed') {
      return colors.gradients.success;
    }
    if (stair.status === 'current') {
      return colors.gradients.primary;
    }
    return ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)'] as const;
  };

  const isLocked = stair.status === 'locked';
  const isCurrent = stair.status === 'current';

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
          <Animated.View style={[styles.contentRow, contentAnimatedStyle]}>
            {/* Emoji */}
            <View style={styles.emojiContainer}>
              <StairIcon value={stair.emoji} size={28} fontSize={28} />
            </View>

            {/* Text Content */}
            <View style={styles.textContainer}>
              {/* Title - 1 line, truncated */}
              <Text
                style={styles.title}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {stair.title}
              </Text>

              {/* Description - 2 lines max, truncated */}
              <Text
                style={styles.description}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {stair.description}
              </Text>

              {/* Stats Row */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statEmoji}>{'📝'}</Text>
                  <Text style={styles.statText}>{stair.vocabulary_count} words</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statEmoji}>{'⏱️'}</Text>
                  <Text style={styles.statText}>{stair.estimated_days} days</Text>
                </View>
              </View>
            </View>
          </Animated.View>
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
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  description: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    lineHeight: 16,
    marginBottom: spacing.xs,
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

export default CompactStairCard;
