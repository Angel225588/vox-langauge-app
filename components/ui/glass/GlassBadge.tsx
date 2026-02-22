/**
 * GlassBadge — Frosted glass chip/pill for selections.
 * Used for scenarios, levels, language pills, tags.
 */

import React, { useCallback } from 'react';
import { Pressable, Text, View, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import {
  glass,
  borderRadius,
  spacing,
  typography,
  colors,
} from '@/constants/designSystem';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GlassBadgeProps {
  label: string;
  selected?: boolean;
  /** Use accent (blue) tint when selected. Default: true */
  accent?: boolean;
  onPress?: () => void;
  /** Ionicons icon name */
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  /** Show checkmark when selected. Default: true */
  showCheck?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional container style */
  style?: ViewStyle;
  /** Additional text style */
  textStyle?: TextStyle;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
  sm: { px: spacing.sm + 2, py: spacing.xs + 1, fontSize: typography.fontSize.xs, iconSize: 12 },
  md: { px: spacing.md, py: spacing.sm, fontSize: typography.fontSize.sm, iconSize: 14 },
  lg: { px: spacing.lg, py: spacing.md - 4, fontSize: typography.fontSize.base, iconSize: 16 },
};

export function GlassBadge({
  label,
  selected = false,
  accent = true,
  onPress,
  icon,
  showCheck = true,
  disabled = false,
  style,
  textStyle,
  size = 'md',
}: GlassBadgeProps) {
  const s = SIZE_MAP[size];

  const handlePress = useCallback(() => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  }, [disabled, onPress]);

  const bg = selected
    ? accent ? glass.badge.accentBackground : glass.surface.heavy
    : glass.badge.backgroundColor;

  const border = selected
    ? accent ? glass.badge.accentBorder : glass.border.bright
    : glass.badge.borderColor;

  const textColor = selected ? colors.text.primary : colors.text.tertiary;

  return (
    <AnimatedPressable
      onPress={handlePress}
      disabled={disabled}
      style={[
        {
          backgroundColor: bg,
          borderColor: border,
          borderWidth: glass.border.width.default,
          borderRadius: borderRadius.md,
          paddingHorizontal: s.px,
          paddingVertical: s.py,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs + 2,
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={s.iconSize}
          color={selected ? colors.primary.light : colors.text.disabled}
        />
      )}
      <Text
        style={[
          {
            fontSize: s.fontSize,
            fontWeight: selected ? typography.fontWeight.semibold : typography.fontWeight.medium,
            color: textColor,
          },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {selected && showCheck && (
        <Ionicons
          name="checkmark"
          size={s.iconSize}
          color={accent ? colors.primary.light : colors.text.primary}
        />
      )}
    </AnimatedPressable>
  );
}
