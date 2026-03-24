/**
 * Call Results Screen — Post-call feedback with KPIs, objectives recap, points
 *
 * From verified design (rated 9/10 by User Advocate):
 * - Score ring (overall)
 * - 4 KPI cards (tappable)
 * - Points earned
 * - Mission checklist recap (completed vs missed)
 * - Quick feedback text
 * - CTAs: "See Detailed Feedback" + "Done"
 */

import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { colors, spacing, typography, borderRadius } from '@/constants/designSystem';
import { fonts } from '@/constants/fonts';

interface CallResultsScreenProps {
  overallScore: number;
  kpis: {
    articulation: number;
    fluency: number;
    communication: number;
    scenario: number;
  };
  pointsEarned: number;
  scenarioTitle: string;
  objectives: string[];
  objectivesCompleted: boolean[];
  feedbackSummary: string;
  onDetailedFeedback: () => void;
  onDone: () => void;
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} fill="none"
        />
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={colors.secondary.DEFAULT} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={`${progress} ${circumference - progress}`}
          strokeLinecap="round"
          rotation={-90} origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={styles.scoreNumber}>{score}</Text>
        <Text style={styles.scoreMax}>/100</Text>
      </View>
    </View>
  );
}

function getPerformanceLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good performance';
  if (score >= 60) return 'Solid effort';
  if (score >= 40) return 'Keep practicing';
  return 'Getting started';
}

export function CallResultsScreen({
  overallScore,
  kpis,
  pointsEarned,
  scenarioTitle,
  objectives,
  objectivesCompleted,
  feedbackSummary,
  onDetailedFeedback,
  onDone,
}: CallResultsScreenProps) {
  const completedCount = objectivesCompleted.filter(Boolean).length;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="checkmark-circle" size={20} color={colors.secondary.DEFAULT} />
          <Text style={styles.headerTitle}>Session Complete</Text>
        </View>

        {/* Score ring */}
        <View style={styles.scoreSection}>
          <ScoreRing score={overallScore} />
          <Text style={styles.performanceLabel}>{getPerformanceLabel(overallScore)}</Text>
        </View>

        {/* 4 KPIs */}
        <View style={styles.kpiGrid}>
          {[
            { label: 'Articulation', value: kpis.articulation },
            { label: 'Fluency', value: kpis.fluency },
            { label: 'Communication', value: kpis.communication },
            { label: 'Scenario', value: kpis.scenario },
          ].map((kpi) => (
            <View key={kpi.label} style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>{kpi.label}</Text>
              <Text style={styles.kpiValue}>{kpi.value}</Text>
              <View style={styles.kpiBar}>
                <View style={[styles.kpiBarFill, { width: `${kpi.value}%` }]} />
              </View>
            </View>
          ))}
        </View>

        {/* Points earned */}
        <View style={styles.pointsCard}>
          <Text style={styles.pointsLabel}>Points earned</Text>
          <Text style={styles.pointsValue}>+{pointsEarned} points</Text>
          <Text style={styles.pointsScenario}>{scenarioTitle} completed</Text>
        </View>

        {/* Mission checklist recap */}
        <View style={styles.checklistSection}>
          <Text style={styles.checklistTitle}>Mission checklist recap</Text>
          {objectives.map((obj, i) => (
            <View key={i} style={styles.checklistItem}>
              {objectivesCompleted[i] ? (
                <Ionicons name="checkmark" size={16} color={colors.secondary.DEFAULT} />
              ) : (
                <Ionicons name="close" size={16} color="#F59E0B" />
              )}
              <Text style={[
                styles.checklistText,
                !objectivesCompleted[i] && styles.checklistMissed,
              ]}>
                {obj}
              </Text>
            </View>
          ))}
        </View>

        {/* Quick feedback */}
        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackTitle}>Quick feedback</Text>
          <Text style={styles.feedbackText}>{feedbackSummary}</Text>
        </View>
      </ScrollView>

      {/* CTAs */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.detailButton}
          onPress={onDetailedFeedback}
          activeOpacity={0.8}
        >
          <Text style={styles.detailButtonText}>See Detailed Feedback</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={onDone}
          activeOpacity={0.8}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: fonts.display.bold,
    color: colors.text.primary,
  },

  // Score
  scoreSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  scoreNumber: {
    fontSize: 36,
    fontFamily: fonts.display.bold,
    color: colors.text.primary,
  },
  scoreMax: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.body.regular,
    color: colors.text.tertiary,
    marginTop: -4,
  },
  performanceLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.body.medium,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },

  // KPI grid
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  kpiCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: spacing.md,
    gap: 4,
  },
  kpiLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: fonts.body.regular,
    color: colors.text.tertiary,
  },
  kpiValue: {
    fontSize: typography.fontSize.xl,
    fontFamily: fonts.display.bold,
    color: colors.text.primary,
  },
  kpiBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  kpiBarFill: {
    height: '100%',
    backgroundColor: colors.secondary.DEFAULT,
    borderRadius: 2,
  },

  // Points
  pointsCard: {
    backgroundColor: 'rgba(6, 214, 160, 0.08)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(6, 214, 160, 0.15)',
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  pointsLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: fonts.body.regular,
    color: colors.text.tertiary,
  },
  pointsValue: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: fonts.display.bold,
    color: colors.secondary.DEFAULT,
    marginVertical: 2,
  },
  pointsScenario: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.body.regular,
    color: colors.text.tertiary,
  },

  // Checklist
  checklistSection: {
    marginBottom: spacing.lg,
  },
  checklistTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.display.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 4,
  },
  checklistText: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.body.regular,
    color: colors.text.secondary,
  },
  checklistMissed: {
    color: '#F59E0B',
  },

  // Feedback
  feedbackSection: {
    marginBottom: spacing.lg,
  },
  feedbackTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.display.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  feedbackText: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.body.regular,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * 1.5,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  detailButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.primary.DEFAULT,
    alignItems: 'center',
  },
  detailButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.display.semiBold,
    color: colors.primary.light,
  },
  doneButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.display.bold,
    color: '#FFFFFF',
  },
});
