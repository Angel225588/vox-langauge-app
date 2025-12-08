/**
 * DepthBackButton Component
 *
 * A reusable back button with neomorphic inset (pressed) depth styling.
 * Uses inner shadow effect to create a "pressed into the surface" appearance.
 *
 * Features:
 * - Inset/concave neomorphic styling
 * - Animated press feedback
 * - Haptic feedback
 * - Optional label text
 * - Multiple size variants
 *
 * @example
 * ```tsx
 * // Icon only (default)
 * <DepthBackButton onPress={() => router.back()} />
 *
 * // With label
 * <DepthBackButton onPress={() => router.back()} showLabel />
 *
 * // Custom label
 * <DepthBackButton onPress={() => router.back()} label="Go Back" />
 *
 * // Small size
 * <DepthBackButton onPress={() => router.back()} size="sm" />
 * ```
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { neomorphism, borderRadius, spacing, typography, colors } from '@/constants/designSystem';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export type DepthBackButtonSize = 'sm' | 'md' | 'lg';

export interface DepthBackButtonProps {
  onPress: () => void;
  size?: DepthBackButtonSize;
  showLabel?: boolean;
  label?: string;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

const SIZE_CONFIG = {
  sm: {
    buttonSize: 36,
    iconSize: 18,
    labelSize: typography.fontSize.sm,
    innerPadding: 2,
    borderWidth: 1.5,
  },
  md: {
    buttonSize: 44,
    iconSize: 22,
    labelSize: typography.fontSize.base,
    innerPadding: 3,
    borderWidth: 2,
  },
  lg: {
    buttonSize: 52,
    iconSize: 26,
    labelSize: typography.fontSize.lg,
    innerPadding: 4,
    borderWidth: 2,
  },
};

export function DepthBackButton({
  onPress,
  size = 'md',
  showLabel = false,
  label,
  disabled = false,
  style,
  accessibilityLabel = 'Go back',
}: DepthBackButtonProps) {
  const scale = useSharedValue(1);
  const config = SIZE_CONFIG[size];

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.9, { damping: 15, stiffness: 250 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const handlePress = async () => {
    if (disabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const displayLabel = label || 'Back';

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.9}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={[
        styles.container,
        showLabel && styles.containerWithLabel,
        animatedStyle,
        style,
      ]}
    >
      {/* Outer ring - creates the raised edge illusion */}
      <View
        style={[
          styles.outerRing,
          {
            width: config.buttonSize,
            height: config.buttonSize,
            borderRadius: config.buttonSize / 2,
          },
          disabled && styles.outerRingDisabled,
        ]}
      >
        {/* Inner inset - the "pressed in" effect */}
        <View
          style={[
            styles.innerInset,
            {
              width: config.buttonSize - config.innerPadding * 2,
              height: config.buttonSize - config.innerPadding * 2,
              borderRadius: (config.buttonSize - config.innerPadding * 2) / 2,
              borderWidth: config.borderWidth,
            },
            disabled && styles.innerInsetDisabled,
          ]}
        >
          {/* Arrow icon */}
          <Text
            style={[
              styles.arrow,
              { fontSize: config.iconSize },
              disabled && styles.arrowDisabled,
            ]}
          >
            ←
          </Text>
        </View>
      </View>

      {/* Optional label */}
      {showLabel && (
        <Text
          style={[
            styles.label,
            { fontSize: config.labelSize },
            disabled && styles.labelDisabled,
          ]}
        >
          {displayLabel}
        </Text>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  containerWithLabel: {
    gap: spacing.sm,
  },

  // Outer ring - subtle raised edge
  outerRing: {
    backgroundColor: neomorphism.background,
    justifyContent: 'center',
    alignItems: 'center',
    // Soft outer shadow for depth
    shadowColor: neomorphism.raised.dark.shadowColor,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  outerRingDisabled: {
    opacity: 0.5,
    shadowOpacity: 0.1,
  },

  // Inner inset - creates the "pressed in" concave effect
  innerInset: {
    backgroundColor: neomorphism.pressed.backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
    // Dark border for inset illusion
    borderColor: neomorphism.pressed.borderColor,
    // Inner shadow simulation via overlay gradient would be ideal,
    // but we achieve similar effect with border + background contrast
  },
  innerInsetDisabled: {
    backgroundColor: neomorphism.background,
  },

  // Arrow icon
  arrow: {
    color: neomorphism.text.secondary,
    fontWeight: '400',
    marginLeft: -1, // Optical centering adjustment
  },
  arrowDisabled: {
    color: neomorphism.text.inactive,
  },

  // Label text
  label: {
    color: neomorphism.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  labelDisabled: {
    color: neomorphism.text.inactive,
  },
});

export default DepthBackButton;
