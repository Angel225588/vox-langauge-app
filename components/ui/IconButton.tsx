/**
 * IconButton Component - Touchable Icon with Haptic Feedback
 *
 * A touchable icon button with proper accessibility, minimum touch targets,
 * smooth animations, and haptic feedback.
 *
 * Features:
 * - Minimum 44x44px touch target (iOS HIG standard)
 * - Haptic feedback on press
 * - Smooth scale animation
 * - Circular or square variants
 * - Optional background and border
 * - Accessible labels
 *
 * @example
 * ```tsx
 * <IconButton name="settings" onPress={handleSettings} />
 * <IconButton name="close" onPress={handleClose} color="error" />
 * <IconButton
 *   name="play"
 *   onPress={handlePlay}
 *   variant="filled"
 *   backgroundColor="primary"
 * />
 * ```
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Icon, IconProps, ICON_COLORS } from './Icon';
import { colors, spacing, borderRadius } from '@/constants/designSystem';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export type IconButtonVariant = 'default' | 'filled' | 'outlined' | 'ghost';
export type IconButtonShape = 'circle' | 'square' | 'rounded';

export interface IconButtonProps extends Omit<IconProps, 'style'> {
  /** Press handler */
  onPress: () => void;
  /** Button variant */
  variant?: IconButtonVariant;
  /** Button shape */
  shape?: IconButtonShape;
  /** Background color (for filled variant) */
  backgroundColor?: string;
  /** Border color (for outlined variant) */
  borderColor?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Accessibility label */
  accessibilityLabel?: string;
  /** Accessibility hint */
  accessibilityHint?: string;
  /** Custom container style */
  style?: ViewStyle;
  /** Enable haptic feedback (default: true) */
  haptics?: boolean;
  /** Haptic feedback style */
  hapticStyle?: 'light' | 'medium' | 'heavy';
}

/**
 * IconButton component with haptic feedback and animations
 */
export function IconButton({
  name,
  size = 'md',
  color = 'text-primary',
  onPress,
  variant = 'default',
  shape = 'circle',
  backgroundColor,
  borderColor,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  style,
  haptics = true,
  hapticStyle = 'light',
}: IconButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.90, { damping: 15, stiffness: 300 });
      opacity.value = withSpring(0.7, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    opacity.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const handlePress = async () => {
    if (disabled) return;

    if (haptics) {
      const feedbackStyle =
        hapticStyle === 'heavy'
          ? Haptics.ImpactFeedbackStyle.Heavy
          : hapticStyle === 'medium'
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light;

      await Haptics.impactAsync(feedbackStyle);
    }

    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // Get variant styles
  const getVariantStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 44,
      minHeight: 44,
    };

    // Shape styles
    if (shape === 'circle') {
      baseStyle.borderRadius = borderRadius.full;
    } else if (shape === 'rounded') {
      baseStyle.borderRadius = borderRadius.md;
    } else {
      baseStyle.borderRadius = borderRadius.sm;
    }

    // Variant-specific styles
    switch (variant) {
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: backgroundColor
            ? ICON_COLORS[backgroundColor] || backgroundColor
            : colors.primary.DEFAULT,
        };

      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: borderColor
            ? ICON_COLORS[borderColor] || borderColor
            : colors.border.medium,
        };

      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };

      default: // 'default' variant
        return {
          ...baseStyle,
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)',
        };
    }
  };

  const containerStyle = getVariantStyles();

  // Determine icon color based on variant
  const getIconColor = () => {
    if (disabled) {
      return 'text-disabled';
    }

    // For filled variant with dark background, use white
    if (variant === 'filled' && !color) {
      return 'white';
    }

    return color;
  };

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={1}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || `${name} button`}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      style={[
        styles.container,
        containerStyle,
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      <View style={styles.iconWrapper}>
        <Icon name={name} size={size} color={getIconColor()} />
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    // Base styles handled by getVariantStyles
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
});

export default IconButton;
