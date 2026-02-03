/**
 * VoxCounter - Animated point counter display
 *
 * Shows the current Vox points with the icon and animated counting.
 * Used in headers, profile screens, and reward moments.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { VoxIcon, VoxIconProps } from './VoxIcon';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';

export type VoxCounterVariant = 'default' | 'compact' | 'large' | 'badge';

export interface VoxCounterProps {
  value: number;
  variant?: VoxCounterVariant;
  showIcon?: boolean;
  iconColor?: VoxIconProps['color'];
  animated?: boolean;
  glowing?: boolean;
  style?: ViewStyle;
  onAnimationComplete?: () => void;
}

export function VoxCounter({
  value,
  variant = 'default',
  showIcon = true,
  iconColor = 'primary',
  animated = true,
  glowing = false,
  style,
  onAnimationComplete,
}: VoxCounterProps) {
  const [displayValue, setDisplayValue] = React.useState(value);
  const previousValue = useRef(value);
  const scale = useSharedValue(1);

  // Animate value changes
  useEffect(() => {
    if (value !== previousValue.current && animated) {
      // Animate the counter
      const diff = value - previousValue.current;
      const steps = Math.min(Math.abs(diff), 20);
      const stepValue = diff / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setDisplayValue(value);
          clearInterval(interval);
          if (onAnimationComplete) {
            runOnJS(onAnimationComplete)();
          }
        } else {
          setDisplayValue(Math.round(previousValue.current + stepValue * currentStep));
        }
      }, 30);

      // Scale animation
      scale.value = withSequence(
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 12 })
      );

      previousValue.current = value;
      return () => clearInterval(interval);
    } else {
      setDisplayValue(value);
      previousValue.current = value;
    }
  }, [value, animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          container: styles.containerCompact,
          text: styles.textCompact,
          iconSize: 'xs' as const,
        };
      case 'large':
        return {
          container: styles.containerLarge,
          text: styles.textLarge,
          iconSize: 'lg' as const,
        };
      case 'badge':
        return {
          container: styles.containerBadge,
          text: styles.textBadge,
          iconSize: 'sm' as const,
        };
      default:
        return {
          container: styles.containerDefault,
          text: styles.textDefault,
          iconSize: 'md' as const,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <Animated.View style={[styles.container, variantStyles.container, animatedStyle, style]}>
      {showIcon && (
        <VoxIcon
          size={variantStyles.iconSize}
          color={iconColor}
          animated={animated && glowing}
          glowing={glowing}
        />
      )}
      <Text style={[styles.text, variantStyles.text]}>
        {displayValue.toLocaleString()}
      </Text>
    </Animated.View>
  );
}

// ============================================================================
// REWARD EARNED POPUP
// ============================================================================

export interface RewardEarnedProps {
  voxEarned: number;
  skillCurrency?: {
    type: 'fluency' | 'comprehension' | 'expression';
    amount: number;
  };
  multipliers?: string[];
  visible: boolean;
  onDismiss: () => void;
}

export function RewardEarned({
  voxEarned,
  skillCurrency,
  multipliers = [],
  visible,
  onDismiss,
}: RewardEarnedProps) {
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, { damping: 12 });

      // Auto dismiss after 2.5 seconds
      const timeout = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 200 });
        translateY.value = withTiming(50, { duration: 200 });
        setTimeout(onDismiss, 200);
      }, 2500);

      return () => clearTimeout(timeout);
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.rewardContainer, animatedStyle]}>
      <View style={styles.rewardContent}>
        <View style={styles.rewardMain}>
          <VoxIcon size="lg" animated glowing />
          <Text style={styles.rewardAmount}>+{voxEarned}</Text>
        </View>

        {multipliers.length > 0 && (
          <View style={styles.multipliersRow}>
            {multipliers.map((m, i) => (
              <View key={i} style={styles.multiplierBadge}>
                <Text style={styles.multiplierText}>{m}</Text>
              </View>
            ))}
          </View>
        )}

        {skillCurrency && (
          <View style={styles.skillReward}>
            <Text style={styles.skillRewardText}>
              +{skillCurrency.amount} {skillCurrency.type}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // VoxCounter styles
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  containerDefault: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  containerCompact: {
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: borderRadius.full,
  },
  containerLarge: {
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  containerBadge: {
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: borderRadius.full,
  },
  text: {
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  textDefault: {
    fontSize: typography.fontSize.base,
  },
  textCompact: {
    fontSize: typography.fontSize.sm,
  },
  textLarge: {
    fontSize: typography.fontSize['2xl'],
  },
  textBadge: {
    fontSize: typography.fontSize.xs,
    color: 'white',
  },

  // RewardEarned styles
  rewardContainer: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
  },
  rewardContent: {
    backgroundColor: colors.background.elevated,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary.DEFAULT,
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  rewardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rewardAmount: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.light,
  },
  multipliersRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  multiplierBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  multiplierText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary.light,
    fontWeight: typography.fontWeight.medium,
  },
  skillReward: {
    marginTop: spacing.sm,
  },
  skillRewardText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
});

export default VoxCounter;
