/**
 * TypeBadge - Shared type/category badge for learning cards
 *
 * Displays card type at top-right corner per design guidelines.
 * Position: absolute, top: spacing.md, right: spacing.lg, zIndex: 100
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';

export type BadgeVariant =
  | 'vocabulary'
  | 'grammar'
  | 'listening'
  | 'speaking'
  | 'reading'
  | 'writing'
  | 'quiz'
  | 'comparison'
  | 'typing'
  | 'role-play'
  | 'sentence'
  | 'custom';

interface TypeBadgeProps {
  /** The type of badge to display */
  variant: BadgeVariant;
  /** Custom label (overrides variant default) */
  label?: string;
  /** Custom gradient colors (overrides variant default) */
  gradientColors?: readonly [string, string];
}

const BADGE_CONFIG: Record<BadgeVariant, { label: string; colors: readonly [string, string] }> = {
  'vocabulary': { label: 'VOCABULARY', colors: colors.gradients.primary },
  'grammar': { label: 'GRAMMAR', colors: colors.gradients.secondary },
  'listening': { label: 'LISTENING', colors: ['#06D6A0', '#4ECDC4'] as const },
  'speaking': { label: 'SPEAKING', colors: ['#FF6B6B', '#FFA07A'] as const },
  'reading': { label: 'READING', colors: ['#00A3FF', '#3D6BFF'] as const },
  'writing': { label: 'WRITING', colors: ['#8B5CF6', '#A78BFA'] as const },
  'quiz': { label: 'QUIZ', colors: colors.gradients.primary },
  'comparison': { label: 'COMPARISON', colors: colors.gradients.primary },
  'typing': { label: 'TYPING', colors: colors.gradients.accent },
  'role-play': { label: 'ROLE PLAY', colors: colors.gradients.accent },
  'sentence': { label: 'SENTENCE', colors: colors.gradients.secondary },
  'custom': { label: '', colors: colors.gradients.primary },
};

export function TypeBadge({ variant, label, gradientColors }: TypeBadgeProps) {
  const config = BADGE_CONFIG[variant];
  const displayLabel = label || config.label;
  const displayColors = gradientColors || config.colors;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={displayColors as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.badge}
      >
        <Text style={styles.text}>{displayLabel}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.lg,
    zIndex: 100,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  text: {
    color: colors.text.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
