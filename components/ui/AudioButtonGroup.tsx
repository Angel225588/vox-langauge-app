/**
 * AudioButtonGroup - Container for Audio Playback Controls
 *
 * Wraps AudioButton components in a styled container with optional
 * background card and configurable padding sizes.
 *
 * Usage:
 * ```tsx
 * <AudioButtonGroup size="compact">
 *   <AudioButton variant="play" ... />
 *   <AudioButton variant="slow" ... />
 * </AudioButtonGroup>
 * ```
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '@/constants/designSystem';

export interface AudioButtonGroupProps {
  children: React.ReactNode;
  /** Show the container card background */
  showContainer?: boolean;
  /** Size variant - compact has less padding */
  size?: 'compact' | 'default';
  /** Optional custom style */
  style?: ViewStyle;
}

export function AudioButtonGroup({
  children,
  showContainer = true,
  size = 'default',
  style,
}: AudioButtonGroupProps) {
  const isCompact = size === 'compact';

  if (!showContainer) {
    return (
      <View style={[styles.noContainer, isCompact && styles.noContainerCompact, style]}>
        {children}
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      isCompact && styles.containerCompact,
      style,
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius['2xl'],
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  containerCompact: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  noContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  noContainerCompact: {
    gap: spacing.md,
  },
});

export default AudioButtonGroup;
