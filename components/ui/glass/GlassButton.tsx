/**
 * GlassButton — Frosted glass button with BlurView backdrop.
 *
 * Variants:
 * - primary:   Gradient button (white → light blue → Electric Blue)
 * - secondary: Neutral glass (social auth, secondary actions)
 * - ghost:     Minimal glass (tertiary actions, "skip" buttons)
 * - danger:    Red-tinted glass
 * - success:   Green-tinted glass
 */

import React, { useCallback } from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  glass,
  borderRadius,
  spacing,
  typography,
  colors,
} from '@/constants/designSystem';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface GlassButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  /** Full width (flex). Default: true */
  fullWidth?: boolean;
  /** Additional container styles */
  style?: ViewStyle;
  /** Additional text styles (only used if children is string) */
  textStyle?: TextStyle;
  /** Left icon element */
  icon?: React.ReactNode;
  /** Haptic feedback on press. Default: true */
  haptic?: boolean;
}

const SIZE_STYLES: Record<ButtonSize, { paddingVertical: number; paddingHorizontal: number; fontSize: number }> = {
  sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, fontSize: typography.fontSize.sm },
  md: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl, fontSize: typography.fontSize.base },
  lg: { paddingVertical: spacing.lg - 4, paddingHorizontal: spacing.xl, fontSize: typography.fontSize.lg },
};

// Gradient for primary CTA: white → light blue → Electric Blue
const PRIMARY_GRADIENT = ['#FFFFFF', '#7CB9E8', '#0036FF'] as const;
const PRIMARY_GRADIENT_PRESSED = ['#E8E8E8', '#5A9BD5', '#0029CC'] as const;

export function GlassButton({
  children,
  variant = 'primary',
  size = 'lg',
  onPress,
  disabled = false,
  loading = false,
  fullWidth = true,
  style,
  textStyle,
  icon,
  haptic = true,
}: GlassButtonProps) {
  const preset = glass.button[variant];
  const sizeStyle = SIZE_STYLES[size];
  const isPrimary = variant === 'primary';

  const handlePress = useCallback(() => {
    if (disabled || loading) return;
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress?.();
  }, [disabled, loading, haptic, onPress]);

  const isStringChild = typeof children === 'string';

  const textContent = (
    <>
      {loading ? (
        <ActivityIndicator
          color={isPrimary ? '#0A0E1A' : colors.text.primary}
          size="small"
        />
      ) : (
        <>
          {icon}
          {isStringChild ? (
            <Text
              style={[
                {
                  fontSize: sizeStyle.fontSize,
                  fontWeight: typography.fontWeight.semibold,
                  color: isPrimary ? '#0A0E1A' : colors.text.primary,
                },
                textStyle,
              ]}
            >
              {children}
            </Text>
          ) : (
            children
          )}
        </>
      )}
    </>
  );

  // Primary variant uses gradient instead of glass
  if (isPrimary) {
    return (
      <View
        style={[
          {
            borderRadius: borderRadius.xl,
            overflow: 'hidden',
            opacity: disabled ? 0.45 : 1,
          },
          fullWidth && { width: '100%' as any },
          style,
        ]}
      >
        <Pressable
          onPress={handlePress}
          disabled={disabled || loading}
          style={({ pressed }) => [
            {
              borderRadius: borderRadius.xl,
              overflow: 'hidden',
            },
            pressed && { transform: [{ scale: 0.98 }] },
          ]}
        >
          {({ pressed }) => (
            <LinearGradient
              colors={(pressed ? PRIMARY_GRADIENT_PRESSED : PRIMARY_GRADIENT) as unknown as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                paddingVertical: sizeStyle.paddingVertical,
                paddingHorizontal: sizeStyle.paddingHorizontal,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.sm,
                minHeight: 52,
                borderRadius: borderRadius.xl,
              }}
            >
              {textContent}
            </LinearGradient>
          )}
        </Pressable>
      </View>
    );
  }

  // All other variants use glass
  return (
    <View
      style={[
        {
          borderRadius: borderRadius.xl,
          overflow: 'hidden',
          opacity: disabled ? 0.5 : 1,
        },
        fullWidth && { width: '100%' as any },
        style,
      ]}
    >
      <BlurView
        intensity={preset.blur}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading}
        style={({ pressed }) => [
          {
            backgroundColor: pressed ? preset.pressedBackground : preset.backgroundColor,
            borderColor: preset.borderColor,
            borderWidth: glass.border.width.default,
            borderRadius: borderRadius.xl,
            paddingVertical: sizeStyle.paddingVertical,
            paddingHorizontal: sizeStyle.paddingHorizontal,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
            minHeight: 52,
          },
          pressed && { transform: [{ scale: 0.98 }] },
        ]}
      >
        {textContent}
      </Pressable>
    </View>
  );
}
