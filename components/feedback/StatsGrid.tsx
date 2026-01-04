/**
 * StatsGrid Component
 *
 * Displays 4 mini stat cards in a row with staggered animations.
 * Used in all practice feedback screens.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';

// =============================================================================
// Types
// =============================================================================

export interface StatItem {
  /** Emoji or icon string */
  icon: string;
  /** Value to display */
  value: string | number;
  /** Label below value */
  label: string;
  /** Optional color for value */
  color?: string;
}

export interface StatsGridProps {
  /** Array of 4 stat items */
  stats: StatItem[];
  /** Animation delay start in ms */
  delay?: number;
  /** Stagger between each card animation */
  stagger?: number;
}

// =============================================================================
// Component
// =============================================================================

export const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  delay = 800,
  stagger = 100,
}) => {
  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <Animated.View
          key={stat.label}
          entering={FadeInUp.delay(delay + index * stagger).springify()}
          style={styles.statCard}
        >
          <Text style={styles.icon}>{stat.icon}</Text>
          <Text style={[styles.value, stat.color && { color: stat.color }]}>
            {stat.value}
          </Text>
          <Text style={styles.label}>{stat.label}</Text>
        </Animated.View>
      ))}
    </View>
  );
};

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    gap: spacing.xs,
  },
  icon: {
    fontSize: 22,
  },
  value: {
    fontSize: typography.fontSize.lg,
    fontWeight: '700',
    color: colors.text.primary,
  },
  label: {
    fontSize: 10,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});

export default StatsGrid;
