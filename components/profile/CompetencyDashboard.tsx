/**
 * CompetencyDashboard - 2x2 grid of competency metric cards.
 * Matches the prototype's CompCard pattern: icon + label header,
 * big value, and change indicator with trend arrow.
 *
 * Connected to real metrics via useUserMetrics hook.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '@/constants/designSystem';
import { rewardCurrencies } from '@/constants/designSystem';
import type { ScoreTrend } from '@/lib/db/competencyMetrics';

export interface CompetencyData {
  articulation: number;
  fluency: number;
  ideaCommunication: number;
  scenariosCompleted: number;
}

const DEFAULT_COMPETENCY: CompetencyData = {
  articulation: 0,
  fluency: 0,
  ideaCommunication: 0,
  scenariosCompleted: 0,
};

const KPI_TREND_KEYS: Record<string, string> = {
  'Articulation': 'articulation',
  'Fluency': 'fluency',
  'Idea Comm.': 'communication',
  'Scenarios': 'scenario',
};

interface MetricConfig {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  suffix: string;
  color: string;
}

interface CompetencyDashboardProps {
  data?: CompetencyData;
  trends?: ScoreTrend[];
}

export function CompetencyDashboard({ data = DEFAULT_COMPETENCY, trends = [] }: CompetencyDashboardProps) {
  const metrics: MetricConfig[] = [
    {
      icon: 'mic-outline',
      label: 'Articulation',
      value: data.articulation,
      suffix: '/100',
      color: colors.accent.cyan,
    },
    {
      icon: 'bar-chart-outline',
      label: 'Fluency',
      value: data.fluency,
      suffix: '/100',
      color: colors.primary.light,
    },
    {
      icon: 'bulb-outline',
      label: 'Idea Comm.',
      value: data.ideaCommunication,
      suffix: '/100',
      color: colors.success.DEFAULT,
    },
    {
      icon: 'chatbubbles-outline',
      label: 'Scenarios',
      value: data.scenariosCompleted,
      suffix: '',
      color: rewardCurrencies.vox.tiers.gold.primary,
    },
  ];

  const getTrend = (label: string) => {
    const key = KPI_TREND_KEYS[label];
    if (!key) return null;
    return trends.find(t => t.kpi === key) || null;
  };

  return (
    <View style={styles.grid}>
      {metrics.map((m) => {
        const trend = getTrend(m.label);
        const isImproving = trend?.direction === 'improving';
        const isDeclining = trend?.direction === 'declining';
        const trendColor = isImproving ? colors.success.DEFAULT
          : isDeclining ? colors.error.DEFAULT
          : colors.text.disabled;
        const trendIcon = isDeclining ? 'arrow-down' : 'arrow-up';
        const trendText = trend && trend.delta !== 0
          ? `${trend.delta > 0 ? '+' : ''}${trend.delta}`
          : '';

        return (
          <View key={m.label} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: m.color + '15' }]}>
                <Ionicons name={m.icon} size={14} color={m.color} />
              </View>
              <Text style={styles.cardLabel}>{m.label.toUpperCase()}</Text>
            </View>

            <View style={styles.valueRow}>
              <Text style={styles.valueText}>{m.value}</Text>
              <Text style={styles.suffixText}>{m.suffix}</Text>
            </View>

            <View style={styles.trendRow}>
              {trendText ? (
                <>
                  <Ionicons name={trendIcon as any} size={10} color={trendColor} />
                  <Text style={[styles.trendText, { color: trendColor }]}>{trendText}</Text>
                </>
              ) : (
                <Text style={[styles.trendText, { color: colors.text.disabled }]}>—</Text>
              )}
            </View>
          </View>
        );
      })}
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
