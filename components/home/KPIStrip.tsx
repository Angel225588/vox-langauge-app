/**
 * KPIStrip - Compact horizontal KPI strip for Home screen.
 * Shows daily progress, articulation, fluency, and level at a glance.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';
import { CompetencyGauge } from '@/components/profile/CompetencyGauge';

interface KPIStripProps {
  dailyProgress?: number;
  dailyGoal?: number;
  articulation?: number;
  fluency?: number;
  cefrLevel?: string;
}

export function KPIStrip({
  dailyProgress = 3,
  dailyGoal = 5,
  articulation = 74,
  fluency = 72,
  cefrLevel = 'B2',
}: KPIStripProps) {
  return (
    <View style={styles.container}>
      {/* Daily Ring */}
      <View style={styles.cell}>
        <CompetencyGauge
          value={dailyProgress}
          maxValue={dailyGoal}
          color={colors.primary.DEFAULT}
          size={40}
          label="Today"
        />
      </View>

      <View style={styles.divider} />

      {/* Articulation */}
      <View style={styles.cell}>
        <Text style={styles.kpiLabel}>ARTICULATION</Text>
        <Text style={[styles.kpiValue, { color: colors.accent.cyan }]}>{articulation}</Text>
      </View>

      <View style={styles.divider} />

      {/* Fluency */}
      <View style={styles.cell}>
        <Text style={styles.kpiLabel}>FLUENCY</Text>
        <Text style={[styles.kpiValue, { color: colors.primary.light }]}>{fluency}%</Text>
      </View>

      <View style={styles.divider} />

      {/* Level */}
      <View style={styles.cell}>
        <Text style={styles.kpiLabel}>LEVEL</Text>
        <Text style={[styles.kpiValue, { color: colors.success.DEFAULT }]}>{cefrLevel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.overlay.light5,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: colors.overlay.light8,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: colors.overlay.light10,
  },
  kpiLabel: {
    fontSize: 7,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.tertiary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  kpiValue: {
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
  },
});

export default KPIStrip;
