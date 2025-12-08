/**
 * BackButton Component - Premium Minimalist Design
 *
 * A clean, consistent back button inspired by Claude, Perplexity, and Revolut.
 * Features a subtle glass-morphism effect with smooth animations.
 *
 * Design principles:
 * - Minimalist: Simple chevron icon, no unnecessary decoration
 * - Premium feel: Subtle blur, soft borders, smooth press animation
 * - Consistent: Same component used across ALL screens
 * - Accessible: Proper hit target size (44x44 minimum)
 *
 * @example
 * ```tsx
 * <BackButton onPress={() => router.back()} />
 * <BackButton onPress={handleBack} variant="light" />
 * <BackButton onPress={handleBack} label="Library" />
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
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { colors, spacing, typography, borderRadius } from '@/constants/designSystem';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export type BackButtonVariant = 'default' | 'light' | 'blur';

export interface BackButtonProps {
  onPress: () => void;
  variant?: BackButtonVariant;
  label?: string;
  style?: ViewStyle;
  disabled?: boolean;
}

export function BackButton({
  onPress,
  variant = 'default',
  label,
  style,
  disabled = false,
}: BackButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.92, { damping: 15, stiffness: 300 });
      opacity.value = withSpring(0.7, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    opacity.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const handlePress = async () => {
    if (disabled) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getVariantStyles = () => {
    switch (variant) {
      case 'light':
        return {
          container: styles.containerLight,
          icon: styles.iconLight,
          label: styles.labelLight,
        };
      case 'blur':
        return {
          container: styles.containerBlur,
          icon: styles.iconDefault,
          label: styles.labelDefault,
        };
      default:
        return {
          container: styles.containerDefault,
          icon: styles.iconDefault,
          label: styles.labelDefault,
        };
    }
  };

  const variantStyles = getVariantStyles();

  // Chevron SVG-like icon using Text (cleaner than emoji)
  const ChevronIcon = () => (
    <View style={styles.chevronContainer}>
      <View style={[styles.chevronLine, styles.chevronTop, variantStyles.icon]} />
      <View style={[styles.chevronLine, styles.chevronBottom, variantStyles.icon]} />
    </View>
  );

  const ButtonContent = () => (
    <View style={styles.contentWrapper}>
      <ChevronIcon />
      {label && (
        <Text style={[styles.label, variantStyles.label]}>{label}</Text>
      )}
    </View>
  );

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={1}
      accessibilityLabel={label ? `Go back to ${label}` : 'Go back'}
      accessibilityRole="button"
      style={[styles.touchable, animatedStyle, style]}
    >
      {variant === 'blur' ? (
        <BlurView intensity={40} tint="dark" style={[styles.container, variantStyles.container]}>
          <ButtonContent />
        </BlurView>
      ) : (
        <View style={[styles.container, variantStyles.container]}>
          <ButtonContent />
        </View>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  touchable: {
    alignSelf: 'flex-start',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  // Variants
  containerDefault: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  containerLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  containerBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },

  // Chevron icon (built with views for crisp rendering)
  chevronContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronLine: {
    position: 'absolute',
    width: 10,
    height: 2,
    borderRadius: 1,
  },
  chevronTop: {
    transform: [{ rotate: '-45deg' }, { translateY: -3 }],
  },
  chevronBottom: {
    transform: [{ rotate: '45deg' }, { translateY: 3 }],
  },
  iconDefault: {
    backgroundColor: colors.text.secondary,
  },
  iconLight: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },

  // Label
  label: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    marginLeft: spacing.xs,
    paddingRight: spacing.xs,
  },
  labelDefault: {
    color: colors.text.secondary,
  },
  labelLight: {
    color: 'rgba(0, 0, 0, 0.7)',
  },
});

export default BackButton;
