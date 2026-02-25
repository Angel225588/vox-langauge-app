/**
 * StatStrip — Three stat cards: Total Days, Total Time, Best Streak.
 *
 * "Total Days" is primary (large). "Best Streak" is secondary (small).
 * Professional tone: informative, not guilt-tripping.
 */

import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/constants/designSystem';

interface Props {
  totalDays: number;
  totalTimeSeconds: number;
  bestStreak: number;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours === 0) return `${mins}m`;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function StatStrip({ totalDays, totalTimeSeconds, bestStreak }: Props) {
  return (
    <View style={styles.container}>
      {/* Total Days — Primary */}
      <View style={[styles.stat, styles.statPrimary]}>
        <Ionicons name="calendar-outline" size={20} color={colors.primary.light} />
        <Text style={styles.primaryValue}>{totalDays}</Text>
        <Text style={styles.primaryLabel}>Total Days</Text>
      </View>

      {/* Total Time */}
      <View style={styles.stat}>
        <Ionicons name="time-outline" size={18} color={colors.text.tertiary} />
        <Text style={styles.secondaryValue}>{formatTime(totalTimeSeconds)}</Text>
        <Text style={styles.secondaryLabel}>Total Time</Text>
      </View>

      {/* Best Streak — Secondary, not emphasized */}
      <View style={styles.stat}>
        <Ionicons name="flame-outline" size={18} color={colors.text.tertiary} />
        <Text style={styles.secondaryValue}>{bestStreak}</Text>
        <Text style={styles.secondaryLabel}>Best Streak</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.overlay.light5,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.overlay.light8,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  statPrimary: {
    backgroundColor: colors.overlay.primary10,
    borderColor: colors.overlay.primary15,
  },
  primaryValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  primaryLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary.light,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  secondaryValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.secondary,
    fontVariant: ['tabular-nums'],
  },
  secondaryLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.disabled,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
