/**
 * CardActions Component
 *
 * Shared "Again" / "Got it" action buttons for learning cards.
 * Positioned at the bottom of the screen with safe area padding.
 *
 * Design rules (from CLAUDE.md):
 * - 2 buttons: "Again" (error gradient) / "Got it" (success gradient)
 * - Full-width, equal size, borderRadius.lg
 * - Fixed at bottom with safe area padding
 *
 * @example
 * ```tsx
 * import { CardActions } from '@/components/ui/CardActions';
 *
 * <CardActions
 *   onAgain={() => handleComplete('again')}
 *   onGotIt={() => handleComplete('got-it')}
 * />
 *
 * // With custom labels
 * <CardActions
 *   onAgain={() => handleRetry()}
 *   onGotIt={() => handleNext()}
 *   againLabel="Retry"
 *   gotItLabel="Next"
 * />
 * ```
 */

import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, animation } from '@/constants/designSystem';
import { useHaptics } from '@/hooks/useHaptics';
import { Icon } from '@/components/ui/Icon';

// =============================================================================
// TYPES
// =============================================================================

export interface CardActionsProps {
  /** Callback when "Again" button is pressed */
  onAgain: () => void;
  /** Callback when "Got it" button is pressed */
  onGotIt: () => void;
  /** Custom label for the "Again" button (default: "Again") */
  againLabel?: string;
  /** Custom label for the "Got it" button (default: "Got it") */
  gotItLabel?: string;
  /** Disable the "Again" button */
  againDisabled?: boolean;
  /** Disable the "Got it" button */
  gotItDisabled?: boolean;
}

// =============================================================================
// ANIMATED BUTTON SUB-COMPONENT
// =============================================================================

interface ActionButtonProps {
  onPress: () => void;
  label: string;
  gradientColors: readonly [string, string];
  iconName: 'refresh' | 'checkmark-circle';
  disabled?: boolean;
}

function ActionButton({ onPress, label, gradientColors, iconName, disabled }: ActionButtonProps) {
  const haptics = useHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, {
      damping: animation.spring.stiff.damping,
      stiffness: animation.spring.stiff.stiffness,
    });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, {
      damping: animation.spring.default.damping,
      stiffness: animation.spring.default.stiffness,
    });
  }, [scale]);

  const handlePress = useCallback(() => {
    if (disabled) return;
    haptics.medium();
    onPress();
  }, [disabled, haptics, onPress]);

  return (
    <Animated.View style={[styles.actionButton, animatedStyle]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.85}
        disabled={disabled}
        style={styles.actionButtonTouchable}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.actionButtonGradient,
            disabled && styles.actionButtonDisabled,
          ]}
        >
          <Icon name={iconName} size="lg" color="primary" />
          <Text style={[
            styles.actionButtonText,
            disabled && styles.actionButtonTextDisabled,
          ]}>
            {label}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CardActions({
  onAgain,
  onGotIt,
  againLabel = 'Again',
  gotItLabel = 'Got it',
  againDisabled = false,
  gotItDisabled = false,
}: CardActionsProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bottomActions, { paddingBottom: insets.bottom + spacing.sm }]}>
      <ActionButton
        onPress={onAgain}
        label={againLabel}
        gradientColors={colors.gradients.error}
        iconName="refresh"
        disabled={againDisabled}
      />
      <ActionButton
        onPress={onGotIt}
        label={gotItLabel}
        gradientColors={colors.gradients.success}
        iconName="checkmark-circle"
        disabled={gotItDisabled}
      />
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
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
  actionButtonTouchable: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderRadius: borderRadius.xl,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  actionButtonTextDisabled: {
    opacity: 0.7,
  },
});

export default CardActions;
