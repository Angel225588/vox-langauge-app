/**
 * GlassInput — Frosted glass text input.
 * Focus state animates border to primary accent.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import {
  glass,
  borderRadius,
  spacing,
  typography,
  colors,
} from '@/constants/designSystem';

interface GlassInputProps extends Omit<TextInputProps, 'style'> {
  /** Label shown above input */
  label?: string;
  /** Error message */
  error?: string;
  /** Hint text below input */
  hint?: string;
  /** Auto-focus on mount */
  autoFocusOnMount?: boolean;
  /** Container style */
  style?: ViewStyle;
  /** Large text variant (for name input etc.) */
  large?: boolean;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function GlassInput({
  label,
  error,
  hint,
  autoFocusOnMount = false,
  style,
  large = false,
  ...inputProps
}: GlassInputProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (autoFocusOnMount) {
      // Small delay to allow screen transition to complete
      const timer = setTimeout(() => inputRef.current?.focus(), 400);
      return () => clearTimeout(timer);
    }
  }, [autoFocusOnMount]);

  const borderAnimStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(
      focused
        ? glass.input.focusBorderColor
        : error
        ? 'rgba(239, 68, 68, 0.35)'
        : glass.input.borderColor,
      { duration: 200 },
    ),
  }));

  return (
    <View style={[{ width: '100%' as any }, style]}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}

      <AnimatedView
        style={[
          styles.inputContainer,
          large && styles.inputContainerLarge,
          borderAnimStyle,
        ]}
      >
        <BlurView
          intensity={glass.blur.subtle}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            large && styles.inputLarge,
          ]}
          placeholderTextColor={glass.input.placeholderColor}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectionColor={colors.primary.light}
          keyboardAppearance="dark"
          {...inputProps}
        />
      </AnimatedView>

      {error && (
        <Text style={styles.error}>{error}</Text>
      )}
      {hint && !error && (
        <Text style={styles.hint}>{hint}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    backgroundColor: glass.input.backgroundColor,
    borderColor: glass.input.borderColor,
    borderWidth: glass.border.width.default,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  inputContainerLarge: {
    borderRadius: borderRadius.xl,
  },
  input: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...Platform.select({
      ios: {},
      android: { paddingVertical: spacing.md - 2 },
    }),
  },
  inputLarge: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    paddingVertical: spacing.lg,
    textAlign: 'center',
  },
  error: {
    fontSize: typography.fontSize.xs,
    color: colors.error.DEFAULT,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
  hint: {
    fontSize: typography.fontSize.xs,
    color: colors.text.disabled,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
});
