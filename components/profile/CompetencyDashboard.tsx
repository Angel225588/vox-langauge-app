/**
 * CompetencyDashboard - 2x2 grid of competency metric cards.
 * Matches the prototype's CompCard pattern: icon + label header,
 * big value, and change indicator with trend arrow.
 *
 * Uses mock data for now — will connect to real metrics in Phase 2.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';
import { rewardCurrencies } from '@/constants/designSystem';

// TODO: Replace with real competency data from Phase 2
export interface CompetencyData {
  articulation: number;
  fluency: number;
  ideaCommunication: number;
  scenariosCompleted: number;
}

const DEFAULT_COMPETENCY: CompetencyData = {
  articulation: 74,
  fluency: 72,
  ideaCommunication: 81,
  scenariosCompleted: 8,
};

interface MetricConfig {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  suffix: string;
  change: string;
  color: string;
}

interface CompetencyDashboardProps {
  data?: CompetencyData;
}

export function CompetencyDashboard({ data = DEFAULT_COMPETENCY }: CompetencyDashboardProps) {
  const metrics: MetricConfig[] = [
    {
      icon: 'mic-outline',
      label: 'Articulation',
      value: data.articulation,
      suffix: '/100',
      change: '+5',
      color: colors.accent.cyan,
    },
    {
      icon: 'bar-chart-outline',
      label: 'Fluency',
      value: data.fluency,
      suffix: '%',
      change: '+8%',
      color: colors.primary.light,
    },
    {
      icon: 'bulb-outline',
      label: 'Idea Comm.',
      value: data.ideaCommunication,
      suffix: '%',
      change: '+3%',
      color: colors.success.DEFAULT,
    },
    {
      icon: 'chatbubbles-outline',
      label: 'Scenarios',
      value: data.scenariosCompleted,
      suffix: '/15',
      change: '+2',
      color: rewardCurrencies.vox.tiers.gold.primary,
    },
  ];

  return (
    <View style={styles.grid}>
      {metrics.map((m) => (
        <View key={m.label} style={styles.card}>
          {/* Header: Icon + Label */}
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: m.color + '15' }]}>
              <Ionicons name={m.icon} size={14} color={m.color} />
            </View>
            <Text style={styles.cardLabel}>{m.label.toUpperCase()}</Text>
          </View>

          {/* Value + Change */}
          <View style={styles.valueRow}>
            <Text style={styles.valueText}>{m.value}</Text>
            <Text style={styles.suffixText}>{m.suffix}</Text>
          </View>

          {/* Trend */}
          <View style={styles.trendRow}>
            <Ionicons name="arrow-up" size={10} color={colors.success.DEFAULT} />
            <Text style={styles.trendText}>{m.change}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  card: {
    width: '48%',
    backgroundColor: colors.overlay.light5,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.overlay.light8,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.disabled,
    letterSpacing: 0.7,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    marginBottom: 6,
  },
  valueText: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  suffixText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.tertiary,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  trendText: {
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
    color: colors.success.DEFAULT,
  },
});

export default CompetencyDashboard;
